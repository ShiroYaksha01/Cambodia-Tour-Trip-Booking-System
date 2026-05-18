import { MigrationInterface, QueryRunner } from "typeorm";

export class DescriptionOfChange1778019628918 implements MigrationInterface {
    name = 'DescriptionOfChange1778019628918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'provider', 'customer')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "username" character varying(60) NOT NULL, "email" character varying(150) NOT NULL, "phone_number" character varying(20), "password_hash" text NOT NULL, "profile_picture" text, "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "is_email_verified" boolean NOT NULL DEFAULT false, "email_verified_at" TIMESTAMP WITH TIME ZONE, "last_login_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transportation_transport_type_enum" AS ENUM('van', 'bus', 'car', 'boat', 'tuk_tuk', 'other')`);
        await queryRunner.query(`CREATE TABLE "transportation" ("service_id" uuid NOT NULL, "transport_type" "public"."transportation_transport_type_enum" NOT NULL, "vehicle_model" character varying(100), "total_seats" smallint NOT NULL, "price_per_seat" numeric(12,2) NOT NULL, "departure_point" text NOT NULL, "destination" text NOT NULL, "departure_time" TIMESTAMP WITH TIME ZONE NOT NULL, "arrival_time" TIMESTAMP WITH TIME ZONE, "pickup_notes" text, CONSTRAINT "PK_ba91c155a939ed990b7fccf3b83" PRIMARY KEY ("service_id"))`);
        await queryRunner.query(`CREATE TABLE "service_inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "total_capacity" smallint NOT NULL, "booked_count" smallint NOT NULL DEFAULT '0', "is_closed" boolean NOT NULL DEFAULT false, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_f7848b314e821904abbb71d036" UNIQUE ("service_id"), CONSTRAINT "PK_6ad9db36c28a6359c99103e90a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "image_url" text NOT NULL, "is_cover" boolean NOT NULL DEFAULT false, "sort_order" smallint NOT NULL DEFAULT '0', "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d99f2c54bf48af54e7952abe0c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tour_packages" ("service_id" uuid NOT NULL, "num_days" smallint NOT NULL, "max_people" smallint NOT NULL, "base_price" numeric(12,2) NOT NULL, "travel_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "departure_point" text, "destination" text NOT NULL, "includes_accommodation" boolean NOT NULL DEFAULT true, "includes_transportation" boolean NOT NULL DEFAULT true, "includes_meals" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_702707e7ddae6a61ccd8b11d61e" PRIMARY KEY ("service_id"))`);
        await queryRunner.query(`CREATE TABLE "itinerary_days" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "day_number" smallint NOT NULL, "title" character varying(200), "summary" text, CONSTRAINT "PK_209d9b73d8e2e2ceb3aef130b37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_92676c4118bbc81cfe67f6856e" ON "itinerary_days" ("service_id", "day_number") `);
        await queryRunner.query(`CREATE TABLE "itinerary_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day_id" uuid NOT NULL, "sort_order" smallint NOT NULL DEFAULT '0', "time_of_day" TIME, "activity_title" character varying(200) NOT NULL, "description" text, "location" text, "image_url" text, CONSTRAINT "PK_113db72acaa78c9a17b19b4e5d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "accommodations" ("service_id" uuid NOT NULL, "hotel_name" character varying(200) NOT NULL, "address" text, "star_rating" smallint, "room_type" character varying(100), "total_rooms" smallint NOT NULL DEFAULT '1', "price_per_night" numeric(12,2) NOT NULL, "check_in_time" TIME, "check_out_time" TIME, CONSTRAINT "PK_c10f4026fba430a15006a3931ee" PRIMARY KEY ("service_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'confirmed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "service_id" uuid NOT NULL, "provider_id" uuid NOT NULL, "booking_date" date NOT NULL, "quantity" integer NOT NULL, "total_price" numeric(10,2) NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "UQ_842a46f6b0079a69520561eeb62" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "company_name" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "logo" text`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "cover_image" text`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "address" text`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "facebook_url" text`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "telegram_url" text`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "commission_rate" numeric(5,2) NOT NULL DEFAULT '10'`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "service_type"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "service_type" "public"."services_service_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "is_active" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "providers" ADD CONSTRAINT "FK_842a46f6b0079a69520561eeb62" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transportation" ADD CONSTRAINT "FK_ba91c155a939ed990b7fccf3b83" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_inventory" ADD CONSTRAINT "FK_f7848b314e821904abbb71d0360" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_images" ADD CONSTRAINT "FK_8126019095da9b1b08bac179a99" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tour_packages" ADD CONSTRAINT "FK_702707e7ddae6a61ccd8b11d61e" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ADD CONSTRAINT "FK_c5e58da79de81d51aaa6695b849" FOREIGN KEY ("service_id") REFERENCES "tour_packages"("service_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itinerary_activities" ADD CONSTRAINT "FK_cda66d1fff1254b45eaab02065c" FOREIGN KEY ("day_id") REFERENCES "itinerary_days"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "accommodations" ADD CONSTRAINT "FK_c10f4026fba430a15006a3931ee" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_64cd97487c5c42806458ab5520c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_aae90d7b26a7414deb4029ca1b3" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_aae90d7b26a7414deb4029ca1b3"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_64cd97487c5c42806458ab5520c"`);
        await queryRunner.query(`ALTER TABLE "accommodations" DROP CONSTRAINT "FK_c10f4026fba430a15006a3931ee"`);
        await queryRunner.query(`ALTER TABLE "itinerary_activities" DROP CONSTRAINT "FK_cda66d1fff1254b45eaab02065c"`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" DROP CONSTRAINT "FK_c5e58da79de81d51aaa6695b849"`);
        await queryRunner.query(`ALTER TABLE "tour_packages" DROP CONSTRAINT "FK_702707e7ddae6a61ccd8b11d61e"`);
        await queryRunner.query(`ALTER TABLE "service_images" DROP CONSTRAINT "FK_8126019095da9b1b08bac179a99"`);
        await queryRunner.query(`ALTER TABLE "service_inventory" DROP CONSTRAINT "FK_f7848b314e821904abbb71d0360"`);
        await queryRunner.query(`ALTER TABLE "transportation" DROP CONSTRAINT "FK_ba91c155a939ed990b7fccf3b83"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "FK_842a46f6b0079a69520561eeb62"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "is_active" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "service_type"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "service_type" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "providers" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "commission_rate"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "telegram_url"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "facebook_url"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "cover_image"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "logo"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "company_name"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP CONSTRAINT "UQ_842a46f6b0079a69520561eeb62"`);
        await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "providers" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "accommodations"`);
        await queryRunner.query(`DROP TABLE "itinerary_activities"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92676c4118bbc81cfe67f6856e"`);
        await queryRunner.query(`DROP TABLE "itinerary_days"`);
        await queryRunner.query(`DROP TABLE "tour_packages"`);
        await queryRunner.query(`DROP TABLE "service_images"`);
        await queryRunner.query(`DROP TABLE "service_inventory"`);
        await queryRunner.query(`DROP TABLE "transportation"`);
        await queryRunner.query(`DROP TYPE "public"."transportation_transport_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
