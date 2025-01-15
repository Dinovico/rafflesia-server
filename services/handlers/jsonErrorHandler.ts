import type { Request, Response, NextFunction } from "express";

// Custom error handler to send unhandled errors in JSON instead of HTML.
// The error-handling middleware is a special type of Express middleware
// that needs to have four arguments as opposed to a regular middleware.
export const jsonErrorHandler = function (error: Error, req: Request, res: Response, next:NextFunction) {
    if (!res.headersSent) {
      if (process.env.NODE_ENV === 'development') {
        res.status(500).json({ message: error.stack });
      } else {
        // Hide error details in production to avoid security issues
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    next(error);
  };