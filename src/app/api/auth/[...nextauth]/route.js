import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/models/User";
import { connectToDatabase } from "@/libs/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile) {
        token.id = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && profile) {
          await connectToDatabase();
          await User.updateOne(
            { email: profile.email },
            {
              $set: {
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
                provider: "google",
                updatedAt: new Date(),
              },
              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
