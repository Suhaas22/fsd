import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Write errors to a separate "errors.log" file
function writeErrorToFile(line: string) {
  try {
    const filePath = path.join(LOGS_DIR, 'errors.log');
    fs.appendFileSync(filePath, line + '\n');
  } catch (_) {}
}

@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Wrap next() in a try/catch so any synchronous throw is caught here
    try {
      next();
    } catch (err: any) {
      const ts     = new Date().toISOString();
      const msg    = err?.message || 'Unknown error';
      const line   = `[${ts}] ERROR ${req.method} ${req.originalUrl} - ${msg}`;

      console.error(`[ErrorHandler] ${line}`);
      writeErrorToFile(line);

      // If headers haven't been sent yet, return a plain 500
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          statusCode: 500,
          message: 'Internal server error',
          timestamp: ts,
          path: req.originalUrl,
        });
      }
    }
  }
}
