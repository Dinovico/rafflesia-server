import express from 'express';

import auth from '../middleware/auth.js';
import upload from '../middleware/imageUpload.js';
import waExport from '../middleware/waExport.js';
import * as WAChatControllers from '../controllers/wachat.controllers.js';



const router = express.Router();



router.post('/new_export', auth, waExport.single('chat'), WAChatControllers.newExport);


router.post('/upload_image/:wachat_id/:imageRef', auth, upload.single('photo'), WAChatControllers.uploadWAFile);


router.get('/generate_invitation_code/:wachat_id', auth, WAChatControllers.generateInvitationCode);


router.post('/use_invitation_code', auth, WAChatControllers.useInvitationCode);


router.get('/get_loading', auth, WAChatControllers.getUserLoadingExports);


router.get('/get_active', auth, WAChatControllers.getUserActiveExports);


router.get('/get_archived', auth, WAChatControllers.getUserArchivedExports);


router.get('/get_by_id/:wachat_id', auth, WAChatControllers.getExportById);


router.post('/share', auth, WAChatControllers.shareWAExport);


router.get('/preview/:sharingId', WAChatControllers.getExportPreview);


router.post('/validate', auth, WAChatControllers.closeSortingProcess);


router.delete('/delete/:wachat_id', auth, WAChatControllers.deleteExport);


router.get('/regenerate/:wachat_id', auth, WAChatControllers.regenerateAlbums);


export default router;