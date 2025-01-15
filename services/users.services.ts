import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import Image from '../entities/image.js';


import { StreamChat } from 'stream-chat';

import { createImagePresignedUrls, deleteImage } from './images.services.js';
import type { DeepPartial } from 'typeorm';
import { profile } from 'console';
import Album from '../entities/album.js';
import { shareAlbum } from './albums.services.js';




export interface UserInfo {
    id: string;
    firstname: string;
    lastname: string;
    profile_pic: string;
    profile_pic_thumbnail: string;
    profile_pic_card: string;
}




////////////////////////           RETRIEVING USERS              ////////////////////////


export async function getIdFromEmail(email: string): Promise<{ status: number, id?: string, error?: unknown }> {
    try {
        const userRepository = appDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email: email } });

        if (!user) {
            return { status: 404 };
        }

        return { status: 200, id: user.id };
    } catch (error) {
        return { status: 500, error: error };
    }
};



export async function getUserById(userId: string, targetId: string): Promise<{ status: number, user: UserInfo | null, error?: unknown }> {
        try {
            const user = await appDataSource.getRepository(User).findOne({where: {id: targetId}});
            if (!user) {
                return {status: 404, user: null};
            }

            var userInfo;

    
            if (user.profile_pic === null) {
                const default_pp_url =
                    "https://getstream.imgix.net/images/random_svg/" +
                    user.firstname[0] +
                    user.lastname[0] +
                    ".png";
                userInfo = {
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    profile_pic: default_pp_url,
                    profile_pic_thumbnail: default_pp_url,
                    profile_pic_card: default_pp_url,
                };
            } else {
                const image = await appDataSource
                    .getRepository(Image)
                    .findOne({ where: { image_id: user.profile_pic }});
                const default_pp_url =
                    "https://getstream.imgix.net/images/random_svg/" +
                    user.firstname[0] +
                    user.lastname[0] +
                    ".png";
                let profilePicUrl = default_pp_url;
                let thumbnailUrl = default_pp_url;
                let cardUrl = default_pp_url;
                if (image) {
                    const presignedUrls = await createImagePresignedUrls(image.image_key);
                    profilePicUrl = presignedUrls.image_url;
                    thumbnailUrl = presignedUrls.thumbnail_url;
                    cardUrl = presignedUrls.card_url;
                }
                userInfo = {
                    id: user.id.toString(),
                    firstname: user.firstname,
                    lastname: user.lastname,
                    profile_pic: profilePicUrl,
                    profile_pic_thumbnail: thumbnailUrl,
                    profile_pic_card: cardUrl,
                };
            }

            return { status: 200, user: userInfo}
        } catch (error) {
            return { status: 500, user: null, error: error };
        }
};

    








////////////////////////            AUTH               ////////////////////////

export async function authorizeEmail(email: string): Promise<{ status: number, error?: unknown }> {
        try {
                const userRepository = appDataSource.getRepository(User);
        
                // Check if the email is already in use
                const userWithEmail = await userRepository.findOne({ where: { email: email } });
                if (userWithEmail) {
                    return { status: 409 };
                }
        
                return { status: 200 };

            } catch (error) {
                console.log(error);
                return { status: 500, error: error };
            }
};


export async function authorizePhone(phone_number: string): Promise<{ status: number, error?: unknown }> {
    try {
            const userRepository = appDataSource.getRepository(User);
    
            // Check if the phone number is already in use
            const userWithPhone = await userRepository.findOne({ where: { phone_number: phone_number } });
            if (userWithPhone) {
                return { status: 409 };
            }
    
            return { status: 200 };

        } catch (error) {
            return { status: 500, error: error };
        }
};



export async function login(userId: string) {
    try {
        const user = await appDataSource.getRepository(User).findOne({ where: { id: userId } });
        if (!user) {
            return { status: 404, streamChatToken: null };
        }
        
        return { status: 200 };
    } catch (error) {
        return { status: 500, error: error };
    }
};


export async function getUserAuthMethod(userId: string): Promise<{ status: number, method?: string, error?: unknown }>{
    try {
        const user = await appDataSource.getRepository(User).findOne({ where: { id: userId } });
        if (!user) {
            return { status: 404 };
        }

        if (user.email) {
            return { status: 200, method: 'email' };
        } else if (user.phone_number) {
            return { status: 200, method: 'phone' };
        } else {
            return { status: 404 };
        }
        
    } catch (error) {
        return { status: 500, error: error };
    }
}



export async function register(method: 'phone' | 'email', id: string, contact: string, firstname: string, lastname: string, birthdate: Date) {
    try {
        const userRepository = appDataSource.getRepository(User);

        let email: string | null = null;
        let phone_number: string | null = null;

        switch (method) {
            case 'phone':
                phone_number = contact;
                break;
            case 'email':
                email = contact;
                break;
            default:
                return { status: 400 };
        }


        const userInfo = {
            id: id,
            email: email,
            phone_number: phone_number,
            firstname: firstname,
            lastname: lastname,
        } as User;

        const newUser = userRepository.create(userInfo);
        
        await userRepository.save(newUser);


        return {status: 201 };
    } catch (error) {
        console.log(error);
        return {status: 500, error: error };
    }
}










////////////////////////           UPDATING USERS              ////////////////////////


export async function updateProfilePic(imageId: number, userId: string): Promise<{ status: number, error?: unknown }> {
    try {
        const profilePic = imageId; 

        const userRepository = appDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } }); 

        if (user) {
            const oldPic = user.profile_pic;
            user.profile_pic = profilePic;

            if (oldPic != null) {
                const deleteResult = await deleteImage(oldPic);
                if (deleteResult.status != 205) {
                    return { status: deleteResult.status, error: (deleteResult.error)?(deleteResult.error):('Unspecified error') };
                }
            }

            await userRepository.save(user);
    
            return { status: 205 }; 
            } else {
            return { status: 404 };
            }
    } catch (error) {
            return { status: 500, error: error };
    }
};


export async function deleteUser(userId: string) {
    try {
        const userRepository = appDataSource.getRepository(User);
        const albumRepository = appDataSource.getRepository(Album);
        const imageRepository = appDataSource.getRepository(Image);

        // Find user by id
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return { status: 404, error: "User not found" };
        }

        // Retrieve albums created by the user
        const userAlbums = await albumRepository.find({ where: { user_id: userId } });

        // Retrieve albums shared with the user
        const sharedAlbums = await albumRepository.createQueryBuilder("album")
            .leftJoinAndSelect("album.albumShareList", "user")
            .where("user.id = :userId", { userId: userId })
            .getMany();

        // Combine user's albums and shared albums
        const allUserAlbums = [...userAlbums, ...sharedAlbums];

        // Remove user from each album
        for (const album of allUserAlbums) {
            await shareAlbum(userId, album.album_id, album.albumShareList.map(user => user.id).filter(user_id => user_id !== userId));
        }


        const userImages = await imageRepository.find({ where: { user_id: userId }});

        for (const image of userImages) {
            await deleteImage(image.image_id);
        }

        // Finally, remove the user
        await userRepository.remove(user);

        return { status: 205, message: "User and associated posts/circles/albums/groups/images deleted successfully" };
    } catch (error) {
        return { status: 500, error: error };
    }
}

