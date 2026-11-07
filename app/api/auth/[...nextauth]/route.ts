import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Organization from "@/models/organiztion";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({
          email: credentials?.email?.trim().toLowerCase(),
        }).select("+password");

        if (user) {
          const isPasswordCorrect = await bcrypt.compare(
            credentials!.password,
            user.password,
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: "user",
          };
        }

        const organization = await Organization.findOne({
          email: credentials?.email?.trim().toLowerCase(),
        }).select("+password");

        if (organization) {
          const isPasswordCorrect = await bcrypt.compare(
            credentials!.password,
            organization.password,
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid credentials");
          }

          return {
            id: organization._id.toString(),
            name: organization.name,
            email: organization.email,
            role: "ngo",
          };
        }

        throw new Error("Invalid credentials");
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt" as const,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
