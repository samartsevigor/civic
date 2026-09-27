import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { civicPgPool?: Pool };

const pool =
  globalForPg.civicPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.civicPgPool = pool;
}

export const auth = betterAuth({
  appName: 'Civic Fredericton',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: pool,
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: 'select_account',
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[civic-auth] ${type} code for ${email}: ${otp}`);
      },
    }),
  ],
});
