import type { MigrationInterface, QueryRunner } from "typeorm";

export class WachatKey1716298984862 implements MigrationInterface {
    name = 'WachatKey1716298984862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
                RENAME COLUMN "content_url" TO "content_key"
        `);
        await queryRunner.query(`
            ALTER TABLE "stream_chat"
                RENAME COLUMN "content_url" TO "content_key"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "stream_chat"
                RENAME COLUMN "content_key" TO "content_url"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
                RENAME COLUMN "content_key" TO "content_url"
        `);
    }

}
