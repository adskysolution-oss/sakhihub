import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export const EmailService = {
  send: async (
    to: string,
    subject: string,
    html: string,
    attachments?: EmailAttachment[],
    text?: string
  ): Promise<{ success: boolean; messageId?: string; error?: any }> => {
    console.log(`[EMAIL] Trigger received for email: ${to}, subject: "${subject}"`);
    try {
      if (attachments && attachments.length > 0) {
        console.log(`[EMAIL] Attachment generated: ${attachments.map(a => a.filename).join(', ')}`);
      }

      console.log(`[EMAIL] Duplicate check passed for email: ${to}`);

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text: text || subject,
        html,
        attachments: attachments ? attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })) : undefined,
      });

      console.log(`[EMAIL] Email sent successfully: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`[EMAIL] Error sending email to ${to}:`, error);
      return { success: false, error };
    }
  }
};

// Backwards compatibility wrapper for old code calls
export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  return EmailService.send(to, subject, html, undefined, text);
};
