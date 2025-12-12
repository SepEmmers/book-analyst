# Deploying your App

Congratulations! Your app is ready for the world.
We effectively built a Single Page Application (SPA). For these types of apps, specialized hosts like **Vercel** or **Netlify** are perfect (and free for hobby projects), because they handle routing correctly out of the box.

## Recommended: Vercel

Vercel is the easiest place to deploy React/Vite apps.

1.  **Create a GitHub Repository**:
    *   Initialize git in your folder if you haven't: `git init`
    *   Add files: `git add .`
    *   Commit: `git commit -m "Initial commit"`
    *   Push to a new GitHub repo.

2.  **Sign up for Vercel**: Go to [vercel.com](https://vercel.com) and login with GitHub.

3.  **Import Project**:
    *   Click "Add New Project".
    *   Select your GitHub repository.

4.  **Environment Variables** (Crucial!):
    *   In the Vercel deploy screen, look for "Environment Variables".
    *   Add `VITE_SUPABASE_URL` -> (Your URL)
    *   Add `VITE_SUPABASE_ANON_KEY` -> (Your Key)
    *   *You can find these in your local `.env` file.*

5.  **Deploy**: Click "Deploy". Vercel automatically detects it's a Vite app and builds it.

## Alternative: Netlify

Netlify is also excellent.

1.  **Sign up**: [netlify.com](https://netlify.com).
2.  **Add new site**: "Import from Git".
3.  **Build Settings**:
    *   Build command: `npm run build`
    *   Publish directory: `dist`
4.  **Environment Variables**:
    *   Go to "Site settings" -> "Environment variables".
    *   Add your Supabase keys there.
5.  **Redirects**:
    *   Netlify might need a `_redirects` file in your `public` folder containing `/* /index.html 200` to support refreshing on subpages (like `/profile`). Automation usually handles this, but keep it in mind.

## Why not GitHub Pages?
GitHub Pages is great for static HTML, but for apps like this (SPA) where we have routes (like `/profile` or `/?id=...`), GitHub Pages often gives "404 Not Found" errors on refresh because it doesn't know to send all traffic to `index.html`. Vercel/Netlify handles this automatically.
