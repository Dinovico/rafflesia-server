import express from 'express';

import auth from '../middleware/auth.js';

import * as DevicesControllers from '../controllers/devices.controllers.js';


const router = express.Router();





router.post('/register', auth, DevicesControllers.registerDevice);


router.post('/disconnect', auth, DevicesControllers.disconnectDevice);



export default router;
