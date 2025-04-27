
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
    
    // Store payment verification record
    try {
      const { data: verificationData, error: verificationError } = await supabase
        .from('payment_verifications')
        .insert([
          {
            registration_id: registrationId,
            transaction_id: transactionId,
            status: 'pending',
            verification_metadata: {
              transaction_image: transactionImage,
              verification_time: new Date().toISOString(),
            },
          },
        ])
        .select()
        .single();

      if (verificationError) {
        console.error('Database error:', verificationError);
        throw verificationError;
      }
      
      console.log('Payment verification record created:', verificationData?.id);
    } catch (dbError) {
      console.error('Failed to create verification record:', dbError);
      // Continue with email sending even if db insert fails
    }

    // Send confirmation email
    try {
      const smtpHost = Deno.env.get('SMTP_HOST');
      const smtpPort = Deno.env.get('SMTP_PORT');
      const smtpUser = Deno.env.get('SMTP_USER');
      const smtpPassword = Deno.env.get('SMTP_PASSWORD');
      const senderEmail = Deno.env.get('SENDER_EMAIL');
      
      if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !senderEmail) {
        console.warn('SMTP configuration incomplete. Email sending skipped.');
        throw new Error('SMTP configuration incomplete');
      }

      const client = new SmtpClient();
      
      console.log(`Connecting to SMTP: ${smtpHost}:${smtpPort}`);
      
      await client.connectTLS({
        hostname: smtpHost,
        port: parseInt(smtpPort),
        username: smtpUser,
        password: smtpPassword,
      });

      const emailContent = `
        <h1>Registration Payment Verification</h1>
        <p>Dear participant,</p>
        <p>We have received your payment verification request for SYNERGIZIA25.</p>
        <p>Registration ID: ${registrationId}</p>
        <p>Transaction ID: ${transactionId}</p>
        <p>Our team will verify your payment shortly and send you a confirmation email.</p>
        <p>Best regards,<br>SYNERGIZIA25 Team</p>
      `;

      console.log(`Sending email to ${email}`);
      
      await client.send({
        from: senderEmail,
        to: [email],
        subject: "SYNERGIZIA25 Payment Verification",
        content: "Payment verification initiated",
        html: emailContent,
      });

      await client.close();
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't throw here, we'll still return success to the client
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verification initiated",
        emailStatus: "Email sending attempted"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
