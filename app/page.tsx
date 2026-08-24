"use client";

import { useEffect, useState } from "react";

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

function DashboardField({
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

      <p className="mt-1 text-sm text-slate-200">
        {value}
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

      <p className="mt-1 text-base text-slate-200">
        {value || "Not detected"}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
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
  const [image, setImage] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);

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

  // Load saved tasks
  useEffect(() => {
    const savedTasks = localStorage.getItem(
      "screenshot-action-tasks"
    );

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error(
          "Could not load saved tasks:",
          error
        );
      }
    }
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    localStorage.setItem(
      "screenshot-action-tasks",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  // Handle screenshot upload
  const handleFileChange = (
    selectedFile: File | undefined
  ) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError("");
    setResult(null);
    setFile(selectedFile);

    const imageUrl =
      URL.createObjectURL(selectedFile);

    setImage(imageUrl);
  };

  // Analyze screenshot
  const analyzeScreenshot = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const base64 =
        await fileToBase64(file);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
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
          data.error ||
            "Analysis failed."
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
          "The AI returned an invalid response."
        );
      }

      setResult(parsedResult);
    } catch (err) {
      console.error(err);

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
  };

  // Add AI result to tasks
  const addTask = () => {
    if (!result) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: result.title,
      description: result.description,
      date: result.date,
      time: result.time,
      source: result.source,
      urgency: result.urgency,
      action: result.action,
      completed: false,
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);

    alert("Task added successfully!");
  };
    return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">

        {/* =========================
            NAVIGATION
        ========================== */}

        <nav className="mb-12 flex items-center justify-between">

          <button
            onClick={() =>
              setActivePage("home")
            }
            className="text-xl font-bold tracking-tight"
          >
            Screenshot{" "}
            <span className="text-blue-500">
              →
            </span>{" "}
            Action
          </button>

          <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1">

            <button
              onClick={() =>
                setActivePage("home")
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activePage === "home"
                  ? "bg-blue-600 text-white"
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
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              My Actions
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
                  className="flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-10 text-center transition hover:border-blue-500 hover:bg-slate-900"
                >

                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-4xl">
                    📸
                  </div>

                  <h2 className="text-2xl font-semibold">
                    Drop your screenshot here
                  </h2>

                  <p className="mt-3 text-slate-400">
                    or click to browse from your computer
                  </p>

                  <span className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500">
                    Choose Screenshot
                  </span>

                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleFileChange(
                        event.target.files?.[0]
                      )
                    }
                  />

                  <p className="mt-5 text-xs text-slate-500">
                    PNG, JPG, JPEG, WEBP
                  </p>

                </label>

              ) : (

                <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">

                  {/* Image header */}

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <h2 className="text-xl font-semibold">
                        Screenshot uploaded
                      </h2>

                      <p className="text-sm text-slate-400">
                        Ready for AI analysis
                      </p>
                    </div>

                    <button
                      onClick={removeImage}
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                    >
                      Remove
                    </button>

                  </div>


                  {/* Image preview */}

                  <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">

                    <img
                      src={image}
                      alt="Uploaded screenshot"
                      className="max-h-[600px] w-full object-contain"
                    />

                  </div>


                  {/* Analyze button */}

                  {!result && (

                    <button
                      onClick={analyzeScreenshot}
                      disabled={loading}
                      className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "AI is analyzing..."
                        : "Analyze Screenshot →"}
                    </button>

                  )}


                  {/* Error */}

                  {error && (

                    <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                      {error}
                    </div>

                  )}


                  {/* =========================
                      AI RESULT
                  ========================== */}

                  {result && (

                    <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950 p-6">

                      <div className="mb-6 flex items-center justify-between">

                        <div>

                          <p className="text-sm font-medium text-blue-400">
                            AI DETECTED
                          </p>

                          <h2 className="mt-1 text-2xl font-bold">
                            {result.type}
                          </h2>

                        </div>

                        <div className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                          {Math.round(
                            result.confidence * 100
                          )}
                          % confidence
                        </div>

                      </div>


                      <div className="space-y-5">

                        <ResultField
                          label="Title"
                          value={result.title}
                        />

                        <ResultField
                          label="Description"
                          value={result.description}
                        />

                        {result.date && (
                          <ResultField
                            label="Date"
                            value={result.date}
                          />
                        )}

                        {result.time && (
                          <ResultField
                            label="Time"
                            value={result.time}
                          />
                        )}

                        <ResultField
                          label="Source"
                          value={result.source}
                        />

                        <ResultField
                          label="Urgency"
                          value={result.urgency}
                        />

                        <ResultField
                          label="Recommended Action"
                          value={result.action}
                        />


                        {/* Required items */}

                        {result.requiredItems &&
                          result.requiredItems.length > 0 && (

                            <div>

                              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Required Items
                              </p>

                              <ul className="mt-2 space-y-2">

                                {result.requiredItems.map(
                                  (item, index) => (

                                    <li
                                      key={index}
                                      className="rounded-lg bg-slate-900 px-4 py-2 text-slate-200"
                                    >
                                      • {item}
                                    </li>

                                  )
                                )}

                              </ul>

                            </div>

                          )}

                      </div>


                      {/* Add to Tasks */}

                      <button
                        className="mt-8 w-full rounded-xl bg-green-600 px-6 py-4 font-semibold transition hover:bg-green-500"
                        onClick={addTask}
                      >
                        ✓ Add to Tasks
                      </button>

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

                <div className="mb-6">

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


                <div className="space-y-4">

                  {tasks.map((task) => (

                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-700 bg-slate-900 p-6"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="mb-2 inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                            TASK
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
                            <p className="mt-2 text-sm text-slate-400">
                              {task.description}
                            </p>
                          )}

                        </div>

                        <div className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                          {task.urgency}
                        </div>

                      </div>


                      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">

                        {task.date && (
                          <DashboardField
                            label="Due"
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

                        {task.action && (
                          <DashboardField
                            label="Action"
                            value={task.action}
                          />
                        )}

                      </div>


                      {/* Complete */}

                      <button
                        onClick={() => {
                          setTasks(
                            (previousTasks) =>
                              previousTasks.map(
                                (item) =>
                                  item.id === task.id
                                    ? {
                                        ...item,
                                        completed:
                                          !item.completed,
                                      }
                                    : item
                              )
                          );
                        }}
                        className={`mt-6 w-full rounded-xl px-5 py-3 font-semibold transition ${
                          task.completed
                            ? "bg-slate-700 text-slate-300"
                            : "bg-green-600 text-white hover:bg-green-500"
                        }`}
                      >
                        {task.completed
                          ? "✓ Completed"
                          : "Mark as Complete"}
                      </button>


                      {/* Delete */}

                      <button
                        onClick={() => {
                          setTasks(
                            (previousTasks) =>
                              previousTasks.filter(
                                (item) =>
                                  item.id !== task.id
                              )
                          );
                        }}
                        className="mt-2 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
                      >
                        🗑️ Delete Task
                      </button>

                    </div>

                  ))}

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
                value={tasks.length}
              />

              <StatCard
                label="Pending"
                value={
                  tasks.filter(
                    (task) => !task.completed
                  ).length
                }
              />

              <StatCard
                label="Completed"
                value={
                  tasks.filter(
                    (task) => task.completed
                  ).length
                }
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
                    setActivePage("home")
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500"
                >
                  Analyze Screenshot
                </button>

              </div>

            ) : (

              <div className="space-y-4">

                {tasks.map((task) => (

                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-700 bg-slate-900 p-6"
                  >

                    {/* Task header */}

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                          TASK
                        </span>

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
                          <p className="mt-2 text-slate-400">
                            {task.description}
                          </p>
                        )}

                      </div>


                      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                        {task.urgency}
                      </span>

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

                    <div className="mt-6 flex gap-3">

                      <button
                        onClick={() => {
                          setTasks(
                            (previousTasks) =>
                              previousTasks.map(
                                (item) =>
                                  item.id === task.id
                                    ? {
                                        ...item,
                                        completed:
                                          !item.completed,
                                      }
                                    : item
                              )
                          );
                        }}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          task.completed
                            ? "bg-slate-700 text-slate-300"
                            : "bg-green-600 text-white hover:bg-green-500"
                        }`}
                      >
                        {task.completed
                          ? "✓ Completed"
                          : "Mark as Complete"}
                      </button>


                      <button
                        onClick={() => {
                          setTasks(
                            (previousTasks) =>
                              previousTasks.filter(
                                (item) =>
                                  item.id !== task.id
                              )
                          );
                        }}
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-400 transition hover:border-red-900 hover:text-red-400"
                      >
                        Delete
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
      const reader = new FileReader();

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