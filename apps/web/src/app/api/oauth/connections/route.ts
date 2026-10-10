import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@stoneway/database";
import { eq, and, isNull, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await db
    .select({
      id: schema.oauthTokens.id,
      clientName: schema.oauthTokens.clientName,
      clientId: schema.oauthTokens.clientId,
      scope: schema.oauthTokens.scope,
      createdAt: schema.oauthTokens.createdAt,
      lastUsedAt: schema.oauthTokens.lastUsedAt,
      accessExpiresAt: schema.oauthTokens.accessExpiresAt,
      revokedAt: schema.oauthTokens.revokedAt,
    })
    .from(schema.oauthTokens)
    .where(eq(schema.oauthTokens.userId, session.user.id))
    .orderBy(desc(schema.oauthTokens.createdAt));

  return NextResponse.json({ connections });
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("id");

  if (!connectionId) {
    return NextResponse.json({ error: "Missing connection id" }, { status: 400 });
  }

  await db
    .update(schema.oauthTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(schema.oauthTokens.id, connectionId),
        eq(schema.oauthTokens.userId, session.user.id)
      )
    );

  return NextResponse.json({ success: true, revokedId: connectionId });
}
