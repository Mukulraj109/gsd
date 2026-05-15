# GSD - Get Stuff Done

A professional task management application built for the FirstStep Team. Manage tasks, collaborate with your team, and track progress with our beautiful Kanban board.

![GSD Screenshot](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)

## 📸 Screenshots

### Homepage
![Homepage](screenshots/homepage.png)
*Welcome page with branding and quick access to sign in or view the task board*

### Dashboard
![Dashboard](screenshots/dashboard.png)
*Overview with stats, my tasks, and recent activity feed*

### Kanban Board
![Kanban Board](screenshots/board.png)
*Full Kanban board with 4 columns: To Do, In Progress, Review, and Done*

### Task Cards
![Task Cards Detail](screenshots/board-cards.png)
*Rich task cards with cover images, progress bars, assignees, comments, and due dates*

### Team Directory
![Team Directory](screenshots/team.png)
*Team members table with load balancing and top contributors*

### Activity Timeline
![Activity Feed](screenshots/activity.png)
*Complete activity timeline with comments, status changes, and system logs*

### Settings - User Management
![Settings Users](screenshots/settings-users.png)
*User management with roles (Admin, Editor, Viewer) and invite functionality*

### Settings - Project Configuration
![Settings Projects](screenshots/settings-projects.png)
*Project configuration with categories, status options, and priority levels*

### Settings - Automation
![Settings Automation](screenshots/settings-automation.png)
*Automation triggers with toggle switches for email notifications*

### Login Page
![Login](screenshots/login.png)
*Clean login page with social auth options and test credentials*

### Sign Up Page
![Sign Up](screenshots/signup.png)
*User registration with email/password and social auth options*

---

> **Note:** To add screenshots, capture images from http://localhost:3000 and save them to the `screenshots/` directory. See [screenshots/README.md](screenshots/README.md) for detailed instructions.

---

## 🚀 Features

### ✅ Complete Frontend

#### 📊 Dashboard
- **Overview Stats** - Total tasks, in progress, overdue, and completed counts
- **My Tasks Widget** - Personal task list with status and priority badges
- **Recent Activity Feed** - Team activity with avatars and timestamps
- **Quick Actions** - Easy access to create tasks and view board

#### 🎯 Kanban Board
- **4 Column Layout** - To Do, In Progress, Review, Done
- **Rich Task Cards** with:
  - Cover images for visual tasks
  - Progress bars (0-100%)
  - Assignee avatars (single or multiple)
  - Priority badges (High, Medium, Low)
  - Comment counts
  - Attachment indicators
  - Due dates with overdue highlighting
- **Task IDs** - Unique identifiers (GSD-XXX format)
- **Add Card Buttons** - Quick task creation in any column
- **Column Badges** - Task count per column
- **Filters** - By status, assignee, priority, project

#### 👥 Team Directory
- **Team Members Table** with columns:
  - Name with avatar
  - Email address
  - Role (Admin, Member, Viewer)
  - Status (Active, Pending)
  - Active task count
  - Actions menu
- **Load Balance Widget** - Average tasks per member (7.4)
- **Top Contributors** - Leaderboard with task counts
- **Invite Member** - User invitation functionality
- **Search & Filter** - Find team members quickly
- **Pagination** - Showing 5 of 24 members

#### ⚡ Activity Timeline
- **Grouped Timeline** - By date (Today, Yesterday, etc.)
- **Activity Types**:
  - Status changes with color coding
  - Priority updates
  - Task assignments (with automation badges)
  - Comments with full text display
  - File uploads with filenames
- **Activity Summary** - Stats for all activity types
- **Most Active Members** - Top contributors by actions
- **User Attribution** - Profile pictures and names

#### ⚙️ Settings (4 Tabs)
- **User Management**:
  - User table with role badges
  - Invite new members
  - Edit user roles (Admin, Editor, Viewer)
  - Status management (Active, Pending)
- **Project Configuration**:
  - Categories (Marketing, Engineering, HR, Strategic)
  - Status options with color indicators
  - Priority levels (Critical, High, Medium, Low)
  - Edit flow functionality
- **Automation Triggers**:
  - Task Assignment notifications (toggle)
  - Comment notifications (toggle)
  - Status change alerts (toggle)
  - Email template management
- **Security Settings**:
  - Two-factor authentication
  - Session timeout controls
  - Data export options

#### 🔐 Authentication
- **Login Page**:
  - Email/Password authentication
  - Social auth (Google, GitHub)
  - Forgot password link
  - Test credentials displayed
- **Sign Up Page**:
  - User registration form
  - Password requirements
  - Terms & Privacy acceptance
  - Social auth options

### 🎨 Design

#### FirstStep Brand Identity
- **Deep Blue (#0039A6)** - Primary actions, active navigation
- **Secondary Blue (#007BFF)** - Interactive elements, In Progress status
- **Navy (#1B2559)** - All headings and titles
- **Background Grey (#F4F7FE)** - Page canvas
- **Border Grey (#E2E8F0)** - Card dividers, table borders
- **Success Green (#05CD99)** - Done status, success states
- **Warning Amber (#FFB547)** - Review status, medium priority
- **Error Red (#EE5D50)** - High priority, overdue dates

#### UI/UX Features
- **Responsive Layout** - Desktop and tablet optimized
- **Professional Components** - Built with Radix UI primitives
- **Inter Font** - Modern, readable typography
- **Consistent Spacing** - 4px, 8px, 12px, 16px grid
- **Smooth Transitions** - Hover states and animations
- **Accessible** - WCAG AA compliant colors and contrast
- **Icon System** - Lucide React icons throughout

### 🏗️ Technical Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (Prisma ORM) — use [Render PostgreSQL](https://render.com/docs/databases) or any `postgresql://` host in production
- **State Management:** Zustand (ready for integration)
- **UI Components:** Radix UI
- **Authentication:** NextAuth.js (credentials, JWT sessions, protected routes)
- **Icons:** Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gsd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Create a `.env.local` file (see also [`.env.example`](.env.example)):
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/gsd"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-long-random-secret"
   ```
   
   Use a local PostgreSQL instance, Docker, or a free-tier hosted DB. The app does **not** use SQLite.

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## ☁️ Deploying on Render (PostgreSQL)

1. Create a **PostgreSQL** instance on Render and copy its **Internal Database URL** (same region as your web service is recommended).
2. Create a **Web Service** from this repo. Set environment variables (see [`.env.render.example`](.env.render.example)):
   - `DATABASE_URL` — Internal PostgreSQL URL from step 1 (or use Render’s “Link database” so it is injected automatically).
   - `NEXTAUTH_URL` — Your service URL, e.g. `https://your-service.onrender.com` (HTTPS, no trailing slash).
   - `NEXTAUTH_SECRET` — Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
3. **Build command** (example):
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
4. **Start command:** `npm run start`
5. **Demo data (admin / member users):** Render’s **free web tier does not include Shell / SSH**, so you cannot run commands in the dashboard terminal. Use **one** of these:
   - **From your laptop (works on free tier):** In Render → your **PostgreSQL** → copy the **External Database URL** (enable external access if asked). On your machine, from this repo:
     ```bash
     set DATABASE_URL=paste-external-url-here
     npm install
     npm run db:migrate
     npm run db:seed
     ```
     On macOS/Linux use `export DATABASE_URL='…'` instead of `set`. Run **`db:seed` only once** for a fresh database (it creates sample projects/tasks; re-running can duplicate rows).
   - **Paid Starter web instance:** Shell is available; then you can `npm run db:migrate` and `npm run db:seed` there instead.

Migrations should already run during **build** if your build command includes `npx prisma migrate deploy` (see step 3). Seeding still requires a machine with `DATABASE_URL` (local or Shell).

**Health check:** `GET /api/health` returns JSON `{ "ok": true, "database": true }` when PostgreSQL is reachable (use for Render uptime monitors).

## 👥 Test Credentials

The database is pre-seeded with test accounts:

- **Admin Account**
  - Email: `admin@gsd.com`
  - Password: `password123`

- **Member Account**
  - Email: `member@gsd.com`
  - Password: `password123`

## 📁 Project Structure

```
gsd/
├── app/                      # Next.js App Router
│   ├── (app)/               # Protected app routes
│   │   ├── dashboard/       # Dashboard page
│   │   ├── board/           # Kanban board
│   │   ├── team/            # Team directory
│   │   ├── activity/        # Activity feed
│   │   └── settings/        # Settings panel
│   ├── (auth)/              # Auth pages
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   └── api/                 # API routes (ready for implementation)
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── layout/              # Layout components (Sidebar, Header)
│   ├── board/               # Kanban board components
│   ├── task/                # Task components
│   ├── team/                # Team components
│   └── settings/            # Settings components
├── lib/                     # Utility functions
├── store/                   # Zustand stores
├── prisma/                  # Database schema and migrations
└── public/                  # Static assets
```

## 🎨 Design System

### FirstStep Brand Colors

```css
Primary (Deep Blue):     #0039A6
Secondary (Blue):        #007BFF
Heading (Navy):          #1B2559
Background (Grey):       #F4F7FE
Border (Grey):           #E2E8F0
Text:                    #4A5568
Muted Text:              #A3AED0
Success (Green):         #05CD99
Warning (Amber):         #FFB547
Error (Red):             #EE5D50
```

### Typography
- **Font Family:** Inter
- **Headings:** Navy (#1B2559), Semi-bold
- **Body:** Grey (#4A5568)

## 📱 Available Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with branding |
| `/login` | Sign in page |
| `/signup` | User registration |
| `/dashboard` | Overview with stats |
| `/board` | Kanban board |
| `/team` | Team directory |
| `/activity` | Activity timeline |
| `/settings` | Settings panel |

## 🗃️ Database Schema

Includes these models:
- **User** - Authentication and roles
- **Task** - Tasks with status, priority, position
- **Project** - Task categorization
- **Comment** - Task comments
- **Attachment** - File attachments
- **ActivityLog** - Audit trail
- **AutomationRule** - Email triggers

## 📊 Current Status

### ✅ Completed
- Complete frontend UI for all pages
- FirstStep brand colors applied
- Database schema and migrations
- Seed data with test accounts
- UI component library
- Navigation structure

### ⏳ Ready for Implementation
- API route implementations
- NextAuth integration
- Drag-drop functionality
- Task CRUD operations
- Real-time updates
- File uploads
- Email notifications

## 🧪 Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production

# Database
npx prisma studio        # Database GUI
npx prisma migrate dev   # Create migration
npx tsx prisma/seed.ts   # Seed database
```

## 📚 Documentation

- [Navigation Guide](./NAVIGATION.md) - Complete page guide
- [Implementation Plan](./.claude/plans/) - Development plan

## 🤝 Contributing

Private project for FirstStep Team.

## 📝 License

Copyright © 2026 FirstStep Team. All rights reserved.

---

**Built with ❤️ for the FirstStep Team**
