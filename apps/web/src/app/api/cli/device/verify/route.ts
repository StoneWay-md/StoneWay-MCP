import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema, generateApiKey, hashApiKey } from "@stoneway/database";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Missing user verification code" }, { status: 400 });
    }

    const formattedCode = code.trim().toUpperCase();

    const [record] = await db
      .select()
      .from(schema.deviceCodes)
      .where(and(eq(schema.deviceCodes.userCode, formattedCode), eq(schema.deviceCodes.status, "pending")))
      .limit(1);

    if (!record || new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ error: "Invalid, expired, or already approved code" }, { status: 400 });
    }

    // Generate new secure API key for the device
    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    await db.insert(schema.apiKeys).values({
      userId: session.user.id,
      keyHash,
      keyPrefix: rawKey.substring(0, 7),
      name: `CLI Device Login (${new Date().toLocaleDateString()})`,
    });

    // Approve the device code
    await db
      .update(schema.deviceCodes)
      .set({
        status: "approved",
        userId: session.user.id,
        token: rawKey,
      })
      .where(eq(schema.deviceCodes.deviceCode, record.deviceCode));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
