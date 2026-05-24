import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferenceCodeToBookings1779620577859 implements MigrationInterface {
    name = 'AddReferenceCodeToBookings1779620577859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_service"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_user"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_provider"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "reference_code" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "UQ_60bc16929d8e767999884e54481" UNIQUE ("reference_code")`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2"`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "provider_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "quantity" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_64cd97487c5c42806458ab5520c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_aae90d7b26a7414deb4029ca1b3" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_aae90d7b26a7414deb4029ca1b3"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_64cd97487c5c42806458ab5520c"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "quantity" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "provider_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "UQ_60bc16929d8e767999884e54481"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "reference_code"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_provider" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_service" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
