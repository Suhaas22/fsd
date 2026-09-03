import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as fs from 'fs';
import * as path from 'path';

// ── log file helper ───────────────────────────────────────────────
const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function writeDailyLog(line: string) {
  try {
    const today    = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filePath = path.join(LOGS_DIR, `${today}.log`);
    fs.appendFileSync(filePath, line + '\n');
  } catch (_) {}
}
// ─────────────────────────────────────────────────────────────────

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req  = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now  = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response   = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const elapsed    = Date.now() - now;
        const ts         = new Date().toISOString();
        const msg        = `${method} ${url} ${statusCode} +${elapsed}ms`;

        // Console output
        this.logger.log(msg);

        // Append to today's daily log file
        writeDailyLog(`[${ts}] ${msg}`);
      })
    );
  }
}
