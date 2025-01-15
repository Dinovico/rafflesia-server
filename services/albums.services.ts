
import Album from '../entities/album.js';
import User from '../entities/user.js';
import Image from '../entities/image.js';

import { checkImageInPostOrAlbum, createImagePresignedUrls, deleteImage, type ReturnedImage } from './images.services.js';

import { appDataSource } from '../datasource.js';

import { In } from 'typeorm';
import { onAlbumSharing, onNewAlbum, onNewAlbumContent } from './messaging/messaging.js';
import WAChat from '../entities/wachat.js';




export async function createAlbum(userId: string, albumName: string, albumDescription: string, includedUsersIds: string[], includedImagesIds: number[], wachatId?: string) {
    try {

        if (!includedImagesIds || includedImagesIds.length === 0) {
            return { status: 400, album: null };
        }


        const albumRepository = appDataSource.getRepository(Album);
        const userRepository = appDataSource.getRepository(User);
        const imageRepository = appDataSource.getRepository(Image);

        const newAlbum = albumRepository.create({
            name: albumName,
            description: albumDescription,
            creation_date: new Date(),
            user_id: userId,
            albumShareList: [],
            albumContents: [],
            cover_image: includedImagesIds.length ? includedImagesIds[0] : null, // Designate the first image as "cover_image"
            wachat_id: wachatId || null,
        });

        if (!includedUsersIds.includes(userId)) {
            includedUsersIds.push(userId);
        }


        for (let i = 0; i < includedUsersIds.length; i++) {
            const includedUser = await userRepository.findOne({ where: { id: includedUsersIds[i] } });
            if (!includedUser) {
                console.log(`User with ID ${includedUsersIds[i]} not found`);
                continue;
            }

            newAlbum.albumShareList.push(includedUser);
        }

        for (let i = 0; i < includedImagesIds.length; i++) {
            const includedImage = await imageRepository.findOne({ where: { image_id: includedImagesIds[i] } });
            if (!includedImage) {
                console.log(`Image with ID ${includedImagesIds[i]} not found`);
                continue;
            }

            newAlbum.albumContents.push(includedImage);
        }

        await albumRepository.save(newAlbum);

        onNewAlbum(newAlbum);

        return { status: 201, album: newAlbum };
    } catch (error) {
        return { status: 500, album: null, error: error };    
    }
};


export async function getOwnAlbums(userId: string) {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const imageRepository = appDataSource.getRepository(Image);

        const ownedAlbums = (await albumRepository.find({ where: { user_id: userId }, order: { creation_date: "DESC" }, relations: ['albumShareList'] })).filter((album) => album.wachat_id === null);

        // Récupérer l'URL de l'image de couverture pour chaque album
        const albumsWithCoverUrls = await Promise.all(
            ownedAlbums.map(async (album) => {
                const coverImage = await imageRepository.findOne({ where: { image_id: album.cover_image as number } });
                const presignedUrls = await createImagePresignedUrls(coverImage?.image_key as string);
                return { ...album, image_url: presignedUrls.image_url, thumbnail_url: presignedUrls.thumbnail_url, card_url: presignedUrls.card_url };
            })
        );

        return { status: 200, albums: albumsWithCoverUrls };
    } catch (error) {
        return { status: 500, albums: null, error: error };    
    }
};


export async function getSharedAlbums(userId: string) {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const imageRepository = appDataSource.getRepository(Image);

        // Récupérer les albums partagés avec l'utilisateur actuellement authentifié
        const sharedAlbums = (await albumRepository.createQueryBuilder('album')
            .innerJoinAndSelect('album.albumShareList', 'user')
            .where('user.id = :userId AND album.user_id != :userId', { userId })
            .orderBy('album.creation_date', 'DESC')
            .getMany())
            .filter((album) => album.wachat_id === null);

        // Récupérer l'URL de l'image de couverture pour chaque album partagé
        const albumsWithCoverUrls = await Promise.all(
            sharedAlbums.map(async (album) => {
                const coverImage = await imageRepository.findOne({ where: { image_id: album.cover_image as number } });
                const presignedUrls = await createImagePresignedUrls(coverImage?.image_key as string);
                return { ...album, image_url: presignedUrls.image_url, thumbnail_url: presignedUrls.thumbnail_url, card_url: presignedUrls.card_url };
            })
        );

        return { status: 200, albums: albumsWithCoverUrls };
    } catch (error) {
        return { status: 500, albums: null, error: error };    
    }
};




export async function shareAlbum(userId: string, albumId: number, usersIds: string[], fromExportSharing: boolean = false) {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const userRepository = appDataSource.getRepository(User);

        // Vérifier si l'album existe
        const album = await albumRepository.findOne({ where: { album_id: albumId }, relations: ['albumShareList'] });
        if (!album) {
            return { status: 404 };
        }


        const existingMembers = album.albumShareList;


        // Vérifier si le créateur de l'album correspond à userId
        if (album.user_id !== userId) {

            // Si ce n'est pas le cas, autoriser uniquement la suppression de userId de la liste des membres
            if (existingMembers.length === usersIds.length + 1) {
                for (let i = 0; i < existingMembers.length; i++) {
                    if (!usersIds.includes(existingMembers[i].id)) {
                        if (existingMembers[i].id === userId) {
                            existingMembers.splice(i, 1);
                        }
                        else {
                            return { status: 403 };
                        }
                    }
                }

                const imagesToRemove = album.albumContents.filter((image) => image.user_id === userId);

                for (let i = 0; i < imagesToRemove.length; i++) {
                    await removeImageFromAlbum(albumId, imagesToRemove[i].image_id, userId);
                }

                await albumRepository.save(album);
                return { status: 204 };
            }
            return { status: 403 };
        }

        // Si la liste des nouveaux membres est vide, supprimer l'album
        if (usersIds.length === 0) {
            await deleteAlbum(albumId, userId); // Appeler la fonction deleteAlbum pour supprimer l'album
            return { status: 204 };
        }


        // Supprimer les membres qui ne sont plus dans la liste des nouveaux membres
        for (let i = existingMembers.length - 1; i >= 0; i--) {
            if (!usersIds.includes(existingMembers[i].id)) {
                existingMembers.splice(i, 1); // Supprimer le membre de la liste des membres existants

                const imagesToRemove = album.albumContents.filter((image) => image.user_id === existingMembers[i].id);

                for (let j = 0; j < imagesToRemove.length; j++) {
                    await removeImageFromAlbum(albumId, imagesToRemove[j].image_id, existingMembers[i].id);
                }
            }
        }

        // Vérifier si l'utilisateur identifié par album.user_id fait toujours partie de la liste des membres
        if (!usersIds.includes(album.user_id)) {
            // Mettre à jour album.user_id avec l'identifiant d'un utilisateur choisi arbitrairement dans la liste des nouveaux membres
            album.user_id = usersIds[0]; // Mettre à jour avec le premier utilisateur de la liste (choix arbitraire)
        }

        let newMembers: User[] = [];

        // Ajouter les nouveaux membres à la liste des membres existants
        for (let i = 0; i < usersIds.length; i++) {
            if (!existingMembers.some(member => member.id === usersIds[i])) {
                const newMember = await userRepository.findOne({ where: { id: usersIds[i] } });
                if (newMember) {
                    newMembers.push(newMember); // Ajouter le nouveau membre à la liste des membres existants
                }
            }
        }

        album.albumShareList = existingMembers.concat(newMembers);

        // Enregistrer les modifications dans la base de données
        await albumRepository.save(album);

        if (!fromExportSharing) {
            onAlbumSharing(album, newMembers);
        }

        return { status: 204 };
    } catch (error) {
        return { status: 500, error: error };
    }
}


export async function addImagesToAlbum(ownerId: string, albumId: number, imagesIds: number[]) {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const imageRepository = appDataSource.getRepository(Image);

        // Vérifier si l'album existe
        const album = await albumRepository.findOne({where: {album_id: albumId}, relations: ['albumContents', 'albumShareList']});
        if (!album) {
            return { status: 404, album: null };
        }

        if (album.wachat_id !== null) {
            return { status: 403, album: null };
        }

        if (ownerId !== album.user_id && !album.albumShareList.some((sharedUser) => sharedUser.id === ownerId)) {
            return { status: 403, album: null };
        }

        // Récupérer les images à partir des IDs donnés
        const images = await imageRepository.findBy({image_id: In(imagesIds)});

        // Ajouter les images à l'album

        for (const image of images) {
            album.albumContents.push(image);
        }

        if (album.cover_image === null) {
            album.cover_image = album.albumContents[0].image_id;
        }

        // Enregistrer les modifications dans la base de données
        await albumRepository.save(album);

        onNewAlbumContent(album, ownerId);

        return { status: 200, album: album };
    } catch (error) {
        return { status: 500, album: null, error: error };    
    }
};



export async function setAlbumName(userId: string, albumId: number, name: string) {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        
        const album = await albumRepository.findOne({ where: { album_id: albumId } });

        if (!album) {
            return { status: 404 };
        }

        if (album.user_id !== userId) {
            return { status: 403 };
        }

        album.name = name;
        
        await albumRepository.save(album);
        
        return { status: 205 };
    } catch (error) {
        return { status: 500, error: error };
    }
}





export async function getAlbumContentById(albumId: number, userId: string): Promise<{ status: number, album: Album | null, images: ReturnedImage[] | null, error?: any }>{
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const imageRepository = appDataSource.getRepository(Image);


        // Vérifier si l'album existe
        const album = await albumRepository.findOne({ where: { album_id: albumId }, relations: ['albumShareList']});
        if (!album) {
            return { status: 404, album: null, images: null };
        }

        // Vérifier si l'utilisateur est autorisé à accéder à l'album
        const isAuthorized = await albumRepository
            .createQueryBuilder('album')
            .leftJoin('album.albumShareList', 'user')
            .where('album.album_id = :albumId AND (album.user_id = :userId OR user.id = :userId)', { albumId, userId })
            .getCount();


        if (isAuthorized === 0) {
            return { status: 403, album: null, images: null };
        }

        // Récupérer les images de l'album spécifié et des autres albums
        let images = await imageRepository
            .createQueryBuilder('image')
            .leftJoinAndSelect('image.albums', 'album')
            .where('album.album_id = :albumId', { albumId })
            .select(['image.image_id', 'image.user_id', 'image.image_key', 'image.aspect_ratio', 'image.size', 'image.image_time'])
            .getMany();

        let returnedImages: ReturnedImage[] = [];

        for (let image of images) {
            const presignedUrls = await createImagePresignedUrls(image.image_key);
            const returnedImage: ReturnedImage = {
                image_id: image.image_id,
                image_url: presignedUrls.image_url,
                thumbnail_url: presignedUrls.thumbnail_url,
                card_url: presignedUrls.card_url,
                image_time: image.image_time,
                aspect_ratio: image.aspect_ratio,
                size: image.size,
                user_id: image.user_id,
            };

            returnedImages.push(returnedImage);
            
        }

        return { status: 200, album: album, images: returnedImages };
    } catch (error) {
        return { status: 500, album: null, images: null, error: error };    
    }
};


export async function removeImageFromAlbum(albumId: number, imageId: number, userId: string) {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const album = await albumRepository.findOne({ where: { album_id: albumId }, relations: ['albumContents', 'albumShareList']});

        if (!album) {
            return { status: 404 };
        }

        if (album.wachat_id !== null) {
            return { status: 403 };
        }

        if (album.user_id !== userId && !album.albumShareList.some((sharedUser) => sharedUser.id === userId)) {
            return { status: 403 };
        }

        const imageRepository = appDataSource.getRepository(Image);
        const image = await imageRepository.findOne({ where: { image_id: imageId, user_id: userId } });

        if (!image) {
            return { status: 403 };
        }

        // Check if the image is the cover image
        if (album.cover_image === imageId) {
            // Set the cover_image property to the new first image in albumContents after it has been updated
            const updatedAlbumContents = album.albumContents.filter((content) => content.image_id !== imageId);
            album.albumContents = updatedAlbumContents;
            album.cover_image = album.albumContents.length > 0 ? album.albumContents[0].image_id : null;
        } else {
            // Remove the image from the album's content list
            const updatedAlbumContents = album.albumContents.filter((content) => content.image_id !== imageId);
            album.albumContents = updatedAlbumContents;
        }

        const isImageInUse = await checkImageInPostOrAlbum(imageId);

        if (!isImageInUse) {
            await deleteImage(imageId);
        }

        // Save the changes to the database
        await albumRepository.save(album);

        return { status: 205 };
    } catch (error) {
        return { status: 500, error: error };
    }
};



export async function deleteAlbum(albumId: number, userId: string) {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const album = await albumRepository.findOne({ where: { album_id: albumId }, relations: ['albumContents'] });

        if (!album) {
            return { status: 404 };
        }

        if (album.wachat_id !== null) {
            return { status: 403 };
        }

        if (album.user_id !== userId) {
            return { status: 403 };
        }

        for (const image of album.albumContents) {
            const isImageInUse = await checkImageInPostOrAlbum(image.image_id);

            if (!isImageInUse) {
                await deleteImage(image.image_id);
            }
        }

        await albumRepository.remove(album);
        return { status: 205 };
    } catch (error) {
        return { status: 500, error: error };
    }
};









///////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// SPECIFIC TO SUGGESTED ALBUMS ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////




export async function getSuggestedAlbums(userId: string): Promise<{ status: number, albums: Album[] | null, error?: any }> {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const imageRepository = appDataSource.getRepository(Image);
        const userRepository = appDataSource.getRepository(User);

        const ownSuggestedAlbums = (await albumRepository.find({ where: { user_id: userId }, order: { creation_date: "DESC" }})).filter((album) => album.wachat_id !== null && album.archived === false);

        const sharedSuggestedAlbums = (await albumRepository.createQueryBuilder('album')
            .innerJoinAndSelect('album.albumShareList', 'user')
            .where('user.id = :userId AND album.user_id != :userId', { userId})
            .orderBy('album.creation_date', 'DESC')
            .getMany())
            .filter((album) => album.wachat_id !== null && album.archived === false);

        const suggestedAlbums = ownSuggestedAlbums.concat(sharedSuggestedAlbums);

        // Récupérer l'URL de l'image de couverture pour chaque album
        const albumsWithCoverUrls = await Promise.all(
            suggestedAlbums.map(async (album) => {
                const coverImage = await imageRepository.findOne({ where: { image_id: album.cover_image as number } });
                const user = await userRepository.findOne({ where: { id: album.user_id } });
                const presignedUrls = await createImagePresignedUrls(coverImage?.image_key as string);
                return { ...album, image_url: presignedUrls.image_url, thumbnail_url: presignedUrls.thumbnail_url, card_url: presignedUrls.card_url };
            })
        );

        return { status: 200, albums: albumsWithCoverUrls };
    } catch (error) {
        return { status: 500, albums: null, error: error };    
    }
}

export async function transferImagesToAlbum(imagesIds: number[], currentAlbumId: number, newAlbumId: number, userId: string): Promise<{ status: number, error?: any }> {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const imageRepository = appDataSource.getRepository(Image);

        const currentAlbum = await albumRepository.findOne({ where: { album_id: currentAlbumId }, relations: ['albumContents', 'albumShareList']});
        const newAlbum = await albumRepository.findOne({ where: { album_id: newAlbumId }, relations: ['albumContents', 'albumShareList']});

        if (!newAlbum || !currentAlbum) {
            return { status: 404 };
        }

        if (newAlbum.wachat_id === null || currentAlbum.wachat_id === null ) {
            return { status: 403 };
        }

        if ((newAlbum.user_id !== userId && !newAlbum.albumShareList.some((sharedUser) => sharedUser.id === userId))|| (currentAlbum.user_id !== userId && !currentAlbum.albumShareList.some((sharedUser) => sharedUser.id === userId))) {
            return { status: 403 };
        }

        if (newAlbum.archived === true || currentAlbum.archived === true) {
            return { status: 403 };
        }

        for (const imageId of imagesIds){    
            const image = await imageRepository.findOne({ where: { image_id: imageId } });
            if (!image) {
                return { status: 404 };
            }

            currentAlbum.albumContents = currentAlbum.albumContents.filter((content) => content.image_id !== imageId);
            if (currentAlbum.cover_image === imageId) {
                currentAlbum.cover_image = currentAlbum.albumContents.length > 0 ? currentAlbum.albumContents[0].image_id : null;
            }
            newAlbum.albumContents.push(image);
        }

        if (newAlbum.cover_image === null) {
            newAlbum.cover_image = newAlbum.albumContents.length > 0 ? newAlbum.albumContents[0].image_id : null;
        }

        await albumRepository.save(currentAlbum);
        await albumRepository.save(newAlbum);

        return { status: 200 };
    } catch (error) {
        return { status: 500, error: error };
    }
}


export async function deleteSuggestedAlbum(albumId: number, userId: string): Promise<{ status: number, error?: any }> {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const album = await albumRepository.findOne({ where: { album_id: albumId }, relations: ['albumContents', 'albumShareList']});

        if (!album) {
            return { status: 404 };
        }

        if (album.wachat_id === null) {
            return { status: 403 };
        }

        if (album.user_id !== userId && !album.albumShareList.some((sharedUser) => sharedUser.id === userId)){
            return { status: 403 };
        }

        if (album.archived === true) {
            return { status: 403 };
        }

        const defaultAlbum = await albumRepository.findOne({ where: { user_id: userId, default_album: true, wachat_id: album.wachat_id, archived: false }, relations: ['albumContents']});

        if (defaultAlbum === null) {
            return { status: 404 };
        }

        for (const image of album.albumContents) {
            defaultAlbum.albumContents.push(image);
        }

        await albumRepository.save(defaultAlbum);

        await albumRepository.remove(album);
        return { status: 205 };
    } catch (error) {
        return { status: 500, error: error };
    }
}

export async function createAdjustedAlbum(userId: string, albumName: string, albumDescription: string, originAlbumId: number, includedImagesIds: number[], wachatId: string): Promise<{ status: number, error?: any }> {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const wachatRepository = appDataSource.getRepository(WAChat);

        const originAlbum = await albumRepository.findOne({ where: { album_id: originAlbumId }, relations: ['albumContents', 'albumShareList']});

        const wachat = await wachatRepository.findOne({ where: { wachat_id: wachatId }, relations: ['adjusted_albums'] });

        if (!wachat || !originAlbum) {
            return { status: 404 };
        }
        
        if (wachat.user_id !== userId && !originAlbum.albumShareList.some((sharedUser) => sharedUser.id === userId)) {
            return { status: 403 };
        }

        const newAlbumDraft = albumRepository.create({
            name: albumName,
            description: albumDescription,
            creation_date: new Date(),
            user_id: userId,
            albumShareList: originAlbum.albumShareList,
            albumContents: [] as Image[],
            cover_image: includedImagesIds.length > 0 ? includedImagesIds[0] : null, // Designate the first image as "cover_image"
            wachat_id: wachatId,
            validated: false,
        });

        const newAlbum = await albumRepository.save(newAlbumDraft);

        const { status, error } = await transferImagesToAlbum(includedImagesIds, originAlbumId, newAlbum.album_id, userId);
        if (status !== 200) {
            return { status: status, error: error };
        }

        wachat.adjusted_albums.push(newAlbum);

        await wachatRepository.save(wachat);

        return { status: 201 };
    } catch (error) {
        return { status: 500, error: error };
    }
}

export async function copySuggestedAlbum(albumId: number, userId: string, wachatId: string): Promise<{ status: number, error?: any }> {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const wachatRepository = appDataSource.getRepository(WAChat);

        const album = await albumRepository.findOne({ where: { album_id: albumId }, relations: ['albumContents', 'albumShareList']});
        const wachat = await wachatRepository.findOne({ where: { wachat_id: wachatId }, relations: ['validated_albums'] });

        if (!album || !wachat) {
            return { status: 404 };
        }

        if (album.wachat_id === null) {
            return { status: 403 };
        }

        if (album.user_id !== userId) {
            return { status: 403 };
        }

        if (album.archived === true) {
            return { status: 403 };
        }

        const newAlbum = albumRepository.create({
            name: album.name,
            description: album.description,
            creation_date: album.creation_date,
            user_id: userId,
            albumShareList: album.albumShareList,
            albumContents: album.albumContents,
            cover_image: album.cover_image, // Designate the first image as "cover_image"
            wachat_id: wachatId,
            wachat_validated: wachat,
        });

        await albumRepository.save(newAlbum);

        wachat.validated_albums.push(newAlbum);

        await wachatRepository.save(wachat);

        return { status: 201 };
    } catch (error) {
        return { status: 500, error: error };
    }
}

export async function changeAlbumValidationStatus(albumId: number, userId: string): Promise<{ status: number, error?: any }> {
    try {
        const albumRepository = appDataSource.getRepository(Album);
        const album = await albumRepository.findOne({ where: { album_id: albumId } });

        if (!album) {
            return { status: 404 };
        }

        if (album.wachat_id === null || album.archived === true || album.user_id !== userId) {
            return { status: 403 };
        }

        album.validated = album.validated ? false : true;

        await albumRepository.save(album);

        return { status: 200 };
    } catch (error) {
        return { status: 500, error: error };
    }
}