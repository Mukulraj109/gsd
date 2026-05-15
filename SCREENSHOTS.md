# 📸 Screenshot Capture Guide

## Quick Reference: What to Capture

This guide shows exactly what to capture for each screenshot in the README.

### Setup Before Capturing
1. Start the dev server: `npm run dev`
2. Open http://localhost:3000 in Chrome/Firefox
3. Use browser zoom at 90% for better visibility
4. Make window 1920x1080 or 1440x900

---

## 1. Homepage (`homepage.png`)
**URL:** http://localhost:3000/

**What to capture:**
- Full page from top to bottom
- GSD logo and title
- Feature cards (Kanban Board, Team Directory, Automation)
- "View Task Board" and "Sign In" buttons
- Test credentials box at bottom

**Key elements:**
- FirstStep brand colors visible
- Professional landing page feel
- Call-to-action buttons prominent

---

## 2. Dashboard (`dashboard.png`)
**URL:** http://localhost:3000/dashboard

**What to capture:**
- Full dashboard page with sidebar visible
- 4 stat cards across top (Total Tasks, In Progress, Overdue, Completed)
- "My Tasks" section on left
- "Recent Activity" section on right

**Key elements:**
- All stats showing numbers
- Task cards with status badges
- Activity feed with avatars
- Header with search bar visible

---

## 3. Kanban Board - Full View (`board.png`)
**URL:** http://localhost:3000/board

**What to capture:**
- Wide shot showing all 4 columns: To Do, In Progress, Review, Done
- Multiple task cards in each column
- Board header with "Task Board" title and Filter button
- Sidebar navigation on left

**Key elements:**
- All columns visible (may need 90% zoom)
- Column headers with task counts
- Variety of task cards showing different features
- "Add Card" buttons at bottom of columns

---

## 4. Task Cards Detail (`board-cards.png`)
**URL:** http://localhost:3000/board

**What to capture:**
- Close-up of 2-3 task cards from In Progress or Review column
- Show cards with cover images, progress bars, multiple assignees

**Key elements:**
- Cover image on card (blue gradient)
- Progress bar showing percentage
- Multiple assignee avatars
- Comment and attachment counts
- Due date information
- Priority badges

---

## 5. Team Directory (`team.png`)
**URL:** http://localhost:3000/team

**What to capture:**
- Full team page
- Team table showing all columns (Name, Email, Role, Status, Active Tasks)
- Load Balance widget on right
- Top Contributors widget below it

**Key elements:**
- All 5 team members visible
- Role badges (Admin, Member)
- Status badges (Active, Pending)
- Load balance showing 7.4 average
- Top contributors with avatars
- Search bar and "Invite Member" button at top

---

## 6. Activity Timeline (`activity.png`)
**URL:** http://localhost:3000/activity

**What to capture:**
- Activity feed with multiple entries grouped by date
- "Activity Summary" widget on right
- "Most Active Members" widget on right

**Key elements:**
- TODAY section with recent activities
- YESTERDAY section visible
- Different activity types (status changes, comments, uploads)
- Automated badge visible on system actions
- Comment text displayed in grey box
- Activity summary stats

---

## 7. Settings - User Management (`settings-users.png`)
**URL:** http://localhost:3000/settings

**What to capture:**
- Settings page with User Management tab active
- User table with all 3 members
- "Invite Member" button in header

**Key elements:**
- Left sidebar with all 4 tabs (User Management selected)
- User table showing Name, Email, Role, Status columns
- Role badges (Admin, Editor, Viewer)
- Status badges (Active, Pending)
- Actions column with Edit links

---

## 8. Settings - Project Config (`settings-projects.png`)
**URL:** http://localhost:3000/settings
**Action:** Click "Project Config" tab

**What to capture:**
- Project Config tab content
- Categories section with badges
- Status Options with colored dots
- Priority Levels grid (4 cards)

**Key elements:**
- Categories: Marketing, Engineering, HR, Strategic badges
- Status options: Backlog, In Progress, Complete
- Priority grid showing Critical, High, Medium, Low
- "Add New" button visible
- "Edit Flow" button visible

---

## 9. Settings - Automation (`settings-automation.png`)
**URL:** http://localhost:3000/settings
**Action:** Click "Automation" tab

**What to capture:**
- Automation tab content
- 3 automation rules with toggle switches
- Email Templates section below

**Key elements:**
- Task Assignment (toggle ON)
- New Comments (toggle OFF)
- Status Changes (toggle ON)
- Each rule shows description
- Email Templates buttons
- Toggle switches clearly visible in different states

---

## 10. Login Page (`login.png`)
**URL:** http://localhost:3000/login

**What to capture:**
- Login card centered on page
- GSD logo at top
- Email and password fields
- "Forgot password?" link
- Social auth buttons (Google, GitHub)
- Test credentials box at bottom

**Key elements:**
- Clean, centered card design
- All form fields visible
- Social auth buttons with icons
- Test credentials clearly readable
- FirstStep brand colors on logo and buttons

---

## 11. Sign Up Page (`signup.png`)
**URL:** http://localhost:3000/signup

**What to capture:**
- Sign up card centered on page
- Full Name, Email, Password fields
- Password requirements text
- Terms & conditions checkbox
- Social auth buttons
- "Already have an account?" link

**Key elements:**
- Registration form with all fields
- Password requirements note
- Terms & Privacy links
- Social auth options
- "Create Account" button prominent

---

## File Naming Convention

Save all files as PNG with these exact names:
- `homepage.png`
- `dashboard.png`
- `board.png`
- `board-cards.png`
- `team.png`
- `activity.png`
- `settings-users.png`
- `settings-projects.png`
- `settings-automation.png`
- `login.png`
- `signup.png`

## After Capturing

1. Place all PNG files in `/screenshots/` directory
2. Verify all images are clear and readable
3. Commit to git: 
   ```bash
   git add screenshots/*.png
   git commit -m "docs: Add application screenshots"
   git push origin main
   ```

## Tools Recommended

- **macOS:** Cmd + Shift + 4 (drag to select area)
- **Windows:** Windows + Shift + S
- **Linux:** Flameshot or gnome-screenshot
- **Browser:** Chrome DevTools (Cmd/Ctrl + Shift + P → "Capture screenshot")

---

**Result:** Professional README with visual tour of all features! 🎉
