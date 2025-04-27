
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
    console.log(`Sender Email: ${senderEmail ? 'Configured' : 'MISSING'}`);

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
    
    try {
      await client.connectTLS({
        hostname: smtpHost,
        port: parseInt(smtpPort),
        username: smtpUser,
        password: smtpPassword,
      });

      const emailContent = `
        <h1>SYNERGIZIA25 - Payment Verification</h1>
        <p>Dear Participant,</p>
        <p>We have received your payment verification request.</p>
        <p>Registration ID: ${registrationId}</p>
        <p>Transaction ID: ${transactionId}</p>
        <p>Our team will review your payment and send a confirmation soon.</p>
        <p>Best regards,<br>SYNERGIZIA25 Team</p>
      `;

      await client.send({
        from: senderEmail,
        to: [email],
        subject: "SYNERGIZIA25 - Payment Verification Received",
        content: "Payment verification request processed",
        html: emailContent,
      });

      console.log(`Email sent successfully to ${email}`);
      await client.close();

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Log the error but don't block the overall response
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verification initiated",
        emailStatus: "ATTEMPTED"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Verification process error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
