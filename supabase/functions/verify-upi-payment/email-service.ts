
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

export interface EmailConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  senderEmail: string;
}

export interface EmailContent {
  to: string;
  registrationId: string;
  transactionId: string;
}

export async function sendConfirmationEmail(
  config: EmailConfig,
  content: EmailContent
): Promise<string> {
  const client = new SmtpClient();
  
  try {
    console.log(`Attempting to connect to SMTP server at ${config.host}:${config.port}`);
    
    await client.connectTLS({
      hostname: config.host,
      port: parseInt(config.port),
      username: config.username,
      password: config.password,
      tls: true
    });
    
    console.log('Successfully connected to SMTP server');

    const emailHtml = `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h1 style="color: #6842c2; text-align: center;">SYNERGIZIA25 - Registration Confirmation</h1>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p>Dear Participant,</p>
          <p>Thank you for registering for SYNERGIZIA25! Your registration has been received and your payment is being verified.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Registration ID:</strong> ${content.registrationId}</p>
            <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${content.transactionId}</p>
          </div>
          <p>Our team will review your payment shortly. You will receive a confirmation email once your payment is verified.</p>
          <p>If you have any questions or concerns, please contact us at synergizia@rgce.edu.in</p>
          <p>Best regards,<br>SYNERGIZIA25 Team</p>
        </div>
      </body>
      </html>
    `;

    const sendConfig = {
      from: config.senderEmail,
      to: [content.to],
      subject: "SYNERGIZIA25 - Registration Confirmation",
      content: "Registration confirmation",
      html: emailHtml,
    };
    
    console.log(`Attempting to send email to ${content.to} from ${config.senderEmail}`);
    await client.send(sendConfig);
    console.log(`Email sent successfully to ${content.to}`);
    
    return "SENT";
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    if (emailError instanceof Error) {
      return `ERROR: ${emailError.message}`;
    }
    return "UNKNOWN_ERROR";
  } finally {
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing SMTP client:', closeError);
    }
  }
}
