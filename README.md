# EdTech Platform

A learning platform with student, instructor, organization, and administrator interfaces. It combines a React frontend with a NestJS API and a local JSON-based data store.

Students can explore courses, enroll, follow lessons, complete quizzes, and view certificates. Instructors can manage course content, monitor learners, and review teaching activity. Organizations can manage courses, instructors, learners, enrollments, and institutional reports. Administrators have views for managing users, courses, organizations, payments, disputes, and platform activity.

The backend provides APIs for these workflows, including authentication, course and enrollment management, assessments, payments, analytics, and notifications. Its JSON database stores collections in local files and initializes seed data when needed, allowing the project to run without a separate database server. Swagger provides interactive API documentation.

## Project structure

```text
fsd/
├── front-end/    React application and Vite development server
├── back-end/     NestJS API, tests, and JSON data
└── package.json  Commands for running and building the applications
```

## Prerequisites and dependencies

- Node.js 20 or newer and npm.
- The frontend uses React, React Router, Vite, Tailwind CSS, Recharts, and Lucide React.
- The backend uses NestJS, TypeScript, class-validator, Swagger, and a JSON file database. Jest and Supertest are included for testing.

The full dependency lists and versions are in each application's `package.json`. No separate database server is required.

## Setup

From the `fsd` directory, install each application's dependencies separately:

```bash
cd fsd
npm ci --prefix back-end
npm ci --prefix front-end
```

The backend reads optional settings from `back-end/.env` or `back-end/.env.local`. Defaults used by the code include:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | API server port |
| `API_PREFIX` | `api` | API route prefix |
| `SWAGGER_PATH` | `api/docs` | Swagger UI path |
| `CORS_ORIGIN` | `*` | Allowed CORS origin |
| `DATA_DIR` | `./data` | JSON data directory, relative to the backend working directory |
| `RESET_CODE` | `482910` | Password reset code |

Existing environment files or environment variables may override these defaults. The frontend development proxy targets `http://localhost:3000`; update `front-end/vite.config.js` if the backend port changes. The database stores data in `back-end/data` by default, so application changes can modify these files.

## Run in development

From `fsd`, start the backend in one terminal:

```bash
npm run backend:dev
```

In a second terminal, start the frontend:

```bash
npm run frontend:dev
```

Open `http://localhost:5173`. The API is available at `http://localhost:3000/api`, with interactive documentation at `http://localhost:3000/api/docs`. The Vite server proxies `/api` requests to the backend. The root `npm run dev` command starts the backend, waits for its landing API to respond, then starts the frontend. It reuses servers already running on the configured ports. Set `API_PROXY_TARGET` when starting Vite separately against a different backend address.

## Build and run

From `fsd`, build both applications:

```bash
npm run build
```

To run the built backend and preview the built frontend, use separate terminals:

```bash
cd back-end
npm run start:prod
```

```bash
cd front-end
npm run preview
```

Vite's preview command is intended for inspecting the frontend build locally. It does not use the development server's proxy configuration; configure API routing when deploying the frontend.

## Testing

Run the backend Jest suite from `fsd`:

```bash
npm test --prefix back-end
```

For watch mode or coverage:

```bash
npm run test:watch --prefix back-end
npm run test:cov --prefix back-end
```

Coverage is written to `back-end/coverage`. Although the backend package defines a `test:e2e` script, its referenced `test/jest-e2e.json` configuration is not present in this checkout. The frontend has no automated test script configured; run `npm run frontend:build` and exercise the interface against the running API for a basic manual check.


Web data storage: the backend defaults to `DATA_STORAGE_MODE=memory`. It reads the existing JSON files once as starting records, then shares website changes across actors in backend memory. Website changes do not modify those JSON files and reset when the backend restarts. File persistence remains available with `DATA_STORAGE_MODE=file`.

The bundled website demo starts with three published courses and at most two enrollments per learner. Its backend seed preparation reconciles enrollments, payments, completed-course certificates, eligible reviews, and course disputes as one dataset; obsolete demo financial and learning records are excluded from the running snapshot. New website enrollments still require the normal enrollment or checkout workflow.
