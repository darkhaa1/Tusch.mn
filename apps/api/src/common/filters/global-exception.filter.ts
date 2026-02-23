import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const requestId = (req as any).requestId ?? '-';
    const userId = (req as any).user?.id ?? null;

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const stack = exception instanceof Error ? exception.stack : undefined;

    // Structured error log
    this.logger.error(
      JSON.stringify({
        requestId,
        method: req.method,
        url: req.url,
        statusCode,
        message,
        userId,
        timestamp: new Date().toISOString(),
        // Stack only in logs, never sent to client in prod
        ...(stack ? { stack } : {}),
      }),
    );

    // TODO: Sentry integration
    // if (statusCode >= 500) {
    //   Sentry.captureException(exception, { extra: { requestId, userId } });
    // }

    const body: Record<string, any> = {
      statusCode,
      message,
      requestId,
      timestamp: new Date().toISOString(),
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV !== 'production' && stack) {
      body.stack = stack;
    }

    res.status(statusCode).json(body);
  }
}
