import User from './user';
import Image from './image';
import PostSharing from './postSharing';
export default class Post {
    post_id: number;
    image_id: number;
    user_id: number;
    created_at: Date;
    caption: string;
    user: User;
    image: Image;
    postSharing: PostSharing[];
}
