import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Enrollment } from "@/lib/canvas/types";

export function GradeTable({ enrollments }: { enrollments: Enrollment[] }) {
  if (enrollments.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma nota lançada ainda.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matrícula</TableHead>
          <TableHead>Nota atual</TableHead>
          <TableHead>Nota final</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => (
          <TableRow key={enrollment.id}>
            <TableCell>{enrollment.type}</TableCell>
            <TableCell>{enrollment.grades?.current_grade ?? enrollment.grades?.current_score ?? "—"}</TableCell>
            <TableCell>{enrollment.grades?.final_grade ?? enrollment.grades?.final_score ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
