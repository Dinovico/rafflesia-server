import type { Request, Response } from 'express';
import * as ImagesServices from "../services/images.services.js";

import type { CustomFile } from '../middleware/imageUpload.js';

export async function getImageById(req: Request, res: Response) {

    const getImageByIdResult = await ImagesServices.getImageById(req.params);
    
    switch (getImageByIdResult.status) {
      case 200:
        return res.status(getImageByIdResult.status)
                  .json({
                    status: getImageByIdResult.status,
                    message: 'Image successfully retrieved',
                    body: getImageByIdResult.image,
                  });
      case 404:
        return res.status(getImageByIdResult.status)
                  .json({
                    status: getImageByIdResult.status,
                    message: 'Image not found',
                    body: getImageByIdResult.image,
                  });
      case 500:
        return res.status(getImageByIdResult.status)
                  .json({
                    status: getImageByIdResult.status,
                    message: 'Failed to retrieve image (Server error: ' + getImageByIdResult.error + ')',
                    body: getImageByIdResult.image,
                  });
      default:
        return res.status(getImageByIdResult.status)
                  .json({
                    status: getImageByIdResult.status,
                    message: 'Unexpected behaviour encountered',
                    body: getImageByIdResult?.image,
                  });
    }
  }
  
  
  export async function uploadImage(req: Request, res: Response) {
    const cf = req.file as CustomFile;
  
    const uploadImageResult = await ImagesServices.uploadImage(cf, req.params.auth_id, Number(req.params.ratio));
  
    switch (uploadImageResult.status) {
      case 200:
        return res.status(uploadImageResult.status).json({
          status: uploadImageResult.status,
          message: 'Image successfully uploaded',
          body: uploadImageResult.image,
        });
      case 400:
        return res.status(uploadImageResult.status).json({
          status: uploadImageResult.status,
          message: 'No file transmitted',
          body: uploadImageResult.image,
        });
      case 500:
        return res.status(uploadImageResult.status).json({
          status: uploadImageResult.status,
          message: 'Failed to upload image (Server error: ' + uploadImageResult.error + ')',
          body: uploadImageResult.image,
        });
      default:
        return res.status(uploadImageResult.status).json({
          status: uploadImageResult.status,
          message: 'Unexpected behaviour encountered',
          body: uploadImageResult?.image,
        });
    }
  }
  