import "server-only";
import { canvasPaginated, type CanvasCredentials } from "./client";
import type { TodoItem } from "./types";

/** Lista os itens pendentes do aluno (tarefas a entregar). */
export async function listTodoItems(creds: CanvasCredentials): Promise<TodoItem[]> {
  return canvasPaginated<TodoItem>(creds, "/users/self/todo");
}
