import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./db"

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, user, account }: { token: any; user?: any; account?: any; profile?: any }) {
            if (account && user) {
                token.accessToken = account.access_token
                token.userId = user.id
            }
            return token
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token.userId) {
                session.user.id = token.userId
            }
            return session
        },
        async signIn({ user, account }: { user: any; account: any; profile?: any }) {
            console.log('SignIn attempt:', { user: user?.email, account: account?.provider });

            // Ensure user exists in database
            if (user?.email) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email }
                    })

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                email: user.email,
                                name: user.name || '',
                                subjects: JSON.stringify([]),
                                gradeLevel: JSON.stringify([]),
                                lastLoginAt: new Date()
                            }
                        })
                    } else {
                        await prisma.user.update({
                            where: { email: user.email },
                            data: { lastLoginAt: new Date() }
                        })
                    }
                } catch (error) {
                    console.error('Error handling user in database:', error)
                }
            }

            return true
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
}