import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import PaymentConfig from '@/models/PaymentConfig';
import { areAllDocsApproved, determineUserStatus } from '@/lib/docs/service';

/**
 * Idempotent service to evaluate and transition user onboarding activation status.
 * Replaces duplicate activation checks spread across controllers.
 */
export async function evaluateUserActivation(userId: string) {
  await dbConnect();
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Super admins and operations admins are always active
  if (['super_admin', 'operations_admin'].includes(user.role)) {
    return user;
  }

  // Manually suspended, rejected, or inactive users must retain their status and have access revoked
  if (['rejected', 'suspended', 'inactive'].includes(user.status)) {
    user.dashboardAccess = false;
    user.onboardingCompleted = false;
    await user.save();
    return user;
  }

  // 1. Evaluate Documents Verification
  // Members do not have document requirements
  const docsVerified = user.role === 'member' ? true : areAllDocsApproved(user);
  user.documentsVerified = docsVerified;

  // 2. Evaluate Payment Completion
  let paymentCompleted = false;
  const roleKey = user.role as 'vendor' | 'sub_vendor' | 'employee';

  if (!['vendor', 'sub_vendor', 'employee', 'member'].includes(user.role)) {
    // Staff, admin, etc., do not require payment configuration
    paymentCompleted = true;
  } else if (user.role === 'member') {
    // Members only pay a subscription
    paymentCompleted = user.subscriptionPaid;
  } else {
    const config = await PaymentConfig.findOne({ key: 'default' });
    if (!config) {
      paymentCompleted = true;
    } else {
      const subRequired = config.subscriptionRequired[roleKey];
      const depRequired = config.depositRequired[roleKey];

      const subPaid = user.subscriptionPaid || !subRequired;
      const depPaid = user.depositPaid || !depRequired;

      paymentCompleted = subPaid && depPaid;
    }
  }

  user.paymentCompleted = paymentCompleted;

  // Sync specific flags for employees
  if (user.role === 'employee') {
    if (paymentCompleted) {
      user.paymentStatus = 'completed';
      user.accessStatus = 'unlocked';
      user.depositPaid = true; // Auto-sync payment completed deposit flag
    } else {
      user.paymentStatus = 'pending';
      user.accessStatus = 'locked';
    }
  }

  // Self-heal assignment status if parentVendorId is present
  if (['employee', 'sub_vendor', 'member'].includes(user.role) && user.parentVendorId && user.assignmentStatus === 'pending') {
    user.assignmentStatus = 'completed';
  }

  // 3. Evaluate Mapping/Assignment
  // Vendors and Staff do not require mapping.
  // Employees, Sub-vendors, and Members require campaign/parent mapping.
  const mappingCompleted = (
    user.role === 'vendor' || 
    user.role === 'staff' || 
    user.assignmentStatus === 'completed'
  );

  // 4. Determine Final User Status and Dashboard Access
  if (docsVerified) {
    if (paymentCompleted && mappingCompleted) {
      user.status = 'active';
      user.dashboardAccess = true;
      user.onboardingCompleted = true;
      user.isVerified = true;
    } else {
      // Documents verified, but payment or mapping is still pending
      user.status = 'approved';
      user.dashboardAccess = false;
      user.onboardingCompleted = false;
    }
  } else {
    // Documents are not fully approved/verified yet
    user.status = determineUserStatus(user);
    user.dashboardAccess = false;
    user.onboardingCompleted = false;
  }

  // Special checks for Staff (only require doc verification)
  if (user.role === 'staff') {
    if (docsVerified) {
      if (user.status !== 'active') user.status = 'approved';
      user.dashboardAccess = true;
      user.onboardingCompleted = true;
      user.isVerified = true;
    } else {
      user.dashboardAccess = false;
      user.isVerified = false;
    }
  }

  await user.save();

  // Trigger Notifications if status changed to active
  if (user.status === 'active') {
    try {
      const { NotificationService, NotificationEvent } = await import('@/lib/notifications');
      await NotificationService.trigger(NotificationEvent.ACCOUNT_ACTIVATED, { userId: user._id });
    } catch (err) {
      console.error('Failed to trigger account activation notification:', err);
    }
  }

  return user;
}
