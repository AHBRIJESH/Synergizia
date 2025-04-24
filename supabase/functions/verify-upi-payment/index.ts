
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

interface PaymentVerificationRequest {
  transactionId: string;
  registrationId: string;
  paymentMethod: string;
  email?: string; // Make email optional but available
}

const sendConfirmationEmail = async (userEmail: string, registrationId: string, transactionId: string, eventDetails: any, amount: number) => {
  try {
    // Get email configuration from environment variables
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.example.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER') || 'user@example.com';
    const smtpPass = Deno.env.get('SMTP_PASSWORD') || 'password';
    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'events@synergizia25.com';

    // For development/testing only - if env variables aren't set, log instead of sending
    if (!Deno.env.get('SMTP_HOST') || !Deno.env.get('SMTP_USER') || !Deno.env.get('SMTP_PASSWORD')) {
      console.log(`[DEV MODE] Would send email to ${userEmail} with registration ${registrationId}`);
      return { success: true, mode: 'development' };
    }

    const client = new SmtpClient();
    
    await client.connectTLS({
      hostname: smtpHost,
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
    });

    // Format selected events for the email
    const eventsList = eventDetails?.selectedEvents?.map((event: string) => `• ${event}`).join('\n') || 'No events selected';
    const lunchOption = eventDetails?.lunchOption === 'veg' ? 'Vegetarian (₹50)' : 
                        (eventDetails?.lunchOption === 'nonveg' ? 'Non-Vegetarian (₹60)' : 'None');

    // Create email content
    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6d28d9; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SYNERGIZIA25 Registration Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear Participant,</p>
          <p>Thank you for registering for SYNERGIZIA25! Your registration has been confirmed.</p>
          
          <h2>Registration Details</h2>
          <table>
            <tr>
              <th>Registration ID</th>
              <td>${registrationId}</td>
            </tr>
            <tr>
              <th>Transaction ID</th>
              <td>${transactionId}</td>
            </tr>
            <tr>
              <th>Payment Amount</th>
              <td>₹${amount}</td>
            </tr>
          </table>
          
          <h2>Event Selections</h2>
          <p>${eventsList}</p>
          
          <h2>Lunch Option</h2>
          <p>${lunchOption}</p>
          
          <p>Please keep this email for your records. You may be asked to show it upon arrival.</p>
          
          <p>We look forward to seeing you at the event!</p>
          
          <p>Best regards,<br>The SYNERGIZIA25 Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await client.send({
      from: senderEmail,
      to: userEmail,
      subject: "SYNERGIZIA25 Registration Confirmation",
      content: emailContent,
      html: emailContent,
    });

    await client.close();
    
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: String(error) };
  }
};

serve(async (req) => {
  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const { transactionId, registrationId, paymentMethod, email } = await req.json() as PaymentVerificationRequest;

    if (!transactionId || !registrationId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID and Registration ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store the payment information
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          registration_id: registrationId,
          transaction_id: transactionId,
          amount: 0, // We'll update this after fetching registration details
          status: 'Pending',
          payment_method: 'upi',
          payment_metadata: { email: email || null } // Store email in metadata
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

    // Get registration details to update payment amount
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('payment_details, email, full_name, selected_events')
      .eq('id', registrationId)
      .single();

    if (registrationError) {
      console.error('Error fetching registration:', registrationError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch registration details' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (registration) {
      // Update payment amount using registration details
      const amount = registration.payment_details?.amount || 0;
      
      await supabase
        .from('payments')
        .update({ amount })
        .eq('id', paymentData.id);
        
      // Update registration payment status
      await supabase
        .from('registrations')
        .update({
          payment_details: {
            ...registration.payment_details,
            paymentStatus: 'Pending',
            transactionId: transactionId
          }
        })
        .eq('id', registrationId);
        
      // Get the email either from the request or from the registration
      const userEmail = email || registration.email || null;
      
      // If email exists, send a confirmation email
      if (userEmail) {
        const emailResult = await sendConfirmationEmail(
          userEmail, 
          registrationId, 
          transactionId,
          { 
            selectedEvents: registration.selected_events,
            lunchOption: registration.payment_details?.lunchOption 
          },
          amount
        );
        
        console.log(`Email sending result for ${userEmail}:`, emailResult);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: 'Pending',
        paymentId: paymentData.id,
        userEmail: email || registration?.email || null,
        upiDetails: {
          upiId: "your.upi.id@bank", // Replace with your actual UPI ID
          merchantName: "SYNERGIZIA25"
        }
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
