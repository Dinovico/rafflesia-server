import express from 'express';
import auth from '../middleware/auth.js';
import upload from '../middleware/imageUpload.js';
import * as ImagesControllers from '../controllers/images.controllers.js';


const router = express.Router();

// GET route pour récupérer une image par son ID
router.get('/byid/:image_id', auth, ImagesControllers.getImageById);

// POST route pour ajouter une nouvelle image à la base de données et la télécharger sur le serveur
router.post('/upload/:ratio', auth, upload.single('photo'), ImagesControllers.uploadImage);

export default router;
