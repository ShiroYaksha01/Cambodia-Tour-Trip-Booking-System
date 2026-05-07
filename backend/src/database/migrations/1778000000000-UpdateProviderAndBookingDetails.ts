import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateProviderAndBookingDetails1778000000000 implements MigrationInterface {
  name = 'UpdateProviderAndBookingDetails1778000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "providers" ADD COLUMN "service_category" character varying(100)`)
    await queryRunner.query(`CREATE TYPE "public"."booking_payment_status_enum" AS ENUM('pending', 'paid', 'failed')`)
    await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN "payment_status" "public"."booking_payment_status_enum" NOT NULL DEFAULT 'pending'`)
    await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN "transaction_id" character varying(60)`) 
    await queryRunner.query(`ALTER TYPE "public"."bookings_status_enum" ADD VALUE IF NOT EXISTS 'completed'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "transaction_id"`)
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "payment_status"`)
    await queryRunner.query(`DROP TYPE "public"."booking_payment_status_enum"`)
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "service_category"`)
    // note: PostgreSQL does not support removing enum values safely in all versions.
  }
}
