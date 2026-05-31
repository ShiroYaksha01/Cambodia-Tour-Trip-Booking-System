import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoverImageToServices1780199424000 implements MigrationInterface {
    name = 'AddCoverImageToServices1780199424000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" ADD "cover_image" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "cover_image"`);
    }

}
