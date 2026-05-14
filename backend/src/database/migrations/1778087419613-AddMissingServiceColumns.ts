import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingServiceColumns1778087419613 implements MigrationInterface {
    name = 'AddMissingServiceColumns1778087419613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" ADD "location" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "services" ADD "rating" numeric(3,2)`);
        await queryRunner.query(`ALTER TABLE "services" ADD "duration" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "location"`);
    }

}
