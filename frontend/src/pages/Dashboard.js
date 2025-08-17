import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiAlertCircle,
  FiXCircle 
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProcesses, setRecentProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, processesResponse] = await Promise.all([
        api.get('/tasks/dashboard/stats/'),
        api.get('/tasks/assessments/?limit=5')
      ]);

      setStats(statsResponse.data);
      setRecentProcesses(processesResponse.data.results || processesResponse.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ['Highly Automatable', 'Possibly Automatable', 'Not Suitable'],
    datasets: [
      {
        data: [
          stats?.highly_automatable || 0,
          stats?.possibly_automatable || 0,
          stats?.not_suitable || 0
        ],
        backgroundColor: ['#198754', '#ffc107', '#dc3545'],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const barData = {
    labels: recentProcesses.map(p => p.process_name.substring(0, 20) + '...'),
    datasets: [
      {
        label: 'Automation Score',
        data: recentProcesses.map(p => p.total_score),
        backgroundColor: recentProcesses.map(p => {
          if (p.total_score >= 21) return '#198754';
          if (p.total_score >= 11) return '#ffc107';
          return '#dc3545';
        }),
        borderColor: '#fff',
        borderWidth: 1
      }
    ]
  };

  const getSuitabilityIcon = (suitability) => {
    switch (suitability) {
      case 'highly_automatable':
        return <FiCheckCircle className="text-success" />;
      case 'possibly_automatable':
        return <FiAlertCircle className="text-warning" />;
      default:
        return <FiXCircle className="text-danger" />;
    }
  };

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">Dashboard</h1>
              <p className="text-muted mb-0">
                Process automation assessment overview
              </p>
            </div>
            <Link to="/assessment/new">
              <Button variant="primary" size="lg">
                <FiPlus className="me-2" />
                New Assessment
              </Button>
            </Link>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="stats-number">{stats?.total_processes || 0}</div>
              <div className="text-muted">Total Processes</div>
              <div className="mt-2">
                <FiTrendingUp className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="stats-number text-success">{stats?.highly_automatable || 0}</div>
              <div className="text-muted">Highly Automatable</div>
              <div className="mt-2">
                <FiCheckCircle className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="stats-number text-warning">{stats?.possibly_automatable || 0}</div>
              <div className="text-muted">Possibly Automatable</div>
              <div className="mt-2">
                <FiAlertCircle className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="stats-card">
            <Card.Body>
              <div className="stats-number">
                {stats?.average_score ? stats.average_score.toFixed(1) : '0.0'}
              </div>
              <div className="text-muted">Average Score</div>
              <div className="mt-2">
                <span className="text-info">/ 30</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts and Recent Processes */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Automation Suitability Distribution</h5>
            </Card.Header>
            <Card.Body>
              {stats?.total_processes > 0 ? (
                <Doughnut 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                  height={300}
                />
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">No data available</p>
                  <Link to="/assessment/new">
                    <Button variant="outline-primary">Create First Assessment</Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Process Scores</h5>
            </Card.Header>
            <Card.Body>
              {recentProcesses.length > 0 ? (
                <Bar 
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 30
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                  height={300}
                />
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">No processes assessed yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Processes List */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Assessments</h5>
              <Link to="/processes" className="btn btn-outline-primary btn-sm">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {recentProcesses.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Process Name</th>
                        <th>Department</th>
                        <th>Score</th>
                        <th>Suitability</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProcesses.map((process) => (
                        <tr key={process.id}>
                          <td>
                            <Link 
                              to={`/processes/${process.id}`} 
                              className="text-decoration-none"
                            >
                              {process.process_name}
                            </Link>
                          </td>
                          <td>{process.department || '-'}</td>
                          <td>
                            <span className="fw-bold">{process.total_score}/30</span>
                          </td>
                          <td>
                            <span className="d-flex align-items-center">
                              {getSuitabilityIcon(process.automation_suitability)}
                              <span className="ms-2">
                                {process.automation_suitability_display}
                              </span>
                            </span>
                          </td>
                          <td>
                            {new Date(process.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">No assessments yet</p>
                  <Link to="/assessment/new">
                    <Button variant="primary">
                      <FiPlus className="me-2" />
                      Create Your First Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
