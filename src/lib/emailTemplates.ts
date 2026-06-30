
export const getBaseTemplate = (content: string, cta?: { text: string, url: string }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SakhiHub Notification</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #eee; }
        .header { background: linear-gradient(135deg, #e91e63, #6a1b9a); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; }
        .footer { background-color: #fcfcfc; padding: 30px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #f1f1f1; }
        .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #e91e63, #6a1b9a); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; margin-top: 25px; box-shadow: 0 5px 15px rgba(233, 30, 99, 0.3); transition: all 0.3s ease; }
        .otp-box { background: #fdf2f8; border: 2px dashed #e91e63; padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center; font-size: 36px; font-weight: 900; color: #e91e63; letter-spacing: 10px; }
        .highlight { color: #e91e63; font-weight: 700; }
        p { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sakhi<span style="color: #ffffff; opacity: 0.8;">Hub</span></h1>
        </div>
        <div class="content">
            ${content}
            ${cta ? `<div style="text-align: center;"><a href="${cta.url}" class="button">${cta.text}</a></div>` : ''}
        </div>
        <div class="footer">
            <p style="margin-bottom: 10px; font-weight: 700; color: #555;">SakhiHub Community Platform</p>
            <p>Empowering women through community and connection. <br> If you have any questions, contact us at support@sakhihub.com</p>
            <div style="margin-top: 20px; color: #bbb;">© 2026 SakhiHub. All rights reserved.</div>
        </div>
    </div>
</body>
</html>
`;

export const getOTPTemplate = (name: string, otp: string, purpose: string) => getBaseTemplate(`
    <p>Hello <span class="highlight">${name}</span>,</p>
    <p>Your OTP for <strong>${purpose}</strong> on SakhiHub is:</p>
    <div class="otp-box">${otp}</div>
    <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone for security reasons.</p>
    <p>If you didn't request this code, please ignore this email or contact our support.</p>
`);

export const getWelcomeTemplate = (name: string, role: string, isPending: boolean) => getBaseTemplate(`
    <p>Hello <span class="highlight">${name}</span>,</p>
    <p>Welcome to <strong>SakhiHub</strong>! We are thrilled to have you join our mission of empowering women across communities.</p>
    <p>You have successfully registered as a <span class="highlight">${role}</span>.</p>
    ${isPending ? `
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">Account Status: Pending Approval</p>
        <p style="margin: 10px 0 0; color: #b45309; font-size: 14px;">Your application is currently under review by our administration. You will receive an email notification once your account is activated.</p>
    </div>
    ` : `
    <p>Your account is now active. You can start exploring the dashboard and connecting with the community.</p>
    `}
    <p>Let's work together to build a stronger, more connected future!</p>
`, { text: 'Go to Dashboard', url: 'https://sakhihub.com/dashboard' });

export const getMembershipReceiptTemplate = (data: any) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.memberName}</span>,</p>
    <p>Congratulations! Your membership payment has been successfully verified.</p>
    <div style="background: #f8f9fa; border: 1px solid #eee; border-radius: 15px; padding: 25px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #e91e63;">Payment Details</h3>
        <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #777; padding: 5px 0;">Membership ID:</td><td style="font-weight: 700; text-align: right;">${data.membershipId}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Receipt Number:</td><td style="font-weight: 700; text-align: right;">${data.receiptNumber}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Amount Paid:</td><td style="font-weight: 700; text-align: right; color: #16a34a;">₹${data.amount}.00</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Payment Mode:</td><td style="font-weight: 700; text-align: right;">${data.paymentMode}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Date:</td><td style="font-weight: 700; text-align: right;">${data.date}</td></tr>
            <tr><td style="color: #777; padding: 5px 0; border-top: 1px solid #eee; margin-top: 10px;">Group Name:</td><td style="font-weight: 700; text-align: right; border-top: 1px solid #eee; padding-top: 10px;">${data.groupName}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Agent:</td><td style="font-weight: 700; text-align: right;">${data.employeeName}</td></tr>
        </table>
    </div>
    <p>A digital copy of your receipt is attached for your records.</p>
`, { text: 'View Digital Receipt', url: `https://sakhihub.com/member/receipt/${data.receiptId}` });

export const getGroupAddedTemplate = (data: any) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.memberName}</span>,</p>
    <p>We are happy to inform you that you have been added to a new group: <span class="highlight">${data.groupName}</span>.</p>
    <p>This group operates in <span class="highlight">${data.village}</span> and is managed by <span class="highlight">${data.employeeName}</span>.</p>
    <p>Joining a group is the first step towards active participation in our community campaigns and benefits.</p>
`, { text: 'View Group Details', url: 'https://sakhihub.com/member/group' });

export const getInvitationTemplate = (data: any) => getBaseTemplate(`
    <p>Hello!</p>
    <p><span class="highlight">${data.inviterName}</span> from SakhiHub has invited you to join our community platform.</p>
    <p><strong>Purpose:</strong> ${data.purpose}</p>
    <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px; padding: 20px; margin: 20px 0; color: #be185d;">
        <p style="margin: 0; font-weight: 600;">About SakhiHub:</p>
        <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">SakhiHub is a community-driven platform dedicated to empowering women through financial inclusion, health awareness, and shared growth.</p>
    </div>
    <p>Join us today to be part of the movement!</p>
`, { text: 'Join Movement', url: 'https://sakhihub.com/register' });

export const getMemberRequestTemplate = (data: any) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.employeeName}</span>,</p>
    <p>You have received a new connection request from a member.</p>
    <div style="background: #f8f9fa; border: 1px solid #eee; border-radius: 15px; padding: 25px; margin: 25px 0;">
        <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #777; padding: 5px 0;">Member Name:</td><td style="font-weight: 700; text-align: right;">${data.memberName}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">District/Block:</td><td style="font-weight: 700; text-align: right;">${data.memberLocation}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Timestamp:</td><td style="font-weight: 700; text-align: right;">${data.timestamp}</td></tr>
        </table>
    </div>
    <p>Please log in to your dashboard to review and approve the request.</p>
`, { text: 'Review Request', url: 'https://sakhihub.com/employee/requests' });

export const getAccountActivatedTemplate = (data: { name: string; role: string; userId: string; loginUrl: string }) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.name}</span>,</p>
    <p>Congratulations! Your SakhiHub account has been officially <strong>Activated</strong> by our administration team.</p>
    <div style="background: #f8f9fa; border: 1px solid #eee; border-radius: 15px; padding: 25px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #e91e63;">Account Details</h3>
        <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #777; padding: 5px 0;">Role:</td><td style="font-weight: 700; text-align: right; text-transform: uppercase;">${data.role}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">User ID / Code:</td><td style="font-weight: 700; text-align: right; font-family: monospace;">${data.userId}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Dashboard Link:</td><td style="font-weight: 700; text-align: right;"><a href="${data.loginUrl}" style="color: #e91e63;">Click here to Login</a></td></tr>
        </table>
    </div>
    <p>You now have full access to your SakhiHub Dashboard. Please use your registered mobile number and password to log in.</p>
    <p>Welcome to our movement!</p>
`, { text: 'Access Dashboard', url: data.loginUrl });

export const getDocumentVerifiedTemplate = (data: { name: string; role: string }) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.name}</span>,</p>
    <p>We are pleased to inform you that all your mandatory onboarding documents have been reviewed and <strong>Verified Successfully</strong> by our verification team.</p>
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; color: #065f46;">
        <p style="margin: 0; font-weight: 700;">Documents Status: Verified</p>
        <p style="margin: 5px 0 0; font-size: 13px;">Your profile status is updated, and you are fully compliant with SakhiHub guidelines.</p>
    </div>
    <p>You can view your verified documents list inside the profile section on your dashboard.</p>
`, { text: 'View Profile', url: 'https://sakhihub.com/dashboard/profile' });

export const getDocumentRejectedTemplate = (data: { name: string; documentName: string; reason: string; instructions: string }) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.name}</span>,</p>
    <p>During our routine verification process, a document submitted by you has been marked as <strong>Rejected / Requires Re-upload</strong>.</p>
    <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 15px; padding: 25px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #dc2626;">Rejection Details</h3>
        <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #777; padding: 5px 0; width: 120px;">Document:</td><td style="font-weight: 700; color: #1f2937;">${data.documentName}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Reason:</td><td style="font-weight: 700; color: #dc2626;">${data.reason}</td></tr>
        </table>
    </div>
    <p><strong>Instructions:</strong></p>
    <p>${data.instructions}</p>
    <p>Please log in to your dashboard as soon as possible to re-upload a clear and valid copy of the document to avoid onboarding delays.</p>
`, { text: 'Re-upload Document', url: 'https://sakhihub.com/dashboard/profile' });

export const getPaymentReceiptEmailTemplate = (data: { name: string; amount: number; transactionId: string; date: string; type: string }) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.name}</span>,</p>
    <p>Your payment for the <strong>${data.type}</strong> of ₹${data.amount} has been successfully verified.</p>
    <div style="background: #f8f9fa; border: 1px solid #eee; border-radius: 15px; padding: 25px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #e91e63;">Receipt Summary</h3>
        <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #777; padding: 5px 0;">Transaction ID:</td><td style="font-weight: 700; text-align: right;">${data.transactionId}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Amount Paid:</td><td style="font-weight: 700; text-align: right; color: #16a34a;">₹${data.amount}.00</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Date:</td><td style="font-weight: 700; text-align: right;">${data.date}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Payment Type:</td><td style="font-weight: 700; text-align: right; text-transform: uppercase;">${data.type}</td></tr>
        </table>
    </div>
    <p>A copy of your official, digitally-sealed PDF receipt has been generated and is attached to this email for your records.</p>
`, { text: 'Go to Dashboard', url: 'https://sakhihub.com/dashboard' });

export const getParentAssignedTemplate = (data: { name: string; parentName: string; parentRole: string; parentContact: string }) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.name}</span>,</p>
    <p>You have been assigned a new coordinator/parent partner in your hierarchy network. This partner will support and manage your activities on SakhiHub.</p>
    <div style="background: #f8f9fa; border: 1px solid #eee; border-radius: 15px; padding: 25px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #e91e63;">Assigned Partner Details</h3>
        <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #777; padding: 5px 0;">Name:</td><td style="font-weight: 700; text-align: right;">${data.parentName}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Role:</td><td style="font-weight: 700; text-align: right; text-transform: uppercase;">${data.parentRole.replace('_', ' ')}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Contact Number:</td><td style="font-weight: 700; text-align: right;">${data.parentContact}</td></tr>
        </table>
    </div>
    <p>Please feel free to connect with them for any field query or campaign-related guidance.</p>
`, { text: 'View Hierarchy Network', url: 'https://sakhihub.com/dashboard' });

export const getCampaignAssignedTemplate = (data: { name: string; campaignName: string; description: string; duration?: string }) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.name}</span>,</p>
    <p>We are excited to inform you that a <strong>New Campaign</strong> has been assigned to you. You are authorized to carry out awareness activities for this campaign in your region.</p>
    <div style="background: #f8f9fa; border: 1px solid #eee; border-radius: 15px; padding: 25px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #e91e63;">Campaign Details</h3>
        <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #777; padding: 5px 0;">Campaign Name:</td><td style="font-weight: 700; text-align: right;">${data.campaignName}</td></tr>
            ${data.duration ? `<tr><td style="color: #777; padding: 5px 0;">Duration / Timelines:</td><td style="font-weight: 700; text-align: right;">${data.duration}</td></tr>` : ''}
        </table>
        <p style="margin-top: 15px; font-size: 13px; color: #555;"><strong>Description:</strong><br/>${data.description}</p>
    </div>
    <p>You can find training materials, campaign documents, and report templates inside the campaigns page of your dashboard.</p>
`, { text: 'View Campaign Details', url: 'https://sakhihub.com/dashboard/campaigns' });

export const getOfferLetterGeneratedTemplate = (data: { name: string; position: string; joiningDate: string }) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.name}</span>,</p>
    <p>Congratulations! We are pleased to issue your official <strong>Offer Letter</strong> for the position of <strong>${data.position}</strong> at SakhiHub.</p>
    <p>Your joining date is scheduled for <strong>${data.joiningDate}</strong>.</p>
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">Next Steps: Digital Acceptance Required</p>
        <p style="margin: 10px 0 0; color: #b45309; font-size: 13px;">Please log in to the SakhiHub Employee Portal, review the terms, and complete the digital acceptance declaration signature process.</p>
    </div>
    <p>A copy of your generated Offer Letter PDF is attached to this email.</p>
`, { text: 'Review & Sign Offer Letter', url: 'https://sakhihub.com/dashboard' });

export const getAgreementGeneratedTemplate = (data: { name: string; agreementId: string; role: string }) => getBaseTemplate(`
    <p>Hello <span class="highlight">${data.name}</span>,</p>
    <p>Your official <strong>Vendor Partnership Agreement</strong> (Agreement ID: <strong>${data.agreementId}</strong>) has been generated successfully.</p>
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e; font-weight: 600;">Action Required: Upload Signed Copy</p>
        <p style="margin: 10px 0 0; color: #b45309; font-size: 13px;">Please log in to your dashboard, download the agreement copy, print & sign it, and upload the signed copy under the documents section to finalize onboarding.</p>
    </div>
    <p>A copy of the generated Partnership Agreement PDF is attached to this email for your reference.</p>
`, { text: 'View Agreement Page', url: 'https://sakhihub.com/dashboard' });

export const getActivationTemplate = (name: string, otp: string, email: string, employeeName: string) => getBaseTemplate(`
    <p>Hello <span class="highlight">${name}</span>,</p>
    <p>Welcome to SakhiHub! An account has been created for you by our executive <strong>${employeeName}</strong>.</p>
    <p>Your OTP for <strong>Account Activation</strong> is:</p>
    <div class="otp-box">${otp}</div>
    <p>Please click the button below to verify your OTP and set your password to activate your account.</p>
`, { text: 'Activate Account', url: `https://sakhihub.com/activate-account?email=${encodeURIComponent(email)}` });


