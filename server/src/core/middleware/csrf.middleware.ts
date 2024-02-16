import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.method.toUpperCase() === 'GET' || req.xhr) {
      return next();
    }
    res.status(400).end();
    // next(new Error('Not allowed'));
  }
}
