import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CourseGradeSummary } from "@/lib/canvas/grades";

export function GradesSummaryTable({ summaries }: { summaries: CourseGradeSummary[] }) {
  if (summaries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum curso pra mostrar notas.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Curso</TableHead>
          <TableHead>Nota atual</TableHead>
          <TableHead>Nota final</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {summaries.map((summary) => (
          <TableRow key={summary.courseId}>
            <TableCell>{summary.courseName}</TableCell>
            <TableCell>{summary.currentGrade ?? summary.currentScore ?? "—"}</TableCell>
            <TableCell>{summary.finalGrade ?? summary.finalScore ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
