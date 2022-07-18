import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const isInstanceOfHttpException = exception instanceof HttpException;
    const statusCode = isInstanceOfHttpException ? exception.getStatus() : 500;
    console.log(exception);
    const error = isInstanceOfHttpException
      ? exception.message
      : 'Sorry, something went wrong. Please try again later.';
    res.status(statusCode).json({ success: false, error });
  }
}
