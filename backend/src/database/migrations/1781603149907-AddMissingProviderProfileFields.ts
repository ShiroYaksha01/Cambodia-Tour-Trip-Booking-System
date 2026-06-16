import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingProviderProfileFields1781603149907 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "providers" 
            ADD COLUMN "tagline" text,
            ADD COLUMN "website_url" text,
            ADD COLUMN "instagram_handle" varchar(255),
            ADD COLUMN "city_province" varchar(255),
            ADD COLUMN "google_maps_link" text,
            ADD COLUMN "highlights" text[] DEFAULT '{}',
            ADD COLUMN "languages" text[] DEFAULT '{}';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "providers" 
            DROP COLUMN "tagline",
            DROP COLUMN "website_url",
            DROP COLUMN "instagram_handle",
            DROP COLUMN "city_province",
            DROP COLUMN "google_maps_link",
            DROP COLUMN "highlights",
            DROP COLUMN "languages";
        `);
    }

}
