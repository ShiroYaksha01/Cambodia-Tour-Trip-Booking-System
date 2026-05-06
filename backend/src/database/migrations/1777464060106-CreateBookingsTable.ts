import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingsTable1777464060106 implements MigrationInterface {
  name = 'CreateBookingsTable1777464060106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."bookings_booking_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'refunded')`);
    await queryRunner.query(`CREATE TYPE "public"."bookings_payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded')`);
    await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "user_id" uuid NOT NULL, "quantity" smallint NOT NULL DEFAULT '1', "booking_status" "public"."bookings_booking_status_enum" NOT NULL DEFAULT 'pending', "payment_status" "public"."bookings_payment_status_enum" NOT NULL DEFAULT 'pending', "booking_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "total_amount" numeric(12,2), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_01b0bb8567cdee2d90ea7f8a0d3" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_service" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_user"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_service"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_booking_status_enum"`);
  }
}
