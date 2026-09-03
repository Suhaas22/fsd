import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// ── file helper ──────────────────────────────────────────────────
const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function writeErrorLog(line: string) {
  try {
    fs.appendFileSync(path.join(LOGS_DIR, 'errors.log'), line + '\n');
  } catch (_) {}
}
// ─────────────────────────────────────────────────────────────────

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let errors: any  = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as any;
        message = resObj.message || exception.message;
        errors  = resObj.errors || (Array.isArray(resObj.message) ? resObj.message : null);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    // Write to errors.log
    const ts   = new Date().toISOString();
    const line = `[${ts}] ${status} ${request.method} ${request.url} - ${Array.isArray(message) ? message[0] : message}`;
    writeErrorLog(line);

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      errors: errors || (Array.isArray(message) ? message : undefined),
      timestamp: ts,
      path: request.url,
      method: request.method,
    });
  }
}
