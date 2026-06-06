import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderPayoutAndPolicyFields1780630727171 implements MigrationInterface {
    name = 'AddProviderPayoutAndPolicyFields1780630727171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "providers" ADD "bank_account_number" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "bank_name" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "refund_policy" text`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "guest_requirements" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "guest_requirements"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "refund_policy"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "bank_name"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "bank_account_number"`);
    }

}
