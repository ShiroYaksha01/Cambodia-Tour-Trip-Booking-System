import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerificationToProviders1778860778983 implements MigrationInterface {
    name = 'AddVerificationToProviders1778860778983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "providers" ADD "is_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "verified_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "verified_at"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "is_verified"`);
    }

}
