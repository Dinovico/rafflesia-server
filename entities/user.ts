import { Entity, PrimaryColumn, Column, OneToMany, ManyToMany, JoinColumn, OneToOne, JoinTable, BeforeInsert, BeforeUpdate } from 'typeorm';
import type Image from './image.js';
import type Album from './album.js';
import type WAChat from './wachat.js';

@Entity()
export default class User {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone_number: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({nullable: true})
  profile_pic: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP', nullable: true })
  register_date: Date;

  @Column({ type: Number, default: 0 })
  used_storage: number;

  @OneToOne('Image', { onDelete: 'SET NULL' })
  @JoinColumn({ name: "profile_pic", referencedColumnName: "image_id" })
  image: Image;

  @OneToMany('Image', 'user')
  images: Image[];

  @ManyToMany('Album', 'albumShareList')
  sharedExports: WAChat[];



  @BeforeInsert()
  @BeforeUpdate()
  validateEmailOrPhoneNumber() {
    if (!this.email && !this.phone_number) {
      throw new Error('At least one of email or phone_number must be provided');
    }
  }

}
