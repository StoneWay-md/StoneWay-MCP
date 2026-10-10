import { NextResponse } from "next/server";
import { db, schema } from "@stoneway/database";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { device_code } = await req.json();

    if (!device_code) {
      return NextResponse.json({ error: "Missing device_code" }, { status: 400 });
    }

    const [record] = await db
      .select()
      .from(schema.deviceCodes)
      .where(eq(schema.deviceCodes.deviceCode, device_code))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
    }

    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ error: "expired_token" }, { status: 400 });
    }

    if (record.status === "pending") {
      return NextResponse.json({ status: "authorization_pending" });
    }

    if (record.status === "approved" && record.token) {
      // Mark consumed
      await db
        .update(schema.deviceCodes)
        .set({ status: "consumed" })
        .where(eq(schema.deviceCodes.deviceCode, device_code));

      return NextResponse.json({
        status: "approved",
        token: record.token,
      });
    }

    return NextResponse.json({ error: "access_denied" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
