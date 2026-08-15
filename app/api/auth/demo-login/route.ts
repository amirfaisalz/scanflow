import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user as userTable, session as sessionTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { ensureUserDemoData } from "@/lib/db/seed-user";

export async function POST(request: NextRequest) {
  try {
    const demoEmail = "admin@scanflow.io";
    const demoName = "Admin Demo User";

    // 1. Find or create admin user in database
    let adminUser = await db.query.user.findFirst({
      where: eq(userTable.email, demoEmail),
    });

    if (!adminUser) {
      const [newUser] = await db
        .insert(userTable)
        .values({
          id: `usr_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
          name: demoName,
          email: demoEmail,
          emailVerified: true,
        })
        .returning();
      adminUser = newUser;
    }

    if (!adminUser) {
      return NextResponse.json({ error: "Failed to initialize demo user" }, { status: 500 });
    }

    // 2. Ensure admin user has campaigns, QR codes, and analytics data in DB
    await ensureUserDemoData(adminUser.id, adminUser.email);

    // 3. Create a fresh session token
    const token = crypto.randomBytes(32).toString("hex");
    const sessionId = `sess_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessionTable).values({
      id: sessionId,
      token,
      userId: adminUser.id,
      expiresAt,
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: request.headers.get("user-agent") || "ScanFlow Demo Client",
    });

    // 4. Return response with auth cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      path: "/",
      sameSite: "lax" as const,
      secure: isProduction,
      expires: expiresAt,
    };

    response.cookies.set("better-auth.session_token", token, cookieOptions);
    if (isProduction) {
      response.cookies.set("__Secure-better-auth.session_token", token, cookieOptions);
    }

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
