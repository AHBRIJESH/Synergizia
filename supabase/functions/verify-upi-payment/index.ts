
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("-------------- STARTING VERIFY UPI PAYMENT FUNCTION --------------");
  console.log(`Request received at: ${new Date().toISOString()}`);
  console.log(`Request URL: ${req.url}`);
  console.log(`Request method: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log(`Supabase URL available: ${!!supabaseUrl}`);
    console.log(`Supabase key available: ${!!supabaseKey}`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Parsing request body...");
    const requestBody = await req.json();
    const { transactionId, registrationId, email, transactionImage } = requestBody;
    
    console.log("Request body parsed successfully");
    console.log(`Processing payment verification for registration: ${registrationId}`);
    console.log(`Email address: ${email}`);
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Transaction image available: ${!!transactionImage}`);
    console.log(`Transaction image length: ${transactionImage?.length || 0}`);

    // Verify all required SMTP environment variables are present
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const senderEmail = Deno.env.get('SENDER_EMAIL');
    
    // Comprehensive logging for SMTP configuration
    console.log('SMTP Configuration Check:');
    console.log(`SMTP Host: ${smtpHost ? 'Configured' : 'MISSING'}`);
    console.log(`SMTP Port: ${smtpPort ? 'Configured' : 'MISSING'}`);
    console.log(`SMTP User: ${smtpUser ? 'Configured' : 'MISSING'}`);
    console.log(`SMTP Password: ${smtpPassword ? 'Configured' : 'MISSING'}`);
    console.log(`Sender Email: ${senderEmail ? 'Configured' : 'MISSING'}`);

    // Check if registration exists before proceeding
    try {
      console.log(`Checking if registration ${registrationId} exists...`);
      
      const { data: existingReg, error: regError } = await supabase
        .from('registrations')
        .select('id, email')
        .eq('id', registrationId)
        .maybeSingle();
      
      if (regError) {
        console.log(`Error checking registration: ${regError.message}`);
      } else if (existingReg) {
        console.log(`Registration found: ${existingReg.id}, email: ${existingReg.email}`);
      } else {
        console.log(`No registration found with ID ${registrationId}`);
      }
    } catch (checkError) {
      console.error(`Exception checking registration: ${checkError}`);
    }
    
    // Store the payment verification data
    try {
      console.log("Storing payment data...");
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([
          { 
            registration_id: registrationId,
            transaction_id: transactionId,
            status: 'pending',
            transaction_image_url: transactionImage,
            verification_timestamp: new Date().toISOString(),
            payment_method: 'upi',
            amount: 0,  // This will be updated later
            email_sent: false
          }
        ]);
      
      if (paymentError) {
        console.error('Error storing payment data:', paymentError);
        console.log('Continuing execution despite database error');
      } else {
        console.log('Payment verification data stored successfully');
      }
    } catch (dbError) {
      console.error('Exception while storing payment data:', dbError);
    }

    // Proceed with email sending
    let emailStatus = "NOT_ATTEMPTED";
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !senderEmail) {
      console.error('Incomplete SMTP configuration. Email sending will be skipped.');
      emailStatus = "CONFIG_ERROR";
    } else {
      const client = new SmtpClient();
      
      try {
        console.log(`Attempting to connect to SMTP server at ${smtpHost}:${smtpPort}`);
        
        const connectionConfig = {
          hostname: smtpHost,
          port: parseInt(smtpPort),
          username: smtpUser,
          password: smtpPassword,
          tls: true
        };

        console.log("Starting SMTP connection...");
        await client.connectTLS(connectionConfig);
        console.log('Successfully connected to SMTP server');

        const emailContent = `
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h1 style="color: #6842c2; text-align: center;">SYNERGIZIA25 - Registration Confirmation</h1>
              <hr style="border: 0; border-top: 1px solid #eee;">
              <p>Dear Participant,</p>
              <p>Thank you for registering for SYNERGIZIA25! Your registration has been received and your payment is being verified.</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Registration ID:</strong> ${registrationId}</p>
                <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
              </div>
              <p>Our team will review your payment shortly. You will receive a confirmation email once your payment is verified.</p>
              <p>If you have any questions or concerns, please contact us at synergizia@rgce.edu.in</p>
              <p>Best regards,<br>SYNERGIZIA25 Team</p>
            </div>
          </body>
          </html>
        `;

        console.log(`Attempting to send email to ${email} from ${senderEmail}`);
        const sendConfig = {
          from: senderEmail,
          to: [email],
          subject: "SYNERGIZIA25 - Registration Confirmation",
          content: "Registration confirmation",
          html: emailContent,
        };
        
        console.log("Sending email...");
        await client.send(sendConfig);
        emailStatus = "SENT";
        console.log(`Email sent successfully to ${email}`);
        await client.close();

      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        if (emailError instanceof Error) {
          console.error('Error message:', emailError.message);
          emailStatus = `ERROR: ${emailError.message}`;
        } else {
          emailStatus = "UNKNOWN_ERROR";
        }
        try {
          await client.close();
        } catch (closeError) {
          console.error('Error closing SMTP client:', closeError);
        }
      }
    }

    // Update the payment status with email sending result
    try {
      console.log(`Updating payment record with email sent status: ${emailStatus === "SENT"}`);
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          email_sent: emailStatus === "SENT",
          payment_metadata: { 
            emailStatus: emailStatus,
            emailAttemptTime: new Date().toISOString()
          }
        })
        .eq('registration_id', registrationId)
        .eq('transaction_id', transactionId);
      
      if (updateError) {
        console.error('Error updating payment email status:', updateError);
      } else {
        console.log('Payment email status updated successfully');
      }
    } catch (updateError) {
      console.error('Exception while updating payment email status:', updateError);
    }

    console.log("Function completed successfully");
    console.log(`Final email status: ${emailStatus}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verification initiated",
        emailStatus: emailStatus,
        email: email,
        smtpConfigured: !(!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !senderEmail)
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
