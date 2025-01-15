import type { MigrationInterface, QueryRunner } from "typeorm";

export class SharingCode1716897493691 implements MigrationInterface {
    name = 'SharingCode1716897493691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
            ADD "sharing_code" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
            ADD "sharing_code_expiry" TIMESTAMP DEFAULT now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "wa_chat" DROP COLUMN "sharing_code_expiry"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat" DROP COLUMN "sharing_code"
        `);
    }

}
