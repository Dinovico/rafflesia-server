import { Request, Response, NextFunction } from 'express';
export default function auth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
