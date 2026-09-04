# Cloud Storage SaaS — Frontend

A Google Drive-style web client for the [Cloud Storage SaaS backend](https://github.com/tanzeem-source/Cloud-storage-SaaS-backend-). Built with Next.js and Tailwind CSS as part of a first internship project.

**Backend API:** https://cloud-storage-saa-s-backend.vercel.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Cookie-based sessions (JWT) + Google Sign-In |

---

## Features

### 🔐 Authentication
- Email/password signup and login
- Google Sign-In (via Google Identity Services)
- Session-aware redirects — logging in from a share link returns you to that link instead of the dashboard
- Clean history handling (`router.replace`) so the login/signup page never lingers in the browser's back button history

### 📁 File Explorer
- Google Drive-style grid layout for files and folders
- Breadcrumb navigation with support for deep nesting
- Create new folders directly from the dashboard
- Drag-and-drop file uploads with live per-file progress bars
- Toast notifications for upload success/failure
- File preview modal — inline rendering for images, PDFs, video, and audio; text files render their content directly; other types offer a direct download

### 🗑️ Trash
- Dedicated Trash view listing all soft-deleted files and folders
- Restore files/folders back to their original location
- Permanently delete files (removes the underlying storage object too)

### 🕓 Versioning
- Upload a new version of an existing file without losing history
- View full version history (size, date, version number) per file
- Restore any previous version, making it the current one

### 🔗 Sharing & Permissions
- Share modal for any file — invite by email with Viewer/Editor roles
- Change or revoke a collaborator's access at any time
- Generate public share links with configurable expiry
- Copy-to-clipboard for share links
- A dedicated `/share/[token]` landing page — handles login-gating, password-protected links, and inline preview/download for the shared item

### 🔍 Search & Performance
- Real-time, debounced search across your files
- Sort by name, size, or date (ascending/descending)
- Lightweight in-memory caching of folder contents (30s TTL), invalidated automatically after uploads/changes
- Lazy-loaded pagination ("Load more") for large file lists

### 📱 Responsive Design
- Fully responsive layout across mobile, tablet, and desktop
- Header, file grid, breadcrumbs, and modals all adapt to smaller screens

---

## Project Structure

```
client/
  src/
    app/
      login/            Login page
      signup/           Signup page
      dashboard/        Main file explorer
      trash/            Trash view
      share/[token]/    Public share link landing page
    components/         Reusable UI (modals, dropzone, breadcrumbs, etc.)
    lib/                API client, caching, upload helper, formatting utils, types
    hooks/              Custom hooks (e.g. useDebounce)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- The [backend](https://github.com/tanzeem-source/Cloud-storage-SaaS-backend-) running locally or deployed

### Setup

1. Clone and install:
   ```bash
   git clone https://github.com/tanzeem-source/Cloud-storage-SaaS-Frontend.git
   cd Cloud-storage-SaaS-Frontend
   npm install
   ```

2. Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```

3. Make sure the backend's `FRONTEND_URL` environment variable matches wherever this app runs (e.g. `http://localhost:3000` for local dev), so CORS and cookies work correctly.

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` — you'll land on the default Next.js page; go to `/signup` to create an account.

---

## Deployment

Deployed on **Vercel**. To deploy your own copy:
1. Import this repo into Vercel (repo root already matches the Next.js app root, no subfolder configuration needed)
2. Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` as environment variables
3. Deploy
4. Update the backend's `FRONTEND_URL` to point to the new deployed frontend URL

---

## Project Status

Days 8–13 complete: project setup, auth pages, dashboard UI, file upload/preview, sharing UI, search/sort/performance, Trash, and versioning. Backend (Days 1–7) is complete and deployed separately.

---

## License

This is a personal learning/internship project. No license specified yet.
