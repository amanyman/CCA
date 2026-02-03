import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PartnerFormData {
  partnerType: string;
  agencyName: string;
  contactName: string;
  phone: string;
  email: string;
  insuranceProducts: string[];
  otherProducts?: string;
  customerRange: string;
  referredBy?: string;
  website?: string;
  consentGiven: boolean;
}

async function sendEmail(formData: PartnerFormData) {
  const smtpUsername = Deno.env.get("SMTP_USERNAME");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Deno.env.get("SMTP_PORT");
  const partnerEmail = Deno.env.get("PARTNER_EMAIL") || "partner@californiacarealliance.com";

  if (!smtpUsername || !smtpPassword || !smtpHost || !smtpPort) {
    throw new Error("SMTP configuration is missing");
  }

  const emailBody = `
New Partner Submission Received

Partner Type: ${formData.partnerType}
Agency Name: ${formData.agencyName}
Contact Name: ${formData.contactName}
Phone: ${formData.phone}
Email: ${formData.email}
Website: ${formData.website || 'Not provided'}

Insurance Products: ${formData.insuranceProducts.join(', ')}
${formData.otherProducts ? `Other Products: ${formData.otherProducts}` : ''}

Customer Range: ${formData.customerRange}
Referred By: ${formData.referredBy || 'Not provided'}

Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
`;

  const emailContent = [
    `From: ${smtpUsername}`,
    `Reply-To: ${formData.email}`,
    `To: ${partnerEmail}`,
    `Subject: New Partner Submission from ${formData.agencyName}`,
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
    await sendTlsCommand(`RCPT TO:<${partnerEmail}>`);
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
    const formData: PartnerFormData = await req.json();

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
