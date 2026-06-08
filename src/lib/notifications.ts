import dbConnect from './mongodb';
import { EmailService, EmailAttachment } from './email';
import {
  getBaseTemplate,
  getWelcomeTemplate,
  getMembershipReceiptTemplate,
  getGroupAddedTemplate,
  getInvitationTemplate,
  getMemberRequestTemplate,
  getAccountActivatedTemplate,
  getDocumentVerifiedTemplate,
  getDocumentRejectedTemplate,
  getPaymentReceiptEmailTemplate,
  getParentAssignedTemplate,
  getCampaignAssignedTemplate,
  getOfferLetterGeneratedTemplate,
  getAgreementGeneratedTemplate
} from './emailTemplates';
import EmailLog from '@/models/EmailLog';
import WomenMember from '@/models/WomenMember';
import User from '@/models/User';
import Group from '@/models/Group';
import Membership from '@/models/Membership';
import PaymentTransaction from '@/models/PaymentTransaction';
import VendorAgreement from '@/models/VendorAgreement';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import Campaign from '@/models/Campaign';
import { generateAgreementHtml, generateOfferLetterHtml, generatePdfBuffer } from '@/utils/pdfGenerator';
import mongoose from 'mongoose';

export enum NotificationEvent {
  DOCUMENTS_VERIFIED = 'DOCUMENTS_VERIFIED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PARENT_ASSIGNED = 'PARENT_ASSIGNED',
  CAMPAIGN_ASSIGNED = 'CAMPAIGN_ASSIGNED',
  ACCOUNT_ACTIVATED = 'ACCOUNT_ACTIVATED',
  OFFER_LETTER_GENERATED = 'OFFER_LETTER_GENERATED',
  AGREEMENT_GENERATED = 'AGREEMENT_GENERATED',
  WELCOME_ONBOARDING = 'WELCOME_ONBOARDING'
}

export const NotificationService = {
  trigger: async (event: NotificationEvent, data: any): Promise<boolean> => {
    try {
      await dbConnect();

      switch (event) {
        case NotificationEvent.WELCOME_ONBOARDING: {
          const { userId } = data;
          const user = await User.findById(userId);
          if (!user || !user.email) return false;

          // Prevent duplicate welcome emails
          if (user.welcomeEmailSent) {
            console.log(`[EMAIL] Duplicate prevented: welcome email already sent for user ${user.email}`);
            return false;
          }

          const html = getWelcomeTemplate(user.fullName, user.role, user.status === 'pending');
          const res = await EmailService.send(user.email, 'Welcome to SakhiHub!', html);

          if (res.success) {
            user.welcomeEmailSent = true;
            await user.save();

            await EmailLog.create({
              recipient: user.email,
              subject: 'Welcome to SakhiHub!',
              type: 'welcome_email',
              status: 'success',
              relatedId: user._id
            });
            return true;
          }
          return false;
        }

        case NotificationEvent.DOCUMENTS_VERIFIED: {
          const { userId } = data;
          const user = await User.findById(userId);
          if (!user || !user.email) return false;

          if (user.documentsVerifiedEmailSent) {
            console.log(`[EMAIL] Duplicate prevented: documents verified email already sent to ${user.email}`);
            return false;
          }

          const html = getDocumentVerifiedTemplate({ name: user.fullName, role: user.role });
          const res = await EmailService.send(user.email, 'Documents Verified Successfully', html);

          if (res.success) {
            user.documentsVerifiedEmailSent = true;
            await user.save();

            await EmailLog.create({
              recipient: user.email,
              subject: 'Documents Verified Successfully',
              type: 'documents_verified',
              status: 'success',
              relatedId: user._id
            });
            return true;
          }
          return false;
        }

        case NotificationEvent.DOCUMENT_REJECTED: {
          const { userId, documentName, reason } = data;
          const user = await User.findById(userId);
          if (!user || !user.email) return false;

          const instructions = 'Please log in to your dashboard and re-upload the document under profile settings.';
          const html = getDocumentRejectedTemplate({
            name: user.fullName,
            documentName,
            reason: reason || 'Document did not meet verification criteria.',
            instructions
          });

          const res = await EmailService.send(user.email, `Document Rejected: ${documentName}`, html);

          await EmailLog.create({
            recipient: user.email,
            subject: `Document Rejected: ${documentName}`,
            type: 'document_rejected',
            status: res.success ? 'success' : 'failed',
            error: res.success ? undefined : (res.error as any)?.message,
            relatedId: user._id
          });
          return res.success;
        }

        case NotificationEvent.PAYMENT_SUCCESS: {
          const { transactionId } = data;
          const transaction = await PaymentTransaction.findById(transactionId);
          if (!transaction) return false;

          const user = await User.findById(transaction.userId);
          if (!user || !user.email) return false;

          if (transaction.emailSent) {
            console.log(`[EMAIL] Duplicate prevented: receipt email already sent for transaction ${transactionId}`);
            return false;
          }

          // Generate Receipt PDF
          const receiptDate = new Date(transaction.paidAt || transaction.updatedAt).toLocaleDateString('en-IN');
          const receiptHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.5; padding: 30px; color: #333; }
                .container { border: 1px solid #eee; padding: 30px; border-radius: 15px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
                .header { text-align: center; border-bottom: 2px solid #e91e63; padding-bottom: 15px; margin-bottom: 25px; }
                .title { font-size: 22px; font-weight: bold; color: #1f2937; text-transform: uppercase; margin: 0; }
                .section { margin-top: 20px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
                .label { color: #666; }
                .value { font-weight: bold; text-align: right; }
                .amount-box { margin-top: 25px; background: #fdf2f8; border: 1px solid #fbcfe8; padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
                .amount-label { font-size: 12px; font-weight: bold; color: #be185d; }
                .amount { font-size: 24px; color: #be185d; font-weight: 900; }
                .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 class="title">SakhiHub Payment Receipt</h2>
                  <p style="margin: 5px 0 0; font-size: 12px; color: #10b981; font-weight: bold;">PAYMENT CONFIRMED / SUCCESSFUL</p>
                </div>
                <div class="section">
                  <div class="row"><span class="label">Payer Name:</span><span class="value">${user.fullName}</span></div>
                  <div class="row"><span class="label">Mobile Number:</span><span class="value">${user.mobile}</span></div>
                  <div class="row"><span class="label">Role:</span><span class="value" style="text-transform: uppercase;">${user.role}</span></div>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;"/>
                  <div class="row"><span class="label">Transaction ID:</span><span class="value" style="font-family: monospace;">${transaction.gatewayOrderId || transaction.cashfreeOrderId || transaction._id}</span></div>
                  <div class="row"><span class="label">Payment Date:</span><span class="value">${receiptDate}</span></div>
                  <div class="row"><span class="label">Payment Mode:</span><span class="value">${transaction.paymentMethod || 'Online'}</span></div>
                  <div class="row"><span class="label">Payment Type:</span><span class="value" style="text-transform: uppercase;">${transaction.type}</span></div>
                  
                  <div class="amount-box">
                    <span class="amount-label">AMOUNT PAID</span>
                    <span class="amount">₹${transaction.amount}.00</span>
                  </div>
                </div>
                <div class="footer">
                  <p>This is a digitally generated payment slip and does not require a physical signature.</p>
                  <p>SakhiHub Community Platform &copy; 2026. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          const pdfBufferVal = await generatePdfBuffer(receiptHtml);
          const pdfBuffer = Buffer.from(pdfBufferVal);
          const attachments: EmailAttachment[] = [{
            filename: `Receipt-${transaction.gatewayOrderId || transaction._id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }];

          const emailHtml = getPaymentReceiptEmailTemplate({
            name: user.fullName,
            amount: transaction.amount,
            transactionId: (transaction.gatewayOrderId || transaction.cashfreeOrderId || transaction._id.toString()),
            date: receiptDate,
            type: transaction.type
          });

          const res = await EmailService.send(
            user.email,
            `SakhiHub Payment Receipt - ${transaction.type.toUpperCase()}`,
            emailHtml,
            attachments
          );

          if (res.success) {
            transaction.emailSent = true;
            await transaction.save();

            await EmailLog.create({
              recipient: user.email,
              subject: `SakhiHub Payment Receipt - ${transaction.type.toUpperCase()}`,
              type: 'payment_receipt',
              status: 'success',
              relatedId: transaction._id
            });
            return true;
          }
          return false;
        }

        case NotificationEvent.PARENT_ASSIGNED: {
          const { userId } = data;
          const user = await User.findById(userId).populate('parentVendorId');
          if (!user || !user.email) return false;

          const parent = user.parentVendorId as any;
          if (!parent) return false;

          if (user.notifiedParentId && user.notifiedParentId.toString() === parent._id.toString()) {
            console.log(`[EMAIL] Duplicate prevented: parent assignment email already sent for parent ${parent._id}`);
            return false;
          }

          const html = getParentAssignedTemplate({
            name: user.fullName,
            parentName: parent.fullName,
            parentRole: parent.role,
            parentContact: parent.mobile
          });

          const res = await EmailService.send(user.email, 'SakhiHub Hierarchy Partner Assigned', html);

          if (res.success) {
            user.notifiedParentId = parent._id;
            await user.save();

            await EmailLog.create({
              recipient: user.email,
              subject: 'SakhiHub Hierarchy Partner Assigned',
              type: 'parent_assigned',
              status: 'success',
              relatedId: user._id
            });
            return true;
          }
          return false;
        }

        case NotificationEvent.CAMPAIGN_ASSIGNED: {
          const { userId } = data;
          const user = await User.findById(userId).populate('assignedCampaigns').populate('campaignId');
          if (!user || !user.email) return false;

          const assignedCampaigns = user.assignedCampaigns || [];
          const singleCampaign = user.campaignId;
          const notifiedCampaignIds = user.notifiedCampaignIds || [];

          // Combine campaigns to check
          const allAssigned: any[] = [...assignedCampaigns];
          if (singleCampaign && !allAssigned.some((c: any) => c._id.toString() === (singleCampaign as any)._id.toString())) {
            allAssigned.push(singleCampaign);
          }

          // Filter for newly assigned campaigns
          const newCampaigns = allAssigned.filter(
            (c: any) => !notifiedCampaignIds.some((nc: any) => nc.toString() === c._id.toString())
          );

          if (newCampaigns.length === 0) {
            console.log(`[EMAIL] Duplicate prevented: no new campaigns found to notify for user ${user.email}`);
            return false;
          }

          let successCount = 0;
          for (const campaignObj of newCampaigns) {
            const campaign = campaignObj as any;
            const html = getCampaignAssignedTemplate({
              name: user.fullName,
              campaignName: campaign.title,
              description: campaign.description || 'Campaign details available on your dashboard.',
              duration: campaign.duration
            });

            const res = await EmailService.send(
              user.email,
              `New Campaign Assigned: ${campaign.title}`,
              html
            );

            if (res.success) {
              successCount++;
              await EmailLog.create({
                recipient: user.email,
                subject: `New Campaign Assigned: ${campaign.title}`,
                type: 'campaign_assigned',
                status: 'success',
                relatedId: user._id
              });
            }
          }

          if (successCount > 0) {
            user.notifiedCampaignIds = allAssigned.map((c: any) => c._id);
            await user.save();
            return true;
          }
          return false;
        }

        case NotificationEvent.ACCOUNT_ACTIVATED: {
          const { userId } = data;
          const user = await User.findById(userId);
          if (!user || !user.email) return false;

          if (user.status !== 'active') {
            console.log(`[EMAIL] Activation skipped: user ${userId} is not active`);
            return false;
          }

          if (user.activationEmailSent) {
            console.log(`[EMAIL] Duplicate prevented: account activation email already sent for user ${user.email}`);
            return false;
          }

          const loginUrl = 'https://www.sakhihub.com/login';
          const userRoleCode = user.employeeId || user.vendorCode || user.subVendorCode || 'N/A';
          const html = getAccountActivatedTemplate({
            name: user.fullName,
            role: user.role,
            userId: userRoleCode,
            loginUrl
          });

          const res = await EmailService.send(user.email, 'Your SakhiHub Account is Activated!', html);

          if (res.success) {
            user.activationEmailSent = true;
            await user.save();

            await EmailLog.create({
              recipient: user.email,
              subject: 'Your SakhiHub Account is Activated!',
              type: 'account_activation',
              status: 'success',
              relatedId: user._id
            });
            return true;
          }
          return false;
        }

        case NotificationEvent.OFFER_LETTER_GENERATED: {
          const { userId } = data;
          const user = await User.findById(userId);
          if (!user || !user.email) return false;

          const offerLetter = await EmployeeOfferLetter.findOne({ employeeId: userId });
          if (!offerLetter) return false;

          if (user.offerLetterEmailSent) {
            console.log(`[EMAIL] Duplicate prevented: offer letter already sent for this version of user ${user.email}`);
            return false;
          }

          // Generate Offer Letter PDF
          const letterData = {
            employeeName: user.fullName,
            employeeId: user.employeeId || 'PENDING-ID',
            role: user.designation || user.role,
            mobile: user.mobile,
            joiningDate: offerLetter.joiningDate,
            salary: offerLetter.salary,
            travelAllowance: offerLetter.travelAllowance,
            performanceIncentives: offerLetter.performanceIncentives,
            membershipIncentives: offerLetter.membershipIncentives,
            coordinatorType: offerLetter.coordinatorType,
            assignedRegions: offerLetter.assignedRegions,
            workingArea: user.block ? `${user.block}, ${user.district}` : (user.district as string) || 'All areas',
            assignedDistrict: user.district || 'N/A',
            assignedState: user.state || 'N/A',
            generatedDate: offerLetter.generatedDate,
            offerLetterId: offerLetter.offerLetterId,
            documentStatus: offerLetter.status
          };

          const htmlContent = generateOfferLetterHtml(letterData);
          const pdfBufferVal = await generatePdfBuffer(htmlContent, undefined, {
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
            displayHeaderFooter: false
          });
          const pdfBuffer = Buffer.from(pdfBufferVal);

          const attachments: EmailAttachment[] = [{
            filename: `OfferLetter-${offerLetter.offerLetterId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }];

          const emailHtml = getOfferLetterGeneratedTemplate({
            name: user.fullName,
            position: letterData.role,
            joiningDate: new Date(letterData.joiningDate).toLocaleDateString('en-IN')
          });

          const res = await EmailService.send(
            user.email,
            'Your SakhiHub Offer Letter',
            emailHtml,
            attachments
          );

          if (res.success) {
            user.offerLetterEmailSent = true;
            await user.save();

            await EmailLog.create({
              recipient: user.email,
              subject: 'Your SakhiHub Offer Letter',
              type: 'offer_letter_generated',
              status: 'success',
              relatedId: user._id
            });
            return true;
          }
          return false;
        }

        case NotificationEvent.AGREEMENT_GENERATED: {
          const { userId } = data;
          const user = await User.findById(userId);
          if (!user || !user.email) return false;

          const agreement = await VendorAgreement.findOne({ vendorId: userId });
          if (!agreement) return false;

          if (user.agreementEmailSent) {
            console.log(`[EMAIL] Duplicate prevented: agreement already sent for this version of user ${user.email}`);
            return false;
          }

          // Generate Agreement PDF
          const templateData = {
            ...agreement.templateData,
            mobile: user.mobile,
            email: user.email,
            address: user.address,
            district: user.district,
            state: user.state,
            vendorName: user.fullName,
            vendorCode: agreement.vendorCode || user.vendorCode || user.subVendorCode || 'PENDING',
            role: user.role,
            joiningDate: new Date(agreement.joiningDate).toLocaleDateString('en-IN'),
            agreementId: agreement.agreementId,
            qrVerificationCode: agreement.qrVerificationCode,
            status: agreement.status
          };

          const htmlContent = generateAgreementHtml(templateData);
          const pdfBufferVal = await generatePdfBuffer(htmlContent, agreement.agreementId);
          const pdfBuffer = Buffer.from(pdfBufferVal);

          const attachments: EmailAttachment[] = [{
            filename: `Agreement-${agreement.agreementId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }];

          const emailHtml = getAgreementGeneratedTemplate({
            name: user.fullName,
            agreementId: agreement.agreementId,
            role: user.role
          });

          const res = await EmailService.send(
            user.email,
            'Your SakhiHub Partnership Agreement',
            emailHtml,
            attachments
          );

          if (res.success) {
            user.agreementEmailSent = true;
            await user.save();

            await EmailLog.create({
              recipient: user.email,
              subject: 'Your SakhiHub Partnership Agreement',
              type: 'agreement_generated',
              status: 'success',
              relatedId: user._id
            });
            return true;
          }
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error(`[EMAIL] Error sending email trigger for event ${event}:`, error);
      return false;
    }
  }
};

// Legacy notifications backward compatibility (redirected through EmailService or kept unchanged)
export const notifyMembershipPayment = async (membershipId: string) => {
  try {
    await dbConnect();
    const membership = await Membership.findById(membershipId)
      .populate('memberId')
      .populate('groupId')
      .populate('employeeId');

    if (!membership || !membership.memberId) return;

    const member = membership.memberId as any;
    const email = member.email;

    if (!email) return;

    // Check if we already logged this membership payment to prevent duplicates
    const existingLog = await EmailLog.findOne({ relatedId: membership._id, type: 'membership_receipt', status: 'success' });
    if (existingLog) {
      console.log(`[EMAIL] Duplicate prevented: membership receipt already sent for membership ${membershipId}`);
      return;
    }

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

    const res = await EmailService.send(
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
    await dbConnect();
    const member = await WomenMember.findById(memberId);
    const group = await Group.findById(groupId);
    const employee = await User.findById(employeeId);

    if (!member || !group || !employee || !member.email) return;

    const res = await EmailService.send(
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
    const res = await EmailService.send(
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
    await dbConnect();
    const employee = await User.findById(employeeId);
    const member = await WomenMember.findOne({ userId: memberId }) || await User.findById(memberId);

    if (!employee || !member || !employee.email) return;

    const res = await EmailService.send(
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
    await dbConnect();
    const employee = await User.findById(employeeId);
    const memberUser = await User.findById(memberUserId);
    const memberProfile = await WomenMember.findOne({ userId: memberUserId });

    const email = memberUser?.email || memberProfile?.email;
    if (!employee || !email) return;

    const res = await EmailService.send(
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
