
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

interface PaymentData {
  registrationId: string;
  transactionId: string;
  transactionImage?: string;
  emailStatus: string;
}

export async function storePaymentData(
  supabase: ReturnType<typeof createClient>,
  data: PaymentData
): Promise<void> {
  console.log("Storing payment data...");
  const { error: paymentError } = await supabase
    .from('payments')
    .insert([
      { 
        registration_id: data.registrationId,
        transaction_id: data.transactionId,
        status: 'pending',
        transaction_image_url: data.transactionImage,
        verification_timestamp: new Date().toISOString(),
        payment_method: 'upi',
        amount: 0,
        email_sent: false
      }
    ]);
  
  if (paymentError) {
    console.error('Error storing payment data:', paymentError);
    console.log('Continuing execution despite database error');
  } else {
    console.log('Payment verification data stored successfully');
  }

  // Update the payment status with email sending result
  const { error: updateError } = await supabase
    .from('payments')
    .update({ 
      email_sent: data.emailStatus === "SENT",
      payment_metadata: { 
        emailStatus: data.emailStatus,
        emailAttemptTime: new Date().toISOString()
      }
    })
    .eq('registration_id', data.registrationId)
    .eq('transaction_id', data.transactionId);
  
  if (updateError) {
    console.error('Error updating payment email status:', updateError);
  } else {
    console.log('Payment email status updated successfully');
  }
}
