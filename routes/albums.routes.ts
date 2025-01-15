import express from 'express';

import auth from '../middleware/auth.js';

import * as AlbumsControllers from '../controllers/albums.controllers.js';


const router = express.Router();


router.post('/create', auth, AlbumsControllers.createAlbum);

router.post('/create_adjusted', auth, AlbumsControllers.createAdjustedAlbum);

router.get('/own', auth, AlbumsControllers.getOwnAlbums);

router.get('/accessible', auth, AlbumsControllers.getSharedAlbums);

router.get('/suggested', auth, AlbumsControllers.getSuggestedAlbums);

router.post('/share', auth, AlbumsControllers.shareAlbum);

router.post('/add_images', auth, AlbumsControllers.addImagesToAlbum);

router.post('/transfer_image', auth, AlbumsControllers.transferImagesToAlbum);

router.post('/set_name', auth, AlbumsControllers.setAlbumName);

router.post('/change_status', auth, AlbumsControllers.changeAlbumValidationStatus);

router.get('/content/:album_id', auth, AlbumsControllers.getAlbumContentById);

router.delete('/remove/:album_id&:image_id', auth, AlbumsControllers.removeImageFromAlbum);

router.delete('/delete/:album_id', auth, AlbumsControllers.deleteAlbum);

router.delete('/delete_suggested/:album_id', auth, AlbumsControllers.deleteSuggestedAlbum);


export default router;
