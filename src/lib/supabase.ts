
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
  console.error('Missing Supabase credentials. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.');
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
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: options?.token ? { Authorization: `Bearer ${options.token}` } : undefined,
    });

    if (error) {
      throw new Error(error.message);
    }

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
  // For development/testing, simulate successful verification
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('Using mocked UPI verification due to missing Supabase credentials');
    console.log(`Would send email to: ${email}`);
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: { 
            success: true, 
            status: 'Verified',
            userEmail: email || 'user@example.com', // Include email in the mock response
            emailSent: true // Simulate that an email was sent
          },
          error: null
        });
      }, 1000);
    });
  }
  
  return callEdgeFunction('verify-upi-payment', {
    transactionId,
    registrationId,
    paymentMethod: 'upi',
    email: email, // Pass the email to the edge function
    transactionImage: transactionImage // Pass the transaction image URL
  });
}
