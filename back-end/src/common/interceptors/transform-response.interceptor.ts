import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    return next.handle().pipe(
      map((res) => {
        // If response is already structured or a stream/buffer/file download, return directly
        if (res && res.__isRawResponse) {
          delete res.__isRawResponse;
          return res;
        }

        const message = res && typeof res === 'object' && res.message && !res.items
          ? res.message
          : undefined;

        let responseData = res;
        if (res && typeof res === 'object' && 'data' in res && 'message' in res && Object.keys(res).length <= 3) {
          responseData = res.data;
        }

        return {
          success: true,
          data: responseData,
          message,
          timestamp: new Date().toISOString(),
        };
      })
    );
  }
}
