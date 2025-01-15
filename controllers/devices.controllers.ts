import type { Request, Response } from 'express';

import * as DevicesServices from '../services/devices.services.js';

export async function registerDevice(req: Request, res: Response) {

    const result = await DevicesServices.registerDevice(req.params.auth_id, req.body.token, req.body.deviceNickname, req.body.systemName, req.body.systemVersion, req.body.brand, req.body.model);
    
    switch (result.status) {
        case 201:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Device successfully registered',
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to register device (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};


export async function disconnectDevice(req: Request, res: Response) {

    const result = await DevicesServices.disconnectDevice(req.params.auth_id, req.body.token);
    
    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Device successfully updated',
                    });
        case 404:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Device not found',
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to update device (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};