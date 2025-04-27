
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { transactionId, registrationId, email, transactionImage } = await req.json();
    
    console.log(`Processing payment verification for registration: ${registrationId}`);
    console.log(`Email address: ${email}`);
    
    // Store the payment verification data in the database
    try {
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([
          { 
            registration_id: registrationId,
            transaction_id: transactionId,
            status: 'pending',
            transaction_image_url: transactionImage,
            verification_timestamp: new Date().toISOString()
          }
        ]);
      
      if (paymentError) {
        console.error('Error storing payment data:', paymentError);
        // Continue execution even if database storage fails
      } else {
        console.log('Payment verification data stored successfully');
      }
    } catch (dbError) {
      console.error('Exception while storing payment data:', dbError);
      // Continue execution even if database storage fails
    }
    
    // Verify all required SMTP environment variables are present
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const senderEmail = Deno.env.get('SENDER_EMAIL');
    
    // Comprehensive logging for SMTP configuration
    console.log('SMTP Configuration Check:');
    console.log(`SMTP Host: ${smtpHost ? smtpHost : 'MISSING'}`);
    console.log(`SMTP Port: ${smtpPort ? smtpPort : 'MISSING'}`);
    console.log(`SMTP User: ${smtpUser ? smtpUser : 'MISSING'}`);
    console.log(`SMTP Password: ${smtpPassword ? 'Configured' : 'MISSING'}`);
    console.log(`Sender Email: ${senderEmail ? senderEmail : 'MISSING'}`);

    // Validate SMTP configuration
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !senderEmail) {
      console.error('Incomplete SMTP configuration. Email sending will be skipped.');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email configuration incomplete. Please contact support.",
          emailStatus: "CONFIGURATION_ERROR"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Proceed with email sending
    const client = new SmtpClient();
    let emailStatus = "FAILED";
    
    try {
      console.log(`Attempting to connect to SMTP server at ${smtpHost}:${smtpPort}`);
      await client.connectTLS({
        hostname: smtpHost,
        port: parseInt(smtpPort),
        username: smtpUser,
        password: smtpPassword,
      });
      console.log('Successfully connected to SMTP server');

      const emailContent = `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h1 style="color: #6842c2; text-align: center;">SYNERGIZIA25 - Payment Verification</h1>
            <hr style="border: 0; border-top: 1px solid #eee;">
            <p>Dear Participant,</p>
            <p>Thank you for registering for SYNERGIZIA25! We have received your payment verification request.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Registration ID:</strong> ${registrationId}</p>
              <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
            </div>
            <p>Our team will review your payment and update your registration status shortly. You will receive a confirmation email once your payment is verified.</p>
            <p>If you have any questions or concerns, please reply to this email.</p>
            <p>Best regards,<br>SYNERGIZIA25 Team</p>
          </div>
        </body>
        </html>
      `;

      console.log(`Attempting to send email to ${email}`);
      await client.send({
        from: senderEmail,
        to: [email],
        subject: "SYNERGIZIA25 - Payment Verification Received",
        content: "Payment verification request processed",
        html: emailContent,
      });

      console.log(`Email sent successfully to ${email}`);
      emailStatus = "SENT";
      await client.close();

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      if (emailError instanceof Error) {
        console.error('Error message:', emailError.message);
        console.error('Error stack:', emailError.stack);
      }
      // Try to close the client gracefully despite the error
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing SMTP client:', closeError);
      }
    }

    // Update the payment status in the database based on email sending result
    try {
      const { error: updateError } = await supabase
        .from('payments')
        .update({ email_sent: emailStatus === "SENT" })
        .eq('registration_id', registrationId)
        .eq('transaction_id', transactionId);
      
      if (updateError) {
        console.error('Error updating payment email status:', updateError);
      }
    } catch (updateError) {
      console.error('Exception while updating payment email status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verification initiated",
        emailStatus: emailStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Verification process error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
