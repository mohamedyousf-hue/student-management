# Student Management System

A simple full-stack Student Management System built with FastAPI, JavaScript, SQLite, Docker, Kubernetes, Helm, and GitHub Actions.

## Features

- Add, view, search, and delete students
- View departments
- View student statistics

## Tech Stack

- **Backend:** Python, FastAPI
- **ORM / Database:** SQLAlchemy, SQLite
- **Frontend:** JavaScript, served by Nginx
- **Containers:** Docker
- **Orchestration:** Kubernetes (Minikube), Helm
- **CI:** GitHub Actions, GitHub Container Registry (GHCR)

## Project Structure

```
student-management/
├── backend/          FastAPI backend and Dockerfile
├── frontend/         JavaScript frontend and Dockerfile (Nginx)
├── k8s/              Plain Kubernetes manifests
├── student-chart/    Helm chart
└── .github/workflows/ci.yml   CI pipeline
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/students` | List students, with optional `?search=` filter on name or department |
| GET | `/students/stats` | Total students, active students, and count per department |
| GET | `/students/{id}` | Get one student |
| POST | `/students` | Create a student (rejects duplicate emails) |
| PUT | `/students/{id}` | Update a student |
| DELETE | `/students/{id}` | Delete a student |

Interactive API docs are available at `/docs` when the backend is running.

## Run the Backend Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Then open `http://127.0.0.1:8000/docs`.

## CI Pipeline

The GitHub Actions workflow runs on every push to `master`. It builds the backend and frontend Docker images and pushes them to GitHub Container Registry:

- `ghcr.io/mohamedyousf-hue/student-backend`
- `ghcr.io/mohamedyousf-hue/student-frontend`

## Deploy with Helm (Minikube)

Requirements: Docker, Minikube, kubectl, Helm.

```bash
minikube start
helm install student student-chart
kubectl get pods
minikube service frontend-service
```

Scale the backend without editing any file:

```bash
helm upgrade student student-chart --set backend.replicas=2
helm history student
```

Roll back to the first release:

```bash
helm rollback student 1
```

Remove everything:

```bash
helm uninstall student
```

## Configuration

Image names, replica counts, ports, and service types are set in `student-chart/values.yaml`.

## Plain Kubernetes Manifests

The `k8s/` folder contains the same Deployments and Services as raw manifests. They use locally built images (`imagePullPolicy: Never`), so build the images inside Minikube first, then run:

```bash
kubectl apply -f k8s/
```
