import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import AuthorizationLetter from '@/models/AuthorizationLetter';
import AuthorizationLetterAudit from '@/models/AuthorizationLetterAudit';

/**
 * Checks all active authorization letters for a given user and automatically
 * revokes them if their eligibility criteria or location assignments have been violated.
 */
export async function syncAuthorizationLetterStatus(userId: string, ipAddress: string = '127.0.0.1') {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return;

    // Find any active letters for this user
    const activeLetters = await AuthorizationLetter.find({ userId: user._id, status: 'active' });
    if (activeLetters.length === 0) return;

    for (const letter of activeLetters) {
      let shouldRevoke = false;
      let reason = '';

      // Rule 1: Employee Status Inactive / Suspended / Terminated / Rejected
      if (user.status !== 'active') {
        shouldRevoke = true;
        reason = `Employee status changed from active to '${user.status}'`;
      }
      
      // Rule 2: Dashboard Access Disabled
      else if (user.dashboardAccess !== true) {
        shouldRevoke = true;
        reason = 'Employee dashboard access was disabled';
      }

      // Rule 3: Designation changed (e.g. no longer District or Block Coordinator/Project Officer/Field Executive)
      else if (
        letter.authorizationType === 'district_coordinator' && 
        user.designation !== 'District Coordinator' &&
        user.designation !== 'District Project Officer'
      ) {
        shouldRevoke = true;
        reason = `Employee designation changed from District Coordinator/Project Officer to '${user.designation || 'None'}'`;
      } 
      else if (
        letter.authorizationType === 'block_coordinator' && 
        user.designation !== 'Block Coordinator' &&
        user.designation !== 'Field Executive' &&
        user.designation !== 'Block Employee'
      ) {
        shouldRevoke = true;
        reason = `Employee designation changed from Block Coordinator/Field Executive/Employee to '${user.designation || 'None'}'`;
      }

      // Rule 4: District Assignment Removed
      else if (!user.district || user.district.trim() === '') {
        shouldRevoke = true;
        reason = 'District assignment was removed from employee profile';
      }

      // Rule 5: Block Assignment Removed (Only for Block Coordinator/Field Executive/Employee)
      else if (
        letter.authorizationType === 'block_coordinator' && 
        (!user.block || user.block.trim() === '')
      ) {
        shouldRevoke = true;
        reason = 'Block assignment was removed from Block Coordinator/Field Executive/Employee profile';
      }

      if (shouldRevoke) {
        letter.status = 'revoked';
        await letter.save();

        // Write to audit trail
        await AuthorizationLetterAudit.create({
          authorizationLetterId: letter._id,
          action: 'auto_revoke',
          ipAddress,
          details: {
            reason,
            previousStatus: 'active',
            userStatus: user.status,
            userDesignation: user.designation,
            userDistrict: user.district,
            userBlock: user.block,
            userDashboardAccess: user.dashboardAccess
          }
        });

        console.log(`[AUTH-LETTER] Auto-revoked letter ${letter.authorizationNumber} for user ${user.fullName}: ${reason}`);
      }
    }
  } catch (error) {
    console.error(`[AUTH-LETTER] Error syncing authorization status for user ${userId}:`, error);
  }
}
