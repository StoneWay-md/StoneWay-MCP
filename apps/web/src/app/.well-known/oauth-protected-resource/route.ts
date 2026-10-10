import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.BETTER_AUTH_URL || "https://stonewaymd.vercel.app";
  return NextResponse.json(
    {
      resource: `${baseUrl}/api/mcp`,
      authorization_servers: [baseUrl],
      scopes_supported: ["mcp:read", "mcp:write"],
      bearer_methods_supported: ["header"],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
