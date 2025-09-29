import { google } from "googleapis";

const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

let currentAccessToken: string | null = null;

export function setGmailAccessToken(token: string) {
  currentAccessToken = token;
  oauth2Client.setCredentials({ access_token: token });
}

function requireGmailAuth() {
  if (!currentAccessToken) {
    throw new Error("Gmail access token not set");
  }
}

function getGmail() {
  requireGmailAuth();
  return google.gmail({ version: "v1", auth: oauth2Client });
}

export type EmailMessage = {
  to: string[];
  subject: string;
  body: string;
  from?: string;
};

/**
 * Creates a raw email message in RFC 2822 format
 */
function createEmailMessage(message: EmailMessage): string {
  const { to, subject, body, from } = message;
  
  const emailLines = [
    `To: ${to.join(", ")}`,
    `Subject: ${subject}`,
    from ? `From: ${from}` : "",
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].filter(Boolean);

  return emailLines.join("\r\n");
}

/**
 * Encodes email message to base64url format required by Gmail API
 */
function encodeMessage(message: string): string {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Sends an email using Gmail API from the authenticated user's account
 */
export async function sendGmailMessage(message: EmailMessage): Promise<void> {
  requireGmailAuth();
  const gmail = getGmail();

  try {
    const rawMessage = createEmailMessage(message);
    const encodedMessage = encodeMessage(rawMessage);

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    if (!response.data.id) {
      throw new Error("Failed to send email - no message ID returned");
    }

    console.log(`Email sent successfully. Message ID: ${response.data.id}`);
  } catch (error) {
    console.error("Error sending Gmail message:", error);
    throw new Error(
      `Failed to send email: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Sends multiple emails in batch (with delay to avoid rate limits)
 */
export async function sendBatchGmailMessages(
  messages: EmailMessage[],
  delayMs: number = 1000
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const message of messages) {
    try {
      await sendGmailMessage(message);
      results.sent++;
      
      // Add delay between emails to avoid rate limits
      if (delayMs > 0 && results.sent < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.failed++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`Failed to send to ${message.to.join(", ")}: ${errorMessage}`);
      console.error(`Failed to send email to ${message.to.join(", ")}:`, error);
    }
  }

  return results;
}
