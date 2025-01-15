import User from './user';
import Post from './post';
import AlbumContents from './albumContents';
export default class Image {
    image_id: number;
    image_url: string;
    image_time: Date;
    user_id: number;
    user: User;
    post: Post;
    albumContents: AlbumContents[];
}
