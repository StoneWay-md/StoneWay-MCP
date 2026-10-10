import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@stoneway/database";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("client_id") || "claude-connector";
  const redirectUri = url.searchParams.get("redirect_uri");
  const responseType = url.searchParams.get("response_type");
  const state = url.searchParams.get("state") || "";
  const codeChallenge = url.searchParams.get("code_challenge");
  const codeChallengeMethod = url.searchParams.get("code_challenge_method") || "plain";
  const scope = url.searchParams.get("scope") || "mcp:read mcp:write";

  if (!redirectUri) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing redirect_uri" },
      { status: 400 }
    );
  }

  if (responseType !== "code") {
    const errorUrl = new URL(redirectUri);
    errorUrl.searchParams.set("error", "unsupported_response_type");
    if (state) errorUrl.searchParams.set("state", state);
    return NextResponse.redirect(errorUrl.toString());
  }

  // Check Better Auth session from incoming cookies
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session || !session.user) {
    // User is not signed in: redirect to login page with return callback
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl.toString());
  }

  // User is authenticated! Issue authorization code
  const code = `sw_code_${crypto.randomBytes(24).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Auto-register trusted clients if not already present
  if (clientId) {
    try {
      const [existingClient] = await db
        .select()
        .from(schema.oauthClients)
        .where(eq(schema.oauthClients.id, clientId))
        .limit(1);

      if (!existingClient) {
        let clientName = "AI Agent Connector";
        if (redirectUri.includes("claude.ai") || redirectUri.includes("claude.com")) {
          clientName = "Claude (Anthropic)";
        } else if (redirectUri.includes("chatgpt.com") || redirectUri.includes("openai.com")) {
          clientName = "ChatGPT (OpenAI)";
        }

        await db.insert(schema.oauthClients).values({
          id: clientId,
          clientName,
          redirectUris: [redirectUri],
          isTrusted: true,
        });
      }
    } catch {
      // Continue even if client registration check encounters race
    }
  }

  await db.insert(schema.oauthCodes).values({
    code,
    clientId,
    userId: session.user.id,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
    scope,
    expiresAt,
    used: false,
  });

  // Redirect back to agent client callback
  const targetRedirect = new URL(redirectUri);
  targetRedirect.searchParams.set("code", code);
  if (state) targetRedirect.searchParams.set("state", state);

  return NextResponse.redirect(targetRedirect.toString());
}
