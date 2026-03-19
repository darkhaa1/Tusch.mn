import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common'
import { ThrottlerException } from '@nestjs/throttler'
import { Response, Request } from 'express'

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    void exception

    response
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .header('Retry-After', '60')
      .json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
        retryAfter: 60,
        requestId: request.headers['x-request-id'] ?? null,
      })
  }
}
