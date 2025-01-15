import { appDataSource } from '../../datasource.js';

import Image from '../../entities/image.js';
import WAChat from '../../entities/wachat.js';
import { deleteImage } from '../images.services.js';
import { deleteExport } from '../wachat.services.js';




async function cleanWipeImagesAndFiles() {

    try {
        
        const imageRepository = appDataSource.getRepository(Image);
        let images = await imageRepository.find();


        for (let image of images) {

            if (image !== null) {
                const { status } = await deleteImage(image.image_id);
                if (status === 205) {
                    console.log('Image deleted: ' + image.image_id);
                } else {
                    console.log('FAILED to delete image: ' + image.image_id + ' with status: ' + status);
                }
            }
        }
        

        const wachatRepository = appDataSource.getRepository(WAChat);
        let wachats = await wachatRepository.find();

        for (let wachat of wachats) {

            if (wachat !== null) {
                const { status } = await deleteExport(wachat.user_id, wachat.wachat_id);
                if (status === 205) {
                    console.log('WA export deleted: ' + wachat.wachat_id);
                } else {
                    console.log('FAILED to delete WA export: ' + wachat.wachat_id + ' with status: ' + status);
                }
            }
        }

    } catch (error) {
        console.error(error);
    }
}



export default async function wipeDB() {
    await cleanWipeImagesAndFiles();
}