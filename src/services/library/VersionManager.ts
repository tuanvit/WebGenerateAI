import { prisma } from '../../lib/db';
import type { PromptVersion } from '../../types/services';
import { DatabaseError, NotFoundError } from '../../types/services';

/**
 * Dedicated service for managing prompt versions
 * Handles version history tracking and comparison between versions
 */
export class VersionManager {
    /**
     * Get all versions for a prompt with detailed information
     */
    async getVersionHistory(promptId: string): Promise<PromptVersion[]> {
        try {
            const versions = await prisma.promptVersion.findMany({
                where: { promptId },
                orderBy: { version: 'desc' },
            });

            return versions;
        } catch (error) {
            console.error('Failed to get version history:', error);
            throw new DatabaseError('Không thể lấy lịch sử phiên bản');
        }
    }

    /**
     * Get a specific version of a prompt
     */
    async getVersion(promptId: string, version: number): Promise<PromptVersion | null> {
        try {
            const promptVersion = await prisma.promptVersion.findUnique({
                where: {
                    promptId_version: {
                        promptId,
                        version,
                    },
                },
            });

            return promptVersion;
        } catch (error) {
            console.error('Failed to get version:', error);
            throw new DatabaseError('Không thể lấy phiên bản');
        }
    }

    /**
     * Get the latest version of a prompt
     */
    async getLatestVersion(promptId: string): Promise<PromptVersion | null> {
        try {
            const latestVersion = await prisma.promptVersion.findFirst({
                where: { promptId },
                orderBy: { version: 'desc' },
            });

            return latestVersion;
        } catch (error) {
            console.error('Failed to get latest version:', error);
            throw new DatabaseError('Không thể lấy phiên bản mới nhất');
        }
    }

    /**
     * Create a new version of a prompt
     */
    async createVersion(promptId: string, content: string): Promise<PromptVersion> {
        try {
            // Verify the prompt exists
            const prompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!prompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            // Get the highest version number for this prompt
            const latestVersion = await prisma.promptVersion.findFirst({
                where: { promptId },
                orderBy: { version: 'desc' },
            });

            const nextVersion = (latestVersion?.version || 0) + 1;

            const version = await prisma.promptVersion.create({
                data: {
                    promptId,
                    version: nextVersion,
                    content,
                },
            });

            return version;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            console.error('Failed to create version:', error);
            throw new DatabaseError('Không thể tạo phiên bản mới');
        }
    }

    /**
     * Compare two versions of a prompt
     * Returns a comparison object with differences
     */
    async compareVersions(
        promptId: string,
        version1: number,
        version2: number
    ): Promise<VersionComparison> {
        try {
            const [v1, v2] = await Promise.all([
                this.getVersion(promptId, version1),
                this.getVersion(promptId, version2),
            ]);

            if (!v1 || !v2) {
                throw new NotFoundError('Không tìm thấy một hoặc cả hai phiên bản');
            }

            return this.generateComparison(v1, v2);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            console.error('Failed to compare versions:', error);
            throw new DatabaseError('Không thể so sánh phiên bản');
        }
    }

    /**
     * Restore a prompt to a specific version
     */
    async restoreToVersion(promptId: string, version: number, userId: string): Promise<PromptVersion> {
        try {
            // Get the version to restore
            const versionToRestore = await this.getVersion(promptId, version);
            if (!versionToRestore) {
                throw new NotFoundError('Không tìm thấy phiên bản để khôi phục');
            }

            // Verify the prompt belongs to the user
            const prompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!prompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            if (prompt.userId !== userId) {
                throw new NotFoundError('Không có quyền khôi phục prompt này');
            }

            // Update the prompt content
            await prisma.generatedPrompt.update({
                where: { id: promptId },
                data: {
                    generatedText: versionToRestore.content,
                },
            });

            // Create a new version with the restored content
            const newVersion = await this.createVersion(promptId, versionToRestore.content);

            return newVersion;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            console.error('Failed to restore version:', error);
            throw new DatabaseError('Không thể khôi phục phiên bản');
        }
    }

    /**
     * Delete a specific version (only if not the latest)
     */
    async deleteVersion(promptId: string, version: number, userId: string): Promise<void> {
        try {
            // Verify the prompt belongs to the user
            const prompt = await prisma.generatedPrompt.findUnique({
                where: { id: promptId },
            });

            if (!prompt) {
                throw new NotFoundError('Không tìm thấy prompt');
            }

            if (prompt.userId !== userId) {
                throw new NotFoundError('Không có quyền xóa phiên bản này');
            }

            // Check if this is the latest version
            const latestVersion = await this.getLatestVersion(promptId);
            if (latestVersion && latestVersion.version === version) {
                throw new DatabaseError('Không thể xóa phiên bản mới nhất');
            }

            // Delete the version
            await prisma.promptVersion.delete({
                where: {
                    promptId_version: {
                        promptId,
                        version,
                    },
                },
            });
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof DatabaseError) {
                throw error;
            }
            console.error('Failed to delete version:', error);
            throw new DatabaseError('Không thể xóa phiên bản');
        }
    }

    /**
     * Get version statistics for a prompt
     */
    async getVersionStats(promptId: string): Promise<VersionStats> {
        try {
            const versions = await this.getVersionHistory(promptId);

            if (versions.length === 0) {
                return {
                    totalVersions: 0,
                    latestVersion: 0,
                    firstCreated: new Date(),
                    lastModified: new Date(),
                    averageContentLength: 0,
                };
            }

            const totalVersions = versions.length;
            const latestVersion = Math.max(...versions.map(v => v.version));
            const firstCreated = versions[versions.length - 1].createdAt;
            const lastModified = versions[0].createdAt;
            const averageContentLength = Math.round(
                versions.reduce((sum, v) => sum + v.content.length, 0) / totalVersions
            );

            return {
                totalVersions,
                latestVersion,
                firstCreated,
                lastModified,
                averageContentLength,
            };
        } catch (error) {
            console.error('Failed to get version stats:', error);
            throw new DatabaseError('Không thể lấy thống kê phiên bản');
        }
    }

    /**
     * Generate a comparison between two versions
     */
    private generateComparison(v1: PromptVersion, v2: PromptVersion): VersionComparison {
        const content1 = v1.content;
        const content2 = v2.content;

        // Simple line-by-line comparison
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');

        const changes: VersionChange[] = [];
        const maxLines = Math.max(lines1.length, lines2.length);

        for (let i = 0; i < maxLines; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';

            if (line1 !== line2) {
                if (!line1) {
                    changes.push({
                        type: 'added',
                        lineNumber: i + 1,
                        content: line2,
                    });
                } else if (!line2) {
                    changes.push({
                        type: 'removed',
                        lineNumber: i + 1,
                        content: line1,
                    });
                } else {
                    changes.push({
                        type: 'modified',
                        lineNumber: i + 1,
                        content: line2,
                        previousContent: line1,
                    });
                }
            }
        }

        return {
            version1: v1,
            version2: v2,
            changes,
            summary: {
                totalChanges: changes.length,
                additions: changes.filter(c => c.type === 'added').length,
                deletions: changes.filter(c => c.type === 'removed').length,
                modifications: changes.filter(c => c.type === 'modified').length,
            },
        };
    }
}

// Types for version comparison
export interface VersionComparison {
    version1: PromptVersion;
    version2: PromptVersion;
    changes: VersionChange[];
    summary: {
        totalChanges: number;
        additions: number;
        deletions: number;
        modifications: number;
    };
}

export interface VersionChange {
    type: 'added' | 'removed' | 'modified';
    lineNumber: number;
    content: string;
    previousContent?: string;
}

export interface VersionStats {
    totalVersions: number;
    latestVersion: number;
    firstCreated: Date;
    lastModified: Date;
    averageContentLength: number;
}