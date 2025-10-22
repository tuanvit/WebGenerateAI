import { NextRequest } from 'next/server';

// Log levels
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}

// Log entry interface
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    userId?: string;
    requestId?: string;
    error?: Error;
    performance?: {
        duration: number;
        memory: number;
    };
}

// Performance metrics interface
interface PerformanceMetrics {
    requestCount: number;
    averageResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    activeUsers: number;
}

class Logger {
    private logLevel: LogLevel;
    private metrics: Map<string, number> = new Map();
    private requestTimes: Map<string, number> = new Map();

    constructor() {
        this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        return levels.indexOf(level) <= levels.indexOf(this.logLevel);
    }

    private formatLogEntry(entry: LogEntry): string {
        const { timestamp, level, message, context, userId, requestId, error, performance } = entry;

        const logData = {
            timestamp,
            level,
            message,
            ...(userId && { userId }),
            ...(requestId && { requestId }),
            ...(context && { context }),
            ...(error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }
            }),
            ...(performance && { performance })
        };

        return JSON.stringify(logData);
    }

    private writeLog(entry: LogEntry): void {
        if (!this.shouldLog(entry.level)) return;

        const formattedLog = this.formatLogEntry(entry);

        // In production, you might want to send logs to external service
        if (process.env.NODE_ENV === 'production') {
            // Send to external logging service (e.g., Sentry, LogRocket, etc.)
            this.sendToExternalService(entry);
        } else {
            // Console logging for development
            console.log(formattedLog);
        }
    }

    private async sendToExternalService(entry: LogEntry): Promise<void> {
        try {
            // Example: Send to Sentry or other logging service
            if (process.env.SENTRY_DSN && entry.level === LogLevel.ERROR) {
                // Sentry integration would go here
            }

            // Example: Send to custom logging endpoint
            if (process.env.LOGGING_ENDPOINT) {
                await fetch(process.env.LOGGING_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry)
                });
            }
        } catch (error) {
            console.error('Failed to send log to external service:', error);
        }
    }

    // Public logging methods
    error(message: string, context?: Record<string, any>, error?: Error, userId?: string, requestId?: string): void {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.ERROR,
            message,
            context,
            error,
            userId,
            requestId
        });

        // Increment error metrics
        this.incrementMetric('errors');
    }

    warn(message: string, context?: Record<string, any>, userId?: string, requestId?: string): void {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.WARN,
            message,
            context,
            userId,
            requestId
        });
    }

    info(message: string, context?: Record<string, any>, userId?: string, requestId?: string): void {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            message,
            context,
            userId,
            requestId
        });
    }

    debug(message: string, context?: Record<string, any>, userId?: string, requestId?: string): void {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.DEBUG,
            message,
            context,
            userId,
            requestId
        });
    }

    // Performance logging
    startTimer(requestId: string): void {
        this.requestTimes.set(requestId, Date.now());
    }

    endTimer(requestId: string, message: string, context?: Record<string, any>, userId?: string): void {
        const startTime = this.requestTimes.get(requestId);
        if (!startTime) return;

        const duration = Date.now() - startTime;
        const memory = process.memoryUsage().heapUsed / 1024 / 1024; // MB

        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            message,
            context,
            userId,
            requestId,
            performance: {
                duration,
                memory
            }
        });

        this.requestTimes.delete(requestId);
        this.updatePerformanceMetrics(duration);
    }

    // Metrics management
    private incrementMetric(key: string): void {
        const current = this.metrics.get(key) || 0;
        this.metrics.set(key, current + 1);
    }

    private updatePerformanceMetrics(duration: number): void {
        this.incrementMetric('requests');

        const totalRequests = this.metrics.get('requests') || 1;
        const currentAvg = this.metrics.get('avgResponseTime') || 0;
        const newAvg = (currentAvg * (totalRequests - 1) + duration) / totalRequests;

        this.metrics.set('avgResponseTime', newAvg);
    }

    getMetrics(): PerformanceMetrics {
        const requests = this.metrics.get('requests') || 0;
        const errors = this.metrics.get('errors') || 0;

        return {
            requestCount: requests,
            averageResponseTime: this.metrics.get('avgResponseTime') || 0,
            errorRate: requests > 0 ? (errors / requests) * 100 : 0,
            cacheHitRate: this.metrics.get('cacheHitRate') || 0,
            activeUsers: this.metrics.get('activeUsers') || 0
        };
    }

    resetMetrics(): void {
        this.metrics.clear();
        this.requestTimes.clear();
    }

    // Request logging helpers
    logRequest(req: NextRequest, userId?: string): string {
        const requestId = this.generateRequestId();

        this.info('Incoming request', {
            method: req.method,
            url: req.url,
            userAgent: req.headers.get('user-agent'),
            ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
        }, userId, requestId);

        this.startTimer(requestId);
        return requestId;
    }

    logResponse(requestId: string, status: number, userId?: string): void {
        this.endTimer(requestId, 'Request completed', {
            status
        }, userId);
    }

    // Database operation logging
    logDatabaseOperation(operation: string, table: string, duration: number, userId?: string): void {
        this.info('Database operation', {
            operation,
            table,
            duration
        }, userId);

        if (duration > 1000) { // Log slow queries (>1s)
            this.warn('Slow database query detected', {
                operation,
                table,
                duration
            }, userId);
        }
    }

    // Cache operation logging
    logCacheOperation(operation: 'hit' | 'miss' | 'set' | 'invalidate', key: string, userId?: string): void {
        this.debug('Cache operation', {
            operation,
            key
        }, userId);

        if (operation === 'hit') {
            this.incrementMetric('cacheHits');
        } else if (operation === 'miss') {
            this.incrementMetric('cacheMisses');
        }

        // Update cache hit rate
        const hits = this.metrics.get('cacheHits') || 0;
        const misses = this.metrics.get('cacheMisses') || 0;
        const total = hits + misses;

        if (total > 0) {
            this.metrics.set('cacheHitRate', (hits / total) * 100);
        }
    }

    // User activity logging
    logUserActivity(activity: string, userId: string, context?: Record<string, any>): void {
        this.info('User activity', {
            activity,
            ...context
        }, userId);

        // Track active users
        const activeUsers = new Set(Array.from(this.metrics.keys()).filter(k => k.startsWith('user:')));
        activeUsers.add(`user:${userId}`);
        this.metrics.set('activeUsers', activeUsers.size);
    }

    // AI prompt generation logging
    logPromptGeneration(type: string, success: boolean, duration: number, userId: string, context?: Record<string, any>): void {
        const message = success ? 'Prompt generated successfully' : 'Prompt generation failed';
        const level = success ? LogLevel.INFO : LogLevel.ERROR;

        this.writeLog({
            timestamp: new Date().toISOString(),
            level,
            message,
            context: {
                type,
                success,
                duration,
                ...context
            },
            userId
        });
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export singleton instance
export const logger = new Logger();

// Middleware helper for automatic request logging
export function withLogging<T extends (...args: any[]) => any>(
    fn: T,
    operation: string
): T {
    return ((...args: any[]) => {
        const requestId = logger.generateRequestId();
        logger.startTimer(requestId);

        try {
            const result = fn(...args);

            // Handle async functions
            if (result instanceof Promise) {
                return result
                    .then((res) => {
                        logger.endTimer(requestId, `${operation} completed successfully`);
                        return res;
                    })
                    .catch((error) => {
                        logger.error(`${operation} failed`, { error: error.message }, error, undefined, requestId);
                        throw error;
                    });
            }

            logger.endTimer(requestId, `${operation} completed successfully`);
            return result;
        } catch (error) {
            logger.error(`${operation} failed`, { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined, undefined, requestId);
            throw error;
        }
    }) as T;
}