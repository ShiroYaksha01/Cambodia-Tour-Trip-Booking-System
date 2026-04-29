# Cambodia Tour Trip Booking System

A full-stack application for managing tour bookings in Cambodia. Built with **NestJS** (Backend) and **Vue 3** (Frontend).

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ 
- **PostgreSQL**: v14+ 
- **npm**: v9+

---

### 2. Backend Setup (`/backend`)

1.  **Install dependencies**:
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Configuration**:
    Create a `.env` file in the `backend` folder:
    ```env
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USER=your_user
    DATABASE_PASSWORD=your_password
    DATABASE_NAME=tour_booking
    PORT=3000
    ```

3.  **Database Migration**:
    Initialize your database schema:
    ```bash
    npm run migration:run
    ```

4.  **Start the server**:
    ```bash
    npm run start:dev
    ```

---

### 3. Frontend Setup (`/frontend`)

1.  **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The app will usually be available at `http://localhost:5173`.

---

## Database Management (TypeORM Migrations)

Always use migrations to keep the database in sync between developers.

- **Generate Migration**: After changing an `.entity.ts` file:
  ```bash
  npm run migration:generate -- src/database/migrations/DescriptionOfChange
  ```
- **Apply Migrations**:
  ```bash
  npm run migration:run
  ```
- **Revert**:
  ```bash
  npm run migration:revert
  ```

---

## GitHub Workflow (For Developers)

Before pushing your code to GitHub, follow these critical steps:

### 1. Security Check
- **NEVER** commit the `.env` file. It is already added to `.gitignore`.
- If you add new environment variables, update the `.env.example` file (if available) or inform the team.

### 2. Clean Code & Build
Run linting and ensure the project builds locally:
```bash
# In backend
npm run lint
npm run build

# In frontend
npm run build
```

### 3. Standard Push Process
1.  **Pull latest changes**: `git pull origin main`
2.  **Check status**: `git status`
3.  **Add changes**: `git add .`
4.  **Commit with a clear message**: `git commit -m "feat: add user registration logic"`
5.  **Push**: `git push origin your-branch-name`

---

## Project Structure

-   `backend/`: NestJS application, TypeORM entities, and migrations.
-   `frontend/`: Vue 3 application with Vite and TailwindCSS.
-   `backend/src/database/migrations/`: History of database changes.
-   `backend/src/modules/`: Business logic separated by features (Auth, Users, Providers).
