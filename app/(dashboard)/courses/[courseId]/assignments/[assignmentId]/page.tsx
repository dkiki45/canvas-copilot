import { redirect } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { getAssignment } from "@/lib/canvas/assignments";
import { getSubmissionSelf } from "@/lib/canvas/submissions";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { SubmitForm } from "./submit-form";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const { courseId, assignmentId } = await params;

  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const [assignment, submission] = await Promise.all([
    getAssignment(credentials, Number(courseId), Number(assignmentId)),
    getSubmissionSelf(credentials, Number(courseId), Number(assignmentId)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{assignment.name}</h1>
        <SubmissionStatusBadge workflowState={submission.workflow_state} />
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>{assignment.due_at ? `Prazo: ${new Date(assignment.due_at).toLocaleString("pt-BR")}` : "Sem prazo definido"}</p>
        <p>{assignment.points_possible != null ? `${assignment.points_possible} pontos` : "Sem pontuação definida"}</p>
      </div>

      {assignment.description && (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assignment.description) }}
        />
      )}

      {assignment.attachments && assignment.attachments.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Anexos</h2>
          <ul className="flex flex-col gap-1">
            {assignment.attachments.map((attachment) => (
              <li key={attachment.id}>
                <a href={attachment.url} className="text-sm text-primary hover:underline">
                  {attachment.display_name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Enviar entrega</h2>
        <SubmitForm courseId={Number(courseId)} assignmentId={Number(assignmentId)} />
      </section>
    </div>
  );
}
