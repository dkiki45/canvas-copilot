CREATE TABLE "assignment_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"canvas_course_id" text NOT NULL,
	"canvas_assignment_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignment_overrides_user_id_canvas_assignment_id_unique" UNIQUE("user_id","canvas_assignment_id")
);
--> statement-breakpoint
ALTER TABLE "assignment_overrides" ADD CONSTRAINT "assignment_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;