
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { sendConfirmationEmail } from './email-service.ts';
import { storePaymentData } from './payment-service.ts';
import { verifyRegistration } from './registration-service.ts';
import { getSmtpConfig } from './config-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("-------------- STARTING VERIFY UPI PAYMENT FUNCTION --------------");
  console.log(`Request received at: ${new Date().toISOString()}`);
  console.log(`Request URL: ${req.url}`);
  console.log(`Request method: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log(`Supabase URL available: ${!!supabaseUrl}`);
    console.log(`Supabase key available: ${!!supabaseKey}`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { transactionId, registrationId, email, transactionImage } = await req.json();
    
    console.log("Request body parsed successfully");
    console.log(`Processing payment verification for registration: ${registrationId}`);
    console.log(`Email address: ${email}`);
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Transaction image available: ${!!transactionImage}`);
    console.log(`Transaction image length: ${transactionImage?.length || 0}`);

    // Verify registration exists
    await verifyRegistration(supabase, registrationId);

    // Get SMTP configuration
    const smtpConfig = getSmtpConfig();
    let emailStatus = "NOT_ATTEMPTED";
    
    if (!smtpConfig) {
      console.error('Incomplete SMTP configuration. Email sending will be skipped.');
      emailStatus = "CONFIG_ERROR";
    } else {
      emailStatus = await sendConfirmationEmail(
        smtpConfig,
        { to: email, registrationId, transactionId }
      );
    }

    // Store payment data and update email status
    await storePaymentData(supabase, {
      registrationId,
      transactionId,
      transactionImage,
      emailStatus
    });

    console.log("Function completed successfully");
    console.log(`Final email status: ${emailStatus}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verification initiated",
        emailStatus: emailStatus,
        email: email,
        smtpConfigured: !!smtpConfig
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
