CREATE TABLE "clients" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "clients_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "subscriptions" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"delivery_id" integer NOT NULL,
	"date" DATE NOT NULL,
	CONSTRAINT "subscriptions_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "plans" (
	"id" serial NOT NULL,
	"type" varchar(255) NOT NULL UNIQUE,
	CONSTRAINT "plans_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "delivery_days" (
	"id" serial NOT NULL,
	"day" varchar(255) NOT NULL UNIQUE,
	CONSTRAINT "delivery_days_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "products" (
	"id" serial NOT NULL,
	"name" varchar(255) NOT NULL UNIQUE,
	CONSTRAINT "products_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "delivery_data" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"address" varchar(255) NOT NULL,
	"cep" varchar(8) NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	CONSTRAINT "delivery_data_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "sessions" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"token" uuid NOT NULL UNIQUE,
	CONSTRAINT "sessions_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "user_products" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	CONSTRAINT "user_products_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);




ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_fk0" FOREIGN KEY ("user_id") REFERENCES "clients"("id");
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_fk1" FOREIGN KEY ("plan_id") REFERENCES "plans"("id");
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_fk2" FOREIGN KEY ("delivery_id") REFERENCES "delivery_days"("id");




ALTER TABLE "delivery_data" ADD CONSTRAINT "delivery_data_fk0" FOREIGN KEY ("user_id") REFERENCES "clients"("id");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_fk0" FOREIGN KEY ("user_id") REFERENCES "clients"("id");

ALTER TABLE "user_products" ADD CONSTRAINT "user_products_fk0" FOREIGN KEY ("user_id") REFERENCES "clients"("id");
ALTER TABLE "user_products" ADD CONSTRAINT "user_products_fk1" FOREIGN KEY ("product_id") REFERENCES "products"("id");








