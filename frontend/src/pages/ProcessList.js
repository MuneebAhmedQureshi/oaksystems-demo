import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProcessList = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSuitability, setFilterSuitability] = useState('');

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const response = await api.get('/tasks/assessments/');
      setProcesses(response.data.results || response.data);
    } catch (error) {
      toast.error('Failed to load processes');
    } finally {
      setLoading(false);
    }
  };

  const deleteProcess = async (id) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await api.delete(`/tasks/assessments/${id}/`);
        toast.success('Assessment deleted successfully');
        loadProcesses();
      } catch (error) {
        toast.error('Failed to delete assessment');
      }
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

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.process_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (process.department && process.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSuitability = !filterSuitability || process.automation_suitability === filterSuitability;
    return matchesSearch && matchesSuitability;
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Process Assessments</h1>
              <p className="text-muted mb-0">
                Manage and review all Process Automation Feasibility and Prioritizations
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

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterSuitability}
            onChange={(e) => setFilterSuitability(e.target.value)}
          >
            <option value="">All Suitability Levels</option>
            <option value="highly_automatable">Highly Automatable</option>
            <option value="possibly_automatable">Possibly Automatable</option>
            <option value="not_suitable">Not Suitable</option>
          </Form.Select>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {filteredProcesses.length === 0 ? (
            <div className="text-center py-5">
              <h5>No assessments found</h5>
              <p className="text-muted">
                {processes.length === 0 
                  ? "Start by creating your first process assessment"
                  : "Try adjusting your search filters"
                }
              </p>
              {processes.length === 0 && (
                <Link to="/assessment/new">
                  <Button variant="primary">
                    <FiPlus className="me-2" />
                    Create First Assessment
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Process Name</th>
                    <th>Department</th>
                    <th>Score</th>
                    <th>Automation Suitability</th>
                    <th>Priority</th>
                    <th>Assessed By</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcesses.map((process) => (
                    <tr key={process.id} className="process-card">
                      <td>
                        <Link 
                          to={`/processes/${process.id}`}
                          className="text-decoration-none fw-bold"
                        >
                          {process.process_name}
                        </Link>
                      </td>
                      <td>{process.department || '-'}</td>
                      <td>
                        <span className="fw-bold">{process.total_score}/30</span>
                      </td>
                      <td>
                        <Badge bg={getSuitabilityBadge(process.automation_suitability)}>
                          {process.automation_suitability_display}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getPriorityBadge(process.priority)}>
                          {process.priority_display}
                        </Badge>
                      </td>
                      <td>{process.assessed_by_name}</td>
                      <td>
                        {new Date(process.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/assessment/edit/${process.id}`}>
                            <Button variant="outline-primary" size="sm">
                              <FiEdit />
                            </Button>
                          </Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteProcess(process.id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProcessList;
