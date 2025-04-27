
export interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  senderEmail: string;
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = Deno.env.get('SMTP_HOST');
  const port = Deno.env.get('SMTP_PORT');
  const username = Deno.env.get('SMTP_USER');
  const password = Deno.env.get('SMTP_PASSWORD');
  const senderEmail = Deno.env.get('SENDER_EMAIL');
  
  // Comprehensive logging for SMTP configuration
  console.log('SMTP Configuration Check:');
  console.log(`SMTP Host: ${host ? 'Configured' : 'MISSING'}`);
  console.log(`SMTP Port: ${port ? 'Configured' : 'MISSING'}`);
  console.log(`SMTP User: ${username ? 'Configured' : 'MISSING'}`);
  console.log(`SMTP Password: ${password ? 'Configured' : 'MISSING'}`);
  console.log(`Sender Email: ${senderEmail ? 'Configured' : 'MISSING'}`);

  if (!host || !port || !username || !password || !senderEmail) {
    return null;
  }

  return {
    host,
    port,
    username,
    password,
    senderEmail
  };
}
