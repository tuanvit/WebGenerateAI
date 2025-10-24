/**
 * Database utilities for SQLite compatibility
 */

// Re-export prisma for backward compatibility
export { prisma } from './db';

/**
 * Create case-insensitive search conditions for SQLite
 * Since SQLite doesn't support mode: 'insensitive', we need to handle it differently
 */
export function createCaseInsensitiveSearch(
    searchTerm: string,
    fields: string[]
) {
    // For SQLite, we can use LOWER() function or just use contains without mode
    // Since Prisma's contains is already case-insensitive in SQLite by default
    return {
        OR: fields.map((field) => ({
            [field]: { contains: searchTerm },
        })),
    };
}

/**
 * Create search conditions that work across different databases
 */
export function createSearchConditions(searchTerm: string, fields: string[]) {
    const isPostgreSQL = process.env.DATABASE_URL?.includes("postgresql");

    if (isPostgreSQL) {
        return {
            OR: fields.map((field) => ({
                [field]: { contains: searchTerm, mode: "insensitive" as const },
            })),
        };
    } else {
        // SQLite - contains is case-insensitive by default
        return {
            OR: fields.map((field) => ({
                [field]: { contains: searchTerm },
            })),
        };
    }
}
