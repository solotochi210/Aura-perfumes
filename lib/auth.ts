import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { isConfiguredAdmin } from "@/lib/admin-identity";
import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { assertLoginAllowed, getRequestIp, recordFailedLogin } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const ip = await getRequestIp();
        await assertLoginAllowed(email, ip);

        if (!isConfiguredAdmin(email)) {
          await recordFailedLogin(email, ip);
          return null;
        }

        const user = await db.adminUser.findUnique({ where: { email } });
        const passwordOk = user
          ? await bcrypt.compare(parsed.data.password, user.hashedPassword)
          : false;

        if (!user || !passwordOk) {
          await recordFailedLogin(email, ip);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "Admin",
        };
      },
    }),
  ],
});
