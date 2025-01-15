import type { MigrationInterface, QueryRunner } from "typeorm";

export class Rework31716296540068 implements MigrationInterface {
    name = 'Rework31716296540068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "wa_chat_image_relation" (
                "image_id" integer NOT NULL,
                "wachat_id" character varying NOT NULL,
                "image_ref" character varying NOT NULL,
                "wachatWachatId" uuid,
                CONSTRAINT "PK_6fc43a00ad6437aca5669c759e4" PRIMARY KEY ("image_id", "wachat_id", "image_ref")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "stream_chat_image_relation"
            ADD "wachatExportId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD CONSTRAINT "FK_ea53e1e4b463ac3033cc8d4e894" FOREIGN KEY ("wachatWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "stream_chat_image_relation"
            ADD CONSTRAINT "FK_b24934faa91c67bd6b447ee71dc" FOREIGN KEY ("wachatExportId") REFERENCES "stream_chat"("export_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "stream_chat_image_relation" DROP CONSTRAINT "FK_b24934faa91c67bd6b447ee71dc"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP CONSTRAINT "FK_ea53e1e4b463ac3033cc8d4e894"
        `);
        await queryRunner.query(`
            ALTER TABLE "stream_chat_image_relation" DROP COLUMN "wachatExportId"
        `);
        await queryRunner.query(`
            DROP TABLE "wa_chat_image_relation"
        `);
    }

}
