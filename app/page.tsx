"use client";

import { useEffect, useRef, useState } from "react";

type Task = {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  time: string;
  source: string;
  urgency: string;
  action: string;
  completed: boolean;
};

type AnalysisResult = {
  type: string;
  title: string;
  description: string;
  date: string;
  time: string;
  source: string;
  urgency: string;
  action: string;
  confidence: number;
  requiredItems: string[];
};

const TASKS_STORAGE_KEY = "screenshot-action-tasks";

function getTypeStyle(type: string): {
  icon: string;
  badge: string;
} {
  switch (type.toLowerCase()) {
    case "event":
      return {
        icon: "📅",
        badge:
          "border-violet-200 bg-violet-50 text-violet-700",
      };

    case "deadline":
      return {
        icon: "⏰",
        badge:
          "border-orange-200 bg-orange-50 text-orange-700",
      };

    case "reminder":
      return {
        icon: "🔔",
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "message":
      return {
        icon: "💬",
        badge:
          "border-sky-200 bg-sky-50 text-sky-700",
      };

    case "task":
      return {
        icon: "✓",
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    default:
      return {
        icon: "📌",
        badge:
          "border-slate-200 bg-slate-50 text-slate-700",
      };
  }
}

function getUrgencyStyle(urgency: string): string {
  switch (urgency.toLowerCase()) {
    case "high":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

function DashboardField({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactNode {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-700">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function ResultField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-base leading-7 text-slate-700">
        {value || "Not detected"}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-lg">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-100 hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl transition group-hover:scale-105">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const [image, setImage] =
    useState<string | null>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [activePage, setActivePage] =
    useState<"home" | "actions">("home");

  const [dragActive, setDragActive] =
    useState(false);

  const [taskAdded, setTaskAdded] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // Load saved tasks
  useEffect(() => {
    try {
      const savedTasks =
        localStorage.getItem(
          TASKS_STORAGE_KEY
        );

      if (savedTasks) {
        const parsedTasks =
          JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
        }
      }
    } catch (error) {
      console.error(
        "Could not load saved tasks:",
        error
      );
    }
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(tasks)
      );
    } catch (error) {
      console.error(
        "Could not save tasks:",
        error
      );
    }
  }, [tasks]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  // Handle screenshot upload
  const handleFileChange = (
    selectedFile: File | undefined
  ) => {
    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError(
        "Please upload a valid image file."
      );
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(
        "Image is too large. Please upload an image smaller than 10 MB."
      );
      return;
    }

    if (image) {
      URL.revokeObjectURL(image);
    }

    setError("");
    setResult(null);
    setTaskAdded(false);
    setFile(selectedFile);

    const imageUrl =
      URL.createObjectURL(selectedFile);

    setImage(imageUrl);
  };

  // Drag and drop
  const handleDragOver = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    handleFileChange(droppedFile);
  };

  // Analyze screenshot
  const analyzeScreenshot = async () => {
    if (!file) {
      setError(
        "Please select a screenshot first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setTaskAdded(false);

    try {
      const base64 =
        await fileToBase64(file);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64,
            mimeType: file.type,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Analysis failed."
        );
      }

      if (!data?.result) {
        throw new Error(
          "The AI did not return a result."
        );
      }

      let parsedResult: AnalysisResult;

      try {
        parsedResult =
          JSON.parse(
            cleanJson(data.result)
          );
      } catch {
        console.error(
          "Raw AI response:",
          data.result
        );

        throw new Error(
          "The AI returned an invalid response. Please try again."
        );
      }

      parsedResult = {
        type:
          parsedResult.type ||
          "Unknown",

        title:
          parsedResult.title ||
          "Untitled Action",

        description:
          parsedResult.description ||
          "",

        date:
          parsedResult.date ||
          "",

        time:
          parsedResult.time ||
          "",

        source:
          parsedResult.source ||
          "",

        urgency:
          parsedResult.urgency ||
          "Low",

        action:
          parsedResult.action ||
          "",

        confidence:
          typeof parsedResult.confidence ===
          "number"
            ? Math.max(
                0,
                Math.min(
                  1,
                  parsedResult.confidence
                )
              )
            : 0,

        requiredItems:
          Array.isArray(
            parsedResult.requiredItems
          )
            ? parsedResult.requiredItems
            : [],
      };

      setResult(parsedResult);
    } catch (err) {
      console.error(
        "Screenshot analysis error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the screenshot."
      );
    } finally {
      setLoading(false);
    }
  };

  // Remove current screenshot
  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }

    setImage(null);
    setFile(null);
    setResult(null);
    setError("");
    setLoading(false);
    setTaskAdded(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add AI result to tasks
  const addTask = () => {
    if (!result) {
      return;
    }

    const newTask: Task = {
  id: `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`,

  type:
    result.type || "TASK",

  title:
        result.title ||
        "Untitled Action",

      description:
        result.description ||
        "",

      date:
        result.date ||
        "",

      time:
        result.time ||
        "",

      source:
        result.source ||
        "",

      urgency:
        result.urgency ||
        "Low",

      action:
        result.action ||
        "",

      completed: false,
    };

    setTasks(
      (previousTasks) => [
        ...previousTasks,
        newTask,
      ]
    );

    setTaskAdded(true);
  };

  // Toggle task completion
  const toggleTask = (
    taskId: string
  ) => {
    setTasks(
      (previousTasks) =>
        previousTasks.map(
          (task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed:
                    !task.completed,
                }
              : task
        )
    );
  };

  // Delete task
  const deleteTask = (
    taskId: string
  ) => {
    setTasks(
      (previousTasks) =>
        previousTasks.filter(
          (task) =>
            task.id !== taskId
        )
    );
  };

  const pendingCount =
    tasks.filter(
      (task) => !task.completed
    ).length;

  const completedCount =
    tasks.filter(
      (task) => task.completed
    ).length;

  return (
    <main className="min-h-screen bg-[#F8F7FC] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-7 sm:px-8 sm:py-10">

        {/* NAVIGATION */}
        <nav className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <button
            onClick={() =>
              setActivePage("home")
            }
            className="group self-start text-xl font-bold tracking-tight text-slate-800 transition hover:text-violet-600"
          >
            Screenshot{" "}
            <span className="text-violet-500 transition group-hover:text-violet-600">
              →
            </span>{" "}
            Action
          </button>

          <div className="flex w-fit gap-1 rounded-2xl border border-violet-100 bg-white p-1.5 shadow-sm">

            <button
              onClick={() =>
                setActivePage("home")
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activePage === "home"
                  ? "bg-violet-500 text-white shadow-md shadow-violet-200"
                  : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              Home
            </button>

            <button
              onClick={() =>
                setActivePage("actions")
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activePage === "actions"
                  ? "bg-violet-500 text-white shadow-md shadow-violet-200"
                  : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              My Actions

              {tasks.length > 0 && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    activePage === "actions"
                      ? "bg-white/20 text-white"
                      : "bg-violet-100 text-violet-600"
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

          </div>
        </nav>

        {/* HOME PAGE */}
        {activePage === "home" && (
          <>
            {/* HERO */}
            <header className="mb-14 text-center">

              <div className="mb-5 inline-flex items-center rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-violet-600 shadow-sm">
                <span className="mr-2">
                  ✨
                </span>
                AI-powered screenshot intelligence
              </div>

              <h1 className="text-5xl font-bold tracking-tight text-slate-800 sm:text-6xl">
                Screenshot
                <span className="mx-2 text-violet-500">
                  →
                </span>
                Action
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
                Turn passive screenshots into
                actionable information. Upload a
                screenshot and let AI understand
                what needs to happen next.
              </p>

            </header>

            {/* UPLOAD SECTION */}
            <section className="mx-auto w-full max-w-3xl">

              {!image ? (
                <label
                  htmlFor="file-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`group flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-10 text-center transition ${
                    dragActive
                      ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-100"
                      : "border-violet-200 bg-white shadow-sm hover:border-violet-400 hover:bg-violet-50/40 hover:shadow-md"
                  }`}
                >

                  <div
                    className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-sm transition ${
                      dragActive
                        ? "bg-violet-100"
                        : "bg-violet-50 group-hover:scale-105"
                    }`}
                  >
                    📸
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800">
                    {dragActive
                      ? "Drop your screenshot"
                      : "Drop your screenshot here"}
                  </h2>

                  <p className="mt-3 text-slate-500">
                    or click to browse from your computer
                  </p>

                  <span className="mt-6 rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-600">
                    Choose Screenshot
                  </span>

                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(event) =>
                      handleFileChange(
                        event.target.files?.[0]
                      )
                    }
                  />

                  <p className="mt-5 text-xs text-slate-400">
                    PNG, JPG, JPEG, WEBP · Max 10 MB
                  </p>

                </label>
              ) : (
                <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-md sm:p-6">

                  {/* IMAGE HEADER */}
                  <div className="mb-5 flex items-center justify-between gap-4">

                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        Screenshot uploaded
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {file?.name ||
                          "Ready for AI analysis"}
                      </p>
                    </div>

                    <button
                      onClick={removeImage}
                      disabled={loading}
                      className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>

                  </div>

                  {/* IMAGE PREVIEW */}
                  <div className="overflow-hidden rounded-2xl border border-violet-100 bg-[#F8F7FC] p-2">
                    <img
                      src={image}
                      alt="Uploaded screenshot preview"
                      className="max-h-[600px] w-full rounded-xl object-contain"
                    />
                  </div>

                  {/* ANALYZE BUTTON */}
                  {!result && (
                    <button
                      onClick={analyzeScreenshot}
                      disabled={loading}
                      className="mt-6 w-full rounded-xl bg-violet-500 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-3">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          AI is analyzing...
                        </span>
                      ) : (
                        "Analyze Screenshot →"
                      )}
                    </button>
                  )}

                  {/* ERROR */}
                  {error && (
                    <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                      <div className="flex gap-3">
                        <span>⚠️</span>
                        <p>{error}</p>
                      </div>
                    </div>
                  )}
                                    {/* AI RESULT */}
                  {result && (
                    <div className="mt-8 rounded-[1.75rem] border border-violet-100 bg-[#FCFBFF] p-5 shadow-sm sm:p-7">

                      {/* RESULT HEADER */}
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          <p className="text-sm font-semibold uppercase tracking-wider text-violet-500">
                            AI detected
                          </p>

                          <div
                            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                              getTypeStyle(result.type).badge
                            }`}
                          >
                            <span>
                              {getTypeStyle(result.type).icon}
                            </span>

                            <span>
                              {result.type}
                            </span>
                          </div>

                          <h2 className="mt-4 text-2xl font-bold text-slate-800 sm:text-3xl">
                            {result.title}
                          </h2>
                        </div>

                        <div className="flex flex-col items-start gap-2 sm:items-end">

                          <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                            {Math.round(
                              result.confidence * 100
                            )}
                            % confidence
                          </div>

                          <div
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                              getUrgencyStyle(
                                result.urgency
                              )
                            }`}
                          >
                            {result.urgency || "Low"} urgency
                          </div>

                        </div>

                      </div>

                      {/* RESULT CONTENT */}
                      <div className="mt-7 space-y-6">

                        {result.description && (
                          <div className="rounded-2xl border border-slate-100 bg-white p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              What AI understood
                            </p>

                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              {result.description}
                            </p>
                          </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">

                          {result.date && (
                            <ResultField
                              label={
                                result.type.toLowerCase() ===
                                "deadline"
                                  ? "Deadline"
                                  : "Date"
                              }
                              value={result.date}
                            />
                          )}

                          {result.time && (
                            <ResultField
                              label="Time"
                              value={result.time}
                            />
                          )}

                          {result.source && (
                            <ResultField
                              label="Source"
                              value={result.source}
                            />
                          )}

                          {result.action && (
                            <ResultField
                              label="Recommended Action"
                              value={result.action}
                            />
                          )}

                        </div>

                        {/* REQUIRED ITEMS */}
                        {result.requiredItems.length > 0 && (
                          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5">

                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                                📋
                              </span>

                              <p className="text-sm font-bold text-sky-800">
                                Required Items
                              </p>
                            </div>

                            <ul className="mt-4 space-y-2">
                              {result.requiredItems.map(
                                (item, index) => (
                                  <li
                                    key={`${item}-${index}`}
                                    className="flex items-center gap-3 rounded-xl border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
                                  >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs text-sky-600">
                                      ✓
                                    </span>

                                    {item}
                                  </li>
                                )
                              )}
                            </ul>

                          </div>
                        )}

                        {/* ACTION */}
                        {result.action && (
                          <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">

                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                              Suggested next step
                            </p>

                            <div className="mt-3 flex items-start gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-lg">
                                ✨
                              </span>

                              <p className="pt-1 text-base font-semibold leading-6 text-violet-900">
                                {result.action}
                              </p>
                            </div>

                          </div>
                        )}

                      </div>

                      {/* ADD TO TASKS */}
                      <div className="mt-7">

                        {!taskAdded ? (
                          <button
                            onClick={addTask}
                            className="w-full rounded-xl bg-emerald-500 px-6 py-4 font-semibold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-600 hover:shadow-xl"
                          >
                            ✓ Add to My Actions
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 font-semibold text-emerald-700">
                            <span>✓</span>
                            Added to My Actions
                          </div>
                        )}

                      </div>

                    </div>
                  )}

                </div>
              )}

            </section>

            {/* HOME TASK PREVIEW */}
            {tasks.length > 0 && (
              <section className="mx-auto mt-16 w-full max-w-3xl">

                <div className="mb-6 flex items-end justify-between gap-4">

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-violet-500">
                      Your actions
                    </p>

                    <h2 className="mt-1 text-3xl font-bold text-slate-800">
                      Recent Actions
                    </h2>

                    <p className="mt-2 text-slate-500">
                      Information extracted from your screenshots.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setActivePage("actions")
                    }
                    className="hidden rounded-xl border border-violet-100 bg-white px-4 py-2 text-sm font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50 sm:block"
                  >
                    View all →
                  </button>

                </div>

                <div className="space-y-4">

                  {tasks
                    .slice(-3)
                    .reverse()
                    .map((task) => {

                      const typeStyle =
                        getTypeStyle(
                          task.type || "task"
                        );

                      return (
                        <div
                          key={task.id}
                          className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                            task.completed
                              ? "border-slate-100 opacity-70"
                              : "border-violet-100"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                              <div
                                className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                                  typeStyle.badge
                                }`}
                              >
                                <span>
                                  {typeStyle.icon}
                                </span>

                                <span>
                                  {task.type || "TASK"}
                                </span>
                              </div>

                              <h3
                                className={`text-lg font-bold ${
                                  task.completed
                                    ? "text-slate-400 line-through"
                                    : "text-slate-800"
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.description && (
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                  {task.description}
                                </p>
                              )}

                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                                getUrgencyStyle(
                                  task.urgency
                                )
                              }`}
                            >
                              {task.urgency}
                            </span>

                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-3">

                            {task.date && (
                              <DashboardField
                                label="Date"
                                value={task.date}
                              />
                            )}

                            {task.time && (
                              <DashboardField
                                label="Time"
                                value={task.time}
                              />
                            )}

                            {task.source && (
                              <DashboardField
                                label="Source"
                                value={task.source}
                              />
                            )}

                          </div>

                          <div className="mt-5 flex flex-col gap-2 sm:flex-row">

                            <button
                              onClick={() =>
                                toggleTask(task.id)
                              }
                              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                task.completed
                                  ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                              }`}
                            >
                              {task.completed
                                ? "✓ Completed"
                                : "Mark as Complete"}
                            </button>

                            <button
                              onClick={() =>
                                deleteTask(task.id)
                              }
                              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                            >
                              Delete
                            </button>

                          </div>

                        </div>
                      );
                    })}

                </div>

                <button
                  onClick={() =>
                    setActivePage("actions")
                  }
                  className="mt-4 w-full rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50 sm:hidden"
                >
                  View all actions →
                </button>

              </section>
            )}

            {/* FEATURES */}
            <section className="mt-20 grid gap-5 sm:grid-cols-3">

              <Feature
                icon="🧠"
                title="Understand"
                description="AI analyzes the content and context of your screenshot."
              />

              <Feature
                icon="⚡"
                title="Extract"
                description="Important tasks, events, deadlines and actions are identified."
              />

              <Feature
                icon="✨"
                title="Act"
                description="Turn extracted information into useful, organized actions."
              />

            </section>
          </>
        )}

        {/* MY ACTIONS PAGE */}
        {activePage === "actions" && (
          <>
            <section>

              <div className="mb-10">

                <div className="mb-4 inline-flex items-center rounded-full border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-violet-600 shadow-sm">
                  <span className="mr-2">
                    ✨
                  </span>
                  Your action dashboard
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
                  My Actions
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                  Everything you've extracted from
                  your screenshots, organized in one
                  place.
                </p>

              </div>

              {/* STATISTICS */}
              <div className="grid gap-4 sm:grid-cols-3">

                <StatCard
                  label="Total"
                  value={tasks.length}
                  icon="📊"
                />

                <StatCard
                  label="Pending"
                  value={pendingCount}
                  icon="⏳"
                />

                <StatCard
                  label="Completed"
                  value={completedCount}
                  icon="✓"
                />

              </div>

              {/* EMPTY STATE */}
              {tasks.length === 0 ? (
                <div className="mt-10 rounded-[2rem] border border-dashed border-violet-200 bg-white p-12 text-center shadow-sm">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50 text-4xl">
                    📭
                  </div>

                  <h2 className="mt-5 text-2xl font-bold text-slate-800">
                    No actions yet
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-slate-500">
                    Upload a screenshot and let AI
                    find something actionable for you.
                  </p>

                  <button
                    onClick={() =>
                      setActivePage("home")
                    }
                    className="mt-7 rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white shadow-md shadow-violet-100 transition hover:bg-violet-600"
                  >
                    Analyze Screenshot
                  </button>

                </div>
              ) : (
                <div className="mt-10 space-y-5">

                  {tasks.map((task) => {

                    const typeStyle =
                      getTypeStyle(
                        task.type || "task"
                      );

                    return (
                      <div
                        key={task.id}
                        className={`rounded-[1.75rem] border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6 ${
                          task.completed
                            ? "border-slate-100"
                            : "border-violet-100"
                        }`}
                      >

                        {/* CARD HEADER */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <div
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                                typeStyle.badge
                              }`}
                            >
                              <span>
                                {typeStyle.icon}
                              </span>

                              <span>
                                {task.type || "TASK"}
                              </span>
                            </div>

                            <h2
                              className={`mt-3 text-xl font-bold ${
                                task.completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-800"
                              }`}
                            >
                              {task.title}
                            </h2>

                            {task.description && (
                              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                                {task.description}
                              </p>
                            )}

                          </div>

                          <span
                            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold uppercase ${
                              getUrgencyStyle(
                                task.urgency
                              )
                            }`}
                          >
                            {task.urgency}
                          </span>

                        </div>

                        {/* DETAILS */}
                        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

                          <DashboardField
                            label="Date"
                            value={
                              task.date ||
                              "Not specified"
                            }
                          />

                          <DashboardField
                            label="Time"
                            value={
                              task.time ||
                              "Not specified"
                            }
                          />

                          <DashboardField
                            label="Source"
                            value={
                              task.source ||
                              "Unknown"
                            }
                          />

                          <DashboardField
                            label="Action"
                            value={
                              task.action ||
                              "Not specified"
                            }
                          />

                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                          <button
                            onClick={() =>
                              toggleTask(task.id)
                            }
                            className={`flex-1 rounded-xl px-5 py-3 font-semibold transition ${
                              task.completed
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
                            }`}
                          >
                            {task.completed
                              ? "✓ Completed — Mark Pending"
                              : "Mark as Complete"}
                          </button>

                          <button
                            onClick={() =>
                              deleteTask(task.id)
                            }
                            className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            🗑 Delete
                          </button>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </section>
          </>
        )}

        {/* FOOTER */}
        <footer className="mt-auto pt-20 text-center">

          <div className="mx-auto mb-4 h-px max-w-xl bg-gradient-to-r from-transparent via-violet-200 to-transparent" />

          <p className="text-sm font-medium text-slate-400">
            Screenshot
            <span className="mx-2 text-violet-400">
              →
            </span>
            Understand
            <span className="mx-2 text-violet-400">
              →
            </span>
            Extract
            <span className="mx-2 text-violet-400">
              →
            </span>
            Action
          </p>

          <p className="mt-2 text-xs text-slate-300">
            AI-powered screenshot intelligence
          </p>

        </footer>

      </div>
    </main>
  );
}
function fileToBase64(
  file: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(
          new Error("Could not read image.")
        );
        return;
      }

      const base64 = result.split(",")[1];

      if (!base64) {
        reject(
          new Error("Could not convert image.")
        );
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(
        new Error("Could not read image.")
      );
    };

    reader.readAsDataURL(file);
  });
}

function cleanJson(
  text: string
): string {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}