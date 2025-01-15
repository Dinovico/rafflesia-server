import { appDataSource } from '../datasource.js';

import WAChat from '../entities/wachat.js';
import Album from '../entities/album.js';
import Image from '../entities/image.js';
import WAChat_Image_Relation from '../entities/wachat_image_relation.js';
import type { CustomFile } from '../middleware/imageUpload.js';
import { createImagePresignedUrls, deleteImage, getImageById, uploadImage } from './images.services.js';
import { getSortedAlbums, type ChatResponseObject } from './wasorting/getSortedAlbums.js';
import { onAlbumSharing, onExportCancelled, onExportSharing, onSortedWAExport } from './messaging/messaging.js';
import { copySuggestedAlbum, shareAlbum } from './albums.services.js';
import { log } from 'console';
import User from '../entities/user.js';


import s3 from './misc/s3Init.js';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';




async function createSuggestedAlbums(userId: string, wachat: WAChat): Promise<{ status: number, error?: unknown }> {

    try {    


        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_TEXT_BUCKET!,
            Key: wachat.content_key,
        });
        const s3Response = await s3.send(command);
        const chatContent = await s3Response.Body?.transformToString() as string;
        const suggestedAlbums: ChatResponseObject |null = await getSortedAlbums(chatContent, wachat.wachat_id);
        
        const wachatRepository = appDataSource.getRepository(WAChat);
        const albumRepository = appDataSource.getRepository(Album);
        const imageRepository = appDataSource.getRepository(Image);
        const wachatImageRelationRepository = appDataSource.getRepository(WAChat_Image_Relation);

        let usedImagesRefs: string[] = [];

        if (suggestedAlbums !== null) {

            for (const album of suggestedAlbums) {


                let albumContents: Image[] = [];

                for (const waref of album.value) {
                    
                    const wachatImageRelation = await wachatImageRelationRepository.findOne({ where: { image_ref: waref, wachat_id: wachat.wachat_id } });
                    
                    if (wachatImageRelation !== null) {
                        
                        usedImagesRefs.push(waref);
                        
                        const image = await imageRepository.findOne({ where: { image_id: wachatImageRelation.image_id } });

                        if (image) {
                            albumContents.push(image);
                        }
                        
                    } else {
                        console.log('This ref seems to be made up');
                    }
                }

                if (albumContents.length > 0) {
                    
                    const newImmutableAlbum = albumRepository.create({
                        name: album.key,
                        description: '',
                        creation_date: new Date(),
                        user_id: userId,
                        albumShareList: [],
                        albumContents: albumContents,
                        cover_image: albumContents[0].image_id,
                        wachat_id: wachat.wachat_id,
                        archived: true,
                    });

                    await albumRepository.save(newImmutableAlbum);

                    wachat.suggested_albums.push(newImmutableAlbum);

                    const newMutableAlbum = albumRepository.create({
                        name: album.key,
                        description: '',
                        creation_date: new Date(),
                        user_id: userId,
                        albumShareList: [],
                        albumContents: albumContents,
                        cover_image: albumContents[0].image_id,
                        wachat_id: wachat.wachat_id,
                        archived: false,
                        validated: false,
                    });

                    await albumRepository.save(newMutableAlbum);

                    wachat.adjusted_albums.push(newMutableAlbum);

                }

                await wachatRepository.save(wachat);
            }

        } else {
            console.log("Error");
        }

        const unusedImagesRefs = (await wachatImageRelationRepository.find({ where: { wachat_id: wachat.wachat_id } })).filter((relation) => !usedImagesRefs.includes(relation.image_ref));
        let unusedImages: Image[] = [];


        for (const relation of unusedImagesRefs) {

            const image = await imageRepository.findOne({ where: { image_id: relation.image_id } });

            if (image !== null) {
                unusedImages.push(image);
            }
        }

        const newImmutableDump = albumRepository.create({
            name: 'Photos non classées',
            description: '',
            creation_date: new Date(),
            user_id: userId,
            albumShareList: [],
            albumContents: unusedImages,
            cover_image: unusedImages.length > 0 ? unusedImages[0].image_id : null,
            wachat_id: wachat.wachat_id,
            archived: true,
            default_album: true,
        });

        await albumRepository.save(newImmutableDump);

        wachat.suggested_albums.push(newImmutableDump);

        const newMutableDump = albumRepository.create({
            name: 'Photos non classées',
            description: '',
            creation_date: new Date(),
            user_id: userId,
            albumShareList: [],
            albumContents: unusedImages,
            cover_image: unusedImages.length > 0 ? unusedImages[0].image_id : null,
            wachat_id: wachat.wachat_id,
            archived: false,
            default_album: true,
            validated: true,
        });

        await albumRepository.save(newMutableDump);

        wachat.adjusted_albums.push(newMutableDump);

        wachat.archived = false;

        wachat.sorted = true;

        await wachatRepository.save(wachat);

        onSortedWAExport(userId);

        return { status: 200 };
    } catch (err) {
        console.error('Error during suggested albums creation', err);
        return { status: 500, error: err };
    }
}



export async function newExport(userId: string, chatFile: CustomFile, chatName: string, imagesCount: number): Promise<{ status: number, exportId?: string, error?: unknown }> {
    try {

        const wachatRepository = appDataSource.getRepository(WAChat);

        const key = chatFile.location.split('/')[chatFile.location.split('/').length - 1];
        
        const newWAChat = wachatRepository.create({
            user_id: userId,
            content_key: key,
            chat_name: chatName,
            images_count: imagesCount,
            images: [] as WAChat_Image_Relation[],
        });

        await wachatRepository.save(newWAChat);


        return { status: 200, exportId: newWAChat.wachat_id };
    } catch (err) {
        console.error('Error during new export creation', err);
        return { status: 500, error: err };
    }
    
}



export async function uploadWAFile(userId: string, cf: CustomFile, exportId: string, WAFileRef: string): Promise<{ status: number, error?: unknown }> {
    try {

        const wachatRepository = appDataSource.getRepository(WAChat);
        const wachatImageRelationRepository = appDataSource.getRepository(WAChat_Image_Relation);


        const existingWAChat = await wachatRepository.findOne({ where: { wachat_id: exportId }, relations: ['images', 'suggested_albums', 'adjusted_albums']});

        if (!existingWAChat) {
                return { status: 404 };
        }


        const response = await uploadImage(cf, userId, 1);

        if (response.status !== 200) {
                return response;
        }

        if (WAFileRef.startsWith('IMG-')){
            // Extract the first 8 digits from the string between <>
            WAFileRef = WAFileRef.split('-')[1] + "-" + WAFileRef.split('-')[2].split(".")[0];
        } else {
            WAFileRef = WAFileRef.split('-')[0];
        }

        const wachatImageRelation = wachatImageRelationRepository.create({
            wachat_id: existingWAChat.wachat_id,
            image_id: response.image!.image_id,
            image_ref: WAFileRef,
        });

        const savedWachatImageRelation = await wachatImageRelationRepository.save(wachatImageRelation);
        existingWAChat.images.push(savedWachatImageRelation);
        await wachatRepository.save(existingWAChat);

        if(existingWAChat.images.length === existingWAChat.images_count) {
            await createSuggestedAlbums(userId, existingWAChat);
        }

        return { status: 200 };
    } catch (err) {
        console.error('Error during file upload', err);
        return { status: 500, error: err };
    }
}



export async function generateInvitationCode(userId: string, exportId: string): Promise<{ status: number, invitationCode?: string, error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const wachat = await wachatRepository.findOne({ where: { wachat_id: exportId }});

        if (!wachat) {
            return { status: 404 };
        }

        if (wachat.user_id !== userId) {
            return { status: 403 };
        }

        let flag = true;

        while (flag) {
            const code = Math.random().toString(36).substring(0, 6).toUpperCase();
            const existingCode = await wachatRepository.findOne({ where: { sharing_code: code }});
            if (existingCode === null) {
                wachat.sharing_code = code;
                wachat.sharing_code_expiry = new Date(Date.now() + 86400000 * 7); // 86400000 ms = 1 day
                flag = false;
            }
        }

        await wachatRepository.save(wachat);

        return { status: 200, invitationCode: wachat.sharing_code };
    } catch (err) {
        console.error('Error during invitation code generation', err);
        return { status: 500, error: err };
    }
};


export async function useInvitationCode(userId: string, invitationCode: string): Promise<{ status: number, error?: unknown }> {
    try {

        if (invitationCode === null || invitationCode === undefined) {
            return { status: 400 };
        }

        const wachatRepository = appDataSource.getRepository(WAChat);
        const wachat = await wachatRepository.findOne({ where: { sharing_code: invitationCode.toUpperCase() }, relations: ['exportShareList']});

        if (!wachat) {
            return { status: 404 };
        }

        if (wachat.user_id === userId) {
            return { status: 403 };
        }

        if (wachat.sorted === false) {
            return { status: 403 };
        }

        if (wachat.sharing_code_expiry < new Date()) {
            return { status: 403 };
        }

        await shareWAExport(wachat.user_id, wachat.wachat_id, wachat.exportShareList.map(e => e.id).concat([userId]));

        return { status: 200 };
    } catch (err) {
        console.error('Error during use of invitation code', err);
        return { status: 500, error: err };
    }
}


interface ExtendedAlbum extends Album {
    card_url: string | null;
}

interface ExtendedWAChat extends WAChat {
    adjusted_albums: ExtendedAlbum[];
    validated_albums: ExtendedAlbum[];
}


export async function getUserLoadingExports(userId: string): Promise<{ status: number, exports?: WAChat[], error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const ownedExports = await wachatRepository.find({ where: { user_id: userId, archived: true, sorted: false }});

        const sharedExports: WAChat[] = (await wachatRepository.createQueryBuilder('wa_chat')
            .innerJoinAndSelect('wa_chat.exportShareList', 'user')
            .where('user.id = :userId AND wa_chat.user_id != :userId', { userId })
            .orderBy('wa_chat.wachat_id', 'DESC')
            .getMany())
            .filter((wa_chat) => wa_chat.archived === true && wa_chat.sorted === false);


        const exports = ownedExports.concat(sharedExports);

        // for (const wa_chat of exports) {
        //     if ( wa_chat.created_at.valueOf() + 600000 < Date.now()) {
        //         deleteExport(wa_chat.user_id, wa_chat.wachat_id);
        //         exports.splice(exports.indexOf(wa_chat), 1);
        //         onExportCancelled(wa_chat);
        //     }
        // }


        return { status: 200, exports: exports };
    } catch (err) {
        console.error('Error during getting user exports', err);
        return { status: 500, error: err };
    }
};


export async function getUserActiveExports(userId: string): Promise<{ status: number, exports?: ExtendedWAChat[], error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const imageRepository = appDataSource.getRepository(Image);
        const ownedExports = await wachatRepository.find({ where: { user_id: userId, archived: false, sorted: true }, relations: ['adjusted_albums']});

        const sharedExports: WAChat[] = (await wachatRepository.createQueryBuilder('wa_chat')
            .innerJoinAndSelect('wa_chat.exportShareList', 'user')
            .innerJoinAndSelect('wa_chat.adjusted_albums', 'albums')
            .where('user.id = :userId AND wa_chat.user_id != :userId', { userId })
            .orderBy('wa_chat.wachat_id', 'DESC')
            .getMany())
            .filter((wa_chat) => wa_chat.archived === false && wa_chat.sorted === true);


        const exports = ownedExports.concat(sharedExports);
        let newExports: ExtendedWAChat[] = [];
        for (const wa_chat of exports) {
            let newWAChat: ExtendedWAChat = wa_chat as ExtendedWAChat;
            let newAdjustedAlbums: ExtendedAlbum[] = [];
            for (const album of newWAChat.adjusted_albums) {
                let newAlbum: ExtendedAlbum = album as ExtendedAlbum;
                if (album.cover_image === null) {
                    album.card_url = null;
                } else {
                    const image = await imageRepository.findOne({ where: { image_id: album.cover_image } });
                    
                    if (image) {
                        const presignedUrls = await createImagePresignedUrls(image.image_key);
                        album.card_url = presignedUrls.card_url;
                    }
                }
                newAdjustedAlbums.push(newAlbum);
            }
            newWAChat.adjusted_albums = newAdjustedAlbums;
            newExports.push(newWAChat);
        }


        return { status: 200, exports: newExports };
    } catch (err) {
        console.error('Error during getting user exports', err);
        return { status: 500, error: err };
    }
};

export async function getUserArchivedExports(userId: string): Promise<{ status: number, exports?: ExtendedWAChat[], error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const imageRepository = appDataSource.getRepository(Image);
        const ownedExports = await wachatRepository.find({ where: { user_id: userId, archived: true, sorted: true }, relations: ['validated_albums']});

        const sharedExports: WAChat[] = (await wachatRepository.createQueryBuilder('wa_chat')
            .innerJoinAndSelect('wa_chat.exportShareList', 'user')
            .innerJoinAndSelect('wa_chat.validated_albums', 'albums')
            .where('user.id = :userId AND wa_chat.user_id != :userId', { userId })
            .orderBy('wa_chat.wachat_id', 'DESC')
            .getMany())
            .filter((wa_chat) => wa_chat.archived === true && wa_chat.sorted === true);


        const exports = ownedExports.concat(sharedExports);
        let newExports: ExtendedWAChat[] = [];
        for (const wa_chat of exports) {
            let newWAChat: ExtendedWAChat = wa_chat as ExtendedWAChat;
            let newValidatedAlbums: ExtendedAlbum[] = [];
            for (const album of newWAChat.validated_albums) {
                let newAlbum: ExtendedAlbum = album as ExtendedAlbum;
                if (album.cover_image === null) {
                    album.card_url = null;
                } else {
                    const image = await imageRepository.findOne({ where: { image_id: album.cover_image } });
                    
                    if (image) {
                        const presignedUrls = await createImagePresignedUrls(image.image_key);
                        album.card_url = presignedUrls.card_url;
                    }
                }
                newValidatedAlbums.push(newAlbum);
            }
            newWAChat.adjusted_albums = newValidatedAlbums;
            newExports.push(newWAChat);
        }


        return { status: 200, exports: newExports };
    } catch (err) {
        console.error('Error during getting user exports', err);
        return { status: 500, error: err };
    }
};

export async function getExportById(userId: string, exportId: string): Promise<{ status: number, export?: ExtendedWAChat, error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const imageRepository = appDataSource.getRepository(Image);
        const wachat = await wachatRepository.findOne({ where: { wachat_id: exportId }, relations: ['adjusted_albums', 'exportShareList']});

        if (!wachat) {
            return { status: 404 };
        }

        if (wachat.user_id !== userId && !wachat.exportShareList.some((u) => u.id === userId)){
            return { status: 403 };
        }

        let newWAChat: ExtendedWAChat = wachat as ExtendedWAChat;
        let newAdjustedAlbums: ExtendedAlbum[] = [];
        for (const album of newWAChat.adjusted_albums) {
            let newAlbum: ExtendedAlbum = album as ExtendedAlbum;
            if (album.cover_image === null) {
                album.card_url = null;
            } else {
                const image = await imageRepository.findOne({ where: { image_id: album.cover_image } });
                if (image) {
                    const presignedUrls = await createImagePresignedUrls(image.image_key);
                    album.card_url = presignedUrls.card_url;
                }
            }
            newAdjustedAlbums.push(newAlbum);
        }
        newWAChat.adjusted_albums = newAdjustedAlbums;

        return { status: 200, export: newWAChat };
    } catch (err) {
        console.error('Error during getting export', err);
        return { status: 500, error: err };
    }
}


export async function shareWAExport(userId: string, exportId: string, shareList: string[]): Promise<{ status: number, error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const userRepository = appDataSource.getRepository(User);
        const wachat = await wachatRepository.findOne({ where: { wachat_id: exportId }, relations: ['exportShareList', 'adjusted_albums']});

        if (!wachat) {
            return { status: 404 };
        }

        // shareList parameter should be the expected new shareList
        if (wachat.user_id !== userId) {
            if (wachat.exportShareList.length === shareList.length + 1) {
                for (let i = 0; i < wachat.exportShareList.length; i++) {
                    if (!shareList.includes(wachat.exportShareList[i].id)) {
                        if (wachat.exportShareList[i].id === userId) {
                            wachat.exportShareList.splice(i, 1);
                        }
                        else {
                            return { status: 403 };
                        }
                    }
                }

                await wachatRepository.save(wachat);
                return { status: 204 };
            }
            return { status: 403 };
        }

        let userShareList: User[] = [];

        for (const shareId of shareList) {
            const user = await userRepository.findOne({ where: { id: shareId } });
            if (!user) {
                return { status: 404 };
            }
            if (!wachat.exportShareList.some((u) => u.id === shareId)) {
                userShareList.push(user);
            }
        }

        let newMembers: User[] = [];
        for (const user of userShareList) {
            if (!wachat.exportShareList.some((u) => u.id === user.id)) {
                newMembers.push(user);
            }
        }

        wachat.exportShareList = userShareList;

        await wachatRepository.save(wachat);

        if (!shareList.some((shareId) => shareId === userId)) {
            shareList.push(userId);
        }

        for (const album of wachat.adjusted_albums) {
            await shareAlbum(userId, album.album_id, shareList, true);
        }

        onExportSharing(wachat, newMembers);

        return { status: 204 };
    } catch (err) {
        console.error('Error during sharing export', err);
        return { status: 500, error: err };
    }
}


export interface AlbumPreview {
    album_id: number;
    name: string;
    description: string;
    card_url: string | null;
}

export interface ExportPreview {
    wachat_id: string;
    username: string;
    chat_name: string;
    albums_previews: AlbumPreview[];
}



export async function getExportPreview(sharingId: string): Promise<{ status: number, preview?: ExportPreview, error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const imageRepository = appDataSource.getRepository(Image);
        const userRepository = appDataSource.getRepository(User);
        const wachat = await wachatRepository.findOne({ where: { sharing_code: sharingId }, relations: ['adjusted_albums', 'validated_albums']});

        if (!wachat) {
            return { status: 404 };
        }

        if (wachat.sharing_code_expiry < new Date()) {
            return { status: 403 };
        }

        const user = await userRepository.findOne({ where: { id: wachat.user_id } });

        if (!user) {
            return { status: 404 };
        }

        const username = user.firstname + ' ' + user.lastname;

        let newAlbumsPreviews: AlbumPreview[] = [];

        const albums = wachat.archived ? wachat.validated_albums : wachat.adjusted_albums;

        for (const album of albums) {
            let newAlbumPreview: AlbumPreview = {
                album_id: album.album_id,
                name: album.name,
                description: album.description,
                card_url: '',
            };
            if (album.cover_image === null) {
                newAlbumPreview.card_url = null;
            } else {
                const image = await imageRepository.findOne({ where: { image_id: album.cover_image } });
                if (image) {
                    const presignedUrls = await createImagePresignedUrls(image.image_key);
                    newAlbumPreview.card_url = presignedUrls.card_url;
                }
            }
            newAlbumsPreviews.push(newAlbumPreview);
        }

        return { status: 200, preview: { wachat_id: wachat.wachat_id, username: username, chat_name: wachat.chat_name, albums_previews: newAlbumsPreviews } };
    } catch (err) {
        console.error('Error during getting export preview', err);
        return { status: 500, error: err };
    }
}


export async function closeSortingProcess(userId: string, exportId: string): Promise<{ status: number, error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const albumRepository = appDataSource.getRepository(Album);
        const wachat = await wachatRepository.findOne({ where: { wachat_id: exportId }, relations: ['adjusted_albums']});

        if (!wachat) {
            return { status: 404 };
        }

        if (wachat.user_id !== userId) {
            return { status: 403 };
        }

        if (wachat.archived === true) {
            return { status: 409 };
        }

        for (const album of wachat.adjusted_albums) {

            await copySuggestedAlbum(album.album_id, userId, wachat.wachat_id);

            album.archived = true;

            await albumRepository.save(album);
        }

        wachat.archived = true;

        await wachatRepository.save(wachat);

        return { status: 200 };
    } catch (err) {
        console.error('Error during closing sorting process', err);
        return { status: 500, error: err };
    }
}


export async function deleteExport(userId: string, exportId: string): Promise<{ status: number, error?: unknown }> {
    try {
        console.log("export ID", exportId)
        const wachatRepository = appDataSource.getRepository(WAChat);
        const albumRepository = appDataSource.getRepository(Album);
        const wachatImageRelationRepository = appDataSource.getRepository(WAChat_Image_Relation);
        const wachat = await wachatRepository.findOne({ where: { wachat_id: exportId }, relations: ['images', 'adjusted_albums', 'suggested_albums', 'validated_albums']});

        if (!wachat) {
            return { status: 404 };
        }

        if (wachat.user_id !== userId) {
            return { status: 403 };
        }

        for (const image of wachat.images) {
            await deleteImage(image.image_id);
            wachatImageRelationRepository.remove(image);
        }

        for (const album of wachat.adjusted_albums) {
            await albumRepository.remove(album);
        }
        for (const album of wachat.suggested_albums) {
            await albumRepository.remove(album);
        }
        for (const album of wachat.validated_albums) {
            await albumRepository.remove(album);
        }

        const deleteResult = await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_TEXT_BUCKET!,
                Key: wachat.content_key,
            })
        );

        if (deleteResult.$metadata.httpStatusCode === undefined || deleteResult.$metadata.httpStatusCode > 299) {
            console.log(deleteResult);
            return { status: deleteResult.$metadata.httpStatusCode ? deleteResult.$metadata.httpStatusCode : 500 };
        }

        await wachatRepository.remove(wachat);

        return { status: 205 };
    } catch (err) {
        console.error('Error during deleting export', err);
        return { status: 500, error: err };
    }
}




export async function regenerateAlbums(userId: string, exportId: string): Promise<{ status: number, error?: unknown }> {
    try {
        const wachatRepository = appDataSource.getRepository(WAChat);
        const albumRepository = appDataSource.getRepository(Album);
        const wachat = await wachatRepository.findOne({ where: { wachat_id: exportId }, relations: ['adjusted_albums', 'suggested_albums']});

        if (!wachat) {
            return { status: 404 };
        }

        if (wachat.user_id !== userId) {
            return { status: 403 };
        }

        if (wachat.archived === true) {
            return { status: 403 };
        }

        for (const album of wachat.adjusted_albums) {
            await albumRepository.remove(album);
        }
        for (const album of wachat.suggested_albums) {
            await albumRepository.remove(album);
        }

        createSuggestedAlbums(userId, wachat);

        return { status: 201 };
    } catch (err) {
        console.error('Error during regenerating albums', err);
        return { status: 500, error: err };
    }
}