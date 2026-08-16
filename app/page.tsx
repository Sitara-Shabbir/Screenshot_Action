"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
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

        {/* Upload Area */}
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
                  onClick={() => setImage(null)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Remove
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                <img
                  src={image}
                  alt="Uploaded screenshot"
                  className="max-h-[600px] w-full object-contain"
                />
              </div>

              <button
                className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-500"
                onClick={() => alert("AI analysis will be connected next!")}
              >
                Analyze Screenshot →
              </button>
            </div>
          )}
        </section>

        {/* Feature Preview */}
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