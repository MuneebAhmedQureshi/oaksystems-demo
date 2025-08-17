# Process Automation Assessment Tool

A comprehensive web application to evaluate and prioritize business processes for automation based on key factors such as complexity, frequency, manual error rate, and cost savings.

## 🌟 Features

- **Score-based Assessment**: Evaluate processes using 6 key factors (Repetitiveness, Rule-Based, Complexity, Volume, Standardization, Error Rate)
- **Automated Classification**: Processes are automatically classified as "Not Suitable", "Possibly Automatable", or "Highly Automatable"
- **Intelligent Prioritization**: High/Medium/Low priority assignment based on total scores
- **Comprehensive Reports**: Generate detailed reports with AI-powered conclusions
- **Export Functionality**: Download reports in PDF and CSV formats
- **AI Features**: Process similarity analysis, automation success prediction, and optimization suggestions
- **Dashboard Analytics**: Visual insights with charts and statistics
- **User Authentication**: Secure login and user management

## 🛠 Tech Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework
- **Database**: MySQL
- **Authentication**: JWT (Simple JWT)
- **Task Queue**: Celery with Redis
- **AI/ML**: scikit-learn, pandas, numpy
- **PDF Generation**: ReportLab

### Frontend
- **Framework**: React 18.2.0
- **UI Library**: React Bootstrap
- **Routing**: React Router DOM
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### Database
- **Primary**: MySQL 8.0+
- **Cache/Queue**: Redis 6.0+

## 📋 Assessment Criteria

| Factor | Description | Score Range |
|--------|-------------|-------------|
| Repetitiveness | How frequently is the process executed? | 1-5 |
| Rule-Based | Is the process deterministic with clear rules? | 1-5 |
| Complexity | Process complexity (lower = more automatable) | 1-5 |
| Volume | Transaction/instance volume per day/week | 1-5 |
| Standardization | Input/output standardization level | 1-5 |
| Current Errors | Manual error rate (higher = more need for automation) | 1-5 |

### Classification System

| Score Range | Classification | Recommendation |
|-------------|----------------|----------------|
| 0-10 | Not Suitable for Automation | Keep manual - too complex or rule-ambiguous |
| 11-20 | Possibly Automatable | Consider semi-automation with human intervention |
| 21-30 | Highly Automatable | Ideal for full automation - implement immediately |

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd process-automation-tool
   ```

2. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your database and other configurations
   ```

5. **Setup database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE automation_ai_db;
   exit

   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## 📖 API Documentation

### Authentication Endpoints

```
POST /api/auth/register/     - User registration
POST /api/auth/login/        - User login
GET  /api/auth/profile/      - Get user profile
```

### Process Assessment Endpoints

```
GET    /api/tasks/assessments/              - List assessments
POST   /api/tasks/assessments/              - Create assessment
GET    /api/tasks/assessments/{id}/         - Get assessment details
PUT    /api/tasks/assessments/{id}/         - Update assessment
DELETE /api/tasks/assessments/{id}/         - Delete assessment
POST   /api/tasks/assessments/bulk/         - Bulk create assessments
```

### Reports Endpoints

```
GET    /api/tasks/reports/                  - List reports
POST   /api/tasks/reports/                  - Create report
GET    /api/tasks/reports/{id}/             - Get report details
POST   /api/tasks/reports/{id}/ai-conclusion/ - Generate AI conclusion
GET    /api/tasks/reports/{id}/download/csv/ - Download CSV
GET    /api/tasks/reports/{id}/download/pdf/ - Download PDF
```

### AI Features Endpoints

```
POST /api/ai/similarity-analysis/      - Analyze process similarity
POST /api/ai/predict-success/          - Predict automation success
POST /api/ai/optimization-suggestions/ - Get optimization suggestions
GET  /api/ai/analysis-history/         - Get analysis history
```

### Dashboard Endpoints

```
GET /api/tasks/dashboard/stats/        - Get dashboard statistics
```

## 🏗 Project Structure

```
process-automation-tool/
├── backend/
│   ├── automation_ai/          # Django project settings
│   ├── accounts/               # User authentication app
│   ├── tasks/                  # Process assessment app
│   ├── automation/             # Automation templates and recommendations
│   ├── ai_features/            # AI/ML features app
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts (Auth, etc.)
│   │   ├── services/          # API services
│   │   └── App.js
│   ├── package.json
│   └── ...
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DB_NAME=automation_ai_db
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_HOST=localhost
DB_PORT=3306
REDIS_URL=redis://localhost:6379/0
```

### Database Configuration

Ensure MySQL is running and create the database:

```sql
CREATE DATABASE automation_ai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Redis Configuration

Install and start Redis server:

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# macOS with Homebrew
brew install redis
brew services start redis

# Windows
# Download and install Redis for Windows
```

## 🚀 Deployment

### Local Development

1. Follow the Quick Start guide above
2. Access the application at http://localhost:3000

### Production Deployment

#### Using Docker (Recommended)

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

#### Manual Deployment

##### Backend (Django)

1. **Install production dependencies**
   ```bash
   pip install gunicorn whitenoise
   ```

2. **Configure settings for production**
   ```python
   DEBUG = False
   ALLOWED_HOSTS = ['your-domain.com']
   ```

3. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

4. **Run with Gunicorn**
   ```bash
   gunicorn automation_ai.wsgi:application --bind 0.0.0.0:8000
   ```

##### Frontend (React)

1. **Build for production**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve with a web server** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/frontend/build;
           try_files $uri $uri/ /index.html;
       }
       
       location /api/ {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

#### Cloud Deployment Options

##### AWS Deployment

1. **EC2 Instance Setup**
   - Launch Ubuntu 20.04 LTS instance
   - Install Docker and Docker Compose
   - Clone repository and deploy with Docker

2. **RDS for MySQL**
   - Create MySQL 8.0 RDS instance
   - Update environment variables

3. **ElastiCache for Redis**
   - Create Redis cluster
   - Update REDIS_URL

##### Google Cloud Platform

1. **App Engine Deployment**
   - Configure app.yaml for Django
   - Deploy with `gcloud app deploy`

2. **Cloud SQL for MySQL**
   - Create MySQL instance
   - Configure connection

##### Heroku Deployment

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Add buildpacks**
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add heroku/python
   ```

3. **Configure environment variables**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set DEBUG=False
   # Add other environment variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Run both backend and frontend tests
npm run test:all
```

## 🔒 Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **CORS**: Configured for frontend domain
3. **SQL Injection**: Using Django ORM prevents SQL injection
4. **XSS Protection**: React's built-in XSS protection
5. **CSRF Protection**: Django's CSRF middleware enabled
6. **Environment Variables**: Sensitive data in environment variables
7. **HTTPS**: Enable HTTPS in production
8. **Input Validation**: Server-side validation for all inputs

## 📊 Monitoring and Logging

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'automation_ai.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Health Check Endpoints

```
GET /api/health/        - Application health check
GET /api/version/       - Application version
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

No License has been included for now.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Redis Connection Error**
   - Start Redis server
   - Check REDIS_URL configuration

3. **CORS Issues**
   - Verify CORS_ALLOWED_ORIGINS in settings
   - Check frontend URL configuration

4. **Import Errors**
   - Ensure virtual environment is activated
   - Install all requirements: `pip install -r requirements.txt`

5. **Migration Issues**
   - Delete migration files (keep __init__.py)
   - Run `python manage.py makemigrations`
   - Run `python manage.py migrate`

### Getting Help

- Create an issue on GitHub
- Check the documentation
- Review logs for error details

## 📈 Roadmap

- [ ] Advanced AI recommendations using machine learning models
- [ ] Integration with popular automation tools (UiPath, Automation Anywhere)
- [ ] Real-time collaboration features
- [ ] Mobile application
- [ ] Advanced analytics and insights
- [ ] Process mining integration
- [ ] Custom scoring models
- [ ] Multi-tenant support

## 🎯 Example Use Cases

### 1. Invoice Processing Assessment

```json
{
  "process_name": "Monthly Invoice Processing",
  "repetitiveness_score": 4,
  "rule_based_score": 5,
  "complexity_score": 3,
  "volume_score": 4,
  "standardization_score": 5,
  "current_errors_score": 4,
  "total_score": 25,
  "automation_suitability": "highly_automatable"
}
```

**Result**: Highly Automatable (25/30) - Ideal for immediate automation

### 2. Employee Onboarding Assessment

```json
{
  "process_name": "Employee Onboarding",
  "repetitiveness_score": 3,
  "rule_based_score": 4,
  "complexity_score": 2,
  "volume_score": 3,
  "standardization_score": 3,
  "current_errors_score": 2,
  "total_score": 17,
  "automation_suitability": "possibly_automatable"
}
```

**Result**: Possibly Automatable (17/30) - Consider semi-automation

## 🎬 Demo Video

[Link to demo video will be provided here]

---

**Built with ❤️ for automating the future of work**
