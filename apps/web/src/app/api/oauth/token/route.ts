import { NextResponse } from "next/server";
import { db, schema } from "@stoneway/database";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: Record<string, any> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const grantType = body.grant_type;

    // =========================================================================
    // GRANT 1: authorization_code
    // =========================================================================
    if (grantType === "authorization_code") {
      const code = body.code;
      const redirectUri = body.redirect_uri;
      const codeVerifier = body.code_verifier;

      if (!code) {
        return NextResponse.json(
          { error: "invalid_request", error_description: "Missing authorization code" },
          { status: 400 }
        );
      }

      const [codeRecord] = await db
        .select()
        .from(schema.oauthCodes)
        .where(eq(schema.oauthCodes.code, code))
        .limit(1);

      if (!codeRecord || codeRecord.used || new Date() > new Date(codeRecord.expiresAt)) {
        return NextResponse.json(
          { error: "invalid_grant", error_description: "Authorization code invalid, already used, or expired" },
          { status: 400 }
        );
      }

      // Verify PKCE if code challenge was set
      if (codeRecord.codeChallenge) {
        if (!codeVerifier) {
          return NextResponse.json(
            { error: "invalid_grant", error_description: "Missing code_verifier for PKCE" },
            { status: 400 }
          );
        }

        if (codeRecord.codeChallengeMethod === "S256") {
          const calculatedChallenge = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url");

          if (calculatedChallenge !== codeRecord.codeChallenge) {
            return NextResponse.json(
              { error: "invalid_grant", error_description: "PKCE verification failed" },
              { status: 400 }
            );
          }
        } else if (codeVerifier !== codeRecord.codeChallenge) {
          return NextResponse.json(
            { error: "invalid_grant", error_description: "PKCE verification failed" },
            { status: 400 }
          );
        }
      }

      // Mark code as used immediately
      await db
        .update(schema.oauthCodes)
        .set({ used: true })
        .where(eq(schema.oauthCodes.code, code));

      // Resolve friendly client name
      let clientName = "AI Agent Connector";
      const targetUri = redirectUri || codeRecord.redirectUri;
      if (targetUri.includes("claude.ai") || targetUri.includes("claude.com")) {
        clientName = "Claude (Anthropic)";
      } else if (targetUri.includes("chatgpt.com") || targetUri.includes("openai.com")) {
        clientName = "ChatGPT (OpenAI)";
      }

      const accessToken = `sw_oauth_acc_${crypto.randomBytes(32).toString("hex")}`;
      const refreshToken = `sw_oauth_ref_${crypto.randomBytes(32).toString("hex")}`;
      const now = Date.now();
      const accessExpiresAt = new Date(now + 3600 * 1000); // 1 hour
      const refreshExpiresAt = new Date(now + 30 * 86400 * 1000); // 30 days

      await db.insert(schema.oauthTokens).values({
        accessToken,
        refreshToken,
        clientId: codeRecord.clientId,
        userId: codeRecord.userId,
        clientName,
        scope: codeRecord.scope || "mcp:read mcp:write",
        accessExpiresAt,
        refreshExpiresAt,
      });

      return NextResponse.json(
        {
          access_token: accessToken,
          token_type: "Bearer",
          expires_in: 3600,
          refresh_token: refreshToken,
          scope: codeRecord.scope || "mcp:read mcp:write",
        },
        {
          headers: {
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        }
      );
    }

    // =========================================================================
    // GRANT 2: refresh_token
    // =========================================================================
    if (grantType === "refresh_token") {
      const refreshToken = body.refresh_token;

      if (!refreshToken) {
        return NextResponse.json(
          { error: "invalid_request", error_description: "Missing refresh_token" },
          { status: 400 }
        );
      }

      const [tokenRecord] = await db
        .select()
        .from(schema.oauthTokens)
        .where(eq(schema.oauthTokens.refreshToken, refreshToken))
        .limit(1);

      if (!tokenRecord || tokenRecord.revokedAt || new Date() > new Date(tokenRecord.refreshExpiresAt)) {
        return NextResponse.json(
          { error: "invalid_grant", error_description: "Refresh token is invalid, revoked, or expired" },
          { status: 400 }
        );
      }

      // Rotate tokens
      const newAccessToken = `sw_oauth_acc_${crypto.randomBytes(32).toString("hex")}`;
      const newRefreshToken = `sw_oauth_ref_${crypto.randomBytes(32).toString("hex")}`;
      const now = Date.now();
      const accessExpiresAt = new Date(now + 3600 * 1000); // 1 hour
      const refreshExpiresAt = new Date(now + 30 * 86400 * 1000); // 30 days

      await db
        .update(schema.oauthTokens)
        .set({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          accessExpiresAt,
          refreshExpiresAt,
          lastUsedAt: new Date(),
        })
        .where(eq(schema.oauthTokens.id, tokenRecord.id));

      return NextResponse.json(
        {
          access_token: newAccessToken,
          token_type: "Bearer",
          expires_in: 3600,
          refresh_token: newRefreshToken,
          scope: tokenRecord.scope || "mcp:read mcp:write",
        },
        {
          headers: {
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        }
      );
    }

    return NextResponse.json(
      { error: "unsupported_grant_type", error_description: `Grant type '${grantType}' not supported` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "server_error", error_description: error.message },
      { status: 500 }
    );
  }
}
