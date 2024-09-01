import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';

config();

@Injectable()
export class AccessMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-api-token'];
    const appApiToken = process.env.API_TOKEN;

    if (!token) {
    return res.send({
        error: "Api token is missing"
    }).status(HttpStatus.BAD_REQUEST)
    }

    try {
      if (appApiToken !== token) {
        return res.send({
            error: "Invalid Api token"
        }).status(HttpStatus.FORBIDDEN)
      }
      next();
    } catch (error) {
      console.error(error);
        return res.send({
            error: "Invalid Api token"
        }).status(HttpStatus.FORBIDDEN)
    }
  }
}
