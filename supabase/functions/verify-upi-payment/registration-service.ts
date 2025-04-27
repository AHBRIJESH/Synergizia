
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

export async function verifyRegistration(
  supabase: ReturnType<typeof createClient>,
  registrationId: string
): Promise<boolean> {
  console.log(`Checking if registration ${registrationId} exists...`);
  
  const { data: existingReg, error: regError } = await supabase
    .from('registrations')
    .select('id, email')
    .eq('id', registrationId)
    .maybeSingle();
  
  if (regError) {
    console.log(`Error checking registration: ${regError.message}`);
    return false;
  }
  
  if (existingReg) {
    console.log(`Registration found: ${existingReg.id}, email: ${existingReg.email}`);
    return true;
  }
  
  console.log(`No registration found with ID ${registrationId}`);
  return false;
}
