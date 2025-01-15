import { Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from "typeorm";
import WAChat from "./wachat.js";



@Entity()
export default class WAChat_Image_Relation {
    @PrimaryColumn()
    image_id: number;

    @PrimaryColumn()
    wachat_id: string;

    @PrimaryColumn()
    image_ref: string;

    @ManyToOne(type => WAChat, wachat => wachat.images)
    wachat: Relation<WAChat>;
}