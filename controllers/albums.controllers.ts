import type { Request, Response } from 'express';

import * as AlbumsServices from '../services/albums.services.js';


export async function createAlbum(req: Request, res: Response) {
    
    const result = await AlbumsServices.createAlbum(req.params.auth_id, req.body.name, req.body.description, req.body.included_users, req.body.included_images);
    
    switch (result.status) {
        case 201:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Album successfully created',
                        body: result.album,
                    });
        case 400:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Bad Request: no images included',
                        body: result.album,
                    });
        case 500:
            console.log(result.error);
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to create album (Server error: ' + result.error + ')',
                        body: result.album,
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                        body: result?.album,
                    });
    }
};


export async function getOwnAlbums(req: Request, res: Response) {

    const result = await AlbumsServices.getOwnAlbums(req.params.auth_id);
    
    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Albums successfully retrieved',
                        body: result.albums,
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to retrieve albums (Server error: ' + result.error + ')',
                        body: result.albums,
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                        body: result?.albums,
                    });
    }
};


export async function getSharedAlbums(req: Request, res: Response) {

    const result = await AlbumsServices.getSharedAlbums(req.params.auth_id);
    
    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Albums successfully retrieved',
                        body: result.albums,
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to retrieve albums (Server error: ' + result.error + ')',
                        body: result.albums,
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                        body: result?.albums,
                    });
    }
};


export async function shareAlbum(req: Request, res: Response) {

    const result = await AlbumsServices.shareAlbum(req.params.auth_id, req.body.album_id, req.body.included_users);
    
    switch (result.status) {
        case 204:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Album successfully shared',
                    });
        case 403:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unauthorized',
                    });
        case 404:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Album not found',
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to share album (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};

export async function addImagesToAlbum(req: Request, res: Response) {

    const result = await AlbumsServices.addImagesToAlbum(req.params.auth_id, req.body.album_id, req.body.included_images);
    
    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Images successfully added to album',
                        body: result.album,
                    });
        case 403:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unauthorized',
                        body: result.album,
                    });
        case 404:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Album not found',
                        body: result.album,
                    });
        case 500:
            console.log(result.error);
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to add images to album (Server error: ' + result.error + ')',
                        body: result.album,
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                        body: result?.album,
                    });
    }
};



export async function setAlbumName(req: Request, res: Response) {
    const result = await AlbumsServices.setAlbumName(req.params.auth_id, req.body.album_id, req.body.name);

    switch (result.status) {
        case 205:
            return res.status(result.status)
                .json({
                    status: result.status,
                    message: 'Album name successfully updated',
                });
        case 403:
            return res.status(result.status)
                .json({
                    status: result.status,
                    message: 'Unauthorized',
                });
        case 404:
            return res.status(result.status)
                .json({
                    status: result.status,
                    message: 'Unable to find requested album',
                });
        case 500:
            return res.status(result.status)
                .json({
                    status: result.status,
                    message: 'Failed to update album name (Server error: ' + result.error + ')',
                });
        default:
            return res.status(result.status)
                .json({
                    status: result.status,
                    message: 'Unexpected behaviour encountered',
                });
    }
};



export async function getAlbumContentById(req: Request, res: Response) {


    const result = await AlbumsServices.getAlbumContentById(Number(req.params.album_id), req.params.auth_id);
    
    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Album content successfully retrieved',
                        body: { album: result.album, images: result.images},
                    });
        case 403:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unauthorized',
                        body: { album: result.album, images: result.images},
                    });
        case 404:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Album not found',
                        body: { album: result.album, images: result.images},
                    });
        case 500:
            console.log(result.error);
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to retrieve album content (Server error: ' + result.error + ')',
                        body: { album: result.album, images: result.images},
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                        body: { album: result?.album, images: result?.images},
                    });
    }
};



export async function removeImageFromAlbum(req: Request, res: Response) {
    const albumId = Number(req.params.album_id);
    const imageId = Number(req.params.image_id);
    const userId = req.params.auth_id;

    const result = await AlbumsServices.removeImageFromAlbum(albumId, imageId, userId);

    switch (result.status) {
        case 205:
            return res.status(result.status).json({
                status: result.status,
                message: 'Image successfully removed from the album',
            });
        case 403:
            return res.status(result.status).json({
                status: result.status,
                message: 'Unauthorized',
            });
        case 404:
            return res.status(result.status).json({
                status: result.status,
                message: 'Unable to find requested album or image',
            });
        case 500:
            return res.status(result.status).json({
                status: result.status,
                message: 'Failed to remove image from the album (Server error: ' + result.error + ')',
            });
        default:
            return res.status(result.status).json({
                status: result.status,
                message: 'Unexpected behaviour encountered',
            });
    }
};


export async function deleteAlbum(req: Request, res: Response) {

    const result = await AlbumsServices.deleteAlbum(Number(req.params.album_id), req.params.auth_id);
    
    switch (result.status) {
        case 205:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Album successfully deleted',
                    });
        case 403:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unauthorized',
                    });
        case 404:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unable to find requested album',
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to delete album (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// SPECIFIC TO SUGGESTED ALBUMS ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////


export async function getSuggestedAlbums(req: Request, res: Response) {

    const result = await AlbumsServices.getSuggestedAlbums(req.params.auth_id);
    
    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Albums successfully retrieved',
                        body: result.albums,
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to retrieve albums (Server error: ' + result.error + ')',
                        body: result.albums,
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                        body: result?.albums,
                    });
    }
};


export async function transferImagesToAlbum(req: Request, res: Response) {
    const { imagesIds, currentAlbumId, newAlbumId } = req.body;

    const result = await AlbumsServices.transferImagesToAlbum(imagesIds, currentAlbumId, newAlbumId, req.params.auth_id);

    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Image transferred successfully' 
                    });
        case 404:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Album or image not found' 
                    });
        case 403:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Unauthorized action' 
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to transfer image (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Unexpected behaviour encountered' 
                    });
    }
}


export async function deleteSuggestedAlbum(req: Request, res: Response) {

    const result = await AlbumsServices.deleteSuggestedAlbum(Number(req.params.album_id), req.params.auth_id);

    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Album deleted successfully' 
                    });
        case 404:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Album not found' 
                    });
        case 403:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Unauthorized action' 
                    });
        case 500:
            console.log(result.error);
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to delete album (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Unexpected behaviour encountered' 
                    });
    }
}


export async function createAdjustedAlbum(req: Request, res: Response) {

    const result = await AlbumsServices.createAdjustedAlbum(req.params.auth_id, req.body.name, req.body.description, req.body.origin_album, req.body.included_images, req.body.wachat_id);

    switch (result.status) {
        case 201:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Album created successfully' 
                    });
        case 404:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'WhatsApp export not found' 
                    });
        case 403:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Unauthorized action' 
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to create album (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Unexpected behaviour encountered' 
                    });
    }
}


export async function changeAlbumValidationStatus(req: Request, res: Response) {
    const albumId = Number(req.body.album_id);
    const userId = req.params.auth_id;

    const result = await AlbumsServices.changeAlbumValidationStatus(albumId, userId);

    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Album validation status updated successfully' 
                    });
        case 404:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Album not found' 
                    });
        case 403:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Unauthorized action' 
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to update album validation status (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({ 
                        status: result.status,
                        message: 'Unexpected behaviour encountered' 
                    });
    }
}
