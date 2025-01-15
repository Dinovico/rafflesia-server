import type Album from "../../entities/album.js";
import User from "../../entities/user.js";
import Image from "../../entities/image.js";
import { getUserActiveDevices } from "../devices.services.js";

import admin from 'firebase-admin';
import { appDataSource } from "../../datasource.js";
import { createImagePresignedUrls } from "../images.services.js";
import type WAChat from "../../entities/wachat.js";



export async function onNewAlbum(album: Album): Promise<{ status: number, error?: unknown }> {

    try {
        const users: User[] = album.albumShareList.filter((user) => user.id !== album.user_id);

        const owner = await appDataSource.getRepository(User).findOne({ where: { id: album.user_id } });

        const cover_image = await appDataSource.getRepository(Image).findOne({ where: { image_id: album.cover_image! } });

        let presignedUrls = { image_url: '', card_url: '', thumbnail_url: '' };
        if (cover_image) {
            presignedUrls = await createImagePresignedUrls(cover_image.image_key);
        }
        
        for (let index = 0; index < users.length; index++) {

            const devices = (await getUserActiveDevices(users[index].id)).devices;

            const tokens = devices?.map((device) => device.token) || [];
            
            await admin.messaging().sendEachForMulticast({
                tokens: tokens, 
                data: {
                    type: 'new_album',
                    album_id: album.album_id.toString(),
                    user_id: album.user_id,
                    imageUrl: presignedUrls.card_url,
                },
                notification: {
                    title: 'Nouvel album collaboratif',
                    body: `${owner?.firstname} ${owner?.lastname} vous a invité à rejoindre l'album "${album.name}"`,
                    imageUrl: presignedUrls.card_url,
                },
                apns: {
                    payload: {
                        aps: {
                        // Required for background/quit data-only messages on iOS
                        // Note: iOS frequently will receive the message but decline to deliver it to your app.
                        //           This is an Apple design choice to favor user battery life over data-only delivery
                        //           reliability. It is not under app control, though you may see the behavior in device logs.
                        'content-available': true,
                        // Required for background/quit data-only messages on Android
                        priority: 'high',
                        },
                    },
                },
            });
        }

        return { status: 200 };
    } catch (error) {
        return { status: 500, error: error };
    }
};



export async function onAlbumSharing(album: Album, newMembers: User[]): Promise<{ status: number, error?: unknown }> {

    try {

        const owner = await appDataSource.getRepository(User).findOne({ where: { id: album.user_id } });

        const cover_image = await appDataSource.getRepository(Image).findOne({ where: { image_id: album.cover_image! } });

        let presignedUrls = { image_url: '', card_url: '', thumbnail_url: '' };
        if (cover_image) {
            presignedUrls = await createImagePresignedUrls(cover_image.image_key);
        }
        
        for (let index = 0; index < newMembers.length; index++) {

            const devices = (await getUserActiveDevices(newMembers[index].id)).devices;

            const tokens = devices?.map((device) => device.token) || [];
            
            await admin.messaging().sendEachForMulticast({
                tokens: tokens, 
                data: {
                    type: 'album_shared',
                    album_id: album.album_id.toString(),
                    user_id: album.user_id,
                    imageUrl: presignedUrls.card_url,
                },
                notification: {
                    title: 'Nouvel album collaboratif',
                    body: `${owner?.firstname} ${owner?.lastname} vous a invité à rejoindre l'album "${album.name}"`,
                    imageUrl: presignedUrls.card_url,
                },
                apns: {
                    payload: {
                        aps: {
                        // Required for background/quit data-only messages on iOS
                        // Note: iOS frequently will receive the message but decline to deliver it to your app.
                        //           This is an Apple design choice to favor user battery life over data-only delivery
                        //           reliability. It is not under app control, though you may see the behavior in device logs.
                        'content-available': true,
                        // Required for background/quit data-only messages on Android
                        priority: 'high',
                        },
                    },
                },
            });
        }

        return { status: 200 };
    } catch (error) {
        return { status: 500, error: error };
    }
};



export async function onNewAlbumContent(album: Album, userId: string): Promise<{ status: number, error?: unknown }> {

    try {
        
        const users: User[] = album.albumShareList.filter((user) => user.id !== album.user_id);
        
        for (let index = 0; index < users.length; index++) {

            const devices = (await getUserActiveDevices(users[index].id)).devices;

            const tokens = devices?.map((device) => device.token) || [];
            
            await admin.messaging().sendEachForMulticast({
                tokens: tokens, 
                data: {
                    type: 'new_album_content',
                    album_id: album.album_id.toString(),
                    user_id: userId,
                },
                apns: {
                    payload: {
                        aps: {
                        // Required for background/quit data-only messages on iOS
                        // Note: iOS frequently will receive the message but decline to deliver it to your app.
                        //           This is an Apple design choice to favor user battery life over data-only delivery
                        //           reliability. It is not under app control, though you may see the behavior in device logs.
                        'content-available': true,
                        // Required for background/quit data-only messages on Android
                        priority: '5',
                        },
                    },
                },
            });
        }

        return { status: 200 };
    } catch (error) {
        return { status: 500, error: error };
    }
};




export async function onExportSharing(wachat: WAChat, newMembers: User[]): Promise<{ status: number, error?: unknown }> {

    try {

        const owner = await appDataSource.getRepository(User).findOne({ where: { id: wachat.user_id } });

        
        for (let index = 0; index < newMembers.length; index++) {

            const devices = (await getUserActiveDevices(newMembers[index].id)).devices;

            const tokens = devices?.map((device) => device.token) || [];
            
            await admin.messaging().sendEachForMulticast({
                tokens: tokens, 
                data: {
                    type: 'export_shared',
                    wachat_id: wachat.wachat_id.toString(),
                    user_id: wachat.user_id,
                },
                notification: {
                    title: 'Nouvelle conversation triée',
                    body: `${owner?.firstname} ${owner?.lastname} a trié les photos de la conversation "${wachat.chat_name} et vous a partagé le résultat !"`,
                },
                apns: {
                    payload: {
                        aps: {
                        // Required for background/quit data-only messages on iOS
                        // Note: iOS frequently will receive the message but decline to deliver it to your app.
                        //           This is an Apple design choice to favor user battery life over data-only delivery
                        //           reliability. It is not under app control, though you may see the behavior in device logs.
                        'content-available': true,
                        // Required for background/quit data-only messages on Android
                        priority: 'high',
                        },
                    },
                },
            });
        }

        return { status: 200 };
    } catch (error) {
        return { status: 500, error: error };
    }
};



export async function onExportCancelled(wachat: WAChat): Promise<{ status: number, error?: unknown }> {
    
    try {
        
        const users: User[] = wachat.exportShareList;
        
        for (let index = 0; index < users.length; index++) {

            const devices = (await getUserActiveDevices(users[index].id)).devices;

            const tokens = devices?.map((device) => device.token) || [];
            
            await admin.messaging().sendEachForMulticast({
                tokens: tokens, 
                data: {
                    type: 'export_cancelled',
                    wachat_id: wachat.wachat_id.toString(),
                },
                notification: {
                    title: "Votre conversation n'a pas pu être triée ",
                    body: `Une erreur inattendue est survenue lors du tri de la conversation ${wachat.chat_name}. Nous vous invitons à réessayer le processus.`,
                },
                apns: {
                    payload: {
                        aps: {
                        // Required for background/quit data-only messages on iOS
                        // Note: iOS frequently will receive the message but decline to deliver it to your app.
                        //           This is an Apple design choice to favor user battery life over data-only delivery
                        //           reliability. It is not under app control, though you may see the behavior in device logs.
                        'content-available': true,
                        // Required for background/quit data-only messages on Android
                        priority: '5',
                        },
                    },
                },
            });
        }

        return { status: 200 };
    } catch (error) {
        return { status: 500, error: error };
    }
};



export async function onSortedWAExport(userId: string): Promise<{ status: number, error?: unknown }> {

    try {

        const devices = (await getUserActiveDevices(userId)).devices;

        const tokens = devices?.map((device) => device.token) || [];

        
        await admin.messaging().sendEachForMulticast({
            tokens: tokens, 
            data: {
                type: 'wasorting_complete',
            },
            notification: {
                title: 'Galerie WhatsApp triée',
                body: 'Venez découvrir vos albums suggérés sur Fanao !',
            },
            apns: {
                payload: {
                    aps: {
                    // Required for background/quit data-only messages on iOS
                    // Note: iOS frequently will receive the message but decline to deliver it to your app.
                    //           This is an Apple design choice to favor user battery life over data-only delivery
                    //           reliability. It is not under app control, though you may see the behavior in device logs.
                    'content-available': true,
                    // Required for background/quit data-only messages on Android
                    priority: 'high',
                    },
                },
            },
        });


        return { status: 200 };
    } catch (error) {
        console.log('error sending notification: ', error);
        return { status: 500, error: error };
    }
};