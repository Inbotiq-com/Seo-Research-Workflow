# SEO Research Workflow

This project is a full-stack SEO research workflow tool with a backend (Node.js) and frontend (Next.js + Tailwind CSS). It integrates with n8n for workflow automation.

---

## Project Structure

- `backend/` — Node.js server, API integration, and workflow logic
- `frontend/` — Next.js app for the user interface

---

## Prerequisites

- Node.js (v16 or above)
- npm (v8 or above)
- Access to n8n instance and API key (see `.env`)

---

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/Inbotiq-com/Seo-Research-Workflow.git
cd Seo-Research-Workflow
```

### 2. Backend Setup

```sh
cd backend
cp .env.example .env  # Or create .env and fill in required values
npm install
```

- Edit `.env` with your n8n API details and workflow IDs.
- Example `.env` variables:
  - `PORT=3001`
  - `N8N_BASE_URL=...`
  - `N8N_API_KEY=...`
  - `WORKFLOW_ID=...`
  - `WEBHOOK_URL=...`
  - `EXTERNAL_URL=...`

#### Start the Backend

```sh
npm start
```

---

### 3. Frontend Setup

```sh
cd ../frontend
npm install
```

#### Start the Frontend

```sh
npm run dev
```

- The frontend will be available at `http://localhost:3000` by default.

---

## Usage

1. Start the backend server.
2. Start the frontend app.
3. Access the frontend in your browser and follow the workflow steps.

---

## Notes

- Ensure the backend `.env` is correctly configured for your n8n instance.
- For production, set up environment variables securely and use process managers (e.g., PM2).
- For any issues, check the logs in both backend and frontend terminals.

---

## License

This project is for internal use at Inbotiq. Contact the admin for questions or support.
