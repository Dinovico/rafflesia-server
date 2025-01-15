import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import type User from './user.js';
import type Image from './image.js';
import type WAChat from './wachat.js';


@Entity()
export default class Album {
  @PrimaryGeneratedColumn()
  album_id: number;

  @Column({ type: String })
  name: string;

  @Column({ type: String , nullable: true })
  description: string;
  
  @Column({ type: Date })
  creation_date: Date;

  @Column()
  user_id: string;

  @Column({ type: Number, nullable: true })
  cover_image: number | null;

  @ManyToMany('User', 'sharedAlbums')
  @JoinTable()
  albumShareList: User[];

  @ManyToMany('Image', 'albums')
  @JoinTable()
  albumContents: Image[];


  //// RELATIVE TO AUTO-GENERATED ALBUMS


  @Column({ type: String, default: null, nullable: true })
  wachat_id: string | null;

  @Column({ type: Boolean, default: false, nullable: true })
  archived: boolean;

  @Column({ type: Boolean, default: false, nullable: true })
  default_album: boolean;

  @Column({ type: Boolean, default: null, nullable: true })
  validated: boolean | null;

  @ManyToOne('WAChat', 'suggested_albums')
  wachat_suggest: WAChat;

  @ManyToOne('WAChat', 'adjusted_albums')
  wachat_adjust: WAChat;

  @ManyToOne('WAChat', 'validated_albums')
  wachat_validated: WAChat;
}
