import type { MigrationInterface, QueryRunner } from "typeorm";

export class AlbumFkwachat1716304049331 implements MigrationInterface {
    name = 'AlbumFkwachat1716304049331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "album" (
                "album_id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "creation_date" TIMESTAMP NOT NULL,
                "user_id" character varying NOT NULL,
                "cover_image" integer,
                "wachat_id" character varying,
                "archived" boolean DEFAULT false,
                "default_album" boolean DEFAULT false,
                "validated" boolean,
                "wachatSuggestWachatId" uuid,
                "wachatAdjustWachatId" uuid,
                "wachatValidatedWachatId" uuid,
                CONSTRAINT "PK_f996cbb3e99b063f0f1db33b172" PRIMARY KEY ("album_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "album_album_share_list_user" (
                "albumAlbumId" integer NOT NULL,
                "userId" character varying NOT NULL,
                CONSTRAINT "PK_e5ae2b5edbd0a4642cc502fa6a3" PRIMARY KEY ("albumAlbumId", "userId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4b8f1468ad9f6e60e6a8d8c651" ON "album_album_share_list_user" ("albumAlbumId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4d81791d64476d7becc00767b0" ON "album_album_share_list_user" ("userId")
        `);
        await queryRunner.query(`
            CREATE TABLE "album_album_contents_image" (
                "albumAlbumId" integer NOT NULL,
                "imageImageId" integer NOT NULL,
                CONSTRAINT "PK_78ed74c2fe48ff8f47d912e726b" PRIMARY KEY ("albumAlbumId", "imageImageId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2791e2d5ec4a509f5191b2c315" ON "album_album_contents_image" ("albumAlbumId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e57a10b93372549ee091a56c25" ON "album_album_contents_image" ("imageImageId")
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD CONSTRAINT "FK_ac1259b368a2057274a78b1b073" FOREIGN KEY ("wachatSuggestWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD CONSTRAINT "FK_b87d92155715087771e8d178df4" FOREIGN KEY ("wachatAdjustWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD CONSTRAINT "FK_93ac3fcaa45f6af072d41de4b1d" FOREIGN KEY ("wachatValidatedWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_share_list_user"
            ADD CONSTRAINT "FK_4b8f1468ad9f6e60e6a8d8c6516" FOREIGN KEY ("albumAlbumId") REFERENCES "album"("album_id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_share_list_user"
            ADD CONSTRAINT "FK_4d81791d64476d7becc00767b0b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_contents_image"
            ADD CONSTRAINT "FK_2791e2d5ec4a509f5191b2c3153" FOREIGN KEY ("albumAlbumId") REFERENCES "album"("album_id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_contents_image"
            ADD CONSTRAINT "FK_e57a10b93372549ee091a56c256" FOREIGN KEY ("imageImageId") REFERENCES "image"("image_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "album_album_contents_image" DROP CONSTRAINT "FK_e57a10b93372549ee091a56c256"
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_contents_image" DROP CONSTRAINT "FK_2791e2d5ec4a509f5191b2c3153"
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_share_list_user" DROP CONSTRAINT "FK_4d81791d64476d7becc00767b0b"
        `);
        await queryRunner.query(`
            ALTER TABLE "album_album_share_list_user" DROP CONSTRAINT "FK_4b8f1468ad9f6e60e6a8d8c6516"
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP CONSTRAINT "FK_93ac3fcaa45f6af072d41de4b1d"
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP CONSTRAINT "FK_b87d92155715087771e8d178df4"
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP CONSTRAINT "FK_ac1259b368a2057274a78b1b073"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e57a10b93372549ee091a56c25"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2791e2d5ec4a509f5191b2c315"
        `);
        await queryRunner.query(`
            DROP TABLE "album_album_contents_image"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4d81791d64476d7becc00767b0"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4b8f1468ad9f6e60e6a8d8c651"
        `);
        await queryRunner.query(`
            DROP TABLE "album_album_share_list_user"
        `);
        await queryRunner.query(`
            DROP TABLE "album"
        `);
    }

}
