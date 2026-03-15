import { TodoList } from "@/components/todo-list";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        Firebase Todo CRUD
      </h1>
      <p className="text-sm text-neutral-600">
        A simple todo list powered by Firestore (create, read, update, delete).
      </p>
      <TodoList />
    </main>
  );
}
