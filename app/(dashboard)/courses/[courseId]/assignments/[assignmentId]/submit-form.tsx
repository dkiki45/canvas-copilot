"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubmitForm({ courseId, assignmentId }: { courseId: number; assignmentId: number }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", String(courseId));
      formData.append("assignmentId", String(assignmentId));

      const response = await fetch("/api/canvas/submit", { method: "POST", body: formData });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Falha ao enviar a entrega");
      }

      toast.success("Entrega enviada com sucesso!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar a entrega");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Button type="submit" disabled={!file || isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}
