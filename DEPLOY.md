# Deploy to Render

This project is set up to deploy on [Render](https://render.com) with a **Web Service** and a **PostgreSQL** database.

---

## Option A: Deploy with Blueprint (recommended)

The repo includes a `render.yaml` that creates the database and web service and links them.

### Steps

1. **Push your code to GitHub** (you already did this).

2. **Sign in to Render**  
   Go to [dashboard.render.com](https://dashboard.render.com) and sign in (GitHub is supported).

3. **Create a Blueprint**
   - Click **New** → **Blueprint**.
   - Connect the GitHub repo that contains this project.
   - Render will detect `render.yaml` and show the **candidate-db** database and **candidate-management** web service.
   - Click **Apply**.

4. **Wait for the first deploy**
   - Render will create the PostgreSQL database, then build and deploy the app.
   - The **release command** (`npm run init-db`) runs automatically and creates the `candidates` table.
   - When the deploy is green, open your service URL (e.g. `https://candidate-management-xxxx.onrender.com`).

5. **Use the app**  
   Open that URL in the browser. The UI and API are served from the same app.

---

## Option B: Manual setup (without Blueprint)

1. **Create a PostgreSQL database**
   - **New** → **PostgreSQL**.
   - Name: `candidate-db`, Region: choose one, Plan: Free.
   - Create. Copy the **Internal Database URL** (or **External** if you need it).

2. **Create a Web Service**
   - **New** → **Web Service**.
   - Connect your GitHub repo.
   - Set:
     - **Root Directory:** `backend`
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Under **Environment**, add:
     - **Key:** `DATABASE_URL`  
       **Value:** paste the database connection string from step 1.
     - **Key:** `NODE_ENV`  
       **Value:** `production`
   - (Optional) Under **Advanced**, set **Release Command:** `npm run init-db` so the schema runs on each deploy.
   - Create Web Service.

3. **Run the schema once (if you didn’t set a release command)**
   - Open your service → **Shell**.
   - Run: `npm run init-db`
   - Exit the shell.

4. **Open the app**  
   Use the service URL (e.g. `https://your-service-name.onrender.com`).

---

## Notes

- **Free tier:** The app may spin down after ~15 minutes of no traffic. The first request after that can take 30–60 seconds (cold start).
- **Database:** Free Postgres on Render is enough for this app. Use the **Internal Database URL** so traffic stays on Render’s network.
- **CORS:** The API allows all origins; the frontend is same-origin when served from the same Render URL.
