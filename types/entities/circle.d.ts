import User from './user';
import CircleMembers from './circleMembers';
import PostSharing from './postSharing';
export default class Circle {
    circle_id: number;
    user_id: number;
    name: string;
    user: User;
    postSharing: PostSharing[];
    circleMembers: CircleMembers[];
}
