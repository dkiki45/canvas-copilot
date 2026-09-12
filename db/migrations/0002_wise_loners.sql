CREATE TABLE "course_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"canvas_course_id" text NOT NULL,
	"visited_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_visits_user_id_canvas_course_id_unique" UNIQUE("user_id","canvas_course_id")
);
--> statement-breakpoint
ALTER TABLE "course_visits" ADD CONSTRAINT "course_visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;