# StudyPack

**StudyPack** is an AI-powered study tool that transforms your PDFs and Word documents into flashcards, quizzes, and interactive study sessions — instantly.

**Live app:** [studypack-brown.vercel.app](https://studypack-brown.vercel.app)

---

## Screenshots
Sign Up/Login Page
      <table>                                                                                                                           
    <tr>                                                                                                                            
      <td><img width="500" alt="signup" src="https://github.com/user-attachments/assets/db9150c4-4a08-4742-a925-7afedb119a4d"       
  /></td>                                                                                                                           
      <td><img width="500" alt="login" src="https://github.com/user-attachments/assets/9b68ae42-6e95-40bd-8264-296569dd6870" /></td>
    </tr>                                                                                                                           
  </table>   
<!-- Theme switcher (pink / light / dark) -->
<!-- Dashboard -->
<!-- Flashcard deck -->
<!-- Quiz mode -->
<!-- AI chat -->
<!-- Spaced repetition review -->

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

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

| Table | Key Columns |
|---|---|
| `study_sets` | `id`, `user_id`, `title`, `extracted_text`, `source_file_url` |
| `flashcards` | `id`, `study_set_id`, `question`, `answer`, `interval_days`, `ease_factor`, `next_review_date` |
| `quiz_questions` | `id`, `study_set_id`, `question`, `option_a–d`, `correct_answer`, `explanation` |
| `quiz_results` | `id`, `study_set_id`, `user_id`, `score`, `total` |
| `user_streaks` | `user_id`, `current_streak`, `longest_streak`, `last_studied_date` |

All tables are protected with Supabase Row Level Security (RLS).

---

## Project Structure

```
studypack/
├── app/
│   ├── dashboard/         # Main dashboard
│   ├── upload/            # File upload & generation
│   ├── study-sets/[id]/   # Flashcards, quiz, review, chat
│   └── api/               # API routes (generate, chat, streak, review…)
├── components/
│   ├── auth/              # Login / signup form
│   ├── dashboard/         # Hero, study set list
│   └── …                  # Navbar, ThemeToggle, FlashcardDeck, QuizPlayer, ChatInterface…
└── lib/
    ├── supabase/          # Browser + server Supabase clients
    ├── extractor.ts       # PDF/DOCX text extraction
    └── generator.ts       # Groq flashcard & quiz generation
```
