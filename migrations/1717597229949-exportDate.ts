import type { MigrationInterface, QueryRunner } from "typeorm";

export class ExportDate1717597229949 implements MigrationInterface {
    name = 'ExportDate1717597229949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
            ADD "created_at" TIMESTAMP DEFAULT now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "wa_chat" DROP COLUMN "created_at"
        `);
    }

}
