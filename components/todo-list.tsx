"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

const todosCollection = collection(db, "todos");

export function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const todosQuery = query(todosCollection, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      todosQuery,
      (snapshot) => {
        const nextTodos = snapshot.docs.map((todoDoc) => {
          const data = todoDoc.data() as { completed?: boolean; text?: string };
          return {
            id: todoDoc.id,
            text: data.text ?? "",
            completed: Boolean(data.completed),
          };
        });
        setTodos(nextTodos);
        setLoading(false);
      },
      () => {
        setErrorMessage(
          "Failed to load todos. Check Firestore rules and try again.",
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const remainingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const handleAddTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);
    try {
      await addDoc(todosCollection, {
        text,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setInput("");
    } catch {
      setErrorMessage("Failed to add todo. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTodo = async (todo: TodoItem) => {
    setErrorMessage(null);
    try {
      await updateDoc(doc(db, "todos", todo.id), {
        completed: !todo.completed,
      });
    } catch {
      setErrorMessage("Failed to update todo. Please try again.");
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    setErrorMessage(null);
    try {
      await deleteDoc(doc(db, "todos", todoId));
    } catch {
      setErrorMessage("Failed to delete todo. Please try again.");
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Todo List</h2>
        <p className="text-sm text-neutral-600">
          {loading
            ? "Loading..."
            : `${remainingCount} remaining / ${todos.length} total`}
        </p>
      </div>

      <form className="flex gap-2" onSubmit={handleAddTodo}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          placeholder="Add a todo..."
          disabled={submitting}
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <ul className="space-y-2">
        {!loading && todos.length === 0 ? (
          <li className="rounded-md border border-dashed border-neutral-300 p-3 text-sm text-neutral-500">
            No todos yet.
          </li>
        ) : null}

        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between rounded-md border border-neutral-200 p-3"
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => void handleToggleTodo(todo)}
                className="h-4 w-4 accent-blue-600"
              />
              <span
                className={`text-sm ${
                  todo.completed
                    ? "text-neutral-400 line-through"
                    : "text-neutral-800"
                }`}
              >
                {todo.text}
              </span>
            </label>

            <button
              type="button"
              onClick={() => void handleDeleteTodo(todo.id)}
              className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
