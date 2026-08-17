"use client";

import { useState } from "react";

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
};

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError("");
    setResult(null);
    setFile(selectedFile);

    const imageUrl = URL.createObjectURL(selectedFile);
    setImage(imageUrl);
  };

  const analyzeScreenshot = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
          mimeType: file.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      let parsedResult: AnalysisResult;

      try {
        parsedResult = JSON.parse(cleanJson(data.result));
      } catch {
        console.error("Raw AI response:", data.result);
        throw new Error("The AI returned an invalid response.");
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

  const removeImage = () => {
    setImage(null);
    setFile(null);
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">

        {/* Header */}
        <header className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
            AI-powered screenshot intelligence
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Screenshot
            <span className="text-blue-500"> → </span>
            Action
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Turn passive screenshots into actionable information.
            Upload a screenshot and let AI understand what needs to happen next.
          </p>
        </header>

        {/* Upload */}
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
                  handleFileChange(event.target.files?.[0])
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

              {/* Image */}
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
                    ? "🧠 AI is analyzing..."
                    : "Analyze Screenshot →"}
                </button>
              )}

              {/* Error */}
              {error && (
                <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* AI Result */}
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
                      {Math.round(result.confidence * 100)}% confidence
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

                  </div>

                  <button
                    className="mt-8 w-full rounded-xl bg-green-600 px-6 py-4 font-semibold transition hover:bg-green-500"
                    onClick={() => alert("Task saving will be added next!")}
                  >
                    ✓ Add to Tasks
                  </button>

                </div>
              )}

            </div>
          )}

        </section>

        {/* Features */}
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

        <footer className="mt-auto pt-20 text-center text-sm text-slate-600">
          Screenshot → Understand → Extract → Action
        </footer>

      </div>
    </main>
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
      <div className="mb-4 text-3xl">{icon}</div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Could not read image."));
        return;
      }

      const base64 = result.split(",")[1];

      if (!base64) {
        reject(new Error("Could not convert image."));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("Could not read image."));
    };

    reader.readAsDataURL(file);
  });
}

function cleanJson(text: string): string {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}