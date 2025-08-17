# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All API endpoints except registration and login require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Authentication Endpoints

### User Registration
```http
POST /auth/register/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securepassword123",
  "password_confirm": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "refresh": "refresh_token_here",
  "access": "access_token_here"
}
```

### User Login
```http
POST /auth/login/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "refresh": "refresh_token_here",
  "access": "access_token_here"
}
```

### Get User Profile
```http
GET /auth/profile/
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "profile": {
    "phone": "",
    "department": "",
    "bio": "",
    "avatar": null,
    "preferences": {}
  }
}
```

## Process Assessment Endpoints

### List Process Assessments
```http
GET /tasks/assessments/
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `search`: Search term for process name
- `automation_suitability`: Filter by suitability (not_suitable, possibly_automatable, highly_automatable)
- `priority`: Filter by priority (low, medium, high)

**Response:**
```json
{
  "count": 10,
  "next": "http://localhost:8000/api/tasks/assessments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "process_name": "Invoice Processing",
      "department": "Finance",
      "total_score": 25,
      "automation_suitability": "highly_automatable",
      "automation_suitability_display": "Highly Automatable",
      "priority": "high",
      "priority_display": "High",
      "assessed_by_name": "John Doe",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Process Assessment
```http
POST /tasks/assessments/
```

**Request Body:**
```json
{
  "process_name": "Invoice Processing",
  "description": "Monthly invoice processing task",
  "department": "Finance",
  "process_owner": "Jane Smith",
  "repetitiveness_score": 4,
  "repetitiveness_remarks": "Performed daily",
  "rule_based_score": 5,
  "rule_based_remarks": "Clear business rules exist",
  "complexity_score": 3,
  "complexity_remarks": "Some exceptions need handling",
  "volume_score": 4,
  "volume_remarks": "High volume during month-end",
  "standardization_score": 5,
  "standardization_remarks": "Standardized invoice templates",
  "current_errors_score": 4,
  "current_errors_remarks": "Frequent manual errors",
  "estimated_cost_savings": 50000.00,
  "estimated_time_savings": 20.5,
  "implementation_effort": "medium"
}
```

**Response:**
```json
{
  "id": 1,
  "process_name": "Invoice Processing",
  "description": "Monthly invoice processing task",
  "department": "Finance",
  "process_owner": "Jane Smith",
  "repetitiveness_score": 4,
  "repetitiveness_remarks": "Performed daily",
  "rule_based_score": 5,
  "rule_based_remarks": "Clear business rules exist",
  "complexity_score": 3,
  "complexity_remarks": "Some exceptions need handling",
  "volume_score": 4,
  "volume_remarks": "High volume during month-end",
  "standardization_score": 5,
  "standardization_remarks": "Standardized invoice templates",
  "current_errors_score": 4,
  "current_errors_remarks": "Frequent manual errors",
  "total_score": 25,
  "automation_suitability": "highly_automatable",
  "automation_suitability_display": "Highly Automatable",
  "priority": "high",
  "priority_display": "High",
  "recommendation": "Process is repetitive, rule-based, and structured—ideal for full automation!",
  "estimated_cost_savings": "50000.00",
  "estimated_time_savings": "20.50",
  "implementation_effort": "medium",
  "assessed_by": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Process Assessment Details
```http
GET /tasks/assessments/{id}/
```

**Response:** Same as create response

### Update Process Assessment
```http
PUT /tasks/assessments/{id}/
```

**Request Body:** Same as create request

### Delete Process Assessment
```http
DELETE /tasks/assessments/{id}/
```

**Response:** 204 No Content

### Bulk Create Assessments
```http
POST /tasks/assessments/bulk/
```

**Request Body:**
```json
{
  "processes": [
    {
      "process_name": "Process 1",
      "repetitiveness_score": 4,
      "rule_based_score": 5,
      "complexity_score": 3,
      "volume_score": 4,
      "standardization_score": 5,
      "current_errors_score": 4
    },
    {
      "process_name": "Process 2",
      "repetitiveness_score": 3,
      "rule_based_score": 4,
      "complexity_score": 2,
      "volume_score": 3,
      "standardization_score": 3,
      "current_errors_score": 2
    }
  ]
}
```

## Reports Endpoints

### List Reports
```http
GET /tasks/reports/
```

**Response:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Q1 Automation Assessment Report",
      "description": "First quarter Process Automation Feasibility and Prioritization",
      "generated_by_name": "John Doe",
      "highly_automatable_count": 3,
      "possibly_automatable_count": 2,
      "not_suitable_count": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Report
```http
POST /tasks/reports/
```

**Request Body:**
```json
{
  "title": "Q1 Automation Assessment Report",
  "description": "First quarter Process Automation Feasibility and Prioritization",
  "assessment_ids": [1, 2, 3, 4, 5, 6]
}
```

### Generate AI Conclusion
```http
POST /tasks/reports/{id}/ai-conclusion/
```

**Response:**
```json
{
  "ai_conclusion": "Based on this assessment, 3 processes are highly automatable, 2 are partially automatable, and 1 should remain manual. Prioritization should focus on high-impact areas to maximize efficiency and cost savings..."
}
```

### Download Report as CSV
```http
GET /tasks/reports/{id}/download/csv/
```

**Response:** CSV file download

### Download Report as PDF
```http
GET /tasks/reports/{id}/download/pdf/
```

**Response:** PDF file download

## Dashboard Endpoints

### Get Dashboard Statistics
```http
GET /tasks/dashboard/stats/
```

**Response:**
```json
{
  "total_processes": 10,
  "highly_automatable": 4,
  "possibly_automatable": 3,
  "not_suitable": 3,
  "average_score": 18.5,
  "total_estimated_savings": "250000.00"
}
```

## AI Features Endpoints

### Analyze Process Similarity
```http
POST /ai/similarity-analysis/
```

**Response:**
```json
{
  "analysis_id": 1,
  "insights": [
    {
      "cluster_id": 0,
      "processes": ["Invoice Processing", "Order Processing"],
      "average_score": 24.5,
      "insight": "These 2 processes have similar automation characteristics"
    }
  ],
  "cluster_groups": {
    "0": [
      {
        "process_name": "Invoice Processing",
        "scores": [4, 5, 3, 4, 5, 4],
        "total_score": 25
      }
    ]
  }
}
```

### Predict Automation Success
```http
POST /ai/predict-success/
```

**Request Body:**
```json
{
  "process_name": "Invoice Processing",
  "scores": {
    "repetitiveness_score": 4,
    "rule_based_score": 5,
    "complexity_score": 3,
    "volume_score": 4,
    "standardization_score": 5,
    "current_errors_score": 4
  }
}
```

**Response:**
```json
{
  "analysis_id": 2,
  "success_probability": 87.5,
  "recommendation": "High success probability - proceed with automation",
  "risk_factors": [],
  "confidence": 85
}
```

### Generate Optimization Suggestions
```http
POST /ai/optimization-suggestions/
```

**Request Body:**
```json
{
  "process_name": "Employee Onboarding",
  "scores": {
    "repetitiveness_score": 3,
    "rule_based_score": 3,
    "complexity_score": 2,
    "volume_score": 3,
    "standardization_score": 2,
    "current_errors_score": 2
  }
}
```

**Response:**
```json
{
  "analysis_id": 3,
  "high_priority_suggestions": [
    {
      "factor": "Rule-Based Logic",
      "current_score": 3,
      "suggestion": "Document decision trees and business rules clearly",
      "potential_improvement": "+1-2 points",
      "priority": "high"
    }
  ],
  "medium_priority_suggestions": [
    {
      "factor": "Standardization",
      "current_score": 2,
      "suggestion": "Create templates and standardize input/output formats",
      "potential_improvement": "+1-2 points",
      "priority": "medium"
    }
  ],
  "total_suggestions": 4
}
```

### Get Analysis History
```http
GET /ai/analysis-history/
```

**Response:**
```json
[
  {
    "id": 1,
    "process_name": "Similarity Analysis",
    "analysis_type": "Similarity Analysis",
    "confidence_score": 0.8,
    "created_at": "2024-01-01T00:00:00Z",
    "results_summary": {...}
  }
]
```

## Automation Templates Endpoints

### List Automation Templates
```http
GET /automation/templates/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Invoice Processing",
    "description": "Template for assessing invoice processing automation potential",
    "category": "Finance & Accounting",
    "default_repetitiveness": 5,
    "default_rule_based": 5,
    "default_complexity": 3,
    "default_volume": 4,
    "default_standardization": 4,
    "default_current_errors": 4,
    "guidance_text": "Invoice processing is typically highly repetitive with clear rules...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Generate Automation Recommendation
```http
POST /automation/recommendations/
```

**Request Body:**
```json
{
  "process_name": "Invoice Processing",
  "current_score": 25,
  "factor_scores": {
    "repetitiveness_score": 4,
    "rule_based_score": 5,
    "complexity_score": 3,
    "volume_score": 4,
    "standardization_score": 5,
    "current_errors_score": 4
  }
}
```

**Response:**
```json
{
  "id": 1,
  "process_name": "Invoice Processing",
  "current_score": 25,
  "recommended_improvements": "Process is well-suited for automation as-is",
  "estimated_impact": "High impact - immediate automation recommended",
  "implementation_steps": "1. Define automation requirements\n2. Select appropriate automation tools\n3. Develop automation solution\n4. Test and validate\n5. Deploy and monitor",
  "generated_for": 1,
  "generated_at": "2024-01-01T00:00:00Z"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "details": {
    "field_name": ["Error message for specific field"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Standard endpoints: 100 requests per minute
- Bulk operations: 10 requests per minute

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `page_size`: Number of items per page (default: 20, max: 100)

Pagination response format:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering and Searching

Most list endpoints support filtering and searching:
- `search`: Full-text search across relevant fields
- `ordering`: Sort by field (prefix with `-` for descending)
- Field-specific filters vary by endpoint

Example:
```
GET /tasks/assessments/?search=invoice&automation_suitability=highly_automatable&ordering=-created_at
```
