
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
    
    // Check if registration exists before proceeding
    try {
      console.log(`Checking if registration ${registrationId} exists...`);
      
      // Note: We're using local storage for demo mode, so the registration may not exist in database
      // This is just a verification step for when using actual Supabase database
      const { data: existingReg, error: regError } = await supabase
        .from('registrations')
        .select('id, email')
        .eq('id', registrationId)
        .maybeSingle();
      
      if (regError) {
        console.log(`Error checking registration: ${regError.message}`);
        // Continue anyway, as we're likely in demo mode
      } else if (existingReg) {
        console.log(`Registration found: ${existingReg.id}, email: ${existingReg.email}`);
      } else {
        console.log(`No registration found with ID ${registrationId} (likely in demo mode)`);
      }
    } catch (checkError) {
      console.error(`Exception checking registration: ${checkError}`);
      // Continue execution even if check fails (likely in demo mode)
    }
    
    // Store the payment verification data in the database
    try {
      console.log("Storing payment data in database...");
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
        console.error(`Error details: ${JSON.stringify(paymentError)}`);
        console.log('Continuing execution despite database error (may be in demo mode)');
      } else {
        console.log('Payment verification data stored successfully');
      }
    } catch (dbError) {
      console.error('Exception while storing payment data:', dbError);
      if (dbError instanceof Error) {
        console.error('DB Error message:', dbError.message);
        console.error('DB Error stack:', dbError.stack);
      } else {
        console.error('Non-Error DB object thrown:', typeof dbError);
      }
      console.log('Continuing execution despite database error (may be in demo mode)');
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
    let emailStatus = "NOT_ATTEMPTED";
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !senderEmail) {
      console.error('Incomplete SMTP configuration. Email sending will be skipped.');
      console.log(`Missing SMTP config: Host=${!smtpHost}, Port=${!smtpPort}, User=${!smtpUser}, Password=${!smtpPassword}, Sender=${!senderEmail}`);
      emailStatus = "CONFIG_ERROR";
    } else {
      // Proceed with email sending
      const client = new SmtpClient();
      
      try {
        console.log(`Attempting to connect to SMTP server at ${smtpHost}:${smtpPort}`);
        
        // Test connectivity to the SMTP server
        try {
          console.log("Testing raw network connectivity to SMTP server...");
          const conn = await Deno.connect({
            hostname: smtpHost,
            port: parseInt(smtpPort),
          });
          console.log("Successfully established raw connection to SMTP server");
          conn.close();
        } catch (connError) {
          console.error("Failed to establish raw connection to SMTP server:", connError);
          if (connError instanceof Error) {
            console.error("Connection error message:", connError.message);
          }
        }
        
        // Add more detailed connection logging
        const connectionConfig = {
          hostname: smtpHost,
          port: parseInt(smtpPort),
          username: smtpUser,
          password: smtpPassword,
          tls: true
        };
        
        console.log(`Connection configuration: ${JSON.stringify({
          hostname: smtpHost,
          port: parseInt(smtpPort),
          username: smtpUser,
          tls: true
          // Don't log the password for security reasons
        })}`);

        console.log("Starting SMTP connection...");
        await client.connectTLS(connectionConfig);
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

        console.log(`Attempting to send email to ${email} from ${senderEmail}`);
        const sendConfig = {
          from: senderEmail,
          to: [email],
          subject: "SYNERGIZIA25 - Payment Verification Received",
          content: "Payment verification request processed",
          html: emailContent,
        };
        
        console.log(`Email send configuration: ${JSON.stringify({
          from: senderEmail,
          to: [email],
          subject: "SYNERGIZIA25 - Payment Verification Received",
        })}`);

        console.log("Sending email...");
        const sendResult = await client.send(sendConfig);
        console.log(`Email send result:`, sendResult);
        
        emailStatus = "SENT";
        console.log(`Email sent successfully to ${email}`);
        await client.close();

      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        if (emailError instanceof Error) {
          console.error('Error message:', emailError.message);
          console.error('Error stack:', emailError.stack);
          console.error('Error type:', emailError.constructor.name);
          emailStatus = `ERROR: ${emailError.message}`;
        } else {
          console.error('Non-Error object thrown:', typeof emailError);
          emailStatus = "UNKNOWN_ERROR";
        }

        // Diagnostic tests for common SMTP issues
        try {
          if (smtpHost === "smtp.gmail.com") {
            console.log("Gmail SMTP detected - checking common issues:");
            
            // Check if using app password
            if (smtpPassword && smtpPassword.length < 20) {
              console.log("WARNING: Gmail likely requires an App Password rather than regular password");
              console.log("See: https://support.google.com/accounts/answer/185833");
              emailStatus = "ERROR: Gmail requires App Password";
            }
            
            // Check port configuration
            if (parseInt(smtpPort) === 587) {
              console.log("Port 587 is correct for TLS with Gmail");
            } else if (parseInt(smtpPort) === 465) {
              console.log("Port 465 is for SSL with Gmail - may require different connection method");
              emailStatus = "ERROR: Incorrect port for Gmail TLS";
            } else {
              console.log(`Port ${smtpPort} is not standard for Gmail SMTP`);
              emailStatus = `ERROR: Non-standard port ${smtpPort} for Gmail`;
            }
          }
        } catch (diagnosticError) {
          console.error("Error during SMTP diagnostics:", diagnosticError);
        }
        
        // Try to close the client gracefully despite the error
        try {
          await client.close();
        } catch (closeError) {
          console.error('Error closing SMTP client:', closeError);
        }
      }
    }

    // Update the payment status in the database based on email sending result
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
        console.log('This is expected in demo mode without database access');
      } else {
        console.log('Payment email status updated successfully');
      }
    } catch (updateError) {
      console.error('Exception while updating payment email status:', updateError);
      console.log('This is expected in demo mode without database access');
    }

    console.log("Function completed successfully");
    console.log(`Final email status: ${emailStatus}`);
    
    // Return a successful response even if email failed, but include the status
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verification initiated",
        emailStatus: emailStatus,
        email: email,
        demoMode: !supabaseUrl || !supabaseKey ? true : false,
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
  } finally {
    console.log("-------------- ENDING VERIFY UPI PAYMENT FUNCTION --------------");
  }
});
