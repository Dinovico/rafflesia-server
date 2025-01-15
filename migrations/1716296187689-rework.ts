import type { MigrationInterface, QueryRunner } from "typeorm";

export class Rework1716296187689 implements MigrationInterface {
    name = 'Rework1716296187689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "image" DROP COLUMN "image_url"
        `);
        await queryRunner.query(`
            ALTER TABLE "image" DROP COLUMN "image_thumbnail"
        `);
        await queryRunner.query(`
            ALTER TABLE "image" DROP COLUMN "image_card"
        `);
        await queryRunner.query(`
            ALTER TABLE "image"
            ADD "image_key" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP CONSTRAINT "FK_ac1259b368a2057274a78b1b073"
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP CONSTRAINT "FK_b87d92155715087771e8d178df4"
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP CONSTRAINT "FK_93ac3fcaa45f6af072d41de4b1d"
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP COLUMN "wachatSuggestWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD "wachatSuggestWachatId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP COLUMN "wachatAdjustWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD "wachatAdjustWachatId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP COLUMN "wachatValidatedWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD "wachatValidatedWachatId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user" DROP CONSTRAINT "FK_235543bc70bf64e68295710b098"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP CONSTRAINT "FK_ea53e1e4b463ac3033cc8d4e894"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat" DROP CONSTRAINT "PK_6cfd2edda3e4e51fe28ab40666c" CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat" DROP COLUMN "wachat_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
            ADD "wachat_id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
            ADD CONSTRAINT "PK_6cfd2edda3e4e51fe28ab40666c" PRIMARY KEY ("wachat_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP CONSTRAINT "PK_6fc43a00ad6437aca5669c759e4"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD CONSTRAINT "PK_aea956795870c86db9b3d721731" PRIMARY KEY ("image_id", "image_ref")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP COLUMN "wachat_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD "wachat_id" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP CONSTRAINT "PK_aea956795870c86db9b3d721731"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD CONSTRAINT "PK_6fc43a00ad6437aca5669c759e4" PRIMARY KEY ("image_id", "image_ref", "wachat_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP COLUMN "wachatWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD "wachatWachatId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user" DROP CONSTRAINT "PK_dd880e3dcbc585b75360515afd9"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user"
            ADD CONSTRAINT "PK_f0ce1699d22de9b7b0d8ddbe43b" PRIMARY KEY ("userId")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_235543bc70bf64e68295710b09"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user" DROP COLUMN "waChatWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user"
            ADD "waChatWachatId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user" DROP CONSTRAINT "PK_f0ce1699d22de9b7b0d8ddbe43b"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user"
            ADD CONSTRAINT "PK_dd880e3dcbc585b75360515afd9" PRIMARY KEY ("userId", "waChatWachatId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_235543bc70bf64e68295710b09" ON "wa_chat_export_share_list_user" ("waChatWachatId")
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
            ALTER TABLE "wa_chat_image_relation"
            ADD CONSTRAINT "FK_ea53e1e4b463ac3033cc8d4e894" FOREIGN KEY ("wachatWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user"
            ADD CONSTRAINT "FK_235543bc70bf64e68295710b098" FOREIGN KEY ("waChatWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user" DROP CONSTRAINT "FK_235543bc70bf64e68295710b098"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP CONSTRAINT "FK_ea53e1e4b463ac3033cc8d4e894"
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
            DROP INDEX "public"."IDX_235543bc70bf64e68295710b09"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user" DROP CONSTRAINT "PK_dd880e3dcbc585b75360515afd9"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user"
            ADD CONSTRAINT "PK_f0ce1699d22de9b7b0d8ddbe43b" PRIMARY KEY ("userId")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user" DROP COLUMN "waChatWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user"
            ADD "waChatWachatId" integer NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_235543bc70bf64e68295710b09" ON "wa_chat_export_share_list_user" ("waChatWachatId")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user" DROP CONSTRAINT "PK_f0ce1699d22de9b7b0d8ddbe43b"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user"
            ADD CONSTRAINT "PK_dd880e3dcbc585b75360515afd9" PRIMARY KEY ("waChatWachatId", "userId")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP COLUMN "wachatWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD "wachatWachatId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP CONSTRAINT "PK_6fc43a00ad6437aca5669c759e4"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD CONSTRAINT "PK_aea956795870c86db9b3d721731" PRIMARY KEY ("image_id", "image_ref")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP COLUMN "wachat_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD "wachat_id" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation" DROP CONSTRAINT "PK_aea956795870c86db9b3d721731"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD CONSTRAINT "PK_6fc43a00ad6437aca5669c759e4" PRIMARY KEY ("image_id", "wachat_id", "image_ref")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat" DROP CONSTRAINT "PK_6cfd2edda3e4e51fe28ab40666c" CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat" DROP COLUMN "wachat_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
            ADD "wachat_id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat"
            ADD CONSTRAINT "PK_6cfd2edda3e4e51fe28ab40666c" PRIMARY KEY ("wachat_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_image_relation"
            ADD CONSTRAINT "FK_ea53e1e4b463ac3033cc8d4e894" FOREIGN KEY ("wachatWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "wa_chat_export_share_list_user"
            ADD CONSTRAINT "FK_235543bc70bf64e68295710b098" FOREIGN KEY ("waChatWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP COLUMN "wachatValidatedWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD "wachatValidatedWachatId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP COLUMN "wachatAdjustWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD "wachatAdjustWachatId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "album" DROP COLUMN "wachatSuggestWachatId"
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD "wachatSuggestWachatId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD CONSTRAINT "FK_93ac3fcaa45f6af072d41de4b1d" FOREIGN KEY ("wachatValidatedWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD CONSTRAINT "FK_b87d92155715087771e8d178df4" FOREIGN KEY ("wachatAdjustWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "album"
            ADD CONSTRAINT "FK_ac1259b368a2057274a78b1b073" FOREIGN KEY ("wachatSuggestWachatId") REFERENCES "wa_chat"("wachat_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "image" DROP COLUMN "image_key"
        `);
        await queryRunner.query(`
            ALTER TABLE "image"
            ADD "image_card" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "image"
            ADD "image_thumbnail" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "image"
            ADD "image_url" character varying NOT NULL DEFAULT 'https://ailerontestv1.s3.eu-west-3.amazonaws.com/image-not-found.jpg'
        `);
    }

}
