import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export default class Device {
  @PrimaryColumn()
  token: string;

  @PrimaryColumn()
  user_id: string;

  @Column()
  last_use: Date;

  @Column()
  authentified: boolean;

  @Column({nullable: true})
  device_nickname: string;

  @Column({nullable: true})
  system_name: string;

  @Column({nullable: true})
  system_version: string;

  @Column({nullable: true})
  brand: string;

  @Column({nullable: true})
  model: string;
}
