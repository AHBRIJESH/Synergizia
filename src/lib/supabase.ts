
import { createClient } from '@supabase/supabase-js'

// Define return type interfaces
interface FunctionResponse<T = any> {
  data: T | null;
  error: Error | null;
}

// Check if the environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Running in demo mode with limited functionality.');
}

// Create the Supabase client with appropriate error handling
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Function to call Supabase edge functions
export async function callEdgeFunction(
  functionName: string,
  payload?: any,
  options?: { token?: string }
): Promise<FunctionResponse> {
  // First check if Supabase is properly configured
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log(`Using demo mode for ${functionName} function`);
    // Return mock data for demo mode
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: { success: true, demo: true },
          error: null
        });
      }, 1000);
    });
  }
  
  try {
    console.log(`Calling Supabase edge function: ${functionName}`);
    console.log(`Payload:`, payload);

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: options?.token ? { Authorization: `Bearer ${options.token}` } : undefined,
    });

    if (error) {
      console.error(`Error invoking ${functionName}:`, error);
      throw new Error(error.message);
    }

    console.log(`Response from ${functionName}:`, data);
    return { data, error: null };
  } catch (err) {
    console.error(`Error calling ${functionName}:`, err);
    return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// Function to verify UPI payment
export async function verifyUPIPayment(
  transactionId: string, 
  registrationId: string,
  email?: string,
  transactionImage?: string
): Promise<FunctionResponse> {
  console.log("verifyUPIPayment called with:");
  console.log("- Transaction ID:", transactionId);
  console.log("- Registration ID:", registrationId);
  console.log("- Email:", email);
  console.log("- Transaction image length:", transactionImage ? transactionImage.length : 0);
  
  // For development/testing or if Supabase credentials are missing, simulate successful verification
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('Using mocked UPI verification due to missing Supabase credentials');
    console.log(`Would send email to: ${email}`);
    console.log(`Transaction image: ${transactionImage?.substring(0, 50)}...`);
    
    // Simulate email sending
    const userEmail = email || 'user@example.com';
    
    // In demo mode, display a more accurate message
    console.log(`In a production environment, an email would be sent to ${userEmail} with payment verification details`);
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: { 
            success: true, 
            status: 'Verified',
            userEmail: userEmail,
            emailSent: true,
            message: `In demo mode: A confirmation would be sent to ${userEmail} in production.`,
            demo: true
          },
          error: null
        });
      }, 1000);
    });
  }
  
  console.log("Calling verify-upi-payment edge function");
  return callEdgeFunction('verify-upi-payment', {
    transactionId,
    registrationId,
    paymentMethod: 'upi',
    email: email,
    transactionImage: transactionImage
  });
}
