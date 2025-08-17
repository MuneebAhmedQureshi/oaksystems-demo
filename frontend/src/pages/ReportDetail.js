import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      const response = await api.get(`/tasks/reports/${id}/`);
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to load report');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const generateAIConclusion = async () => {
    setGeneratingAI(true);
    try {
      const response = await api.post(`/tasks/reports/${id}/ai-conclusion/`);
      setReport({
        ...report,
        ai_conclusion: response.data.ai_conclusion
      });
      toast.success('AI conclusion generated successfully');
    } catch (error) {
      toast.error('Failed to generate AI conclusion');
    } finally {
      setGeneratingAI(false);
    }
  };

  const downloadReport = async (format) => {
    try {
      const response = await api.get(`/tasks/reports/${id}/download/${format}/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()} report`);
    }
  };

  const getSuitabilityBadge = (suitability) => {
    const variants = {
      'highly_automatable': 'success',
      'possibly_automatable': 'warning',
      'not_suitable': 'danger'
    };
    return variants[suitability] || 'secondary';
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      'high': 'danger',
      'medium': 'warning', 
      'low': 'secondary'
    };
    return variants[priority] || 'secondary';
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

  if (!report) {
    return (
      <Container>
        <div className="text-center py-5">
          <h5>Report not found</h5>
          <Button variant="primary" onClick={() => navigate('/reports')}>
            Back to Reports
          </Button>
        </div>
      </Container>
    );
  }

  const highPriorityProcesses = report.assessments?.filter(p => p.automation_suitability === 'highly_automatable') || [];
  const mediumPriorityProcesses = report.assessments?.filter(p => p.automation_suitability === 'possibly_automatable') || [];
  const lowPriorityProcesses = report.assessments?.filter(p => p.automation_suitability === 'not_suitable') || [];

  return (
    <Container fluid>
      <div className="report-header">
        <Row className="align-items-center">
          <Col>
            <Button
              variant="light"
              className="me-3 mb-3"
              onClick={() => navigate('/reports')}
            >
              <FiArrowLeft className="me-2" />
              Back to Reports
            </Button>
            <h1 className="text-white mb-2">{report.title}</h1>
            <p className="text-white-50 mb-0">
              Generated on {new Date(report.created_at).toLocaleDateString()}
            </p>
          </Col>
          <Col xs="auto">
            <div className="download-section">
              <Button
                variant="success"
                className="me-2"
                onClick={() => downloadReport('pdf')}
              >
                <FiDownload className="me-2" />
                Download PDF
              </Button>
              <Button
                variant="info"
                onClick={() => downloadReport('csv')}
              >
                <FiDownload className="me-2" />
                Download CSV
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {report.description && (
        <Alert variant="info" className="mb-4">
          <strong>Description:</strong> {report.description}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{report.highly_automatable_count}</h3>
              <p className="text-muted mb-0">Highly Automatable</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{report.possibly_automatable_count}</h3>
              <p className="text-muted mb-0">Possibly Automatable</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{report.not_suitable_count}</h3>
              <p className="text-muted mb-0">Not Suitable</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{report.assessments?.length || 0}</h3>
              <p className="text-muted mb-0">Total Processes</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Detailed Assessment Results</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Process Name</th>
                  <th>Repetitiveness</th>
                  <th>Rule-Based</th>
                  <th>Complexity</th>
                  <th>Volume</th>
                  <th>Standardization</th>
                  <th>Error Rate</th>
                  <th>Total Score</th>
                  <th>Automation Suitability</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {report.assessments?.map((assessment, index) => (
                  <tr key={assessment.id}>
                    <td>{index + 1}</td>
                    <td>{assessment.process_name}</td>
                    <td>{assessment.repetitiveness_score}</td>
                    <td>{assessment.rule_based_score}</td>
                    <td>{assessment.complexity_score}</td>
                    <td>{assessment.volume_score}</td>
                    <td>{assessment.standardization_score}</td>
                    <td>{assessment.current_errors_score}</td>
                    <td>
                      <strong>{assessment.total_score}/30</strong>
                    </td>
                    <td>
                      <Badge bg={getSuitabilityBadge(assessment.automation_suitability)}>
                        {assessment.automation_suitability_display}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getPriorityBadge(assessment.priority)}>
                        {assessment.priority_display}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Priority-based Recommendations */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-success text-white">
              <h6 className="mb-0">High Priority (Score 21-30) – Automate Immediately</h6>
            </Card.Header>
            <Card.Body>
              {highPriorityProcesses.length > 0 ? (
                <ul className="list-unstyled">
                  {highPriorityProcesses.map((process) => (
                    <li key={process.id} className="mb-2">
                      <strong>{process.process_name}</strong> ({process.total_score})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No high priority processes</p>
              )}
              <small className="text-muted">
                Next Steps: Implement full automation for these processes ASAP.
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0">Medium Priority (Score 11-20) – Consider Partial Automation</h6>
            </Card.Header>
            <Card.Body>
              {mediumPriorityProcesses.length > 0 ? (
                <ul className="list-unstyled">
                  {mediumPriorityProcesses.map((process) => (
                    <li key={process.id} className="mb-2">
                      <strong>{process.process_name}</strong> ({process.total_score})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No medium priority processes</p>
              )}
              <small className="text-muted">
                Next Steps: Some manual intervention is needed, consider semi-automation.
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-danger text-white">
              <h6 className="mb-0">Low Priority (Score 0-10) – Keep Manual</h6>
            </Card.Header>
            <Card.Body>
              {lowPriorityProcesses.length > 0 ? (
                <ul className="list-unstyled">
                  {lowPriorityProcesses.map((process) => (
                    <li key={process.id} className="mb-2">
                      <strong>{process.process_name}</strong> ({process.total_score})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No low priority processes</p>
              )}
              <small className="text-muted">
                Next Steps: This process requires human judgment and is not suitable for automation.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AI Conclusion */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">AI-Generated Conclusion</h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={generateAIConclusion}
            disabled={generatingAI}
          >
            <FiRefreshCw className={`me-2 ${generatingAI ? 'spin' : ''}`} />
            {generatingAI ? 'Generating...' : 'Generate AI Conclusion'}
          </Button>
        </Card.Header>
        <Card.Body>
          {report.ai_conclusion ? (
            <div className="ai-conclusion">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {report.ai_conclusion}
              </pre>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No AI conclusion generated yet</p>
              <Button variant="primary" onClick={generateAIConclusion} disabled={generatingAI}>
                Generate AI Conclusion
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReportDetail;
