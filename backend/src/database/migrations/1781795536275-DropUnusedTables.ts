import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUnusedTables1781795536275 implements MigrationInterface {
    name = 'DropUnusedTables1781795536275'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "payouts" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "provider_contacts" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "email_verifications" CASCADE`);
        
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "FK_842a46f6b0079a69520561eeb62"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "is_email_verified" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "FK_842a46f6b0079a69520561eeb62" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "FK_842a46f6b0079a69520561eeb62"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "is_email_verified" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "FK_842a46f6b0079a69520561eeb62" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Note: recreation of dropped tables omitted in down migration for simplicity
    }

}
