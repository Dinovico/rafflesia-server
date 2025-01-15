import { Entity, PrimaryGeneratedColumn, Column, JoinTable, OneToMany, ManyToMany, BeforeInsert } from 'typeorm';
import WAChat_Image_Relation from './wachat_image_relation.js';
import Album from './album.js';
import User from './user.js';


@Entity()
export default class WAChat {
	@PrimaryGeneratedColumn("uuid")
	wachat_id: string;

	@Column({ type: Date, default: () => 'CURRENT_TIMESTAMP', nullable: true })
	created_at: Date;

	@Column({ type: String, default: null, nullable: true })
	sharing_code: string;

	@Column({ type: Date, default: () => 'CURRENT_TIMESTAMP', nullable: true })
	sharing_code_expiry: Date;

	@Column()
	user_id: string;

	@Column()
	chat_name: string;

    @Column()
    content_key: string;

	@Column({ type: Number, default: 0, nullable: true })
	images_count: number;

	@Column({ type: Boolean, default: false, nullable: true })
	sorted: boolean;

	@Column({ type: Boolean, default: true, nullable: true })
	archived: boolean;

	@ManyToMany('User', 'sharedExports')  
	@JoinTable()
	exportShareList: User[];

	@OneToMany(type => WAChat_Image_Relation, wachatImageRelation => wachatImageRelation.wachat)
	images: WAChat_Image_Relation[];

	@OneToMany(() => Album, album => album.wachat_suggest)
	suggested_albums: Album[];

	@OneToMany(() => Album, album => album.wachat_adjust)
	adjusted_albums: Album[];

	@OneToMany(() => Album, album => album.wachat_validated)
	validated_albums: Album[];

}
