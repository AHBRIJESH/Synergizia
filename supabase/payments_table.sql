
-- Create payments table for tracking UPI transactions
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id TEXT REFERENCES registrations(id),
    transaction_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    payment_method TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy for edge functions
CREATE POLICY "Allow edge functions to manage payments" 
ON payments FOR ALL USING (true);

-- Create policy for users to view their own payments
CREATE POLICY "Users can view their own payments" 
ON payments FOR SELECT 
USING (
    registration_id IN (
        SELECT id FROM registrations 
        WHERE email = auth.email()
    )
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

