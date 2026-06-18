--
-- PostgreSQL database dump
--

\restrict VBJXrcJzhCizGUubLQox76qzdCeh8xmHo3XVvUuQbBk77MkjRmPIshykGdSA1Dm

-- Dumped from database version 17.9 (Debian 17.9-1.pgdg13+1)
-- Dumped by pg_dump version 17.9 (Debian 17.9-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: bookings_booking_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bookings_booking_status_enum AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'refunded'
);


ALTER TYPE public.bookings_booking_status_enum OWNER TO postgres;

--
-- Name: bookings_payment_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bookings_payment_status_enum AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
);


ALTER TYPE public.bookings_payment_status_enum OWNER TO postgres;

--
-- Name: inventory_slots_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.inventory_slots_status_enum AS ENUM (
    'available',
    'low_stock',
    'peak_demand',
    'closed'
);


ALTER TYPE public.inventory_slots_status_enum OWNER TO postgres;

--
-- Name: services_service_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.services_service_type_enum AS ENUM (
    'tour',
    'accommodation',
    'transportation'
);


ALTER TYPE public.services_service_type_enum OWNER TO postgres;

--
-- Name: transportation_transport_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transportation_transport_type_enum AS ENUM (
    'van',
    'bus',
    'car',
    'boat',
    'tuk_tuk',
    'other'
);


ALTER TYPE public.transportation_transport_type_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'admin',
    'provider',
    'customer'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_status_enum AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE public.users_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accommodations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accommodations (
    service_id uuid NOT NULL,
    hotel_name character varying(200) NOT NULL,
    address text,
    star_rating smallint,
    room_type character varying(100),
    total_rooms smallint DEFAULT '1'::smallint NOT NULL,
    price_per_night numeric(12,2) NOT NULL,
    check_in_time time without time zone,
    check_out_time time without time zone
);


ALTER TABLE public.accommodations OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    user_id uuid NOT NULL,
    provider_id uuid NOT NULL,
    quantity smallint NOT NULL,
    booking_status public.bookings_booking_status_enum DEFAULT 'pending'::public.bookings_booking_status_enum NOT NULL,
    payment_status public.bookings_payment_status_enum DEFAULT 'pending'::public.bookings_payment_status_enum NOT NULL,
    booking_date timestamp with time zone DEFAULT now() NOT NULL,
    total_amount numeric(12,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    transaction_id character varying(60),
    reference_code character varying(20)
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: inventory_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_slots (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    date date NOT NULL,
    total_slots smallint NOT NULL,
    available_slots smallint NOT NULL,
    booked_slots smallint DEFAULT 0 NOT NULL,
    price numeric(10,2) NOT NULL,
    status public.inventory_slots_status_enum DEFAULT 'available'::public.inventory_slots_status_enum NOT NULL,
    markup_percentage smallint DEFAULT 0 NOT NULL,
    is_peak_period boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory_slots OWNER TO postgres;

--
-- Name: itinerary_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_activities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    day_id uuid NOT NULL,
    sort_order smallint DEFAULT '0'::smallint NOT NULL,
    time_of_day time without time zone,
    activity_title character varying(200) NOT NULL,
    description text,
    location text,
    image_url text
);


ALTER TABLE public.itinerary_activities OWNER TO postgres;

--
-- Name: itinerary_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_days (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    day_number smallint NOT NULL,
    title character varying(200),
    summary text
);


ALTER TABLE public.itinerary_days OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: provider_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_contacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    provider_id uuid NOT NULL,
    label character varying(50) NOT NULL,
    value character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.provider_contacts OWNER TO postgres;

--
-- Name: providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.providers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    company_name character varying(150) NOT NULL,
    logo text,
    cover_image text,
    description text,
    address text,
    facebook_url text,
    telegram_url text,
    commission_rate numeric(5,2) DEFAULT '10'::numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    service_category character varying(100),
    is_verified boolean DEFAULT false NOT NULL,
    verified_at timestamp with time zone
);


ALTER TABLE public.providers OWNER TO postgres;

--
-- Name: service_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    image_url text NOT NULL,
    is_cover boolean DEFAULT false NOT NULL,
    sort_order smallint DEFAULT '0'::smallint NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_images OWNER TO postgres;

--
-- Name: service_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_inventory (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_id uuid NOT NULL,
    total_capacity smallint NOT NULL,
    booked_count smallint DEFAULT '0'::smallint NOT NULL,
    is_closed boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_inventory OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    provider_id uuid,
    service_type public.services_service_type_enum NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    location character varying(255),
    rating numeric(3,2),
    duration character varying(100),
    cover_image text
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: tour_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_packages (
    service_id uuid NOT NULL,
    num_days smallint NOT NULL,
    max_people smallint NOT NULL,
    base_price numeric(12,2) NOT NULL,
    travel_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    departure_point text,
    destination text NOT NULL,
    includes_accommodation boolean DEFAULT true NOT NULL,
    includes_transportation boolean DEFAULT true NOT NULL,
    includes_meals boolean DEFAULT false NOT NULL
);


ALTER TABLE public.tour_packages OWNER TO postgres;

--
-- Name: transportation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transportation (
    service_id uuid NOT NULL,
    transport_type public.transportation_transport_type_enum NOT NULL,
    vehicle_model character varying(100),
    total_seats smallint NOT NULL,
    price_per_seat numeric(12,2) NOT NULL,
    departure_point text NOT NULL,
    destination text NOT NULL,
    departure_time timestamp with time zone NOT NULL,
    arrival_time timestamp with time zone,
    pickup_notes text
);


ALTER TABLE public.transportation OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    role public.users_role_enum DEFAULT 'customer'::public.users_role_enum NOT NULL,
    username character varying(60) NOT NULL,
    email character varying(150) NOT NULL,
    phone_number character varying(20),
    password_hash text NOT NULL,
    profile_picture text,
    status public.users_status_enum DEFAULT 'active'::public.users_status_enum NOT NULL,
    email_verified_at timestamp with time zone,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: accommodations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accommodations (service_id, hotel_name, address, star_rating, room_type, total_rooms, price_per_night, check_in_time, check_out_time) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, service_id, user_id, provider_id, quantity, booking_status, payment_status, booking_date, total_amount, created_at, updated_at, transaction_id, reference_code) FROM stdin;
\.


--
-- Data for Name: inventory_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_slots (id, service_id, date, total_slots, available_slots, booked_slots, price, status, markup_percentage, is_peak_period, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: itinerary_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itinerary_activities (id, day_id, sort_order, time_of_day, activity_title, description, location, image_url) FROM stdin;
\.


--
-- Data for Name: itinerary_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itinerary_days (id, service_id, day_number, title, summary) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1777194640844	InitialSchema1777194640844
2	1777286699743	RemoveUsernameUnique1777286699743
3	1777464060105	UpdateServiceIdAttribute1777464060105
4	1777464060106	CreateBookingsTable1777464060106
5	1778000000000	UpdateProviderAndBookingDetails1778000000000
6	1778087419613	AddMissingServiceColumns1778087419613
7	1778860778983	AddVerificationToProviders1778860778983
8	1779620577859	AddReferenceCodeToBookings1779620577859
9	1780199424000	AddCoverImageToServices1780199424000
10	1777565400000	CreateInventorySlotsTable1777565400000
\.


--
-- Data for Name: provider_contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provider_contacts (id, provider_id, label, value, created_at) FROM stdin;
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.providers (id, user_id, company_name, logo, cover_image, description, address, facebook_url, telegram_url, commission_rate, created_at, updated_at, service_category, is_verified, verified_at) FROM stdin;
\.


--
-- Data for Name: service_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_images (id, service_id, image_url, is_cover, sort_order, uploaded_at) FROM stdin;
\.


--
-- Data for Name: service_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_inventory (id, service_id, total_capacity, booked_count, is_closed, updated_at) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, provider_id, service_type, title, description, price, is_active, created_at, updated_at, location, rating, duration, cover_image) FROM stdin;
\.


--
-- Data for Name: tour_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_packages (service_id, num_days, max_people, base_price, travel_date, end_date, departure_point, destination, includes_accommodation, includes_transportation, includes_meals) FROM stdin;
\.


--
-- Data for Name: transportation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transportation (service_id, transport_type, vehicle_model, total_seats, price_per_seat, departure_point, destination, departure_time, arrival_time, pickup_notes) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, role, username, email, phone_number, password_hash, profile_picture, status, email_verified_at, last_login_at, created_at, updated_at, is_email_verified) FROM stdin;
cbd61f81-9a03-4605-9e10-1894da5ab562	customer	testuser	user1780224550@example.com	012345678	$2b$10$vXmhLxyEVdV46upFBX.pFuEHMfc7xTeFXhi7wvyJAttxYfzpNpE6q	\N	active	\N	\N	2026-05-31 10:49:11.191405+00	2026-05-31 10:49:11.191405+00	f
79cc3151-6a85-47d2-b9b5-b220bba58d77	provider	provider_demo	provider1780224628@example.com	012345678	$2b$10$wXdNXUPeVV6IneTLU/Wb3uXbZjAwC/BONqWgHLbonuuKbhA1QcOD6	\N	active	\N	\N	2026-05-31 10:50:28.312364+00	2026-05-31 10:50:28.312364+00	f
6ed307d4-233b-4d94-a62d-d31386459f9c	customer	abc	abc@gmail.com	1234567	$2b$10$3ep3DG2IXnSm6gueNZfLne/E3RzzT7mAYxeK.rZcqgEbMIXYBBpQi	\N	active	\N	\N	2026-06-01 15:48:47.821943+00	2026-06-01 15:48:47.821943+00	f
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 42, true);


--
-- Name: bookings PK_01b0bb8567cdee2d90ea7f8a0d3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "PK_01b0bb8567cdee2d90ea7f8a0d3" PRIMARY KEY (id);


--
-- Name: itinerary_activities PK_113db72acaa78c9a17b19b4e5d2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_activities
    ADD CONSTRAINT "PK_113db72acaa78c9a17b19b4e5d2" PRIMARY KEY (id);


--
-- Name: itinerary_days PK_209d9b73d8e2e2ceb3aef130b37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_days
    ADD CONSTRAINT "PK_209d9b73d8e2e2ceb3aef130b37" PRIMARY KEY (id);


--
-- Name: provider_contacts PK_2dc173a4a8664fabd2ca173cd25; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_contacts
    ADD CONSTRAINT "PK_2dc173a4a8664fabd2ca173cd25" PRIMARY KEY (id);


--
-- Name: service_inventory PK_6ad9db36c28a6359c99103e90a0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_inventory
    ADD CONSTRAINT "PK_6ad9db36c28a6359c99103e90a0" PRIMARY KEY (id);


--
-- Name: inventory_slots PK_6d859a9fcdaa7d7853805a6afea; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_slots
    ADD CONSTRAINT "PK_6d859a9fcdaa7d7853805a6afea" PRIMARY KEY (id);


--
-- Name: tour_packages PK_702707e7ddae6a61ccd8b11d61e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_packages
    ADD CONSTRAINT "PK_702707e7ddae6a61ccd8b11d61e" PRIMARY KEY (service_id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: providers PK_af13fc2ebf382fe0dad2e4793aa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY (id);


--
-- Name: services PK_ba2d347a3168a296416c6c5ccb2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY (id);


--
-- Name: transportation PK_ba91c155a939ed990b7fccf3b83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transportation
    ADD CONSTRAINT "PK_ba91c155a939ed990b7fccf3b83" PRIMARY KEY (service_id);


--
-- Name: accommodations PK_c10f4026fba430a15006a3931ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT "PK_c10f4026fba430a15006a3931ee" PRIMARY KEY (service_id);


--
-- Name: service_images PK_d99f2c54bf48af54e7952abe0c0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_images
    ADD CONSTRAINT "PK_d99f2c54bf48af54e7952abe0c0" PRIMARY KEY (id);


--
-- Name: service_inventory REL_f7848b314e821904abbb71d036; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_inventory
    ADD CONSTRAINT "REL_f7848b314e821904abbb71d036" UNIQUE (service_id);


--
-- Name: bookings UQ_60bc16929d8e767999884e54481; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "UQ_60bc16929d8e767999884e54481" UNIQUE (reference_code);


--
-- Name: inventory_slots UQ_67e94e826cb6b836ea728d40e15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_slots
    ADD CONSTRAINT "UQ_67e94e826cb6b836ea728d40e15" UNIQUE (service_id, date);


--
-- Name: providers UQ_842a46f6b0079a69520561eeb62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT "UQ_842a46f6b0079a69520561eeb62" UNIQUE (user_id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: IDX_92676c4118bbc81cfe67f6856e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_92676c4118bbc81cfe67f6856e" ON public.itinerary_days USING btree (service_id, day_number);


--
-- Name: idx_inventory_slots_service_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_slots_service_date ON public.inventory_slots USING btree (service_id, date);


--
-- Name: inventory_slots FK_41df7a044d34f2f342de4da5a59; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_slots
    ADD CONSTRAINT "FK_41df7a044d34f2f342de4da5a59" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: bookings FK_64cd97487c5c42806458ab5520c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_64cd97487c5c42806458ab5520c" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tour_packages FK_702707e7ddae6a61ccd8b11d61e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_packages
    ADD CONSTRAINT "FK_702707e7ddae6a61ccd8b11d61e" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_images FK_8126019095da9b1b08bac179a99; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_images
    ADD CONSTRAINT "FK_8126019095da9b1b08bac179a99" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: providers FK_842a46f6b0079a69520561eeb62; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT "FK_842a46f6b0079a69520561eeb62" FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bookings FK_aae90d7b26a7414deb4029ca1b3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_aae90d7b26a7414deb4029ca1b3" FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE RESTRICT;


--
-- Name: transportation FK_ba91c155a939ed990b7fccf3b83; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transportation
    ADD CONSTRAINT "FK_ba91c155a939ed990b7fccf3b83" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: accommodations FK_c10f4026fba430a15006a3931ee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT "FK_c10f4026fba430a15006a3931ee" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: itinerary_days FK_c5e58da79de81d51aaa6695b849; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_days
    ADD CONSTRAINT "FK_c5e58da79de81d51aaa6695b849" FOREIGN KEY (service_id) REFERENCES public.tour_packages(service_id) ON DELETE CASCADE;


--
-- Name: itinerary_activities FK_cda66d1fff1254b45eaab02065c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_activities
    ADD CONSTRAINT "FK_cda66d1fff1254b45eaab02065c" FOREIGN KEY (day_id) REFERENCES public.itinerary_days(id) ON DELETE CASCADE;


--
-- Name: bookings FK_df22e2beaabc33a432b4f65e3c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: services FK_e7a40b21f8fd548be206fcc89b2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "FK_e7a40b21f8fd548be206fcc89b2" FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: service_inventory FK_f7848b314e821904abbb71d0360; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_inventory
    ADD CONSTRAINT "FK_f7848b314e821904abbb71d0360" FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: provider_contacts FK_f91dec55bcc33c2dfbd69bab06b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_contacts
    ADD CONSTRAINT "FK_f91dec55bcc33c2dfbd69bab06b" FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- PostgreSQL database dump complete
--

\unrestrict VBJXrcJzhCizGUubLQox76qzdCeh8xmHo3XVvUuQbBk77MkjRmPIshykGdSA1Dm

