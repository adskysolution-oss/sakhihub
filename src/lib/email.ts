import nodemailer from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: Buffer | string; // Buffer or Base64/plain string
  contentType?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
  text?: string;
}

// Resend HTTP Send Helper
async function sendViaResendApi(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: any }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Resend API key is missing (RESEND_API_KEY)' };
  }

  const from = process.env.EMAIL_FROM || 'SakhiHub <noreply@sakhihub.com>';
  
  try {
    const formattedAttachments = options.attachments?.map(att => {
      const contentBase64 = att.content instanceof Buffer 
        ? att.content.toString('base64') 
        : Buffer.from(att.content).toString('base64');
      return {
        filename: att.filename,
        content: contentBase64
      };
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
        attachments: formattedAttachments
      })
    });

    const data = await response.json();
    if (response.ok && data.id) {
      return { success: true, messageId: data.id };
    } else {
      return { success: false, error: data.message || 'Failed to send via Resend API' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || error };
  }
}

// SMTP Transporter Factory
function getSmtpTransporter(provider: string) {
  let host = '';
  let port = 587;
  let secure = false;
  let auth = { user: '', pass: '' };

  switch (provider) {
    case 'aws_ses':
      host = process.env.AWS_SES_HOST || `email-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
      port = parseInt(process.env.AWS_SES_PORT || '465');
      secure = port === 465;
      auth = {
        user: process.env.AWS_SES_USER || '',
        pass: process.env.AWS_SES_PASS || '',
      };
      break;

    case 'brevo':
      host = 'smtp-relay.brevo.com';
      port = 587;
      secure = false;
      auth = {
        user: process.env.BREVO_USER || '',
        pass: process.env.BREVO_PASS || '',
      };
      break;

    case 'mailgun':
      host = process.env.MAILGUN_HOST || 'smtp.mailgun.org';
      port = 587;
      secure = false;
      auth = {
        user: process.env.MAILGUN_USER || '',
        pass: process.env.MAILGUN_PASS || '',
      };
      break;

    case 'gmail':
    default:
      host = 'smtp.gmail.com';
      port = 465;
      secure = true;
      auth = {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      };
      break;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
    connectionTimeout: 10000,
    socketTimeout: 10000,
    greetingTimeout: 10000
  });
}

export const EmailService = {
  send: async (
    to: string,
    subject: string,
    html: string,
    attachments?: EmailAttachment[],
    text?: string
  ): Promise<{ success: boolean; messageId?: string; error?: any }> => {
    const provider = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase();
    console.log(`[EMAIL] Dispatching email via [${provider}] to: ${to}, subject: "${subject}"`);

    try {
      // 1. Resend API Send path (Primary)
      if (provider === 'resend') {
        const result = await sendViaResendApi({ to, subject, html, attachments, text });
        if (result.success) {
          console.log(`[EMAIL] Sent successfully via Resend API: ${result.messageId}`);
          return result;
        }
        console.error(`[EMAIL] Resend API failed:`, result.error, `. Falling back to SMTP configuration.`);
        // Fall back to SMTP or continue
      }

      // 2. SMTP Providers path (AWS SES, Brevo, Mailgun, or Gmail fallback)
      const transporter = getSmtpTransporter(provider === 'resend' ? 'gmail' : provider);
      
      const mailOptions: any = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text: text || subject,
        html,
        attachments: attachments ? attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })) : undefined
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Email sent successfully via SMTP [${provider}]: ${info.messageId}`);
      return { success: true, messageId: info.messageId };

    } catch (error: any) {
      console.error(`[EMAIL] Error sending email to ${to} using ${provider}:`, error);
      return { success: false, error: error.message || error };
    }
  }
};

// Backwards compatibility wrapper for older parts of the app
export const sendEmail = async (to: string, subject: string, html: string, text?: string) => {
  return EmailService.send(to, subject, html, undefined, text);
};
