// Repository exports and factory

export { BaseRepository } from './base.repository';
export { UserRepository } from './user.repository';
export { GeneratedPromptRepository } from './generated-prompt.repository';
export { SharedContentRepository } from './shared-content.repository';
export { UserLibraryRepository } from './user-library.repository';

// Import repository classes for factory
import { UserRepository } from './user.repository';
import { GeneratedPromptRepository } from './generated-prompt.repository';
import { SharedContentRepository } from './shared-content.repository';
import { UserLibraryRepository } from './user-library.repository';

// Repository factory for dependency injection
export class RepositoryFactory {
    private static userRepository: UserRepository | null = null;
    private static generatedPromptRepository: GeneratedPromptRepository | null = null;
    private static sharedContentRepository: SharedContentRepository | null = null;
    private static userLibraryRepository: UserLibraryRepository | null = null;

    static getUserRepository(): UserRepository {
        if (!this.userRepository) {
            this.userRepository = new UserRepository();
        }
        return this.userRepository;
    }

    static getGeneratedPromptRepository(): GeneratedPromptRepository {
        if (!this.generatedPromptRepository) {
            this.generatedPromptRepository = new GeneratedPromptRepository();
        }
        return this.generatedPromptRepository;
    }

    static getSharedContentRepository(): SharedContentRepository {
        if (!this.sharedContentRepository) {
            this.sharedContentRepository = new SharedContentRepository();
        }
        return this.sharedContentRepository;
    }

    static getUserLibraryRepository(): UserLibraryRepository {
        if (!this.userLibraryRepository) {
            this.userLibraryRepository = new UserLibraryRepository();
        }
        return this.userLibraryRepository;
    }

    // Method to get all repositories
    static getAllRepositories() {
        return {
            userRepository: this.getUserRepository(),
            generatedPromptRepository: this.getGeneratedPromptRepository(),
            sharedContentRepository: this.getSharedContentRepository(),
            userLibraryRepository: this.getUserLibraryRepository(),
        };
    }

    // Method to reset repositories (useful for testing)
    static reset(): void {
        this.userRepository = null as any;
        this.generatedPromptRepository = null as any;
        this.sharedContentRepository = null as any;
        this.userLibraryRepository = null as any;
    }
}

// Convenience exports for direct access
export const userRepository = RepositoryFactory.getUserRepository();
export const generatedPromptRepository = RepositoryFactory.getGeneratedPromptRepository();
export const sharedContentRepository = RepositoryFactory.getSharedContentRepository();
export const userLibraryRepository = RepositoryFactory.getUserLibraryRepository();