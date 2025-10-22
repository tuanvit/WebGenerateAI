import { prisma } from "./db-utils"

export async function ensureUserExists(email: string, name?: string) {
    let user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                name: name || '',
                subjects: JSON.stringify([]),
                gradeLevel: JSON.stringify([]),
                lastLoginAt: new Date()
            }
        })
    } else {
        // Update last login
        user = await prisma.user.update({
            where: { email },
            data: { lastLoginAt: new Date() }
        })
    }

    return user
}