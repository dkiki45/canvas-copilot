import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { getGradesForCourse } from "@/lib/canvas/enrollments";
import { listAssignmentsForCourse } from "@/lib/canvas/assignments";
import { listCourseFiles } from "@/lib/canvas/files";
import { recordCourseVisit } from "@/lib/course-visits";
import { GradeTable } from "@/components/grade-table";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  await recordCourseVisit(userId, courseId);

  const [enrollments, assignments, files] = await Promise.all([
    getGradesForCourse(credentials, Number(courseId)),
    listAssignmentsForCourse(credentials, Number(courseId)),
    listCourseFiles(credentials, Number(courseId)).catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Notas</h1>
        <GradeTable enrollments={enrollments} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Arquivos</h2>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum arquivo disponível.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {files.map((file) => (
              <li key={file.id}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {file.display_name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Atividades</h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma atividade encontrada.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <Link
                  href={`/courses/${courseId}/assignments/${assignment.id}`}
                  className="block rounded-md border p-3 hover:bg-muted/50"
                >
                  <p className="font-medium">{assignment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.due_at ? `Prazo: ${new Date(assignment.due_at).toLocaleString("pt-BR")}` : "Sem prazo definido"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
