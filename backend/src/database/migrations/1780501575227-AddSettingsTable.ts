import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettingsTable1780501575227 implements MigrationInterface {
    name = 'AddSettingsTable1780501575227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "settings" ("key" character varying(100) NOT NULL, "value" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c8639b7626fa94ba8265628f214" PRIMARY KEY ("key"))`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "company_logo"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "provider_revenue"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ADD "provider_revenue" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "company_logo" character varying(255)`);
        await queryRunner.query(`DROP TABLE "settings"`);
    }

}
