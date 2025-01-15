import type { MigrationInterface, QueryRunner } from "typeorm";

export class ErrorLogs1717160769675 implements MigrationInterface {
    name = 'ErrorLogs1717160769675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "error_log" (
                "id" SERIAL NOT NULL,
                "device_token" character varying NOT NULL,
                "custom_message" character varying,
                "error" character varying,
                "file_name" character varying,
                "date" TIMESTAMP NOT NULL DEFAULT now(),
                "version" character varying,
                CONSTRAINT "PK_0284e7aa7afe77ea1ce1621c252" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "error_log"
        `);
    }

}
