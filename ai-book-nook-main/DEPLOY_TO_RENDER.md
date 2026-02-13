# How to Deploy Backend to Render

Follow these steps to deploy your `Sri Chola Book Shop` backend to Render.com.

## 1. Create a New Web Service
1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Choose **Build and deploy from a Git repository**.
4.  Connect your GitHub account if you haven't already.
5.  Select the repository: `ai-book`.

## 2. Configure the Service
Fill in the following details:

*   **Name**: `ai-book-api` (or any name you like)
*   **Region**: Singapore (or nearest to you)
*   **Branch**: `main`
*   **Root Directory**: `server`  <-- **IMPORTANT**
*   **Runtime**: `Node`
*   **Build Command**: `npm install`
*   **Start Command**: `node index.js`
*   **Instance Type**: Free

## 3. Environment Variables
You MUST add the following Environment Variables (copy values from your local `.env` file).
Click **Advanced** or **Environment Variables** to add them:

| Key | Value (Example) |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://...` (Your MongoDB Atlas connection string) |
| `JWT_SECRET` | `supersecretkey123` (Or generate a new complex one) |
| `RAZORPAY_KEY_ID` | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | `...` |
| `EMAIL_USER` | `sengosaminathan@gmail.com` |
| `EMAIL_PASS` | `...` (Your App Password) |
| `N8N_WEBHOOK_URL` | `...` |
| `GEMINI_API_KEY` | `...` |

## 4. Deploy
1.  Click **Create Web Service**.
2.  Render will start building. Watch the logs.
3.  Once it says "Live", copy the URL (e.g., `https://ai-book-api.onrender.com`).

## 5. Connect Frontend
1.  Go to your Vercel Project.
2.  Settings -> Environment Variables.
3.  Add/Edit `VITE_API_URL` with the new Render URL (e.g., `https://ai-book-api.onrender.com`).
4.  Redeploy Vercel.
