/**
 * Initialize backup scheduler on application startup
 */

import { initializeBackupScheduler } from './services/backup-scheduler';

// Initialize the backup scheduler when this module is imported
if (typeof window === 'undefined') {
    // Only run on server side
    initializeBackupScheduler().catch(error => {
        console.error('Failed to initialize backup scheduler:', error);
    });
}

export { initializeBackupScheduler };