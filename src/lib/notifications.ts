import { sendEmail } from './email';
import { 
  getMembershipReceiptTemplate, 
  getGroupAddedTemplate, 
  getInvitationTemplate, 
  getMemberRequestTemplate 
} from './emailTemplates';
import EmailLog from '@/models/EmailLog';
import WomenMember from '@/models/WomenMember';
import User from '@/models/User';
import Group from '@/models/Group';
import Membership from '@/models/Membership';

export const notifyMembershipPayment = async (membershipId: string) => {
  try {
    const membership = await Membership.findById(membershipId)
      .populate('memberId')
      .populate('groupId')
      .populate('employeeId');

    if (!membership || !membership.memberId) return;

    const member = membership.memberId as any;
    const email = member.email;

    if (!email) return;

    const data = {
      memberName: member.name,
      membershipId: membership.membershipId,
      receiptNumber: membership.receiptNumber,
      amount: membership.amount,
      paymentMode: membership.paymentMode,
      date: new Date(membership.paymentDate).toLocaleDateString(),
      groupName: (membership.groupId as any)?.groupName || 'N/A',
      employeeName: (membership.employeeId as any)?.fullName || 'N/A',
      receiptId: membership._id
    };

    const res = await sendEmail(
      email,
      'Your SakhiHub Membership Receipt',
      getMembershipReceiptTemplate(data)
    );

    await EmailLog.create({
      recipient: email,
      subject: 'Your SakhiHub Membership Receipt',
      type: 'membership_receipt',
      status: res.success ? 'success' : 'failed',
      error: res.success ? undefined : (res.error as any)?.message,
      relatedId: membership._id
    });

    if (res.success) {
      await WomenMember.findByIdAndUpdate(member._id, { membershipReceiptEmailSent: true });
    }
  } catch (error) {
    console.error('Notification Error (Membership):', error);
  }
};

export const notifyGroupAddition = async (memberId: string, groupId: string, employeeId: string) => {
  try {
    const member = await WomenMember.findById(memberId);
    const group = await Group.findById(groupId);
    const employee = await User.findById(employeeId);

    if (!member || !group || !employee || !member.email) return;

    const res = await sendEmail(
      member.email,
      'You have been added to a SakhiHub Group',
      getGroupAddedTemplate({
        memberName: member.name,
        groupName: group.groupName,
        village: group.village,
        employeeName: employee.fullName
      })
    );

    await EmailLog.create({
      recipient: member.email,
      subject: 'You have been added to a SakhiHub Group',
      type: 'group_addition',
      status: res.success ? 'success' : 'failed',
      error: res.success ? undefined : (res.error as any)?.message,
      relatedId: member._id
    });
  } catch (error) {
    console.error('Notification Error (Group Addition):', error);
  }
};

export const notifyInvitation = async (email: string, inviterName: string, purpose: string) => {
  try {
    const res = await sendEmail(
      email,
      'Invitation to join SakhiHub Movement',
      getInvitationTemplate({
        inviterName,
        purpose
      })
    );

    await EmailLog.create({
      recipient: email,
      subject: 'Invitation to join SakhiHub Movement',
      type: 'invitation',
      status: res.success ? 'success' : 'failed',
      error: res.success ? undefined : (res.error as any)?.message
    });
  } catch (error) {
    console.error('Notification Error (Invitation):', error);
  }
};

export const notifyMemberRequest = async (employeeId: string, memberId: string) => {
  try {
    const employee = await User.findById(employeeId);
    const member = await WomenMember.findOne({ userId: memberId }) || await User.findById(memberId);

    if (!employee || !member || !employee.email) return;

    const res = await sendEmail(
      employee.email,
      'New Connection Request Received',
      getMemberRequestTemplate({
        employeeName: employee.fullName,
        memberName: (member as any).fullName || (member as any).name,
        memberMobile: member.mobile,
        memberLocation: `${(member as any).block || ''}, ${(member as any).district || ''}`,
        timestamp: new Date().toLocaleString()
      })
    );

    await EmailLog.create({
      recipient: employee.email,
      subject: 'New Connection Request Received',
      type: 'member_request_notification',
      status: res.success ? 'success' : 'failed',
      error: res.success ? undefined : (res.error as any)?.message,
      relatedId: employee._id
    });
  } catch (error) {
    console.error('Notification Error (Member Request):', error);
  }
};

export const notifyEmployeeInvite = async (employeeId: string, memberUserId: string, message: string) => {
  try {
    const employee = await User.findById(employeeId);
    const memberUser = await User.findById(memberUserId);
    const memberProfile = await WomenMember.findOne({ userId: memberUserId });

    const email = memberUser?.email || memberProfile?.email;
    if (!employee || !email) return;

    const res = await sendEmail(
      email,
      'Invitation to Connect on SakhiHub',
      getInvitationTemplate({
        inviterName: employee.fullName,
        purpose: message || 'Join my group and participate in community campaigns.'
      })
    );

    await EmailLog.create({
      recipient: email,
      subject: 'Invitation to Connect on SakhiHub',
      type: 'employee_invite_notification',
      status: res.success ? 'success' : 'failed',
      error: res.success ? undefined : (res.error as any)?.message,
      relatedId: memberUserId as any
    });
    
    if (res.success && memberProfile) {
      await WomenMember.findByIdAndUpdate(memberProfile._id, { invitationEmailSent: true });
    }
  } catch (error) {
    console.error('Notification Error (Employee Invite):', error);
  }
};
