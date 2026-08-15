import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Retrieve the current authenticated session on the server.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentSession(request?: Request | Headers | { headers?: Headers }) {
  let reqHeaders: Headers;
  if (request instanceof Headers) {
    reqHeaders = request;
  } else if (request && "headers" in request && request.headers instanceof Headers) {
    reqHeaders = request.headers;
  } else {
    reqHeaders = await headers();
  }

  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return session;
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
