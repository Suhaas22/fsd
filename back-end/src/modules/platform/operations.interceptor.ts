import {CallHandler,ExecutionContext,Injectable,Logger,NestInterceptor} from '@nestjs/common';
import {concatMap} from 'rxjs/operators';
import {OperationsService} from './operations.service';
@Injectable()
export class OperationsInterceptor implements NestInterceptor {
  private readonly logger=new Logger(OperationsInterceptor.name);
  constructor(private readonly operations:OperationsService){}
  intercept(context:ExecutionContext,next:CallHandler){return next.handle().pipe(concatMap(async result=>{
    try{await this.operations.record(context.switchToHttp().getRequest(),result);}catch(error){this.logger.error('Could not record operation',error);}
    return result;
  }));}
}
