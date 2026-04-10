# PrepWise — AI Mock Interview Platform

An AI-powered mock interview platform built with Next.js, Firebase, Vapi, and Google Gemini.

## Features

- 🔐 Firebase Authentication (Email/Password)
- 🎙️ Voice interviews powered by Vapi AI
- 🤖 AI-generated interview questions via Google Gemini
- 📊 Detailed feedback and scoring after each interview
- 🔥 Firestore database for storing interviews and feedback

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Auth & DB**: Firebase (Auth + Firestore)
- **Voice AI**: Vapi AI (`@vapi-ai/web`)
- **AI/LLM**: Google Gemini via Vercel AI SDK (`@ai-sdk/google`)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd prepwise
npm install
```

### 2. Create `.env.local`

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

---

### 3. Firebase Setup

#### a) Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** and follow the steps

#### b) Enable Authentication
1. In your Firebase project → **Authentication** → **Get started**
2. Enable **Email/Password** provider

#### c) Enable Firestore
1. **Firestore Database** → **Create database**
2. Start in **test mode** (or configure rules for production)

#### d) Get Client Config (for frontend)
1. Project Settings → **Your apps** → Add a Web app
2. Copy the config values to your `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

#### e) Get Admin SDK Credentials (for server)
1. Project Settings → **Service accounts** → **Generate new private key**
2. Download the JSON file and extract values:
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### f) Add Firestore Indexes
You'll need composite indexes for these queries. Firebase will prompt you in the console when first running — just click the link it provides.

Required indexes:
- Collection: `interviews`, Fields: `userId ASC`, `createdAt DESC`
- Collection: `interviews`, Fields: `finalized ASC`, `userId ASC`, `createdAt DESC`

---

### 4. Vapi AI Setup

1. Sign up at [vapi.ai](https://vapi.ai)
2. Go to **Dashboard** → copy your **Public Key** (Web Token):
```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_public_key
```

3. Create a **Workflow** for interview generation:
   - The workflow should collect: job role, level, tech stack, type, and number of questions
   - On completion, it should call your `/api/vapi/generate` endpoint via a server URL action
   - Copy the Workflow ID:
```env
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id
```

#### Vapi Workflow Configuration
Your Vapi workflow should:
1. Greet the user and ask for job details (role, experience level, tech stack, interview type, number of questions)
2. Call a **Server URL** action: `POST https://yourdomain.com/api/vapi/generate` with body: `{ type, role, level, techstack, amount, userid }`

---

### 5. Google AI Setup

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create an API key
3. Add to `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
```

---

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
prepwise/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── layout.tsx
│   ├── (root)/
│   │   ├── interview/
│   │   │   ├── page.tsx              # Interview generation
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Take interview
│   │   │       └── feedback/page.tsx # View feedback
│   │   ├── page.tsx                  # Dashboard
│   │   └── layout.tsx
│   ├── api/vapi/generate/route.ts    # Generate questions API
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── Agent.tsx                     # Vapi voice agent
│   ├── AuthForm.tsx                  # Sign in/up form
│   ├── DisplayTechIcons.tsx          # Tech stack icons
│   ├── FormField.tsx                 # Form field wrapper
│   └── InterviewCard.tsx             # Interview card
├── constants/index.ts                # Vapi config, mappings, schemas
├── firebase/
│   ├── admin.ts                      # Firebase Admin SDK
│   └── client.ts                     # Firebase Client SDK
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts            # Auth server actions
│   │   └── general.action.ts         # Interview/feedback actions
│   ├── utils.ts                      # Utility functions
│   └── vapi.sdk.ts                   # Vapi instance
└── types/
    ├── index.d.ts                    # Global TypeScript types
    └── vapi.d.ts                     # Vapi type declarations
```

---

## How It Works

### Interview Generation Flow
1. User visits `/interview` → Vapi voice call starts
2. AI agent (via Vapi Workflow) asks user for job details
3. When call ends → Vapi calls `/api/vapi/generate` with collected data
4. Gemini generates tailored interview questions
5. Interview saved to Firestore → user redirected to dashboard

### Mock Interview Flow
1. User clicks an interview card → navigated to `/interview/[id]`
2. User starts voice call → Vapi agent conducts the interview using saved questions
3. Live transcript shown during call
4. When call ends → transcript sent to Gemini for analysis
5. Feedback (scores, strengths, improvements) saved to Firestore
6. User redirected to `/interview/[id]/feedback`

### Feedback Scoring (5 Categories, 0–100 each)
- Communication Skills
- Technical Knowledge
- Problem Solving
- Cultural Fit
- Confidence and Clarity

---

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Add all environment variables in your Vercel project settings.

**Important**: The `FIREBASE_PRIVATE_KEY` value must have literal `\n` characters — Vercel handles this automatically if you paste the full key with actual newlines.

---

## Firestore Security Rules (Production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /interviews/{interviewId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /feedback/{feedbackId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
