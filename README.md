<div align="center">
  <h1>Kinetics Mini CRM - Frontend</h1>
  <p>An AI-Native B2C CRM interface built for modern marketers.</p>
  <p>
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="React Query" />
  </p>
</div>

<br />

This repository contains the frontend application for the Kinetics AI-Native Mini CRM. It provides an intelligent, fast, and responsive interface allowing brands to segment shoppers, craft personalized campaigns using AI, and track communication performance in real-time.

> 🔗 **Backend Repository:** [ShreyRai23/crm-backend](https://github.com/ShreyRai23/crm-backend)

## Key Features

*   **AI-Native Audience Builder**: Translate natural language queries into complex data segments instantly.
*   **Intelligent Content Generator**: Draft personalized, context-aware campaign messages leveraging Gemini AI.
*   **Campaign Management**: Create, schedule, and track multi-channel communications (WhatsApp, SMS, Email).
*   **Real-time Analytics**: Visualize campaign performance, revenue attribution, and delivery metrics.
*   **High Performance**: Built with React 19, Vite, and TanStack Query for a snappy, optimistic user interface.

## Tech Stack

*   **Framework**: React 19 + Vite
*   **Data Fetching**: TanStack Query (React Query v5) + Axios
*   **Styling**: Vanilla CSS (Custom Design System with Dark Mode)
*   **Visualization**: Recharts
*   **Icons**: Lucide React

## Local Development

### Prerequisites

*   Node.js (v18 or higher)
*   Backend service running locally

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (refer to `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture Notes

*   **Cursor-Based Pagination**: Implemented for infinite scrolling and robust data fetching on large lists.
*   **Separation of Concerns**: API calls are centralized in the `src/api` module with global response interceptors.
*   **Portal Modals**: Modals are rendered via React Portals to prevent CSS stacking context conflicts.

## Deployment

The application is configured for seamless deployment on Vercel, utilizing `vercel.json` to handle client-side routing fallbacks.
