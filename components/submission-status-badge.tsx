import { Badge } from "@/components/ui/badge";
import type { Submission } from "@/lib/canvas/types";

const LABELS: Record<Submission["workflow_state"], string> = {
  unsubmitted: "Não entregue",
  submitted: "Entregue",
  pending_review: "Em revisão",
  graded: "Corrigido",
};

const VARIANTS: Record<Submission["workflow_state"], "default" | "secondary" | "destructive" | "outline"> = {
  unsubmitted: "destructive",
  submitted: "secondary",
  pending_review: "outline",
  graded: "default",
};

export function SubmissionStatusBadge({ workflowState }: { workflowState: Submission["workflow_state"] }) {
  return <Badge variant={VARIANTS[workflowState]}>{LABELS[workflowState]}</Badge>;
}
