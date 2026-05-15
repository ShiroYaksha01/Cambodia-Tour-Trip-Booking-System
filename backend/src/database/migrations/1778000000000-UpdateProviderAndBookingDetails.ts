import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateProviderAndBookingDetails1778000000000 implements MigrationInterface {
  name = 'UpdateProviderAndBookingDetails1778000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "providers" ADD COLUMN "service_category" character varying(100)`)
    await queryRunner.query(`ALTER TABLE "bookings" ADD COLUMN "transaction_id" character varying(60)`) 
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "transaction_id"`)
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "service_category"`)
  }
}
