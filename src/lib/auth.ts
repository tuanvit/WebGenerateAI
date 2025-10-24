import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"

export const authOptions = {
    adapter: PrismaAdapter(prisma),
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
        CredentialsProvider({
            id: "demo",
            name: "Demo Login",
            credentials: {
                email: { label: "Email", type: "email" },
                name: { label: "Name", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.name) {
                    return null;
                }

                try {
                    // Tạo hoặc cập nhật user demo
                    let user;
                    try {
                        user = await prisma.user.findUnique({
                            where: { email: credentials.email }
                        });

                        if (!user) {
                            user = await prisma.user.create({
                                data: {
                                    email: credentials.email,
                                    name: credentials.name,
                                    subjects: JSON.stringify(['Toán', 'Văn']),
                                    gradeLevel: JSON.stringify([6, 7, 8, 9]),
                                    role: credentials.email === 'admin@example.com' ? 'admin' : 'user'
                                }
                            });
                        } else {
                            user = await prisma.user.update({
                                where: { email: credentials.email },
                                data: {
                                    name: credentials.name,
                                    lastLoginAt: new Date()
                                }
                            });
                        }
                    } catch (dbError) {
                        console.error('Database error:', dbError);
                        // Fallback: return mock user for demo
                        return {
                            id: credentials.email === 'admin@example.com' ? 'admin-id' : 'user-id',
                            email: credentials.email,
                            name: credentials.name,
                            role: credentials.email === 'admin@example.com' ? 'admin' : 'user'
                        };
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                } catch (error) {
                    console.error('Demo auth error:', error);
                    // Fallback: return mock user for demo
                    return {
                        id: credentials.email === 'admin@example.com' ? 'admin-id' : 'user-id',
                        email: credentials.email,
                        name: credentials.name,
                        role: credentials.email === 'admin@example.com' ? 'admin' : 'user'
                    };
                }
            }
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, user }: { token: any; user?: any }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
            console.log('SignIn attempt:', { user: user?.email, account: account?.provider });

            if (account?.provider === 'demo') {
                return true; // Demo provider đã xử lý trong authorize
            }

            // Xử lý OAuth providers (Google)
            if (user?.email && account) {
                try {
                    // Tìm hoặc tạo user
                    const existingUser = await prisma.user.upsert({
                        where: { email: user.email },
                        update: {
                            name: user.name || '',
                            lastLoginAt: new Date()
                        },
                        create: {
                            email: user.email,
                            name: user.name || '',
                            subjects: JSON.stringify([]),
                            gradeLevel: JSON.stringify([]),
                            role: 'user',
                            lastLoginAt: new Date()
                        }
                    });

                    // Kiểm tra xem account đã được liên kết chưa
                    const existingAccount = await prisma.account.findUnique({
                        where: {
                            provider_providerAccountId: {
                                provider: account.provider,
                                providerAccountId: account.providerAccountId
                            }
                        }
                    });

                    // Nếu chưa có account record, tạo mới
                    if (!existingAccount) {
                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                refresh_token: account.refresh_token,
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                            }
                        });
                    }

                    return true;
                } catch (error) {
                    console.error('Error handling OAuth sign in:', error);
                    return false;
                }
            }

            return true;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
}