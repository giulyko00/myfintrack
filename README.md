# MyFinTrack - Personal Finance Tracker

A modern personal finance tracking application with income/expense management and transaction analytics.

## Features

- User authentication (JWT)
- Transaction management (income/expense)
- Transaction categorization
- Dashboard with financial overview
- Monthly transaction summaries
- Category-wise expense tracking
- Responsive design

## Tech Stack

### Backend
- Python 3.10+
- Django 4.2
- Django REST Framework
- PostgreSQL
- Djoser (Authentication)
- JWT (JSON Web Tokens)

### Frontend
- Vue 3
- Nuxt 3
- Pinia (State Management)
- TailwindCSS
- Chart.js

### Development
- Docker
- Docker Compose
- Nginx (Production)


## Prerequisites

- Docker 20.10+
- Docker Compose 1.29+
- Node.js 18+ (for frontend development)
- Python 3.10+ (for backend development)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/myfintrack.git
cd myfintrack
```

### 2. Set up environment variables

Create a `.env` file in the `backend` directory with the following content:

```env
DEBUG=1
SECRET_KEY=your-secret-key-here
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=myfintrack_db
SQL_USER=postgres
SQL_PASSWORD=postgres
SQL_HOST=db
SQL_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_AUTH_REFRESH_COOKIE=refresh
```

### 3. Start the application with Docker

```bash
docker-compose up --build
```

This will start the following services:
- Backend API (Django) - http://localhost:8000
- Frontend (Nuxt.js) - http://localhost:3000
- PostgreSQL Database

### 4. Apply database migrations

```bash
docker-compose exec backend python manage.py migrate
```

### 5. Create a superuser (admin)

```bash
docker-compose exec backend python manage.py createsuperuser
```

## Development

### Backend Development

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Development

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## Production Deployment

For production deployment, make sure to:

1. Set `DEBUG=False` in the `.env` file
2. Set a strong `SECRET_KEY`
3. Update `ALLOWED_HOSTS` with your domain
4. Set up a proper database (PostgreSQL recommended)
5. Configure proper SSL certificates (e.g., using Let's Encrypt)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
