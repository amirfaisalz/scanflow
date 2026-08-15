import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { session as sessionTable } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Retrieve the current authenticated session on the server.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentSession(request?: Request | Headers | { headers?: Headers }) {
  try {
    let reqHeaders: Headers;
    if (request instanceof Headers) {
      reqHeaders = request;
    } else if (request && "headers" in request && request.headers) {
      reqHeaders = request.headers as Headers;
    } else {
      reqHeaders = await headers();
    }

    // 1. Try Better Auth's standard session retrieval
    try {
      const session = await auth.api.getSession({
        headers: reqHeaders,
      });
      if (session?.user) {
        return session;
      }
    } catch {
      // Continue to DB token recovery
    }

    // 2. Direct DB token fallback from cookies (guarantees session recovery in serverless environments)
    let cookieString = "";
    if (reqHeaders && typeof reqHeaders.get === "function") {
      cookieString = reqHeaders.get("cookie") || "";
    }
    if (!cookieString) {
      try {
        const cookieStore = await cookies();
        const tokenCookie =
          cookieStore.get("better-auth.session_token")?.value ||
          cookieStore.get("__Secure-better-auth.session_token")?.value;
        if (tokenCookie) {
          cookieString = `better-auth.session_token=${tokenCookie}`;
        }
      } catch {}
    }

    if (cookieString) {
      const match = cookieString.match(
        /(?:better-auth\.session_token|__Secure-better-auth\.session_token)=([^;]+)/
      );
      const rawToken = match ? decodeURIComponent(match[1].trim()) : null;

      if (rawToken) {
        // Strip signature suffix if token is signed with .
        const cleanToken = rawToken.split(".")[0];
        const dbSession = await db.query.session.findFirst({
          where: and(
            eq(sessionTable.token, cleanToken),
            gt(sessionTable.expiresAt, new Date())
          ),
          with: {
            user: true,
          },
        });

        if (dbSession?.user) {
          return {
            session: {
              id: dbSession.id,
              userId: dbSession.userId,
              expiresAt: dbSession.expiresAt,
              token: dbSession.token,
              createdAt: dbSession.createdAt,
              updatedAt: dbSession.updatedAt,
              ipAddress: dbSession.ipAddress,
              userAgent: dbSession.userAgent,
            },
            user: dbSession.user,
          } as any;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("getCurrentSession error:", error);
    return null;
  }
}

/**
 * Retrieve the current authenticated user on the server.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentUser(request?: Request | Headers | { headers?: Headers }) {
  const session = await getCurrentSession(request);
  return session?.user ?? null;
}

/**
 * Ensure the user is authenticated in Server Components/Actions.
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth(returnUrl?: string) {
  const session = await getCurrentSession();
  if (!session?.user) {
    const loginUrl = returnUrl ? `/login?callbackUrl=${encodeURIComponent(returnUrl)}` : "/login";
    redirect(loginUrl);
  }
  return session;
}
