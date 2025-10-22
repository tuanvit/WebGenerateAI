import { logger } from './logger';
import { checkDatabaseHealth } from './db-optimization';
import { cacheService } from './cache';

// System health status
export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
        database: ServiceStatus;
        cache: ServiceStatus;
        application: ServiceStatus;
    };
    metrics: SystemMetrics;
}

interface ServiceStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    error?: string;
    lastCheck: string;
}

interface SystemMetrics {
    uptime: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    cpuUsage?: number;
    requestsPerMinute: number;
    errorRate: number;
    cacheHitRate: number;
    activeUsers: number;
    databaseConnections?: number;
}

// Alert configuration
interface AlertConfig {
    errorRateThreshold: number; // percentage
    responseTimeThreshold: number; // milliseconds
    memoryUsageThreshold: number; // percentage
    diskUsageThreshold: number; // percentage
}

class MonitoringService {
    private healthChecks: Map<string, ServiceStatus> = new Map();
    private metrics: SystemMetrics;
    private alertConfig: AlertConfig;
    private startTime: number;

    constructor() {
        this.startTime = Date.now();
        this.alertConfig = {
            errorRateThreshold: parseFloat(process.env.ERROR_RATE_THRESHOLD || '5'), // 5%
            responseTimeThreshold: parseInt(process.env.RESPONSE_TIME_THRESHOLD || '2000'), // 2s
            memoryUsageThreshold: parseFloat(process.env.MEMORY_USAGE_THRESHOLD || '80'), // 80%
            diskUsageThreshold: parseFloat(process.env.DISK_USAGE_THRESHOLD || '85') // 85%
        };

        this.metrics = {
            uptime: 0,
            memoryUsage: { used: 0, total: 0, percentage: 0 },
            requestsPerMinute: 0,
            errorRate: 0,
            cacheHitRate: 0,
            activeUsers: 0
        };

        // Start periodic health checks
        this.startPeriodicHealthChecks();
    }

    // Health check methods
    async checkDatabaseHealth(): Promise<ServiceStatus> {
        const startTime = Date.now();

        try {
            const health = await checkDatabaseHealth();
            const responseTime = Date.now() - startTime;

            const status: ServiceStatus = {
                status: health.status === 'healthy' ? 'healthy' : 'unhealthy',
                responseTime,
                lastCheck: new Date().toISOString(),
                ...(health.status !== 'healthy' && { error: health.error })
            };

            this.healthChecks.set('database', status);
            return status;
        } catch (error) {
            const status: ServiceStatus = {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown database error',
                lastCheck: new Date().toISOString()
            };

            this.healthChecks.set('database', status);
            logger.error('Database health check failed', { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined);
            return status;
        }
    }

    async checkCacheHealth(): Promise<ServiceStatus> {
        const startTime = Date.now();

        try {
            // Test cache with a simple operation
            const testKey = 'health-check-test';
            const testValue = { timestamp: Date.now() };

            await cacheService.set(testKey, testValue, 10); // 10 seconds TTL
            const retrieved = await cacheService.get(testKey);
            await cacheService.delete(testKey);

            const responseTime = Date.now() - startTime;
            const isHealthy = retrieved !== null;

            const status: ServiceStatus = {
                status: isHealthy ? 'healthy' : 'degraded',
                responseTime,
                lastCheck: new Date().toISOString(),
                ...(!isHealthy && { error: 'Cache read/write test failed' })
            };

            this.healthChecks.set('cache', status);
            return status;
        } catch (error) {
            const status: ServiceStatus = {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown cache error',
                lastCheck: new Date().toISOString()
            };

            this.healthChecks.set('cache', status);
            logger.error('Cache health check failed', { error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined);
            return status;
        }
    }

    checkApplicationHealth(): ServiceStatus {
        const memoryUsage = process.memoryUsage();
        const uptime = Date.now() - this.startTime;

        // Check memory usage
        const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        const isMemoryHealthy = memoryPercentage < this.alertConfig.memoryUsageThreshold;

        // Get performance metrics from logger
        const loggerMetrics = logger.getMetrics();
        const isErrorRateHealthy = loggerMetrics.errorRate < this.alertConfig.errorRateThreshold;
        const isResponseTimeHealthy = loggerMetrics.averageResponseTime < this.alertConfig.responseTimeThreshold;

        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        const issues: string[] = [];

        if (!isMemoryHealthy) {
            issues.push(`High memory usage: ${memoryPercentage.toFixed(1)}%`);
            status = 'degraded';
        }

        if (!isErrorRateHealthy) {
            issues.push(`High error rate: ${loggerMetrics.errorRate.toFixed(1)}%`);
            status = 'unhealthy';
        }

        if (!isResponseTimeHealthy) {
            issues.push(`Slow response time: ${loggerMetrics.averageResponseTime.toFixed(0)}ms`);
            status = status === 'unhealthy' ? 'unhealthy' : 'degraded';
        }

        const appStatus: ServiceStatus = {
            status,
            lastCheck: new Date().toISOString(),
            ...(issues.length > 0 && { error: issues.join(', ') })
        };

        this.healthChecks.set('application', appStatus);
        return appStatus;
    }

    // Comprehensive system health check
    async getSystemHealth(): Promise<SystemHealth> {
        const [dbHealth, cacheHealth] = await Promise.all([
            this.checkDatabaseHealth(),
            this.checkCacheHealth()
        ]);

        const appHealth = this.checkApplicationHealth();

        // Update metrics
        this.updateMetrics();

        // Determine overall system status
        const services = { database: dbHealth, cache: cacheHealth, application: appHealth };
        const overallStatus = this.determineOverallStatus(services);

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            services,
            metrics: this.metrics
        };
    }

    private determineOverallStatus(services: { [key: string]: ServiceStatus }): 'healthy' | 'degraded' | 'unhealthy' {
        const statuses = Object.values(services).map(s => s.status);

        if (statuses.includes('unhealthy')) {
            return 'unhealthy';
        }

        if (statuses.includes('degraded')) {
            return 'degraded';
        }

        return 'healthy';
    }

    private updateMetrics(): void {
        const memoryUsage = process.memoryUsage();
        const loggerMetrics = logger.getMetrics();

        this.metrics = {
            uptime: Date.now() - this.startTime,
            memoryUsage: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
                percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
            },
            requestsPerMinute: this.calculateRequestsPerMinute(),
            errorRate: loggerMetrics.errorRate,
            cacheHitRate: loggerMetrics.cacheHitRate,
            activeUsers: loggerMetrics.activeUsers
        };
    }

    private calculateRequestsPerMinute(): number {
        const loggerMetrics = logger.getMetrics();
        const uptimeMinutes = (Date.now() - this.startTime) / (1000 * 60);
        return uptimeMinutes > 0 ? Math.round(loggerMetrics.requestCount / uptimeMinutes) : 0;
    }

    // Alert system
    async checkAlerts(): Promise<void> {
        const health = await this.getSystemHealth();

        // Check error rate alert
        if (health.metrics.errorRate > this.alertConfig.errorRateThreshold) {
            await this.sendAlert('high_error_rate', {
                current: health.metrics.errorRate,
                threshold: this.alertConfig.errorRateThreshold
            });
        }

        // Check memory usage alert
        if (health.metrics.memoryUsage.percentage > this.alertConfig.memoryUsageThreshold) {
            await this.sendAlert('high_memory_usage', {
                current: health.metrics.memoryUsage.percentage,
                threshold: this.alertConfig.memoryUsageThreshold
            });
        }

        // Check service health alerts
        Object.entries(health.services).forEach(([service, status]) => {
            if (status.status === 'unhealthy') {
                this.sendAlert('service_unhealthy', {
                    service,
                    error: status.error
                });
            }
        });
    }

    private async sendAlert(type: string, data: any): Promise<void> {
        const alert = {
            type,
            timestamp: new Date().toISOString(),
            data,
            severity: this.getAlertSeverity(type)
        };

        logger.error(`Alert triggered: ${type}`, alert);

        // Send to external alerting systems
        if (process.env.WEBHOOK_URL) {
            try {
                await fetch(process.env.WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(alert)
                });
            } catch (error) {
                logger.error('Failed to send webhook alert', { error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }

        // Send email alerts (if configured)
        if (process.env.ALERT_EMAIL) {
            await this.sendEmailAlert(alert);
        }
    }

    private getAlertSeverity(type: string): 'low' | 'medium' | 'high' | 'critical' {
        const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
            high_error_rate: 'high',
            high_memory_usage: 'medium',
            service_unhealthy: 'critical',
            slow_response_time: 'medium'
        };

        return severityMap[type] || 'low';
    }

    private async sendEmailAlert(alert: any): Promise<void> {
        // Email alert implementation would go here
        // This could integrate with services like SendGrid, AWS SES, etc.
        logger.info('Email alert would be sent', { alert });
    }

    // Periodic health checks
    private startPeriodicHealthChecks(): void {
        // Health check every 30 seconds
        setInterval(async () => {
            try {
                await this.getSystemHealth();
            } catch (error) {
                logger.error('Periodic health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }, 30000);

        // Alert check every 5 minutes
        setInterval(async () => {
            try {
                await this.checkAlerts();
            } catch (error) {
                logger.error('Alert check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
            }
        }, 300000);
    }

    // Performance monitoring
    recordMetric(name: string, value: number, tags?: Record<string, string>): void {
        logger.info('Custom metric recorded', {
            metric: name,
            value,
            tags
        });
    }

    // User activity monitoring
    recordUserActivity(userId: string, activity: string, metadata?: Record<string, any>): void {
        logger.logUserActivity(activity, userId, metadata);
    }

    // API endpoint monitoring
    recordAPICall(endpoint: string, method: string, statusCode: number, duration: number, userId?: string): void {
        logger.info('API call recorded', {
            endpoint,
            method,
            statusCode,
            duration,
            userId
        });

        // Record slow API calls
        if (duration > this.alertConfig.responseTimeThreshold) {
            logger.warn('Slow API call detected', {
                endpoint,
                method,
                duration,
                threshold: this.alertConfig.responseTimeThreshold
            });
        }
    }

    // Get monitoring dashboard data
    getDashboardData(): {
        health: SystemHealth;
        recentAlerts: any[];
        topEndpoints: any[];
        userActivity: any[];
    } {
        // This would return data for a monitoring dashboard
        return {
            health: {} as SystemHealth, // Would be populated with actual data
            recentAlerts: [],
            topEndpoints: [],
            userActivity: []
        };
    }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Middleware for automatic API monitoring
export function withMonitoring(handler: Function, endpoint: string) {
    return async (req: any, res: any) => {
        const startTime = Date.now();
        const requestId = logger.logRequest(req);

        try {
            const result = await handler(req, res);
            const duration = Date.now() - startTime;

            monitoring.recordAPICall(endpoint, req.method, res.statusCode || 200, duration);
            logger.logResponse(requestId, res.statusCode || 200);

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;

            monitoring.recordAPICall(endpoint, req.method, 500, duration);
            logger.error('API call failed', { endpoint, method: req.method, error: error instanceof Error ? error.message : 'Unknown error' }, error instanceof Error ? error : undefined, undefined, requestId);

            throw error;
        }
    };
}