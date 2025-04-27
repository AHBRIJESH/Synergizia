
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

    // Store payment verification record
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
      throw verificationError;
    }

    // Send confirmation email
    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: Deno.env.get('SMTP_HOST') || '',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USER') || '',
      password: Deno.env.get('SMTP_PASSWORD') || '',
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

    await client.send({
      from: Deno.env.get('SENDER_EMAIL') || '',
      to: [email],
      subject: "SYNERGIZIA25 Payment Verification",
      content: "Payment verification initiated",
      html: emailContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, data: verificationData }),
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
