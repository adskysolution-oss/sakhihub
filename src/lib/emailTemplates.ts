
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
            <tr><td style="color: #777; padding: 5px 0;">Mobile:</td><td style="font-weight: 700; text-align: right;">${data.memberMobile}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">District/Block:</td><td style="font-weight: 700; text-align: right;">${data.memberLocation}</td></tr>
            <tr><td style="color: #777; padding: 5px 0;">Timestamp:</td><td style="font-weight: 700; text-align: right;">${data.timestamp}</td></tr>
        </table>
    </div>
    <p>Please log in to your dashboard to review and approve the request.</p>
`, { text: 'Review Request', url: 'https://sakhihub.com/employee/requests' });
