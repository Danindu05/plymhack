# CleanPulse

**CleanPulse** is a verified waste reporting and fast resolution tracking platform designed to support **SDG 11.6** (Sustainable Cities and Communities). It empowers citizens to report environmental hazards like waste, pollution, and infrastructure issues, which are then verified, prioritized, and tracked for resolution.

## 🚀 Key Features

*   **Citizen Reporting Portal**: Report issues with precise location, photos, and severity levels.
*   **Smart Prioritization**: Automated priority scoring based on category severity, time elapsed, and community verification.
*   **Interactive Map**: Visualize reported issues on a dynamic map with clustering and filtering.
*   **Verification System**: Community-driven verification (Still There / Cleaned) updates issue status and priority.
*   **Sustainable Living Index**: Analyze urban areas for habitability based on air quality (AQI) and other metrics.
*   **Admin Dashboard**: Manage reports, view AI summaries, and track resolution progress.

## 🛠️ Technology Stack

### Frontend
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism UI
*   **Maps**: [Leaflet](https://leafletjs.com/) / React-Leaflet
*   **Animations**: CSS Animations & Transitions

### Backend & Services
*   **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
*   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
*   **Storage**: [AWS S3](https://aws.amazon.com/s3/) (Direct upload via presigned URLs)
*   **AI Integration**: Gemini API (for summaries & recommendations)
*   **External APIs**: Open-Meteo (Air Quality Data)

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── api/              # API Routes (e.g., S3 signing)
│   ├── admin/            # Admin dashboard
│   ├── issue/[id]/       # Issue detail view
│   ├── login/            # Authentication
│   ├── map/              # Full-screen map view
│   ├── report/           # Issue reporting form
│   ├── sustainable-living/ # Living index analysis
│   └── layout.tsx        # Root layout with Navbar
├── components/           # Reusable UI components
│   ├── IssueForm.tsx     # Main reporting form logic
│   ├── LivingMap.tsx     # Map for sustainable living index
│   ├── MapComponent.tsx  # Core map visualization
│   └── ...
├── lib/                  # Utilities and Configuration
│   ├── firebase.ts       # Firebase initialization
│   ├── util.ts           # Helper functions & Priority Logic
│   └── s3.ts             # AWS S3 configuration
└── public/               # Static assets
```

## 🧠 Core Logic

### Priority Scoring (`lib/util.ts`)
Issues are automatically prioritized to help response teams focus on critical problems. The score is calculated as:

```typescript
Priority Score = CategoryWeight + (Severity * 2) + VerificationWeight + TimeWeight
```
*   **CategoryWeight**: Ranges from 2 (Other) to 6 (Garbage/Waste).
*   **Severity**: User-reported severity (1-5).
*   **VerificationWeight**: Increases if "Still There" is confirmed; decreases if marked "Cleaned".
*   **TimeWeight**: Increases over time to prevent old issues from being ignored (capped at 8 hours).

## ⚡ Setup & Installation

### Prerequisites
*   Node.js (LTS recommended)
*   pnpm (or npm/yarn)
*   Firebase Project
*   AWS S3 Bucket

### 1. Clone & Install
```bash
git clone <repository-url>
cd cleanpulse
pnpm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory and add:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# AWS S3
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...

# Other
NEXT_PUBLIC_OPENWEATHER_API_KEY=... # For Air Quality Data
```

### 3. Run Locally
```bash
pnpm dev
# App runs at http://localhost:3000
```

## 📝 Usage Guide

1.  **Register/Login**: Create an account to report issues.
2.  **Submit Report**: Go to `/report`, grant location access, take a photo, and describe the issue.
3.  **Verify**: Visit `/issue/[id]` to confirm if an issue is resolved or still present.
4.  **Explore**: Use the Map and Sustainable Living pages to interact with data.

---
*Built for the PlymHack 4.0 | Sustainable Cities & Communities*
