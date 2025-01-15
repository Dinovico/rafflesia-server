import { Request, Response, NextFunction } from "express";
export declare const jsonErrorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void;
