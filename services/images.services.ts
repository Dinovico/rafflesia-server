import { appDataSource } from '../datasource.js';

import Image from '../entities/image.js';
import WAChat_Image_Relation from '../entities/wachat_image_relation.js';

import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

import s3 from './misc/s3Init.js';

import type { CustomFile } from '../middleware/imageUpload.js';
import User from '../entities/user.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';



export interface ReturnedImage {
    image_id: number;
    image_url: string;
    card_url: string;
    thumbnail_url: string;
    image_time: Date;
    aspect_ratio: number;
    size: number;
    user_id: string;
}


export const createImagePresignedUrls = async (key: string) => {
    const image_command = new GetObjectCommand({ Bucket: process.env.AWS_S3_IMAGES_BUCKET, Key: key });
    const image_url = await getSignedUrl(s3, image_command, { expiresIn: 60 });

    const card_command = new GetObjectCommand({ Bucket: process.env.AWS_S3_CARDS_BUCKET, Key: key });
    const card_url = await getSignedUrl(s3, card_command, { expiresIn: 60 });

    const thumbnail_command = new GetObjectCommand({ Bucket: process.env.AWS_S3_THUMBNAILS_BUCKET, Key: key });
    const thumbnail_url = await getSignedUrl(s3, thumbnail_command, { expiresIn: 60 });
    
    return { image_url, card_url, thumbnail_url };
};



export const imageToReturnedImage = async (image: Image): Promise<ReturnedImage> => {
    const presignedUrls = await createImagePresignedUrls(image.image_key);

    return {
        image_id: image.image_id,
        image_url: presignedUrls.image_url,
        card_url: presignedUrls.card_url,
        thumbnail_url: presignedUrls.thumbnail_url,
        image_time: image.image_time,
        aspect_ratio: image.aspect_ratio,
        size: image.size,
        user_id: image.user_id,
    };
};



export async function checkImageInPostOrAlbum(imageId: number): Promise<boolean> {
    const imageRepository = appDataSource.getRepository(Image);

    var postCount = 0;
    var albumCount = 0;

    const image = await imageRepository.findOne({ 
        where: { image_id: imageId }, 
        relations: ['posts', 'albums'] 
      });

    if (image) {
        albumCount = image.albums.length;
    }


    return (postCount + albumCount > 1) ? true : false;
}




export async function deleteImage(imageId: number): Promise<{ status: number, error?: unknown }> {
    const imageRepository = appDataSource.getRepository(Image);
    const userRepository = appDataSource.getRepository(User);

    try {
        const image = await imageRepository.findOne({ where: { image_id: imageId } });

        if (!image) {
            return { status: 404 };
        }

        const user = await userRepository.findOne({ where: { id: image?.user_id } });
        
        if (!user) {
            return { status: 404 };
        }

        const imageResult = await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_IMAGES_BUCKET!,
                Key: image.image_key,
            })
        );

        if (imageResult.$metadata.httpStatusCode === undefined || imageResult.$metadata.httpStatusCode > 299) {
            console.log(imageResult);
            return { status: imageResult.$metadata.httpStatusCode ? imageResult.$metadata.httpStatusCode : 500 };
        }

        const thumbnailResult = await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_THUMBNAILS_BUCKET!,
                Key: image.image_key,
            })
        );

        if (thumbnailResult.$metadata.httpStatusCode === undefined || thumbnailResult.$metadata.httpStatusCode > 299) {
            console.log(thumbnailResult);
            return { status: thumbnailResult.$metadata.httpStatusCode ? thumbnailResult.$metadata.httpStatusCode : 500 };
        }
        
        const cardResult = await s3.send(
            new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_CARDS_BUCKET!,
                Key: image.image_key,
            })
        );

        if (cardResult.$metadata.httpStatusCode === undefined || cardResult.$metadata.httpStatusCode > 299) {
            console.log(cardResult);
            return { status: cardResult.$metadata.httpStatusCode ? cardResult.$metadata.httpStatusCode : 500 };
        }

        user.used_storage -= image.size;

        await imageRepository.remove(image);


        return { status: 205 };
    } catch (error) {
        return { status: 500, error: error };
    }
};


export async function getImageById(params: any) {
    try {
        const imageRepository = appDataSource.getRepository(Image);
        const image = await imageRepository.findOne({
            where: { image_id: Number(params.image_id) },
        });

        if (!image) {
            return { status: 404, image: null };
        }

        const presignedUrls = await createImagePresignedUrls(image.image_key);

        const returnedImage: ReturnedImage = {
            image_id: image.image_id,
            image_url: presignedUrls.image_url,
            card_url: presignedUrls.card_url,
            thumbnail_url: presignedUrls.thumbnail_url,
            image_time: image.image_time,
            aspect_ratio: image.aspect_ratio,
            size: image.size,
            user_id: image.user_id,
        };

        return { status: 200, image: returnedImage };

    } catch (error) {
        return { status: 500, image: null, error: error };
    }
}


export async function uploadImage(cf: CustomFile, auth_id: string, aspect_ratio: number): Promise<{ status: number, image?: Image | null, error?: unknown }>{
    try {
        const imageRepository = appDataSource.getRepository(Image);
        const userRepository = appDataSource.getRepository(User);


        if (cf) {

            const key = cf.location.split('/')[cf.location.split('/').length - 1];

            const command = new HeadObjectCommand({ Key: key, Bucket: process.env.AWS_S3_IMAGES_BUCKET! });
            const headObject = await s3.send(command);

            const newImage = imageRepository.create({
                image_time: new Date(),
                user_id: auth_id,
                image_key: key,
                aspect_ratio: aspect_ratio,
                size: headObject.ContentLength as number,
            });

            const savedImage = await imageRepository.save(newImage);
            
            const user = await userRepository.findOne({ where: { id: auth_id } }) as User;
            user.used_storage += headObject.ContentLength as number;
            await userRepository.save(user);

            return { status: 200, image: savedImage };
        } else {
            return { status: 400, image: null };
        }
    } catch (error) {
        return { status: 500, image: null, error: error };
    }
}

export async function getImageByWARefId(imageRef: string, wachat_id: string) : Promise<{ status: number, presignedUrl?: string | null, error?: unknown }> {
    try {
        const wachatImageRelationRepository = appDataSource.getRepository(WAChat_Image_Relation);
        const imageRepository = appDataSource.getRepository(Image);

        // Trouver la relation entre le chat et l'image correspondant à la référence d'image et à l'identifiant du chat
        const wachatImageRelation = await wachatImageRelationRepository.findOne({ 
            where: { image_ref: imageRef, wachat_id: wachat_id } });
        console.log(".");
        console.log("imageref:",imageRef);
        console.log(wachatImageRelation);

        // Si la relation existe
        if (wachatImageRelation !== null) {
            // Trouver l'image correspondant à l'identifiant de l'image dans la relation
            const image = await imageRepository.findOne({ where: { image_id: wachatImageRelation.image_id } });

            // Si l'image existe
            if (image) {
                // Créer une URL présignée pour l'image
                const presignedObj = await createImagePresignedUrls(image.image_key);
                const presignedUrl : string = presignedObj.image_url;

                // Retourner un objet avec le statut et l'URL présignée
                return { status: 200, presignedUrl: presignedUrl };
            }
        } else {
            console.log('This ref seems to be made up in getImageByWARefId');
        }

        // Si aucun presignedUrl n'a été trouvé, retourner un objet avec le statut et une URL présignée vide
        return { status: 200, presignedUrl: "" };

    } catch (error) {
        // En cas d'erreur, retourner un objet avec le statut, aucune URL présignée et l'erreur
        return { status: 500, presignedUrl: null, error: error };
    }
}