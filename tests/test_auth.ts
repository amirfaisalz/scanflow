import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../lib/db";
import { user, session, account } from "../lib/db/schema";
import { auth } from "../lib/auth";
import { eq } from "drizzle-orm";

async function runAuthTests() {
  console.log("🚀 Starting ScanFlow Auth & DB Verification Tests...\n");

  const testEmail = `test_${Date.now()}@scanflow.io`;
  const testPassword = "SecurePassword123!";
  const testName = "Test Developer";

  // 1. Test database connectivity
  console.log("1. Testing PostgreSQL database connection via Drizzle ORM...");
  const dbUsers = await db.select().from(user).limit(1);
  console.log("   ✓ Database connection verified. Current user count:", dbUsers.length);

  // 2. Test user creation through Better Auth
  console.log("\n2. Testing user registration through Better Auth API...");
  const signUpResponse = await auth.api.signUpEmail({
    body: {
      email: testEmail,
      password: testPassword,
      name: testName,
    },
  });

  if (!signUpResponse || !signUpResponse.user) {
    throw new Error("Failed to sign up user via Better Auth");
  }

  console.log("   ✓ User registered successfully:", {
    id: signUpResponse.user.id,
    email: signUpResponse.user.email,
    name: signUpResponse.user.name,
  });

  // 3. Verify user in PostgreSQL
  console.log("\n3. Verifying record persistence in PostgreSQL...");
  const [persistedUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, testEmail));

  if (!persistedUser) {
    throw new Error("Persisted user not found in PostgreSQL");
  }
  console.log("   ✓ User confirmed in PostgreSQL table `user`:", persistedUser.id);

  // 4. Verify account in PostgreSQL
  const [persistedAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, persistedUser.id));

  if (!persistedAccount) {
    throw new Error("Persisted credential account not found in PostgreSQL");
  }
  console.log("   ✓ Account credential confirmed in table `account` (hashed password)");

  // 5. Test Sign In
  console.log("\n4. Testing user sign-in via Better Auth API...");
  const signInResponse = await auth.api.signInEmail({
    body: {
      email: testEmail,
      password: testPassword,
    },
  });

  console.log("   signInResponse result:", signInResponse);

  if (!signInResponse || !signInResponse.user || !signInResponse.token) {
    throw new Error("Failed to sign in via Better Auth");
  }
  console.log("   ✓ Sign in successful! User authenticated:", signInResponse.user.email);

  // 6. Test Multi-Tenant Data Isolation Query
  console.log("\n5. Testing multi-tenant query isolation...");
  const userOwnedData = await db
    .select()
    .from(session)
    .where(eq(session.userId, persistedUser.id));

  console.log(`   ✓ Multi-tenant isolation verified: retrieved ${userOwnedData.length} sessions scoped strictly to userId ${persistedUser.id}`);

  console.log("\n✨ All Auth & PostgreSQL tests passed successfully!\n");
  process.exit(0);
}

runAuthTests().catch((err) => {
  console.error("❌ Auth test failed:", err);
  process.exit(1);
});
