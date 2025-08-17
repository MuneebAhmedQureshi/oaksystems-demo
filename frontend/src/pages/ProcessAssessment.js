import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProcessAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      repetitiveness_score: 3,
      rule_based_score: 3,
      complexity_score: 3,
      volume_score: 3,
      standardization_score: 3,
      current_errors_score: 3
    }
  });

  const watchedScores = watch([
    'repetitiveness_score',
    'rule_based_score', 
    'complexity_score',
    'volume_score',
    'standardization_score',
    'current_errors_score'
  ]);

  useEffect(() => {
    const scores = watchedScores.map(score => parseInt(score) || 0);
    const total = scores.reduce((sum, score) => sum + score, 0);
    setTotalScore(total);
  }, [watchedScores]);

  useEffect(() => {
    if (id) {
      loadAssessment();
    }
  }, [id]);

  const loadAssessment = async () => {
    try {
      const response = await api.get(`/tasks/assessments/${id}/`);
      const data = response.data;
      
      Object.keys(data).forEach(key => {
        setValue(key, data[key]);
      });
    } catch (error) {
      toast.error('Failed to load assessment');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      if (id) {
        await api.put(`/tasks/assessments/${id}/`, data);
        toast.success('Assessment updated successfully!');
      } else {
        await api.post('/tasks/assessments/', data);
        toast.success('Assessment created successfully!');
      }
      navigate('/processes');
    } catch (err) {
      setError('Failed to save assessment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSuitabilityInfo = (score) => {
    if (score >= 21) {
      return { text: 'Highly Automatable', color: 'success', bg: 'success' };
    } else if (score >= 11) {
      return { text: 'Possibly Automatable', color: 'warning', bg: 'warning' };
    } else {
      return { text: 'Not Suitable for Automation', color: 'danger', bg: 'danger' };
    }
  };

  const suitability = getSuitabilityInfo(totalScore);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>{id ? 'Edit' : 'New'} Process Assessment</h1>
          <p className="text-muted">
            Evaluate process automation potential using 6 key factors
          </p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Basic Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Process Name *</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('process_name', { required: 'Process name is required' })}
                        isInvalid={errors.process_name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.process_name?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('department')}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register('description')}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Process Owner</Form.Label>
                  <Form.Control
                    type="text"
                    {...register('process_owner')}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Assessment Factors (Score 1-5)</h5>
              </Card.Header>
              <Card.Body>
                {[
                  {
                    name: 'repetitiveness_score',
                    label: 'Repetitiveness',
                    description: 'How frequently is the process executed?',
                    remarks: 'repetitiveness_remarks'
                  },
                  {
                    name: 'rule_based_score',
                    label: 'Rule-Based',
                    description: 'Is the process deterministic with clear rules?',
                    remarks: 'rule_based_remarks'
                  },
                  {
                    name: 'complexity_score',
                    label: 'Complexity',
                    description: 'Process complexity (lower = more automatable)',
                    remarks: 'complexity_remarks'
                  },
                  {
                    name: 'volume_score',
                    label: 'Volume',
                    description: 'Transaction/instance volume per day/week',
                    remarks: 'volume_remarks'
                  },
                  {
                    name: 'standardization_score',
                    label: 'Standardization',
                    description: 'Input/output standardization level',
                    remarks: 'standardization_remarks'
                  },
                  {
                    name: 'current_errors_score',
                    label: 'Current Errors',
                    description: 'Manual error rate (higher = more need for automation)',
                    remarks: 'current_errors_remarks'
                  }
                ].map((factor, index) => (
                  <div key={factor.name} className="factor-row">
                    <Row>
                      <Col md={4}>
                        <Form.Label className="factor-label">{factor.label}</Form.Label>
                        <p className="text-muted small mb-2">{factor.description}</p>
                      </Col>
                      <Col md={2}>
                        <Form.Control
                          type="number"
                          min="1"
                          max="5"
                          className="score-input"
                          {...register(factor.name, { 
                            required: true,
                            min: 1,
                            max: 5,
                            valueAsNumber: true
                          })}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          placeholder="Justification/remarks..."
                          {...register(factor.remarks)}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Assessment Results</h5>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-3">
                  <h2 className="display-4 text-primary">{totalScore}/30</h2>
                  <p className="text-muted">Total Score</p>
                </div>
                
                <div className={`alert alert-${suitability.bg} mb-3`}>
                  <strong>{suitability.text}</strong>
                </div>

                <div className="score-visualization mb-3">
                  <div 
                    className="score-marker"
                    style={{ left: `${(totalScore / 30) * 100}%` }}
                  ></div>
                </div>

                <small className="text-muted">
                  {totalScore >= 21 && "Ideal for full automation"}
                  {totalScore >= 11 && totalScore < 21 && "Consider semi-automation"}
                  {totalScore < 11 && "Keep manual or redesign process"}
                </small>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Additional Information</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Estimated Cost Savings (USD/year)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    {...register('estimated_cost_savings')}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Estimated Time Savings (hours/week)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    {...register('estimated_time_savings')}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Implementation Effort</Form.Label>
                  <Form.Select {...register('implementation_effort')}>
                    <option value="">Select effort level</option>
                    <option value="low">Low (1-2 weeks)</option>
                    <option value="medium">Medium (1-2 months)</option>
                    <option value="high">High (3+ months)</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-grid gap-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Saving...' : (id ? 'Update Assessment' : 'Save Assessment')}
              </Button>
              
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/processes')}
              >
                Cancel
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default ProcessAssessment;
