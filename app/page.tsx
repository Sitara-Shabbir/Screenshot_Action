"use client";

import { useEffect, useRef, useState } from "react";

type Task = {
  id: string;
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
          "border-purple-500/30 bg-purple-500/10 text-purple-300",
      };

    case "deadline":
      return {
        icon: "⏰",
        badge:
          "border-red-500/30 bg-red-500/10 text-red-300",
      };

    case "reminder":
      return {
        icon: "🔔",
        badge:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
      };

    case "message":
      return {
        icon: "💬",
        badge:
          "border-blue-500/30 bg-blue-500/10 text-blue-300",
      };

    case "task":
      return {
        icon: "✅",
        badge:
          "border-green-500/30 bg-green-500/10 text-green-300",
      };

    default:
      return {
        icon: "📌",
        badge:
          "border-slate-600 bg-slate-800 text-slate-200",
      };
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
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-200">
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
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-base leading-7 text-slate-200">
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {label}
        </p>

        <span className="text-xl">
          {icon}
        </span>
      </div>

      <p className="mt-2 text-3xl font-bold text-white">
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-slate-700 hover:bg-slate-900">
      <div className="mb-4 text-3xl">
        {icon}
      </div>

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
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
      setError("Please select a screenshot first.");
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

      // Normalize AI output so the UI
      // doesn't break if a field is missing.
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

  // Statistics
  const pendingCount =
    tasks.filter(
      (task) => !task.completed
    ).length;

  const completedCount =
    tasks.filter(
      (task) => task.completed
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">

        {/* =========================
            NAVIGATION
        ========================== */}

        <nav className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            onClick={() =>
              setActivePage("home")
            }
            className="self-start text-xl font-bold tracking-tight transition hover:text-slate-300"
          >
            Screenshot{" "}
            <span className="text-blue-500">
              →
            </span>{" "}
            Action
          </button>

          <div className="flex w-fit gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1">

            <button
              onClick={() =>
                setActivePage("home")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activePage === "home"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Home
            </button>

            <button
              onClick={() =>
                setActivePage("actions")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activePage === "actions"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              My Actions
              {tasks.length > 0 && (
                <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-xs">
                  {pendingCount}
                </span>
              )}
            </button>

          </div>
        </nav>


        {/* =========================
            HOME PAGE
        ========================== */}

        {activePage === "home" && (
          <>

            {/* Header */}

            <header className="mb-16 text-center">

              <div className="mb-4 inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
                <span className="mr-2">
                  ✨
                </span>
                AI-powered screenshot intelligence
              </div>

              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                Screenshot
                <span className="text-blue-500">
                  {" "}
                  →{" "}
                </span>
                Action
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                Turn passive screenshots into actionable information.
                Upload a screenshot and let AI understand what needs to happen next.
              </p>

            </header>


            {/* =========================
                UPLOAD SECTION
            ========================== */}

            <section className="mx-auto w-full max-w-3xl">

              {!image ? (

                <label
                  htmlFor="file-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition ${
                    dragActive
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 bg-slate-900/60 hover:border-blue-500 hover:bg-slate-900"
                  }`}
                >

                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-4xl">
                    📸
                  </div>

                  <h2 className="text-2xl font-semibold">
                    {dragActive
                      ? "Drop your screenshot"
                      : "Drop your screenshot here"}
                  </h2>

                  <p className="mt-3 text-slate-400">
                    or click to browse from your computer
                  </p>

                  <span className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500">
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

                  <p className="mt-5 text-xs text-slate-500">
                    PNG, JPG, JPEG, WEBP · Max 10 MB
                  </p>

                </label>

              ) : (

                <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">

                  {/* Image header */}

                  <div className="mb-5 flex items-center justify-between gap-4">

                    <div>
                      <h2 className="text-xl font-semibold">
                        Screenshot uploaded
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {file?.name || "Ready for AI analysis"}
                      </p>
                    </div>

                    <button
                      onClick={removeImage}
                      disabled={loading}
                      className="shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>

                  </div>


                  {/* Image preview */}

                  <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">

                    <img
                      src={image}
                      alt="Uploaded screenshot preview"
                      className="max-h-[600px] w-full object-contain"
                    />

                  </div>


                  {/* Analyze button */}

                  {!result && (

                    <button
                      onClick={analyzeScreenshot}
                      disabled={loading}
                      className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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


                  {/* Error */}

                  {error && (

                    <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                      <div className="flex gap-3">
                        <span>
                          ⚠️
                        </span>

                        <p>
                          {error}
                        </p>
                      </div>
                    </div>

                  )}


                  {/* =========================
                      AI RESULT
                  ========================== */}

                  {result && (

                    <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950 p-6">
                                          {/* Result Header */}

                      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                          {(() => {
                            const typeStyle =
                              getTypeStyle(
                                result.type
                              );

                            return (
                              <>
                                <p className="text-sm font-medium text-blue-400">
                                  AI DETECTED
                                </p>

                                <div
                                  className={`mt-2 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${typeStyle.badge}`}
                                >
                                  <span>
                                    {typeStyle.icon}
                                  </span>

                                  <span>
                                    {result.type ||
                                      "Unknown"}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">

                          <div className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                            {Math.round(
                              result.confidence *
                                100
                            )}
                            % confidence
                          </div>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                              result.urgency
                                .toLowerCase() ===
                              "high"
                                ? "bg-red-500/10 text-red-400"
                                : result.urgency
                                      .toLowerCase() ===
                                    "medium"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-green-500/10 text-green-400"
                            }`}
                          >
                            {result.urgency ||
                              "Low"}{" "}
                            urgency
                          </span>

                        </div>

                      </div>


                      {/* Confidence Bar */}

                      <div className="mb-8">

                        <div className="mb-2 flex items-center justify-between">

                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            AI Confidence
                          </p>

                          <p className="text-xs text-slate-400">
                            {Math.round(
                              result.confidence *
                                100
                            )}
                            %
                          </p>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className="h-full rounded-full bg-green-500 transition-all duration-700"
                            style={{
                              width: `${Math.round(
                                result.confidence *
                                  100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* Main Information */}

                      <div className="space-y-6">

                        <ResultField
                          label="Title"
                          value={
                            result.title
                          }
                        />

                        <ResultField
                          label="Description"
                          value={
                            result.description
                          }
                        />


                        {/* Date / Time */}

                        {(result.date ||
                          result.time) && (

                          <div className="grid gap-5 sm:grid-cols-2">

                            {result.date && (
                              <ResultField
                                label="Date"
                                value={
                                  result.date
                                }
                              />
                            )}

                            {result.time && (
                              <ResultField
                                label="Time"
                                value={
                                  result.time
                                }
                              />
                            )}

                          </div>

                        )}


                        {/* Source / Urgency */}

                        <div className="grid gap-5 sm:grid-cols-2">

                          <ResultField
                            label="Source"
                            value={
                              result.source
                            }
                          />

                          <ResultField
                            label="Urgency"
                            value={
                              result.urgency
                            }
                          />

                        </div>


                        {/* Recommended Action */}

                        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">

                          <div className="mb-3 flex items-center gap-2">

                            <span className="text-xl">
                              🎯
                            </span>

                            <p className="text-xs font-medium uppercase tracking-wide text-blue-400">
                              Recommended Action
                            </p>

                          </div>

                          <p className="text-base leading-7 text-slate-200">
                            {result.action ||
                              "No specific action detected."}
                          </p>

                        </div>


                        {/* Required Items */}

                        {result.requiredItems &&
                          result.requiredItems
                            .length > 0 && (

                            <div>

                              <div className="mb-3 flex items-center gap-2">

                                <span className="text-xl">
                                  📋
                                </span>

                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Required Items
                                </p>

                              </div>

                              <ul className="space-y-2">

                                {result.requiredItems.map(
                                  (
                                    item,
                                    index
                                  ) => (

                                    <li
                                      key={`${item}-${index}`}
                                      className="flex items-start gap-3 rounded-lg bg-slate-900 px-4 py-3 text-slate-200"
                                    >
                                      <span className="mt-0.5 text-green-400">
                                        ✓
                                      </span>

                                      <span className="text-sm leading-6">
                                        {item}
                                      </span>

                                    </li>

                                  )
                                )}

                              </ul>

                            </div>

                          )}

                      </div>


                      {/* Task Added Confirmation */}

                      {taskAdded && (

                        <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">

                          <div className="flex items-center gap-3">

                            <span className="text-xl">
                              ✅
                            </span>

                            <div>

                              <p className="font-semibold text-green-400">
                                Added to My Actions
                              </p>

                              <p className="mt-1 text-sm text-green-400/70">
                                This action has been saved and will remain available after refreshing the page.
                              </p>

                            </div>

                          </div>

                        </div>

                      )}


                      {/* Add to Tasks */}

                      {!taskAdded ? (

                        <button
                          className="mt-8 w-full rounded-xl bg-green-600 px-6 py-4 font-semibold shadow-lg shadow-green-600/10 transition hover:bg-green-500"
                          onClick={addTask}
                        >
                          ✓ Add to Tasks
                        </button>

                      ) : (

                        <button
                          onClick={() =>
                            setActivePage(
                              "actions"
                            )
                          }
                          className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 font-semibold text-slate-200 transition hover:bg-slate-800"
                        >
                          View My Actions →
                        </button>

                      )}

                    </div>

                  )}

                </div>

              )}

            </section>


            {/* =========================
                HOME TASKS
            ========================== */}

            {tasks.length > 0 && (

              <section className="mx-auto mt-16 w-full max-w-3xl">

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <p className="text-sm font-medium text-blue-400">
                      YOUR ACTIONS
                    </p>

                    <h2 className="mt-1 text-3xl font-bold">
                      My Tasks
                    </h2>

                    <p className="mt-2 text-slate-400">
                      Actions extracted from your screenshots.
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setActivePage(
                        "actions"
                      )
                    }
                    className="w-fit rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    View All →
                  </button>

                </div>


                <div className="space-y-4">

                  {tasks.map((task) => {

                    const taskTypeStyle =
                      getTypeStyle(
                        "task"
                      );

                    return (

                      <div
                        key={task.id}
                        className={`rounded-2xl border bg-slate-900 p-6 transition ${
                          task.completed
                            ? "border-slate-800 opacity-70"
                            : "border-slate-700"
                        }`}
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <div className="mb-2 flex flex-wrap items-center gap-2">

                              <div
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${taskTypeStyle.badge}`}
                              >
                                <span>
                                  {taskTypeStyle.icon}
                                </span>

                                <span>
                                  TASK
                                </span>
                              </div>

                              <div
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  task.urgency
                                    .toLowerCase() ===
                                  "high"
                                    ? "bg-red-500/10 text-red-400"
                                    : task.urgency
                                          .toLowerCase() ===
                                        "medium"
                                      ? "bg-yellow-500/10 text-yellow-400"
                                      : "bg-green-500/10 text-green-400"
                                }`}
                              >
                                {task.urgency ||
                                  "Low"}
                              </div>

                            </div>

                            <h3
                              className={`text-xl font-semibold ${
                                task.completed
                                  ? "text-slate-500 line-through"
                                  : "text-white"
                              }`}
                            >
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {task.description}
                              </p>
                            )}

                          </div>

                        </div>


                        <div className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">

                          {task.date && (
                            <DashboardField
                              label="Due"
                              value={
                                task.date
                              }
                            />
                          )}

                          {task.time && (
                            <DashboardField
                              label="Time"
                              value={
                                task.time
                              }
                            />
                          )}

                          {task.source && (
                            <DashboardField
                              label="Source"
                              value={
                                task.source
                              }
                            />
                          )}

                          {task.action && (
                            <DashboardField
                              label="Action"
                              value={
                                task.action
                              }
                            />
                          )}

                        </div>


                        {/* Complete */}

                        <button
                          onClick={() =>
                            toggleTask(
                              task.id
                            )
                          }
                          className={`mt-6 w-full rounded-xl px-5 py-3 font-semibold transition ${
                            task.completed
                              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              : "bg-green-600 text-white hover:bg-green-500"
                          }`}
                        >
                          {task.completed
                            ? "✓ Completed — Mark as Pending"
                            : "Mark as Complete"}
                        </button>


                        {/* Delete */}

                        <button
                          onClick={() =>
                            deleteTask(
                              task.id
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-red-900/50 bg-red-950/20 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-950/40"
                        >
                          🗑️ Delete Task
                        </button>

                      </div>

                    );
                  })}

                </div>

              </section>

            )}


            {/* =========================
                FEATURES
            ========================== */}

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
                icon="✅"
                title="Act"
                description="Turn extracted information into useful actions."
              />

            </section>

          </>
        )}


        {/* =========================
            MY ACTIONS PAGE
        ========================== */}

        {activePage === "actions" && (

          <section className="mx-auto w-full max-w-4xl">

            {/* Dashboard Header */}

            <div className="mb-10">

              <p className="text-sm font-medium text-blue-400">
                YOUR WORKSPACE
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                My Actions
              </h1>

              <p className="mt-3 text-slate-400">
                Everything you've extracted from your screenshots.
              </p>

            </div>


            {/* Statistics */}

            <div className="mb-10 grid gap-4 sm:grid-cols-3">

              <StatCard
                label="Total"
                value={
                  tasks.length
                }
                icon="📋"
              />

              <StatCard
                label="Pending"
                value={
                  pendingCount
                }
                icon="⏳"
              />

              <StatCard
                label="Completed"
                value={
                  completedCount
                }
                icon="✅"
              />

            </div>


            {/* No tasks */}

            {tasks.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">

                <div className="text-4xl">
                  📭
                </div>

                <h2 className="mt-4 text-xl font-semibold">
                  No actions yet
                </h2>

                <p className="mt-2 text-slate-400">
                  Upload a screenshot and let AI find something actionable.
                </p>

                <button
                  onClick={() =>
                    setActivePage(
                      "home"
                    )
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
                >
                  Analyze Screenshot
                </button>

              </div>

            ) : (

              <div className="space-y-4">

                {tasks.map((task) => (

                  <div
                    key={task.id}
                    className={`rounded-2xl border bg-slate-900 p-6 transition ${
                      task.completed
                        ? "border-slate-800 opacity-70"
                        : "border-slate-700"
                    }`}
                  >

                    {/* Task header */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                              getTypeStyle(
                                "task"
                              ).badge
                            }`}
                          >
                            <span>
                              {getTypeStyle(
                                "task"
                              ).icon}
                            </span>

                            TASK
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              task.completed
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {task.completed
                              ? "Completed"
                              : "Pending"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              task.urgency
                                .toLowerCase() ===
                              "high"
                                ? "bg-red-500/10 text-red-400"
                                : task.urgency
                                      .toLowerCase() ===
                                    "medium"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-green-500/10 text-green-400"
                            }`}
                          >
                            {task.urgency ||
                              "Low"}
                          </span>

                        </div>

                        <h2
                          className={`mt-3 text-xl font-semibold ${
                            task.completed
                              ? "text-slate-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {task.title}
                        </h2>

                        {task.description && (
                          <p className="mt-2 leading-6 text-slate-400">
                            {task.description}
                          </p>
                        )}

                      </div>

                    </div>


                    {/* Task information */}

                    <div className="mt-6 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2 lg:grid-cols-4">

                      <DashboardField
                        label="Due"
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


                    {/* Buttons */}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                      <button
                        onClick={() =>
                          toggleTask(
                            task.id
                          )
                        }
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          task.completed
                            ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            : "bg-green-600 text-white hover:bg-green-500"
                        }`}
                      >
                        {task.completed
                          ? "✓ Completed — Mark as Pending"
                          : "Mark as Complete"}
                      </button>

                      <button
                        onClick={() =>
                          deleteTask(
                            task.id
                          )
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-400 transition hover:border-red-900 hover:bg-red-950/20 hover:text-red-400"
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}

        {/* =========================
            FOOTER
        ========================== */}

        <footer className="mt-auto pt-20 text-center text-sm text-slate-600">
          Screenshot → Understand → Extract → Action
        </footer>

      </div>
    </main>
  );
}
/* =========================
   FILE TO BASE64
========================== */

function fileToBase64(
  file: File
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        const result =
          reader.result;

        if (
          typeof result !==
          "string"
        ) {
          reject(
            new Error(
              "Could not read image."
            )
          );

          return;
        }

        const base64 =
          result.split(",")[1];

        if (!base64) {
          reject(
            new Error(
              "Could not convert image."
            )
          );

          return;
        }

        resolve(base64);
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Could not read image."
          )
        );
      };

      reader.readAsDataURL(file);
    }
  );
}


/* =========================
   CLEAN AI JSON
========================== */

function cleanJson(
  text: string
): string {
  return text
    .replace(
      /```json/g,
      ""
    )
    .replace(
      /```/g,
      ""
    )
    .trim();
}