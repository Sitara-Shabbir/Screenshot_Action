# 📸 Screenshot → Action

**Turn screenshots into actionable tasks — not just saved images.**

We take screenshots every day: WhatsApp messages, emails, assignments, booking confirmations, deadlines, notes, and reminders.

But a screenshot only stores information. **It doesn't help you act on it.**

**Screenshot → Action** uses AI to understand the content of a screenshot and convert it into structured, actionable information such as tasks, deadlines, dates, times, and reminders.

---

## 🚨 The Problem

Important information is often buried inside screenshots.

For example:

> "Please send me the report by Friday at 5 PM."

Normally, you might save the screenshot and hope you remember it later.

Instead, Screenshot → Action can turn it into:

```text
TASK
Send the report

DEADLINE
Friday, 5:00 PM

REMINDER
Set a reminder

STATUS
Pending
```

The idea is simple:

**Screenshot → Understand → Organize → Take Action**

---

## ✨ Features

### 📷 Screenshot Analysis

Upload a screenshot and let AI understand what's inside it.

### 🤖 AI-Powered Extraction

The application can identify actionable information from different types of screenshots, including:

* WhatsApp conversations
* Emails
* Messages
* Assignments
* Event information
* Booking confirmations
* Notes
* Deadlines

### ✅ Automatic Task Detection

The app identifies what action needs to be taken and converts it into a task.

### 📅 Deadline & Date Detection

Important dates and deadlines can be extracted from the screenshot.

### ⏰ Time Detection

If a specific time is mentioned, the application can identify it as part of the actionable information.

### 🔔 Reminders

Users can set reminders for important tasks and deadlines instead of relying on memory.

### 📌 Source & Context

The extracted action can include context about where the information came from, such as a message, email, or other screenshot content.

### 📊 Task Status

Actions can be organized by status, such as:

* Pending
* Completed

### 💾 Local Storage

Tasks can be stored locally so they remain available when the user returns to the application.

---

## 🧠 How It Works

```text
        ┌─────────────────┐
        │  Upload Image   │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   AI Analysis   │
        └────────┬────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ Extract Information  │
      │                      │
      │ • Task               │
      │ • Deadline           │
      │ • Date               │
      │ • Time               │
      │ • Context            │
      └──────────┬───────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Create Action   │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Set Reminder 🔔 │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Complete Task ✓ │
        └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* TypeScript

### AI

* Google Gemini API

### Storage

* Browser Local Storage

### Development Tools

* Node.js
* npm
* Git
* GitHub
* Vercel

---

## 📁 Project Structure

```text
screenshot-to-action/
│
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── public/
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Open the project

```bash
cd screenshot-to-action
```

### 3. Install dependencies

```bash
npm install
```

### 4. Add your environment variable

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

**Never commit your API key to GitHub.**

Make sure `.env.local` is included in `.gitignore`.

### 5. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🌐 Deployment

The project can be deployed using **Vercel**.

Basic deployment flow:

```text
GitHub Repository
       ↓
     Vercel
       ↓
Add GEMINI_API_KEY
       ↓
    Deploy 🚀
```

When deploying on Vercel, add:

```text
GEMINI_API_KEY
```

under your project's **Environment Variables**.

---

## 🔐 Environment Variables

The application requires:

| Variable         | Description                             |
| ---------------- | --------------------------------------- |
| `GEMINI_API_KEY` | API key used for AI screenshot analysis |

Do not expose this key in frontend code or commit it to the repository.

---

## 🎯 Example Use Cases

### 💬 WhatsApp Message

**Screenshot:**

> "Can you send me the assignment tomorrow?"

**Action:**

```text
Task: Send the assignment
Deadline: Tomorrow
Reminder: Yes
Status: Pending
```

### 📧 Email

**Screenshot:**

> "Meeting scheduled for Monday at 10 AM."

**Action:**

```text
Event: Meeting
Date: Monday
Time: 10:00 AM
Reminder: Set reminder
```

### 📚 Assignment

**Screenshot:**

> "Submit AI project report before September 2."

**Action:**

```text
Task: Submit AI project report
Deadline: September 2
Status: Pending
```

---

## 💡 Why I Built It

The inspiration behind Screenshot → Action is a simple observation:

**People don't have an information problem. They have an action problem.**

We already save important information through screenshots.

The challenge is remembering what to do with it.

This project explores how AI can bridge that gap by turning unstructured visual information into structured actions.

---

## 🔮 Future Improvements

Some ideas for future versions include:

* 🔔 Browser notifications
* 📱 Mobile application
* 📅 Google Calendar integration
* 🔄 Automatic recurring reminders
* 🧠 Better context understanding
* 🌍 Multi-language screenshot support
* 🎙️ Voice-based actions
* 🗂️ Categories and tags
* ☁️ Cloud synchronization
* 👥 Shared tasks
* 📊 Productivity dashboard
* 📧 Direct email/task integrations

---

## 👩‍💻 Author

**Sitara Shabbir**

BS Artificial Intelligence Student

Built as an AI-focused capstone project to explore how artificial intelligence can solve everyday productivity problems.

---

## ⭐ Support

If you find the project interesting, consider giving the repository a ⭐ on GitHub.

---

**Screenshot → Action**

> **Don't just save information. Turn it into action. 🚀**
