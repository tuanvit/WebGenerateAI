// Cache configuration
const CACHE_TTL = {
    PROMPT: 60 * 60 * 24, // 24 hours for generated prompts
    COMMUNITY_CONTENT: 60 * 30, // 30 minutes for community content
    USER_LIBRARY: 60 * 15, // 15 minutes for user library
    SEARCH_RESULTS: 60 * 10, // 10 minutes for search results
} as const;

class CacheService {
    private memoryCache = new Map<string, { data: any; expires: number }>();

    constructor() {
        // Use only memory cache for simplicity
        console.log('Cache service initialized with memory cache only');
    }

    private generateKey(prefix: string, identifier: string): string {
        return `ai-prompt:${prefix}:${identifier}`;
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            // Use memory cache only
            const memoryCached = this.memoryCache.get(key);
            if (memoryCached && memoryCached.expires > Date.now()) {
                return memoryCached.data;
            }

            // Clean expired memory cache entries
            if (memoryCached && memoryCached.expires <= Date.now()) {
                this.memoryCache.delete(key);
            }

            return null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set<T>(key: string, data: T, ttl: number): Promise<void> {
        try {
            // Set in memory cache only
            this.memoryCache.set(key, {
                data,
                expires: Date.now() + (ttl * 1000),
            });

            // Clean memory cache if it gets too large
            if (this.memoryCache.size > 1000) {
                this.cleanMemoryCache();
            }
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            this.memoryCache.delete(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async invalidatePattern(pattern: string): Promise<void> {
        try {
            // Clean memory cache
            for (const key of this.memoryCache.keys()) {
                if (key.includes(pattern.replace('*', ''))) {
                    this.memoryCache.delete(key);
                }
            }
        } catch (error) {
            console.error('Cache invalidate error:', error);
        }
    }

    private cleanMemoryCache(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, value] of this.memoryCache.entries()) {
            if (value.expires <= now) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.memoryCache.delete(key));
    }

    // Specific cache methods for different data types
    async cachePrompt(promptHash: string, prompt: any): Promise<void> {
        const key = this.generateKey('prompt', promptHash);
        await this.set(key, prompt, CACHE_TTL.PROMPT);
    }

    async getCachedPrompt(promptHash: string): Promise<any | null> {
        const key = this.generateKey('prompt', promptHash);
        return this.get(key);
    }

    async cacheCommunityContent(filters: string, content: any[]): Promise<void> {
        const key = this.generateKey('community', filters);
        await this.set(key, content, CACHE_TTL.COMMUNITY_CONTENT);
    }

    async getCachedCommunityContent(filters: string): Promise<any[] | null> {
        const key = this.generateKey('community', filters);
        return this.get(key);
    }

    async cacheUserLibrary(userId: string, library: any[]): Promise<void> {
        const key = this.generateKey('library', userId);
        await this.set(key, library, CACHE_TTL.USER_LIBRARY);
    }

    async getCachedUserLibrary(userId: string): Promise<any[] | null> {
        const key = this.generateKey('library', userId);
        return this.get(key);
    }

    async invalidateUserCache(userId: string): Promise<void> {
        await this.invalidatePattern(`ai-prompt:library:${userId}*`);
        await this.invalidatePattern(`ai-prompt:community:*`);
    }

    async cacheSearchResults(query: string, results: any[]): Promise<void> {
        const key = this.generateKey('search', query);
        await this.set(key, results, CACHE_TTL.SEARCH_RESULTS);
    }

    async getCachedSearchResults(query: string): Promise<any[] | null> {
        const key = this.generateKey('search', query);
        return this.get(key);
    }
}

// Export singleton instance
export const cacheService = new CacheService();

// Utility function to generate cache keys for prompts
export function generatePromptHash(input: any): string {
    const normalized = JSON.stringify(input, Object.keys(input).sort());
    return Buffer.from(normalized).toString('base64').slice(0, 32);
}