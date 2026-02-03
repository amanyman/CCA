import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SupportFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferredContactMethod: string;
  helpType: string;
  whatHappened: string;
  incidentDate: string;
  anyPassengers: boolean;
  referredBy?: string;
  consentGiven: boolean;
}

async function sendEmail(formData: SupportFormData) {
  const smtpUsername = Deno.env.get("SMTP_USERNAME");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Deno.env.get("SMTP_PORT");
  const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "support@californiacarealliance.com";

  if (!smtpUsername || !smtpPassword || !smtpHost || !smtpPort) {
    throw new Error("SMTP configuration is missing");
  }

  const emailBody = `
New Support Request Received

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Address: ${formData.address}

Preferred Contact Method: ${formData.preferredContactMethod}
Help Type Needed: ${formData.helpType}

What Happened:
${formData.whatHappened}

Incident Date: ${formData.incidentDate}
Any Passengers: ${formData.anyPassengers ? 'Yes' : 'No'}

Referred By: ${formData.referredBy || 'Not provided'}

Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
`;

  const emailContent = [
    `From: ${smtpUsername}`,
    `Reply-To: ${formData.email}`,
    `To: ${supportEmail}`,
    `Subject: New Support Request from ${formData.name}`,
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
    await sendTlsCommand(`RCPT TO:<${supportEmail}>`);
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
    const formData: SupportFormData = await req.json();

    await sendEmail(formData);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
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
