import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReferralNotificationData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  accidentDate?: string;
  peopleInvolved?: number;
  atFaultStatus?: string;
  agencyName: string;
}

async function sendEmail(data: ReferralNotificationData) {
  const smtpUsername = Deno.env.get("SMTP_USERNAME");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Deno.env.get("SMTP_PORT");
  const adminEmail = Deno.env.get("ADMIN_EMAIL") || Deno.env.get("PARTNER_EMAIL") || "admin@californiacarealliance.com";

  if (!smtpUsername || !smtpPassword || !smtpHost || !smtpPort) {
    throw new Error("SMTP configuration is missing");
  }

  const atFaultLabel = data.atFaultStatus === 'at_fault' ? 'At Fault'
    : data.atFaultStatus === 'not_at_fault' ? 'Not At Fault'
    : data.atFaultStatus === 'unknown' ? 'Unknown'
    : 'Not Specified';

  const emailBody = `
New Referral Submitted

A new referral has been submitted and is awaiting review.

Submitting Agency: ${data.agencyName}

Customer Information:
  Name: ${data.customerName}
  Phone: ${data.customerPhone}
  Email: ${data.customerEmail || 'Not provided'}

Accident Details:
  Date: ${data.accidentDate || 'Not provided'}
  People Involved: ${data.peopleInvolved || 'Not specified'}
  At-Fault Status: ${atFaultLabel}

Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}

Log in to the admin portal to review and manage this referral.
`;

  const emailContent = [
    `From: ${smtpUsername}`,
    `To: ${adminEmail}`,
    `Subject: New Referral from ${data.agencyName} - ${data.customerName}`,
    `Content-Type: text/plain; charset=utf-8`,
    "",
    emailBody
  ].join("\r\n");

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    const conn = await Deno.connect({
      hostname: smtpHost,
      port: parseInt(smtpPort),
    });

    const reader = conn.readable.getReader();
    const writer = conn.writable.getWriter();

    const readResponse = async () => {
      const { value } = await reader.read();
      return decoder.decode(value);
    };

    const sendCommand = async (command: string) => {
      await writer.write(encoder.encode(command + "\r\n"));
      return await readResponse();
    };

    await readResponse();
    await sendCommand(`EHLO ${smtpHost}`);
    await sendCommand("STARTTLS");

    const tlsConn = await Deno.startTls(conn, { hostname: smtpHost });
    const tlsReader = tlsConn.readable.getReader();
    const tlsWriter = tlsConn.writable.getWriter();

    const readTlsResponse = async () => {
      const { value } = await tlsReader.read();
      return decoder.decode(value);
    };

    const sendTlsCommand = async (command: string) => {
      await tlsWriter.write(encoder.encode(command + "\r\n"));
      return await readTlsResponse();
    };

    await sendTlsCommand(`EHLO ${smtpHost}`);
    await sendTlsCommand("AUTH LOGIN");
    await sendTlsCommand(btoa(smtpUsername));
    await sendTlsCommand(btoa(smtpPassword));
    await sendTlsCommand(`MAIL FROM:<${smtpUsername}>`);
    await sendTlsCommand(`RCPT TO:<${adminEmail}>`);
    await sendTlsCommand("DATA");
    await sendTlsCommand(emailContent + "\r\n.");
    await sendTlsCommand("QUIT");

    tlsConn.close();

    return { success: true };
  } catch (error) {
    console.error("SMTP Error:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: ReferralNotificationData = await req.json();

    await sendEmail(data);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
