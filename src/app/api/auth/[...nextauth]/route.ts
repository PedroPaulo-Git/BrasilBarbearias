import NextAuth from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { canCreateShop } from "@/lib/subscriptionUtils"
import { NextResponse } from "next/server"

const authOptions: any = {
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name, 
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
        token.name = user.name  // ← ADICIONE ESTA LINHA
        token.email = user.email // ← ADICIONE ESTA LINHA (boa prática)
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string // ← ADICIONE ESTA LINHA
        session.user.email = token.email as string // ← ADICIONE ESTA LINHA
      }
      return session
    }
  }
}
// import { authOptions } from "@/lib/authOptions"
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 