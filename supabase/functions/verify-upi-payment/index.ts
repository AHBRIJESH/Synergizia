
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

interface PaymentVerificationRequest {
  transactionId: string;
  registrationId: string;
  paymentMethod: string;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const { transactionId, registrationId, paymentMethod } = await req.json() as PaymentVerificationRequest;

    if (!transactionId || !registrationId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID and Registration ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For Google Pay, we'll consider the payment verified immediately since Google Pay handles verification on their end
    const isGooglePay = paymentMethod === 'googlepay';
    
    // Store the payment information
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          registration_id: registrationId,
          transaction_id: transactionId,
          amount: 0, // We'll update this after fetching registration details
          status: isGooglePay ? 'Verified' : 'Pending',
          payment_method: paymentMethod || 'googlepay',
        }
      ])
      .select()
      .single();

    if (paymentError) {
      console.error('Error storing payment:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to store payment information' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If this is a Google Pay payment, we update the registration status immediately
    if (isGooglePay) {
      // Get registration details
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .select('payment_details')
        .eq('id', registrationId)
        .single();

      if (registrationError) {
        console.error('Error fetching registration:', registrationError);
        // We don't fail the request, just log the error
      } else if (registration) {
        // Update payment amount using registration details
        const amount = registration.payment_details?.amount || 0;
        
        await supabase
          .from('payments')
          .update({ amount })
          .eq('id', paymentData.id);
          
        // Update registration payment status to Verified
        await supabase
          .from('registrations')
          .update({
            payment_details: {
              ...registration.payment_details,
              paymentStatus: 'Verified',
              transactionId: transactionId
            }
          })
          .eq('id', registrationId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: isGooglePay ? 'Verified' : 'Pending',
        paymentId: paymentData.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing payment verification:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
