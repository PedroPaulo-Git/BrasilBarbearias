import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const owner = await prisma.owner.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!owner) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          owner.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: owner.id,
          email: owner.email,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin"
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 