# StudyPack

**StudyPack** is an AI-powered study tool that transforms your PDFs and Word documents into flashcards, quizzes, and interactive study sessions — instantly.

**Live app:** [studypack-brown.vercel.app](https://studypack-brown.vercel.app)

---
## Screenshots

<table>
  <tr>
    <th>Sign Up</th>
    <th>Login</th>
  </tr>
  <tr>
    <td><img width="500" alt="signup" src="https://github.com/user-attachments/assets/db9150c4-4a08-4742-a925-7afedb119a4d" /></td>
    <td><img width="500" alt="login" src="https://github.com/user-attachments/assets/9b68ae42-6e95-40bd-8264-296569dd6870" /></td>
  </tr>
  <tr>
    <th>Light Theme</th>
    <th>Dark Theme</th>
  </tr>
  <tr>
    <td><img width="500" alt="light" src="https://github.com/user-attachments/assets/8eed3daa-eac8-44de-a50e-f45d6d67cc8d" /></td>
    <td><img width="500" alt="dark" src="https://github.com/user-attachments/assets/b298957c-088f-4866-92f1-2d4886b71c10" /></td>
  </tr>
  <tr>
    <th>Generating Flashcards/Quiz</th>
    <th>Generated</th>
  </tr>
  <tr>
    <td><img width="500" alt="generating" src="https://github.com/user-attachments/assets/d5325877-10f5-4902-bb59-e2459b62aa4a" /></td>
    <td><img width="500" alt="generated" src="https://github.com/user-attachments/assets/932a32a6-5768-47e6-83f1-9a9d57440e7f" /></td>
  </tr>
  <tr>
    <th>Flashcard — Question</th>
    <th>Flashcard — Answer</th>
  </tr>
  <tr>
    <td><img width="500" alt="flashcard question" src="https://github.com/user-attachments/assets/74b0e08e-19d0-4678-8108-a7742ee2840a" /></td>
    <td><img width="500" alt="flashcard answer" src="https://github.com/user-attachments/assets/8ba2f7da-c28f-4616-b7bc-7eb878fd7b65" /></td>
  </tr>
  <tr>
    <th>Quiz — Correct Answer</th>
    <th>Quiz — Wrong Answer</th>
  </tr>
  <tr>
    <td><img width="500" alt="quiz correct" src="https://github.com/user-attachments/assets/cfc47cee-b850-44d8-a7d0-ef155439c011" /></td>
    <td><img width="500" alt="quiz wrong" src="https://github.com/user-attachments/assets/1ef33b1d-39f7-457d-90b3-b5e8e53514b4" /></td>
  </tr>
  <tr>
    <th>Past Quiz Scores</th>
    <th>Chat with AI</th>
  </tr>
  <tr>
    <td><img width="500" alt="past quiz scores" src="https://github.com/user-attachments/assets/8501a1d8-a368-497e-8696-86b2aa02db1a" /></td>
    <td><img width="500" alt="chat with ai" src="https://github.com/user-attachments/assets/c15963f3-d04a-4fb0-a1f8-3ca896bfc3ad" /></td>
  </tr>
</table>

---

## Features

### Upload & Generate
Upload a PDF or DOCX file and StudyPack automatically extracts the content and generates:
- **10–20 flashcards** tailored to the material
- **8–12 multiple-choice quiz questions** with explanations

### Flashcards
Flip through your generated flashcard deck at your own pace, with smooth card-flip animations.

### Spaced Repetition Review
A smart review mode powered by the **SM-2 algorithm**. Cards are scheduled based on how well you know them — rate each card as Easy, Good, or Hard, and the system adjusts your next review date accordingly.

### Quiz Mode
Test your knowledge with auto-generated multiple-choice quizzes. Scores are saved so you can track improvement over time with a full quiz history per study set.

### AI Chat
Chat directly with your study material. Ask questions, request summaries, or quiz yourself — the AI is grounded in your uploaded content only.

### Study Streaks
Stay motivated with daily study streaks. Your current and longest streaks are tracked and displayed on your dashboard.

### Export to PDF
Export your flashcards and quiz questions as a formatted PDF to study offline or share with classmates.

### Public Share
Share any study set via a public link — no login required for viewers.

### Themes
Choose between three themes: **Pink** (default), **Light**, and **Dark**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Auth & Database | Supabase (Postgres + Storage) |
| AI | Groq (`llama-3.3-70b-versatile`) |
| Document Parsing | `pdf-parse`, `mammoth` |
| PDF Export | `jsPDF` |
| Themes | `next-themes` |

