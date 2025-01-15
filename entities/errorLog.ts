import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class ErrorLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    device_token: string;

    @Column({nullable: true})
    custom_message: string;

    @Column({nullable: true})
    error: string;

    @Column({nullable: true})
    file_name: string;

    @Column({type: Date, default: () => 'CURRENT_TIMESTAMP'})
    date: Date;

    @Column({nullable: true})
    version: string;
}