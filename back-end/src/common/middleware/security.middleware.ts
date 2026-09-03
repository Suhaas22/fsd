import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Simple security middleware – adds basic HTTP security headers.
 * We do this manually so no extra package is needed, but if you have
 * helmet installed you can drop it in main.ts: app.use(helmet()).
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Prevent browsers from guessing the content type
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent page from being framed (clickjacking)
    res.setHeader('X-Frame-Options', 'DENY');

    // Basic XSS protection for older browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Tell browser not to cache sensitive API responses
    res.setHeader('Cache-Control', 'no-store');

    // Remove the default "X-Powered-By: Express" header so attackers
    // don't know which framework you're running
    res.removeHeader('X-Powered-By');

    next();
  }
}
