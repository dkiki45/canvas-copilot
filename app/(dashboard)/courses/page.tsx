import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { listCourses } from "@/lib/canvas/courses";
import { CourseCard } from "@/components/course-card";

export default async function CoursesPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const courses = await listCourses(credentials);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Meus cursos</h1>
      {courses.length === 0 ? (
        <p className="text-muted-foreground">Nenhum curso ativo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
