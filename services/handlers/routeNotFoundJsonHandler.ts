import type { Request, Response } from "express";

export const routeNotFoundJsonHandler = function (req: Request, res: Response) {
    res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
  };