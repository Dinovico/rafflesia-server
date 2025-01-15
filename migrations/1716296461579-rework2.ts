import type { MigrationInterface, QueryRunner } from "typeorm";

export class Rework21716296461579 implements MigrationInterface {
    name = 'Rework21716296461579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "stream_chat_image_relation" DROP CONSTRAINT "FK_b24934faa91c67bd6b447ee71dc"
        `);
        await queryRunner.query(`
            ALTER TABLE "stream_chat_image_relation" DROP COLUMN "wachatExportId"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "stream_chat_image_relation"
            ADD "wachatExportId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "stream_chat_image_relation"
            ADD CONSTRAINT "FK_b24934faa91c67bd6b447ee71dc" FOREIGN KEY ("wachatExportId") REFERENCES "stream_chat"("export_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
