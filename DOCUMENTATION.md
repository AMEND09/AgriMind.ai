# AgriMind AI Documentation

**Version:** 1.0.0 (Last Updated: YYYY-MM-DD)

**Repository:** [AMEND09/AgriMind.ai](https://github.com/AMEND09/AgriMind.ai)

**Authors:** Aditya Mendiratta & Rahbe Abass

## 1. Introduction

AgriMind AI is a sustainable farm management software designed to provide elegant reporting and an efficient user experience. This document provides an in-depth overview of the AgriMind AI project, its architecture, file structure, and key components. The application features a React frontend (TypeScript, Vite, Tailwind CSS) and a Django backend (Python).

## 2. Technology Stack

*   **Frontend:**
    *   **Framework/Library:** React (with TypeScript)
    *   **Build Tool:** Vite
    *   **Routing:** `react-router-dom`
    *   **Styling:** Tailwind CSS, global CSS (`src/index.css`), custom theming (`src/styles/theme.ts`)
    *   **UI Components:**
        *   shadcn/ui (built on Radix UI primitives like `@radix-ui/react-tabs`, `@radix-ui/react-label`, `@radix-ui/react-slot`)
        *   Custom components in `src/artifacts/components/`
    *   **State Management:** React Context API (utilized via `useFormContext`, `createContext`) and component state.
    *   **Form Handling:** `react-hook-form`
    *   **Utility Libraries:** `class-variance-authority` (for UI variants), `clsx`, `tailwind-merge`
    *   **Linting:** ESLint
*   **Backend:**
    *   **Framework:** Django (Python)
    *   **Database:** Utilizes the Django ORM; the specific database engine is configured in Django settings.
*   **Version Control:** Git
*   **Hosting/CI/CD:** GitHub, GitHub Actions

## 3. File Structure

```
AgriMind AI/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD workflow definitions
├── backend/
│   └── backend/                # Django project root
│       ├── api/                # Django app named 'api'
│       │   ├── migrations/     # Database migration scripts for the 'api' app
│       │   │   └── __pycache__/ # Python cache for migrations
│       │   ├── __pycache__/    # Python cache for 'api' app modules
│       │   ├── admin.py        # Django admin configuration for 'api' app
│       │   ├── apps.py         # App configuration for 'api' app
│       │   ├── models.py       # Database models for 'api' app
│       │   ├── tests.py        # Tests for 'api' app
│       │   └── views.py        # Views (request handlers) for 'api' app
│       ├── backend/            # Django project configuration directory
│       │   ├── __pycache__/    # Python cache for project config modules
│       │   ├── asgi.py         # ASGI entry point
│       │   ├── settings.py     # Django project settings
│       │   ├── urls.py         # Project-level URL routing
│       │   └── wsgi.py         # WSGI entry point
│       └── manage.py           # Django's command-line utility
├── public/                     # Static assets (images, fonts, etc.)
├── src/                        # Frontend source code (React application)
│   ├── artifacts/              # Core application logic, types, and custom components
│   │   ├── components/         # Custom React components for specific features
│   │   │   ├── CropFilter.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── Instructions.tsx
│   │   │   ├── IssueTracker.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── TaskManager.tsx
│   │   │   └── Walkthrough.tsx
│   │   ├── models/             # Data models, particularly for sustainability
│   │   │   └── sustainability.ts
│   │   ├── default.tsx         # A major component orchestrating UI and logic
│   │   ├── types.ts            # Core TypeScript type definitions for the app
│   │   └── utils.ts            # Utility functions, esp. for calculations
│   ├── components/               # Reusable UI components (some from shadcn/ui)
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   └── tabs.tsx
│   │   └── layout.tsx          # Main layout component
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions and libraries
│   │   └── utils.ts              # Utility for classname composition (clsx, tailwind-merge)
│   ├── pages/                    # Page-level components
│   │   └── Home.tsx              # Home page component
│   ├── router/                   # Routing configuration
│   │   └── routes.ts             # Defines application routes
│   ├── styles/                   # Styling-related files
│   │   └── theme.ts              # Custom theme definitions
│   ├── typings/                  # Custom TypeScript type definitions
│   ├── App.tsx                   # Main application layout component
│   ├── index.css                 # Global stylesheets, Tailwind CSS setup
│   ├── main.tsx                  # Entry point of the React application
│   └── vite-env.d.ts             # Vite environment & plugin type declarations
├── .eslintrc.cjs                 # ESLint configuration file
├── .gitignore                    # Specifies intentionally untracked files for Git
├── components.json               # shadcn/ui configuration
├── index.html                    # Main HTML entry point for the Vite application
├── jsconfig.json                 # JavaScript language server configuration
├── LICENSE                       # Software license for the project
├── package-lock.json             # Records exact dependency versions
├── package.json                  # Project metadata, dependencies, and scripts
├── postcss.config.js             # PostCSS configuration
├── README.default.md             # Default/template README file
├── README.md                     # Main project README file
├── tailwind.config.mjs           # Tailwind CSS configuration
├── tsconfig.app.json             # TypeScript configuration for the application code
├── tsconfig.json                 # Main TypeScript configuration for the project
├── tsconfig.node.json            # TypeScript configuration for Node.js environments
└── vite.config.ts                # Vite build tool configuration
```

### 3.1 Root Directory Files

*   **`.eslintrc.cjs`**: ESLint configuration.
*   **`.gitignore`**: Specifies Git ignored files.
*   **`LICENSE`**: Software license.
*   **`README.default.md`**: Template README.
*   **`README.md`**: Main project README.
*   **`components.json`**: Configuration for `shadcn/ui`, defining styling, component paths, Tailwind CSS setup (using `tailwind.config.js` and `src/index.css` with "slate" as base color and CSS variables enabled), and aliases (`src/components` for components, `src/lib/utils` for utilities). Components are TypeScript (`tsx: true`).
*   **`index.html`**: Vite application entry HTML.
*   **`jsconfig.json`**: JavaScript language server configuration.
*   **`package-lock.json`**: Exact dependency versions.
*   **`package.json`**: Project metadata, dependencies, and scripts.
*   **`postcss.config.js`**: PostCSS configuration (used by Tailwind CSS).
*   **`tailwind.config.mjs`**: Tailwind CSS customization.
*   **`tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`**: TypeScript configurations.
*   **`vite.config.ts`**: Vite build tool configuration.

### 3.2 `.github/`

*   **`workflows/`**: GitHub Actions workflows for CI/CD.

### 3.3 `backend/` - Django Backend

This directory contains the Django project for AgriMind AI's backend.

*   **`backend/manage.py`**:
    *   Django's command-line utility for administrative tasks. Used to run the development server, create database migrations, manage users, and other Django-specific operations.
    *   Sets `DJANGO_SETTINGS_MODULE` to `backend.settings`.

*   **`backend/backend/` (Project Configuration Directory)**:
    *   **`settings.py`**: Contains all the configuration for the Django project, including database settings, installed apps (e.g., `api`), middleware, template configurations, static files, and API keys (like `GOOGLE_GEMINI_API_KEY`).
    *   **`urls.py`**: The main URL configuration for the project. It defines project-level URL routing, directing requests to appropriate views, including those within the `api` app.
    *   **`wsgi.py` / `asgi.py`**: Entry points for WSGI/ASGI compatible web servers to serve the Django application.
    *   **`__pycache__/`**: Contains compiled Python bytecode for faster execution of project configuration modules.

*   **`backend/backend/api/` (Django App: `api`)**: This directory represents a Django application named `api`, which handles the application's API logic.
    *   **`apps.py` (`ApiConfig`)**:
        *   Configuration class for the `api` Django app.
        *   Sets `default_auto_field` to `django.db.models.BigAutoField` for primary keys.
        *   Specifies the app name as `api`.
    *   **`models.py`**:
        *   Defines the database models (schema) for the `api` app using Django's ORM. Database tables and their fields (e.g., `Farm`, `Crop`, `Task`) are defined here as Python classes. The current version of this file is empty, awaiting model definitions.
    *   **`views.py`**:
        *   Contains the logic for handling HTTP requests and returning responses. API endpoints are implemented here, utilizing Django's view mechanisms or frameworks like Django REST framework. Currently contains a placeholder for creating views.
    *   **`admin.py`**:
        *   Used to register models with Django's built-in admin interface, allowing for easy data management. Currently empty.
    *   **`tests.py`**:
        *   For writing unit and integration tests for the `api` app. Currently contains a placeholder.
    *   **`migrations/`**:
        *   Stores database migration files generated by Django based on changes to `models.py`. These files allow for versioning and applying schema changes to the database.
        *   `__pycache__/` inside `migrations` contains compiled bytecode for migration modules.
    *   **`__pycache__/`**: Contains compiled Python bytecode for the `api` app's modules.

### 3.4 `public/`

Static assets served directly by the web server.

### 3.5 `src/` - Frontend Application Source

#### 3.5.1 `src/App.tsx`, `src/main.tsx`, `src/index.css`
Core frontend setup: React entry point, global styles, and router initialization.

#### 3.5.2 `src/lib/`
*   **`utils.ts`**: Contains the `cn` utility function combining `clsx` and `tailwind-merge` for dynamic and conflict-free Tailwind CSS class generation.

#### 3.5.3 `src/hooks/`
Directory for custom React Hooks.

#### 3.5.4 `src/pages/`
*   **`Home.tsx`**: Home page component.

#### 3.5.5 `src/router/`
*   **`routes.ts`**: Defines application routes.

#### 3.5.6 `src/styles/`
*   **`theme.ts`**: Custom theme definitions (light/dark modes, colors, accessibility settings).

#### 3.5.7 `src/typings/`
Custom global TypeScript type definitions.

#### 3.5.8 `src/vite-env.d.ts`
Vite-specific type declarations.

#### 3.5.9 `src/components/` - Reusable UI Components

*   **`layout.tsx`**:
    *   A React functional component that acts as a layout wrapper. It accepts `children` as a prop and renders them, providing a basic structure for application pages or sections.

*   **`ui/` (shadcn/ui Components)**: This directory hosts UI components generated via the `shadcn/ui` CLI. These components are built using Radix UI primitives and styled with Tailwind CSS. Examples include `Alert`, `Badge`, `Card`, `Form`, `Tabs`, etc., providing a consistent look and feel.
    *   **`alert.tsx` (`Alert`, `AlertTitle`, `AlertDescription`)**:
        *   Provides styled alert components for displaying important messages.
        *   Supports variants like `default` and `destructive`.
        *   Uses `cva` (class-variance-authority) for managing style variants.
    *   **`badge.tsx` (`Badge`, `badgeVariants`)**:
        *   Renders small badge elements for tags, statuses, or counts.
        *   Supports variants including `default`, `secondary`, `destructive`, and `outline`.
        *   Uses `cva` for style variants.
    *   **`card.tsx` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`)**:
        *   A collection of components to build card-based UI elements.
        *   Provides structured components for the header, title, description, content, and footer of a card.
    *   **`form.tsx` (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`)**:
        *   A comprehensive set of components and hooks for building forms with `react-hook-form`.
        *   Integrates `react-hook-form` with `shadcn/ui` styled components (`Label`).
        *   Provides context and helper hooks (`useFormField`) for managing form field state, errors, and accessibility.
    *   **`tabs.tsx` (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`)**:
        *   Components for creating tabbed interfaces, built on `@radix-ui/react-tabs`.
        *   Allows users to switch between different sections of content.

#### 3.5.10 `src/artifacts/` - Core Application Features & Custom Components

This directory houses the primary logic, data structures, and complex, feature-specific components of the AgriMind AI frontend.

*   **`types.ts`**:
    *   Defines a wide range of TypeScript interfaces and types that model the application's data. This file is crucial for understanding the data flow and structure.
    *   Key types include: `Farm` (detailed farm information, histories for water, fertilizer, harvest, rotation, soil properties), `WaterUsage`, `WeatherData`, `Task`, `Issue`, `ConfirmDelete`, `CropPlanEvent`, `SustainabilityMetrics` (overallScore, waterEfficiency, organicScore, etc.), `WalkthroughStep`, `Livestock`, `LivestockType`, `ExportData` (for exporting all app data), `AnyHistoryEntry` (a union type for various history log entries), and `PlanItem`.
    *   These types define the data structures for features including farm management, task tracking, issue reporting, crop planning, sustainability assessment, and livestock management.

*   **`utils.ts`**:
    *   Contains utility functions, primarily focused on calculations related to sustainability metrics and UI helpers.
    *   `getPositionForElement`: Calculates positioning for UI elements for the walkthrough.
    *   `walkthroughStyles`: CSS for the walkthrough component.
    *   `calculateWaterEfficiency`, `calculateSoilQualityScore`, `calculateOrganicScore`, `calculateHarvestEfficiency`, `calculateRotationScore`: Functions to compute various sustainability scores based on farm data and weather.
    *   `calculateSustainabilityMetrics`, `calculateSustainabilityMetricsWithTrackers`: Aggregate sustainability scores.
    *   `getWeatherInfo`: Maps weather codes to descriptions and icons.

*   **`models/sustainability.ts`**:
    *   Defines specific data models related to sustainability tracking.
    *   `FuelRecord`: Tracks fuel usage (equipment, type, gallons, hours, cost).
    *   `SoilRecord`: Tracks soil health parameters (pH, organic matter, nutrients, moisture).
    *   `EnergyRecord`: Tracks energy consumption (type, amount, unit, renewable, cost, purpose).
    *   `CarbonEmissionSource`: Records sources of carbon emissions.
    *   `CarbonSequestrationActivity`: Records activities that sequester carbon.

*   **`default.tsx`**:
    *   A large, central React component that orchestrates much of the main application's UI and state. It integrates various sub-components and manages state for features like the interactive walkthrough, UI element expansion, planning activities (e.g., `newPlantingPlan`), user authentication, farm data, tasks, issues, and livestock information.
    *   Implements handlers for core application functionalities:
        *   Walkthrough initiation and completion.
        *   Creation, modification, and deletion of plan items.
        *   User authentication processes (login, registration, logout, profile updates).
        *   CRUD (Create, Read, Update, Delete) operations for Farms, Water Usage, Fertilizer, Harvest data, Crop Rotations, and Livestock.
        *   Issue resolution and task deletion.
        *   Data import and export functionalities.
        *   Fetching user location and corresponding weather data.
        *   Control of widget visibility and dynamic layout adjustments via `DraggableWidgetLayout`.
        *   Manages the display of modals for various actions (e.g., adding farm data, login, profile settings) and the Gemini chat interface.
    *   This component renders and coordinates the user interface elements corresponding to the managed state and handlers, forming the backbone of the user-facing application.

*   **`components/` (within `src/artifacts/`)**: Contains more specialized, feature-rich React components.
    *   **`CropFilter.tsx`**: A component that allows users to filter a list of farms based on the crop type. It dynamically generates filter options from the available crops.
    *   **`HistoryPage.tsx`**: Displays a comprehensive history of farm activities (Water Usage, Fertilizer Usage, Harvest, Crop Rotation). Includes search and filtering capabilities, and dialogs for editing/deleting history entries. It manages state for editing different types of history records.
    *   **`Instructions.tsx`**: A component providing user guidance and help. It explains different sections of the app (Overview, Water Management, Crops & Farms, etc.) and includes a button to start an interactive walkthrough.
    *   **`IssueTracker.tsx`**: Allows users to report and track farm issues (e.g., pests, diseases). Includes inputs for issue type, description, severity, and a list to display reported issues with an option to resolve them.
    *   **`LoginPage.tsx`**: Provides a dialog for user login and registration. It uses `shadcn/ui` components like `Dialog`, `Tabs`, `Input`, `Button`, `Label`. Handles form state and submission for both login and registration.
    *   **`TaskManager.tsx`**: A component for managing daily farm tasks. Users can add new tasks with due dates and priority, mark tasks as complete/incomplete, and delete tasks.
    *   **`Walkthrough.tsx`**: Implements an interactive tutorial or walkthrough for new users. It takes a series of steps (`WALKTHROUGH_STEPS`), highlights target UI elements, and displays instructional messages. Manages the current step and navigation (next, previous, skip).

## 4. Setup and Running the Project

1.  **Prerequisites:**
    *   Node.js (version 18.x or newer recommended)
    *   npm or yarn
    *   Python (version 3.8 or newer recommended)
    *   pip (Python package installer)
    *   PostgreSQL (or other Django-compatible database, configured in `backend/backend/settings.py`)
2.  **Clone the repository:**
    ```bash
    git clone https://github.com/AMEND09/AgriMind.ai.git
    cd AgriMind.ai
    ```
3.  **Frontend Setup:**
    ```bash
    # Navigate to the project root if not already there
    npm install
    # or
    # yarn install
    ```
4.  **Backend Setup (Django):**
    ```bash
    cd backend # Navigate to the backend directory
    python -m venv venv  # Create a virtual environment
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    # Ensure you have a requirements.txt or install manually:
    # pip install Django djangorestframework psycopg2-binary djangorestframework-simplejwt django-cors-headers
    # If requirements.txt exists:
    # pip install -r requirements.txt 
    python manage.py migrate # Apply database migrations
    # Optional: Create a superuser for Django admin
    # python manage.py createsuperuser
    cd .. # Return to the project root
    ```
5.  **Environment Variables:**
    *   Frontend: If needed, create a `.env` file in the root directory for frontend-specific configurations (e.g., API base URLs if different from default).
    *   Backend: Configure Django settings in `backend/backend/settings.py`. Sensitive information like `SECRET_KEY`, database credentials, and `GOOGLE_GEMINI_API_KEY` should ideally be managed via environment variables in a production setting. For development, you can set them directly in `settings.py` but be cautious with version control.
6.  **Run the development server (frontend):**
    ```bash
    # From the project root
    npm run dev
    # or
    # yarn dev
    ```
    (The frontend development server will typically be accessible at `http://localhost:5173`)
7.  **Run the backend server (Django):**
    ```bash
    # From the project root
    cd backend
    source venv/bin/activate # If not already activated
    python manage.py runserver
    cd .. # Optional: return to project root in another terminal
    ```
    (The Django backend server will typically be accessible at `http://localhost:8000`)
