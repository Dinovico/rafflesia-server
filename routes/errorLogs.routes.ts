import express from 'express';

import * as ErrorLogsControllers from '../controllers/errorLogs.controllers.js';


const router = express.Router();



router.post('/new_error', ErrorLogsControllers.createErrorLog);




export default router;
