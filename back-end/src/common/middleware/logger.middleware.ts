import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// Resolve the logs folder (back-end/logs/)
const LOGS_DIR = path.join(process.cwd(), 'logs');

// Make sure the folder exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Helper – get today's log file path: logs/2026-09-02.log
function getTodayLogFile(): string {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  return path.join(LOGS_DIR, `${today}.log`);
}

// Append one line to the daily log file
function writeToFile(line: string) {
  try {
    fs.appendFileSync(getTodayLogFile(), line + '\n');
  } catch (_) {
    // Never crash the app because of a logging failure
  }
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const ms      = Date.now() - start;
      const status  = res.statusCode;
      const ts      = new Date().toISOString();
      const line    = `[${ts}] ${method} ${originalUrl} ${status} ${ms}ms - IP: ${ip}`;

      // Print to console
      console.log(`[Logger] ${line}`);

      // Write to today's log file
      writeToFile(line);
    });

    next();
  }
}
