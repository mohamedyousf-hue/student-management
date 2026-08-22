# Student Management System

A simple full-stack Student Management System built using FastAPI, JavaScript, SQLite, Docker, and Kubernetes.

## Features

- Add students
- View students
- Search students
- Delete students
- View departments
- Student statistics

## Technologies

- Frontend: HTML, CSS, JavaScript, Nginx
- Backend: Python, FastAPI
- Database: SQLite
- DevOps: Docker, Kubernetes, Minikube
- Version Control: Git, GitHub

## Project Structure

student-management/
├── backend/
├── frontend/
├── k8s/
├── .gitignore
└── README.md

## Kubernetes

The application is deployed on a local Kubernetes cluster using Minikube.

Frontend runs on Nginx and the backend runs on FastAPI.

## Run the Project

Start Minikube:

minikube start --driver=docker

Deploy the application:

kubectl apply -f k8s/

Check the Pods:

kubectl get pods

Open the application:

minikube service frontend-service --url

## Author

Mohamed Yousef

GitHub: https://github.com/mohamedyousf-hue