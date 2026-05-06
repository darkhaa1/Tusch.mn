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

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let code: string | undefined;

    if (isHttp) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const resp = response as Record<string, unknown>;
        message =
          typeof resp.message === 'string'
            ? resp.message
            : Array.isArray(resp.message)
              ? (resp.message as string[]).join(', ')
              : exception.message;
        code = typeof resp.code === 'string' ? resp.code : undefined;
      } else {
        message = exception.message;
      }
    } else {
      message = 'Internal server error';
    }

    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      JSON.stringify({
        requestId,
        method: req.method,
        url: req.url,
        statusCode,
        message,
        userId,
        timestamp: new Date().toISOString(),
        ...(stack ? { stack } : {}),
      }),
    );

    const body: Record<string, unknown> = {
      statusCode,
      message,
      ...(code ? { code } : {}),
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'production' && stack) {
      body.stack = stack;
    }

    res.status(statusCode).json(body);
  }
}
