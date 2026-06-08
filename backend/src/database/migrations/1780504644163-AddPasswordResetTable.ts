import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetTable1780504644163 implements MigrationInterface {
    name = 'AddPasswordResetTable1780504644163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_inventory_slots_service_date"`);
        await queryRunner.query(`CREATE TABLE "password_resets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(150) NOT NULL, "otp" character varying(6) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4816377aa98211c1de34469e742" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "password_resets"`);
        await queryRunner.query(`CREATE INDEX "idx_inventory_slots_service_date" ON "inventory_slots" ("date", "service_id") `);
    }

}
