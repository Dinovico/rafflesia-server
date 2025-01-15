import type { Request, Response } from 'express';
import * as WAChatServices from "../services/wachat.services.js";
import type { CustomFile } from '../middleware/imageUpload.js';




export async function newExport(req: Request, res: Response) {

    const newExportResult = await WAChatServices.newExport(req.params.auth_id, req.file as CustomFile, req.body.name, req.body.images_count);
  
    switch (newExportResult.status) {
        case 200:
            return res.status(newExportResult.status).json({
                status: newExportResult.status,
                message: 'Export successfully created',
                export_id: newExportResult.exportId,
            });
        case 500:
            return res.status(newExportResult.status).json({
                status: newExportResult.status,
                message: 'Failed to create export (Server error: ' + newExportResult.error + ')',
            });
        default:
            return res.status(newExportResult.status).json({
                status: newExportResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function uploadWAFile(req: Request, res: Response) {
    const cf = req.file as CustomFile;


    const uploadImageResult = await WAChatServices.uploadWAFile(req.params.auth_id, cf, req.params.wachat_id, req.params.imageRef);
  
    switch (uploadImageResult.status) {
        case 200:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Files successfully uploaded',
            });
        case 400:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'No file transmitted',
            });
        case 404:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Export not found',
            });
        case 500:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Failed to upload file (Server error: ' + uploadImageResult.error + ')',
            });
        default:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function generateInvitationCode(req: Request, res: Response) {
        
    const generateInvitationCodeResult = await WAChatServices.generateInvitationCode(req.params.auth_id, req.params.wachat_id);

    switch (generateInvitationCodeResult.status) {
        case 200:
            return res.status(generateInvitationCodeResult.status).json({
                status: generateInvitationCodeResult.status,
                message: 'Invitation code successfully generated',
                invitation_code: generateInvitationCodeResult.invitationCode,
            });
        case 403:
            return res.status(generateInvitationCodeResult.status).json({
                status: generateInvitationCodeResult.status,
                message: 'Unauthorized',
            });
        case 500:
            return res.status(generateInvitationCodeResult.status).json({
                status: generateInvitationCodeResult.status,
                message: 'Failed to generate invitation code (Server error: ' + generateInvitationCodeResult.error + ')',
            });
        default:
            return res.status(generateInvitationCodeResult.status).json({
                status: generateInvitationCodeResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function useInvitationCode(req: Request, res: Response) {
    
    const useInvitationCodeResult = await WAChatServices.useInvitationCode(req.params.auth_id, req.body.invitation_code);

    switch (useInvitationCodeResult.status) {
        case 200:
            return res.status(useInvitationCodeResult.status).json({
                status: useInvitationCodeResult.status,
                message: 'Invitation code successfully used',
            });
        case 403:
            return res.status(useInvitationCodeResult.status).json({
                status: useInvitationCodeResult.status,
                message: 'Unauthorized',
            });
        case 404:
            return res.status(useInvitationCodeResult.status).json({
                status: useInvitationCodeResult.status,
                message: 'Invitation code not found',
            });
        case 500:
            return res.status(useInvitationCodeResult.status).json({
                status: useInvitationCodeResult.status,
                message: 'Failed to use invitation code (Server error: ' + useInvitationCodeResult.error + ')',
            });
        default:
            return res.status(useInvitationCodeResult.status).json({
                status: useInvitationCodeResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function getUserLoadingExports(req: Request, res: Response) {
    
    const getUserExportsResult = await WAChatServices.getUserLoadingExports(req.params.auth_id);

    switch (getUserExportsResult.status) {
        case 200:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Exports succesfully retrieved',
                exports: getUserExportsResult.exports,
            });
        case 403:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Unauthorized',
            });
        case 500:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Failed to retrieve exports (Server error: ' + getUserExportsResult.error + ')',
            });
        default:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function getUserActiveExports(req: Request, res: Response) {
    
    const getUserExportsResult = await WAChatServices.getUserActiveExports(req.params.auth_id);

    switch (getUserExportsResult.status) {
        case 200:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Exports succesfully retrieved',
                exports: getUserExportsResult.exports,
            });
        case 403:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Unauthorized',
            });
        case 500:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Failed to retrieve exports (Server error: ' + getUserExportsResult.error + ')',
            });
        default:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function getUserArchivedExports(req: Request, res: Response) {
    
    const getUserExportsResult = await WAChatServices.getUserArchivedExports(req.params.auth_id);

    switch (getUserExportsResult.status) {
        case 200:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Exports succesfully retrieved',
                exports: getUserExportsResult.exports,
            });
        case 403:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Unauthorized',
            });
        case 500:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Failed to retrieve exports (Server error: ' + getUserExportsResult.error + ')',
            });
        default:
            return res.status(getUserExportsResult.status).json({
                status: getUserExportsResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function getExportById(req: Request, res: Response) {

    const getExportResult = await WAChatServices.getExportById(req.params.auth_id, req.params.wachat_id);

    switch (getExportResult.status) {
        case 200:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Export succesfully retrieved',
                export: getExportResult.export,
            });
        case 403:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Unauthorized',
            });
        case 404:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Export not found',
            });
        case 500:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Failed to retrieve export (Server error: ' + getExportResult.error + ')',
            });
        default:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function shareWAExport(req: Request, res: Response) {


    const uploadImageResult = await WAChatServices.shareWAExport(req.params.auth_id, req.body.wachat_id, req.body.share_list);
  
    switch (uploadImageResult.status) {
        case 204:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Export successfully shared',
            });
        case 403:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Unauthorized',
            });
        case 404:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Export not found',
            });
        case 500:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Failed to share export (Server error: ' + uploadImageResult.error + ')',
            });
        default:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function getExportPreview(req: Request, res: Response) {
    
    const getExportResult = await WAChatServices.getExportPreview(req.params.sharingId);

    switch (getExportResult.status) {
        case 200:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Export succesfully retrieved',
                body: getExportResult.preview,
            });
        case 403:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Unauthorized',
            });
        case 404:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Export not found',
            });
        case 500:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Failed to retrieve export (Server error: ' + getExportResult.error + ')',
            });
        default:
            return res.status(getExportResult.status).json({
                status: getExportResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function closeSortingProcess(req: Request, res: Response) {


    const uploadImageResult = await WAChatServices.closeSortingProcess(req.params.auth_id, req.body.wachat_id);
  
    switch (uploadImageResult.status) {
        case 200:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Export process successfully validated',
            });
        case 403:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Unauthorized',
            });
        case 404:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Export not found',
            });
        case 409:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Export already validated',
            });
        case 500:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Failed to validate export process (Server error: ' + uploadImageResult.error + ')',
            });
        default:
            return res.status(uploadImageResult.status).json({
                status: uploadImageResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function deleteExport(req: Request, res: Response) {

    const deleteExportResult = await WAChatServices.deleteExport(req.params.auth_id, req.params.wachat_id);

    switch (deleteExportResult.status) {
        case 205:
            return res.status(deleteExportResult.status).json({
                status: deleteExportResult.status,
                message: 'Export successfully deleted',
            });
        case 403:
            return res.status(deleteExportResult.status).json({
                status: deleteExportResult.status,
                message: 'Unauthorized',
            });
        case 404:
            return res.status(deleteExportResult.status).json({
                status: deleteExportResult.status,
                message: 'Export not found',
            });
        case 500:
            return res.status(deleteExportResult.status).json({
                status: deleteExportResult.status,
                message: 'Failed to delete export (Server error: ' + deleteExportResult.error + ')',
            });
        default:
            return res.status(deleteExportResult.status).json({
                status: deleteExportResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};



export async function regenerateAlbums(req: Request, res: Response) {

    const regenerateAlbumsResult = await WAChatServices.regenerateAlbums(req.params.auth_id, req.params.wachat_id);

    switch (regenerateAlbumsResult.status) {
        case 201:
            return res.status(regenerateAlbumsResult.status).json({
                status: regenerateAlbumsResult.status,
                message: 'Albums successfully regenerated',
            });
        case 403:
            return res.status(regenerateAlbumsResult.status).json({
                status: regenerateAlbumsResult.status,
                message: 'Unauthorized',
            });
        case 404:
            return res.status(regenerateAlbumsResult.status).json({
                status: regenerateAlbumsResult.status,
                message: 'Export not found',
            });
        case 500:
            return res.status(regenerateAlbumsResult.status).json({
                status: regenerateAlbumsResult.status,
                message: 'Failed to regenerate albums (Server error: ' + regenerateAlbumsResult.error + ')',
            });
        default:
            return res.status(regenerateAlbumsResult.status).json({
                status: regenerateAlbumsResult.status,
                message: 'Unexpected behaviour encountered',
            });
    }
}