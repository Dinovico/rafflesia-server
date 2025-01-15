import type { Request, Response } from 'express';

import * as ErrorLogsServices from '../services/errorLogs.services.js';

export async function createErrorLog(req: Request, res: Response) {

    const result = await ErrorLogsServices.createErrorLog(req.body.deviceToken, req.body.customMessage, req.body.error, req.body.fileName, req.body.version);
    
    switch (result.status) {
        case 201:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Error log successfully created',
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to create error log (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};