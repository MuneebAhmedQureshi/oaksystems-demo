import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiArrowLeft, FiDownload } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProcessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcess();
  }, [id]);

  const loadProcess = async () => {
    try {
      const response = await api.get(`/tasks/assessments/${id}/`);
      setProcess(response.data);
    } catch (error) {
      toast.error('Failed to load process details');
      navigate('/processes');
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

  if (!process) {
    return (
      <Container>
        <div className="text-center py-5">
          <h5>Process not found</h5>
          <Link to="/processes">
            <Button variant="primary">Back to Processes</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const getSuitabilityColor = (suitability) => {
    switch (suitability) {
      case 'highly_automatable': return 'success';
      case 'possibly_automatable': return 'warning';
      default: return 'danger';
    }
  };

  const factors = [
    { name: 'Repetitiveness', score: process.repetitiveness_score, remarks: process.repetitiveness_remarks },
    { name: 'Rule-Based', score: process.rule_based_score, remarks: process.rule_based_remarks },
    { name: 'Complexity', score: process.complexity_score, remarks: process.complexity_remarks },
    { name: 'Volume', score: process.volume_score, remarks: process.volume_remarks },
    { name: 'Standardization', score: process.standardization_score, remarks: process.standardization_remarks },
    { name: 'Current Errors', score: process.current_errors_score, remarks: process.current_errors_remarks }
  ];

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button
              variant="outline-secondary"
              className="me-3"
              onClick={() => navigate('/processes')}
            >
              <FiArrowLeft className="me-2" />
              Back
            </Button>
            <div className="flex-grow-1">
              <h1 className="mb-1">{process.process_name}</h1>
              <p className="text-muted mb-0">
                Process Assessment Details
              </p>
            </div>
            <Link to={`/assessment/edit/${process.id}`}>
              <Button variant="primary">
                <FiEdit className="me-2" />
                Edit Assessment
              </Button>
            </Link>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Basic Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <strong>Department:</strong> {process.department || 'Not specified'}
                </Col>
                <Col md={6}>
                  <strong>Process Owner:</strong> {process.process_owner || 'Not specified'}
                </Col>
              </Row>
              {process.description && (
                <Row className="mt-3">
                  <Col>
                    <strong>Description:</strong>
                    <p className="mt-2">{process.description}</p>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Assessment Scores</h5>
            </Card.Header>
            <Card.Body>
              {factors.map((factor, index) => (
                <div key={index} className="factor-row">
                  <Row className="align-items-center">
                    <Col md={3}>
                      <span className="factor-label">{factor.name}</span>
                    </Col>
                    <Col md={2}>
                      <span className="factor-score text-primary">
                        {factor.score}/5
                      </span>
                    </Col>
                    <Col md={7}>
                      <span className="text-muted">
                        {factor.remarks || 'No remarks provided'}
                      </span>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>

          {(process.estimated_cost_savings || process.estimated_time_savings || process.implementation_effort) && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Additional Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {process.estimated_cost_savings && (
                    <Col md={4}>
                      <strong>Estimated Cost Savings:</strong>
                      <p className="mb-0">${parseFloat(process.estimated_cost_savings).toLocaleString()}/year</p>
                    </Col>
                  )}
                  {process.estimated_time_savings && (
                    <Col md={4}>
                      <strong>Estimated Time Savings:</strong>
                      <p className="mb-0">{process.estimated_time_savings} hours/week</p>
                    </Col>
                  )}
                  {process.implementation_effort && (
                    <Col md={4}>
                      <strong>Implementation Effort:</strong>
                      <p className="mb-0">{process.implementation_effort}</p>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Assessment Results</h5>
            </Card.Header>
            <Card.Body className="text-center">
              <div className="mb-3">
                <h2 className="display-4 text-primary">{process.total_score}/30</h2>
                <p className="text-muted">Total Score</p>
              </div>
              
              <Badge 
                bg={getSuitabilityColor(process.automation_suitability)}
                className="automation-badge mb-3"
              >
                {process.automation_suitability_display}
              </Badge>

              <div className="mb-3">
                <strong>Priority: </strong>
                <Badge bg={process.priority === 'high' ? 'danger' : process.priority === 'medium' ? 'warning' : 'secondary'}>
                  {process.priority_display}
                </Badge>
              </div>

              <div className="score-visualization mb-3">
                <div 
                  className="score-marker"
                  style={{ left: `${(process.total_score / 30) * 100}%` }}
                ></div>
              </div>

              <div className="text-start">
                <strong>Recommendation:</strong>
                <p className="small mt-2">{process.recommendation}</p>
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Assessment Info</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Assessed by:</strong> {process.assessed_by_name || 'Unknown'}</p>
              <p><strong>Created:</strong> {new Date(process.created_at).toLocaleDateString()}</p>
              <p><strong>Last Updated:</strong> {new Date(process.updated_at).toLocaleDateString()}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProcessDetail;
