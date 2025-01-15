import User from './user';
import PostSharing from './postSharing';
import AlbumContents from './albumContents';
export default class Album {
    album_id: number;
    name: string;
    user: User;
    postSharing: PostSharing[];
    albumContents: AlbumContents[];
}
