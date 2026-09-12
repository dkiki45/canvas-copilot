import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { listTodoItems } from "@/lib/canvas/todo";
import { TodoItem } from "@/components/todo-item";

export default async function TodoPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const todoItems = await listTodoItems(credentials);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Tarefas pendentes</h1>
      {todoItems.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma tarefa pendente. 🎉</p>
      ) : (
        <div className="flex flex-col gap-3">
          {todoItems.map((item, index) => (
            <TodoItem key={`${item.course_id}-${index}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
