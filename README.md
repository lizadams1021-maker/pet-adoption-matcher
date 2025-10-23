# Paws & Claws Rescue - Pet Adoption Platform

## Introduction

Paws & Claws Rescue is a monolithic Next.js application designed to manage pet adoption.  
The platform allows users to register, log in, manage their profiles, add and edit pets, and view matches between adopters and pets. The application was initially generated using **v0 AI** for rapid prototyping and then enhanced locally for full functionality, including authentication and mock data integration.

---

## Features

- User authentication (login, registration, logout) with session persistence.
- Dashboard displaying statistics such as active pets, new matches, and weekly activity.
- Match list showing pets compatible with the logged-in user.
- "My Pets" page for managing pets: add, edit, delete.
- Detailed pet view for each pet.
- Responsive layout with sidebar navigation.
- Integration-ready for real database connections (Supabase or Neon).

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Neon (PostgreSQL) or Supabase account for database integration
- Optional: VS Code for development

### Installation

1. Clone the repository:

```bash
git clone https://dev.azure.com/YOUR_ORG/YOUR_PROJECT/_git/YOUR_REPO
cd YOUR_REPO

```

2. Install dependencies:

```bash
npm install

```

3. Create a .env.local file in the root directory with the following variables:

```bash
# Database
NEON_NEON_DATABASE_URL=postgresql://usuario:password@ep-xxxxx.neon.tech/neondb
```

### Database Setup

If there is any issue with the database, or if you need to clean it or create a new one, run the provided SQL scripts in your database SQL editor (Neon):

1. 001_create_tables.sql → creates all required tables
2. 002_seed_data.sql → populates the tables with test/mock data

Execute them in order to ensure the database structure and initial data are correct.

### Running Locally

Start the development server:

```bash
npm run dev
```

### Build & Production

To build the application for production:

```bash
npm run build
npm start
```

### Contributing

Contributions are welcome! Follow these guidelines:

1. Create a branch from develop:

```bash
git checkout -b feature/your-feature
```

2. Commit changes with descriptive messages.
3. Push the branch and create a pull request to develop.
4. Ensure all functionality is tested locally before merging.
