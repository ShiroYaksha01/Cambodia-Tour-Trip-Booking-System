import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateServiceIdAttribute1777464060105 implements MigrationInterface {
    name = 'UpdateServiceIdAttribute1777464060105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."services_service_type_enum" AS ENUM('tour', 'accommodation', 'transportation')`);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "service_type" "public"."services_service_type_enum" NOT NULL, "title" character varying(200) NOT NULL, "description" text, "price" numeric(12,2) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transportation_transport_type_enum" AS ENUM('van', 'bus', 'car', 'boat', 'tuk_tuk', 'other')`);
        await queryRunner.query(`CREATE TABLE "transportation" ("service_id" uuid NOT NULL, "transport_type" "public"."transportation_transport_type_enum" NOT NULL, "vehicle_model" character varying(100), "total_seats" smallint NOT NULL, "price_per_seat" numeric(12,2) NOT NULL, "departure_point" text NOT NULL, "destination" text NOT NULL, "departure_time" TIMESTAMP WITH TIME ZONE NOT NULL, "arrival_time" TIMESTAMP WITH TIME ZONE, "pickup_notes" text, CONSTRAINT "PK_ba91c155a939ed990b7fccf3b83" PRIMARY KEY ("service_id"))`);
        await queryRunner.query(`CREATE TABLE "itinerary_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day_id" uuid NOT NULL, "sort_order" smallint NOT NULL DEFAULT '0', "time_of_day" TIME, "activity_title" character varying(200) NOT NULL, "description" text, "location" text, "image_url" text, CONSTRAINT "PK_113db72acaa78c9a17b19b4e5d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "itinerary_days" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "day_number" smallint NOT NULL, "title" character varying(200), "summary" text, CONSTRAINT "PK_209d9b73d8e2e2ceb3aef130b37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_92676c4118bbc81cfe67f6856e" ON "itinerary_days" ("service_id", "day_number") `);
        await queryRunner.query(`CREATE TABLE "tour_packages" ("service_id" uuid NOT NULL, "num_days" smallint NOT NULL, "max_people" smallint NOT NULL, "base_price" numeric(12,2) NOT NULL, "travel_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "departure_point" text, "destination" text NOT NULL, "includes_accommodation" boolean NOT NULL DEFAULT true, "includes_transportation" boolean NOT NULL DEFAULT true, "includes_meals" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_702707e7ddae6a61ccd8b11d61e" PRIMARY KEY ("service_id"))`);
        await queryRunner.query(`CREATE TABLE "service_inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "total_capacity" smallint NOT NULL, "booked_count" smallint NOT NULL DEFAULT '0', "is_closed" boolean NOT NULL DEFAULT false, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_f7848b314e821904abbb71d036" UNIQUE ("service_id"), CONSTRAINT "PK_6ad9db36c28a6359c99103e90a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "image_url" text NOT NULL, "is_cover" boolean NOT NULL DEFAULT false, "sort_order" smallint NOT NULL DEFAULT '0', "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d99f2c54bf48af54e7952abe0c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "accommodations" ("service_id" uuid NOT NULL, "hotel_name" character varying(200) NOT NULL, "address" text, "star_rating" smallint, "room_type" character varying(100), "total_rooms" smallint NOT NULL DEFAULT '1', "price_per_night" numeric(12,2) NOT NULL, "check_in_time" TIME, "check_out_time" TIME, CONSTRAINT "PK_c10f4026fba430a15006a3931ee" PRIMARY KEY ("service_id"))`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "is_verified"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "verified_at"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transportation" ADD CONSTRAINT "FK_ba91c155a939ed990b7fccf3b83" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itinerary_activities" ADD CONSTRAINT "FK_cda66d1fff1254b45eaab02065c" FOREIGN KEY ("day_id") REFERENCES "itinerary_days"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ADD CONSTRAINT "FK_c5e58da79de81d51aaa6695b849" FOREIGN KEY ("service_id") REFERENCES "tour_packages"("service_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tour_packages" ADD CONSTRAINT "FK_702707e7ddae6a61ccd8b11d61e" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_inventory" ADD CONSTRAINT "FK_f7848b314e821904abbb71d0360" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_images" ADD CONSTRAINT "FK_8126019095da9b1b08bac179a99" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "accommodations" ADD CONSTRAINT "FK_c10f4026fba430a15006a3931ee" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accommodations" DROP CONSTRAINT "FK_c10f4026fba430a15006a3931ee"`);
        await queryRunner.query(`ALTER TABLE "service_images" DROP CONSTRAINT "FK_8126019095da9b1b08bac179a99"`);
        await queryRunner.query(`ALTER TABLE "service_inventory" DROP CONSTRAINT "FK_f7848b314e821904abbb71d0360"`);
        await queryRunner.query(`ALTER TABLE "tour_packages" DROP CONSTRAINT "FK_702707e7ddae6a61ccd8b11d61e"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" DROP CONSTRAINT "FK_c5e58da79de81d51aaa6695b849"`);
        await queryRunner.query(`ALTER TABLE "itinerary_activities" DROP CONSTRAINT "FK_cda66d1fff1254b45eaab02065c"`);
        await queryRunner.query(`ALTER TABLE "transportation" DROP CONSTRAINT "FK_ba91c155a939ed990b7fccf3b83"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_email_verified"`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "verified_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "is_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP TABLE "accommodations"`);
        await queryRunner.query(`DROP TABLE "service_images"`);
        await queryRunner.query(`DROP TABLE "service_inventory"`);
        await queryRunner.query(`DROP TABLE "tour_packages"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92676c4118bbc81cfe67f6856e"`);
        await queryRunner.query(`DROP TABLE "itinerary_days"`);
        await queryRunner.query(`DROP TABLE "itinerary_activities"`);
        await queryRunner.query(`DROP TABLE "transportation"`);
        await queryRunner.query(`DROP TYPE "public"."transportation_transport_type_enum"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TYPE "public"."services_service_type_enum"`);
    }

}
