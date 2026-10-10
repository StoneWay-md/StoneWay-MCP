import { NextResponse } from "next/server";
import { db, schema } from "@stoneway/database";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const baseUrl = process.env.BETTER_AUTH_URL || "https://stonewaymd.vercel.app";
    const deviceCode = `sw_dev_${crypto.randomBytes(24).toString("hex")}`;
    const userCode = `SW-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await db.insert(schema.deviceCodes).values({
      deviceCode,
      userCode,
      status: "pending",
      expiresAt,
    });

    return NextResponse.json({
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: `${baseUrl}/cli/verify`,
      verification_uri_complete: `${baseUrl}/cli/verify?code=${userCode}`,
      expires_in: 900,
      interval: 2,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
