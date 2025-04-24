
import { createClient } from '@supabase/supabase-js'

// Public Supabase URL and anon key are safe to expose on the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to call Supabase edge functions
export async function callEdgeFunction(
  functionName: string,
  payload?: any,
  options?: { token?: string }
) {
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
