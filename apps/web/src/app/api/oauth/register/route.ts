import { NextResponse } from "next/server";
import { db, schema } from "@stoneway/database";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: any;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    }

    const clientName = body.client_name || "AI Agent Connector";
    let redirectUris: string[] = [];
    if (Array.isArray(body.redirect_uris)) {
      redirectUris = body.redirect_uris;
    } else if (typeof body.redirect_uris === "string") {
      redirectUris = [body.redirect_uris];
    }

    if (!redirectUris.length) {
      return NextResponse.json(
        { error: "invalid_client_metadata", error_description: "redirect_uris is required" },
        { status: 400 }
      );
    }

    const clientId = `sw_client_${crypto.randomBytes(16).toString("hex")}`;
    const clientSecret = `sw_secret_${crypto.randomBytes(32).toString("hex")}`;

    await db.insert(schema.oauthClients).values({
      id: clientId,
      clientSecret,
      clientName,
      redirectUris,
      isTrusted: false,
    });

    return NextResponse.json(
      {
        client_id: clientId,
        client_secret: clientSecret,
        client_name: clientName,
        redirect_uris: redirectUris,
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "server_error", error_description: error.message },
      { status: 500 }
    );
  }
}
