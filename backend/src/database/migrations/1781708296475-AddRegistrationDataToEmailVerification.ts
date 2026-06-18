import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegistrationDataToEmailVerification1781708296475 implements MigrationInterface {
    name = 'AddRegistrationDataToEmailVerification1781708296475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "commission_amount"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "provider_earnings"`);
        await queryRunner.query(`ALTER TABLE "email_verifications" ADD "registration_data" jsonb`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "highlights" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "languages" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."bookings_payment_status_enum" RENAME TO "bookings_payment_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "payment_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "payment_status" TYPE "public"."bookings_payment_status_enum" USING "payment_status"::"text"::"public"."bookings_payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "payment_status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."bookings_payment_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bookings_payment_status_enum_old" AS ENUM('unpaid', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded')`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "payment_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "payment_status" TYPE "public"."bookings_payment_status_enum_old" USING "payment_status"::"text"::"public"."bookings_payment_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "payment_status" SET DEFAULT 'unpaid'`);
        await queryRunner.query(`DROP TYPE "public"."bookings_payment_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."bookings_payment_status_enum_old" RENAME TO "bookings_payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "languages" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "highlights" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email_verifications" DROP COLUMN "registration_data"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "provider_earnings" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "commission_amount" numeric(12,2)`);
    }

}
