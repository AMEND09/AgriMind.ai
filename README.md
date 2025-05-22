<div style="display: flex; flex-direction: row; align-items: left;">
  <img src="https://github.com/user-attachments/assets/13f974b8-1848-4b73-adf8-0c8a9c2d9a7c" width="80px" alt="logo" style="margin-right: 10px;">
  <h1>AgriMind AI</h1>
</div>
A comprehensive, AI-powered farm management dashboard enabling agricultural professionals to manage fields, resources, sustainability, livestock, and reporting—all in one place.

Access the frontend-only demo at [amend09.github.io/AgriMind.ai/](https://amend09.github.io/AgriMind.ai/). Note: Backend functionality is not available in this demo.

For comprehensive technical information, including setup and architecture, consult the [DOCUMENTATION.md](DOCUMENTATION.md) file.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![Django](https://img.shields.io/badge/Django-5.x-092E20.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🚀 Getting Started](#-getting-started)
- [🛠️ Technical Stack](#-technical-stack)
- [🔧 Development Structure](#-development-structure)
- [🗺️ Future Roadmap](#-future-roadmap)
- [📄 License](#-license)
- [🔗 References](#-references)

---

## 🎯 Overview

AgriMind AI empowers users to:
- Optimize farm operations with data-driven insights and AI-powered recommendations.
- Track sustainability metrics: water usage, carbon footprint, fertilizer/pesticide application, and organic practices.
- Plan, record, and analyze all aspects of farm management from crop rotation to livestock health.
- Utilize a dynamic dashboard with quick actions, weather forecasts, issue tracking, and task management.

---

## ✨ Key Features

- **Comprehensive Dashboard:** Centralized overview with quick actions, sustainability scores, weather forecasts, active issues, task management, and upcoming events.
- **Farm & Field Management:** Detailed tracking of farms, crop rotations, harvest records, and fertilizer applications.
- **Water Resource Management:** Tools for recording water usage, calculating efficiency, and visualizing historical irrigation data.
- **Crop & Livestock Planning:** Support for crop rotation scheduling, event planning, and livestock inventory/health monitoring.
- **Task & Issue Tracking:** Efficient management of farm tasks (priority, due dates, status) and issue reporting/resolution.
- **Soil Health Monitoring:** Tracking of key soil parameters (pH, organic matter, nutrients) with visual quality assessments.
- **Sustainability & Compliance:** Monitoring of water/carbon footprints, pesticide usage with compliance alerts, and organic practice assessment.
- **Weather Integration:** Real-time 10-day weather forecasts via Open-Meteo API for informed planning.
- **Reporting & History:** Detailed logs for all resources/activities, with export options for compliance and analysis.
- **User Experience:** Personalized settings, in-app instructions, and an interactive walkthrough.
- **AI-Powered Assistance:** Integrated Gemini chat for queries and assistance (requires API key).
- **Recent Enhancements:**
    - Modular data/API service layer for improved backend integration.
    - Robust Django backend with PostgreSQL database support.
    - Enhanced modules for soil health, pesticide tracking, and livestock management.
    - Streamlined side navigation for intuitive feature access.

For the complete commit history and the latest changes, refer to:
[GitHub Commits](https://github.com/AMEND09/AgriMind.ai/commits?per_page=20&sort=updated)

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AMEND09/AgriMind.ai.git
    cd AgriMind.ai
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```
3.  **Set up the backend (Python/Django):**
    Refer to the detailed instructions in [DOCUMENTATION.md](DOCUMENTATION.md#4-setup-and-running-the-project).
4.  **Configure Environment Variables:**
    Ensure API keys (e.g., Google Gemini) and database settings are configured as per `DOCUMENTATION.md`.
5.  **Run development servers:**
    *   Frontend: `npm run dev`
    *   Backend: (From `backend/` directory) `python manage.py runserver`
6.  **Build for production:**
    ```bash
    npm run build
    ```

**Access the web application (development):**
Frontend typically at `http://localhost:5173`, Backend at `http://localhost:8000`.

---

## 🛠️ Technical Stack

For comprehensive technical information, consult the [DOCUMENTATION.md](DOCUMENTATION.md) file.

- **Frontend:** React 18+ (TypeScript), Vite, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts.
- **State Management & Data:** React Hooks, Context API, Custom DataStorage Abstraction, Open-Meteo API.
- **Backend:** Python (Django 5+), Django REST Framework, PostgreSQL.
- **Development & Deployment:** ESLint, Prettier, GitHub Actions (CI/CD planned), GitHub Pages (for demo).

---

## 🔧 Development Structure

For comprehensive technical information, consult the [DOCUMENTATION.md](DOCUMENTATION.md) file.

The frontend source code resides in the `src/` directory:
```
src/
├── artifacts/         # Core application logic, types, and feature-specific components
│   ├── components/    # Custom React components (TaskManager, LoginPage, HistoryPage, etc.)
│   ├── models/        # Data models (e.g., sustainability.ts)
│   ├── default.tsx    # Main orchestrating UI component
│   ├── types.ts       # Core TypeScript type definitions
│   └── utils.ts       # Utility functions (calculations, UI helpers)
├── components/        # Reusable UI components (shadcn/ui based and custom)
├── hooks/             # Custom React hooks
├── lib/               # General utility functions
├── services/          # Data storage and API interaction services
├── App.tsx            # Main application layout component
├── main.tsx           # Entry point of the React application
└── ... (other configuration and style files)
```
The Django backend code is located in the `backend/` directory. For a detailed file structure, refer to [DOCUMENTATION.md](DOCUMENTATION.md#3-file-structure).

---

## 🗺️ Future Roadmap

- [ ] ML-based yield predictions
- [ ] Automated irrigation control
- [ ] Mobile application

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🔗 References

- [React Documentation](https://reactjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [Sustainable Agriculture Guidelines](https://saiplatform.org)
