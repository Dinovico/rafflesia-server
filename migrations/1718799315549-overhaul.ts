import type { MigrationInterface, QueryRunner } from "typeorm";

export class Overhaul1718799315549 implements MigrationInterface {
    name = 'Overhaul1718799315549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "album_album_share_list_user" DROP CONSTRAINT "FK_4d81791d64476d7becc00767b0b"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "birthdate"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "verification_code"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "is_verified"
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_share_list_user"
            ADD CONSTRAINT "FK_4d81791d64476d7becc00767b0b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "album_album_share_list_user" DROP CONSTRAINT "FK_4d81791d64476d7becc00767b0b"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "is_verified" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "verification_code" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "birthdate" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_share_list_user"
            ADD CONSTRAINT "FK_4d81791d64476d7becc00767b0b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
