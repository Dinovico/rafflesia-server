import express from 'express';

import auth from '../middleware/auth.js';

import * as UsersControllers from '../controllers/users.controllers.js';


const router = express.Router();





router.get('/other/:id', auth, UsersControllers.getUserById);


router.get('/id/:email', UsersControllers.getIdFromEmail);


router.get('/minimal/:id', UsersControllers.getMinimalUserInfo);


router.get('/current', auth, UsersControllers.getCurrentUser);


router.post('/login', UsersControllers.login);


router.get('/auth_method', auth, UsersControllers.getUserAuthMethod);


router.post('/authorize/email', UsersControllers.authorizeEmail);


router.post('/authorize/phone', UsersControllers.authorizePhone);


router.post('/register', UsersControllers.registerUser);


router.post('/set_pp', auth, UsersControllers.updateProfilePic);


router.delete('/', auth, UsersControllers.deleteUser);



export default router;
