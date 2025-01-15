import Image from './image';
import Circle from './circle';
import Post from './post';
import PostSharing from './circleMembers';
export default class User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    birthdate: Date;
    profile_pic: string;
    register_date: Date;
    image: Image;
    circle: Circle;
    post: Post;
    postSharing: PostSharing[];
}
