import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          const res = await fetch("http://localhost:5000/api/auth/signin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (res.ok && data.token) {
            const user = {
              id: data.id,
              email: data.email,
              token: data.token,
              tokenExpiry: data.expiry || Date.now() + 24 * 60 * 60 * 1000,
            };
            return user;
          } else {
            throw new Error(data.message || "Authentication failed");
          }
        } catch (error) {
          throw new Error(error.message || "An error occurred during authentication");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
        token.tokenExpiry = user.tokenExpiry;
      }

      const currentTime = Date.now();
      const timeToExpiry = token.tokenExpiry - currentTime;
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes

      if (timeToExpiry < refreshThreshold) {
        try {
          // Call the new API route to refresh the token
          const res = await fetch("http://localhost:3000/api/auth/refresh-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token.accessToken }),
          });

          const data = await res.json();

          if (res.ok && data.token) {
            token.accessToken = data.token;
            token.tokenExpiry = data.expiry;
          } else {
            return null; // Invalidate the session if refresh fails
          }
        } catch (error) {
          return null; // Invalidate the session on error
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.token = token.accessToken;
        session.expires = new Date(token.tokenExpiry).toISOString();
      } else {
        session.user = null;
        session.expires = new Date(0).toISOString();
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };