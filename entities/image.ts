import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import type User from './user.js';
import type Album from './album.js';

@Entity()
export default class Image {
  @PrimaryGeneratedColumn()
  image_id: number;

  @Column({ type: String })
  image_key: string;

  @Column({ type: Date })
  image_time: Date;

  @Column({ type: String })
  user_id: string;

  @Column({ type: 'float', default: 1 })
  aspect_ratio: number;

  @Column({ type: Number, default: 0 })
  size: number;

  @ManyToOne('User', 'images')
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToMany('Album', 'albumContents')
  albums: Album[];
}
