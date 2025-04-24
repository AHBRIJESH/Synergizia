
-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  college TEXT NOT NULL,
  department TEXT NOT NULL,
  custom_department TEXT,
  year TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  selected_events JSONB NOT NULL,
  lunch_option TEXT,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_details JSONB NOT NULL
);

-- Enable RLS (Row Level Security) on the table
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (edge functions)
CREATE POLICY "Allow edge functions to insert registrations" 
ON registrations FOR INSERT WITH CHECK (true);

-- Create policy for updating (edge functions)
CREATE POLICY "Allow edge functions to update registrations" 
ON registrations FOR UPDATE USING (true);

-- Create policy for reading their own registrations (users)
CREATE POLICY "Allow users to read their own registrations" 
ON registrations FOR SELECT USING (email = auth.email());

-- Create admin policy for reading all registrations
CREATE POLICY "Allow admins to read all registrations" 
ON registrations FOR SELECT 
USING (
  auth.jwt() ? auth.jwt()->>'role' = 'admin' : false
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
