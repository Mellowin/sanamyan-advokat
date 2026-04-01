import pino from 'pino';

// Configure logger based on environment
const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  
  // Production: JSON format for parsing
  // Development: pretty print for readability
  transport: isProduction 
    ? undefined 
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
  
  // Base fields for all logs
  base: {
    env: process.env.NODE_ENV,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
  },
  
  // Redact sensitive fields
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
    remove: true,
  },
});

// Helper to create child logger with request context
export function createRequestLogger(requestId: string, ip?: string) {
  return logger.child({
    requestId,
    ip,
    type: 'request',
  });
}

// Helper for API route logging
export function logAPIRequest(logger: ReturnType<typeof createRequestLogger>, data: {
  method: string;
  path: string;
  ip: string;
  userAgent?: string;
}) {
  logger.info({
    event: 'api_request',
    ...data,
  }, 'API request received');
}

export function logAPIResponse(logger: ReturnType<typeof createRequestLogger>, data: {
  status: number;
  duration: number;
  success: boolean;
}) {
  const level = data.status >= 500 ? 'error' : data.status >= 400 ? 'warn' : 'info';
  logger[level]({
    event: 'api_response',
    ...data,
  }, `API response: ${data.status}`);
}

export function logError(logger: ReturnType<typeof createRequestLogger>, error: Error, context?: Record<string, unknown>) {
  logger.error({
    event: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  }, error.message);
}

export default logger;
