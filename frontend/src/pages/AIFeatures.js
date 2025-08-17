import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Table, Badge } from 'react-bootstrap';
import { FiCpu, FiTrendingUp, FiTarget, FiPlay } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const AIFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [predictionData, setPredictionData] = useState({
    process_name: '',
    scores: {
      repetitiveness_score: 3,
      rule_based_score: 3,
      complexity_score: 3,
      volume_score: 3,
      standardization_score: 3,
      current_errors_score: 3
    }
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [similarityResult, setSimilarityResult] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);

  useEffect(() => {
    loadProcesses();
    loadAnalysisHistory();
  }, []);

  const loadProcesses = async () => {
    try {
      const response = await api.get('/tasks/assessments/');
      setProcesses(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load processes:', error);
    }
  };

  const loadAnalysisHistory = async () => {
    try {
      const response = await api.get('/ai/analysis-history/');
      setAnalysisHistory(response.data);
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    }
  };

  const runSimilarityAnalysis = async () => {
    if (processes.length < 3) {
      toast.error('Need at least 3 assessments for similarity analysis');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai/similarity-analysis/');
      setSimilarityResult(response.data);
      toast.success('Similarity analysis completed!');
      loadAnalysisHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const predictAutomationSuccess = async () => {
    if (!predictionData.process_name) {
      toast.error('Please enter a process name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai/predict-success/', predictionData);
      setPredictionResult(response.data);
      toast.success('Success prediction completed!');
      loadAnalysisHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const generateOptimizationSuggestions = async () => {
    if (!predictionData.process_name) {
      toast.error('Please enter a process name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai/optimization-suggestions/', predictionData);
      setOptimizationResult(response.data);
      toast.success('Optimization suggestions generated!');
      loadAnalysisHistory();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (factor, value) => {
    setPredictionData({
      ...predictionData,
      scores: {
        ...predictionData.scores,
        [factor]: parseInt(value)
      }
    });
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>AI Features</h1>
          <p className="text-muted">
            Advanced AI-powered analysis for process automation assessment
          </p>
        </Col>
      </Row>

      <Alert variant="success" className="mb-4">
        <strong>AI Features Enabled!</strong> Advanced analytics are now available for your automation assessments.
      </Alert>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header className="text-center">
              <FiCpu size={48} className="text-primary mb-3" />
              <h5>Process Similarity Analysis</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Uses machine learning to identify similar processes based on their 
                assessment scores and characteristics.
              </p>
              <ul className="small mb-3">
                <li>Clustering algorithm to group similar processes</li>
                <li>Identify automation patterns</li>
                <li>Benchmark against similar processes</li>
              </ul>
              <p className="small text-muted">
                Requires at least 3 process assessments
              </p>
            </Card.Body>
            <Card.Footer>
              <Button 
                variant="primary" 
                className="w-100"
                onClick={runSimilarityAnalysis}
                disabled={loading || processes.length < 3}
              >
                <FiPlay className="me-2" />
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header className="text-center">
              <FiTrendingUp size={48} className="text-success mb-3" />
              <h5>Automation Success Prediction</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Predicts the likelihood of successful automation implementation 
                based on process characteristics.
              </p>
              <ul className="small mb-3">
                <li>Success probability scoring</li>
                <li>Risk factor identification</li>
                <li>Implementation recommendations</li>
              </ul>
              <Form.Group className="mb-2">
                <Form.Label className="small">Process Name</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={predictionData.process_name}
                  onChange={(e) => setPredictionData({...predictionData, process_name: e.target.value})}
                  placeholder="Enter process name"
                />
              </Form.Group>
            </Card.Body>
            <Card.Footer>
              <Button 
                variant="success" 
                className="w-100"
                onClick={predictAutomationSuccess}
                disabled={loading}
              >
                <FiPlay className="me-2" />
                {loading ? 'Predicting...' : 'Predict Success'}
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header className="text-center">
              <FiTarget size={48} className="text-warning mb-3" />
              <h5>Optimization Suggestions</h5>
            </Card.Header>
            <Card.Body>
              <p>
                AI-powered recommendations to improve process scores and 
                automation readiness.
              </p>
              <ul className="small mb-3">
                <li>Factor-specific improvement suggestions</li>
                <li>Priority-based recommendations</li>
                <li>Potential impact estimation</li>
              </ul>
            </Card.Body>
            <Card.Footer>
              <Button 
                variant="warning" 
                className="w-100"
                onClick={generateOptimizationSuggestions}
                disabled={loading}
              >
                <FiPlay className="me-2" />
                {loading ? 'Generating...' : 'Get Suggestions'}
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Score Input for Prediction and Optimization */}
      {(activeFeature === 'prediction' || activeFeature === 'optimization' || predictionResult || optimizationResult) && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Process Factors (1-5 scale)</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {[
                { key: 'repetitiveness_score', label: 'Repetitiveness' },
                { key: 'rule_based_score', label: 'Rule-Based' },
                { key: 'complexity_score', label: 'Complexity' },
                { key: 'volume_score', label: 'Volume' },
                { key: 'standardization_score', label: 'Standardization' },
                { key: 'current_errors_score', label: 'Current Errors' }
              ].map((factor) => (
                <Col md={2} key={factor.key} className="mb-3">
                  <Form.Label className="small">{factor.label}</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="5"
                    value={predictionData.scores[factor.key]}
                    onChange={(e) => handleScoreChange(factor.key, e.target.value)}
                    className="text-center"
                  />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Results Sections */}
      {similarityResult && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Similarity Analysis Results</h5>
          </Card.Header>
          <Card.Body>
            {similarityResult.insights.map((insight, index) => (
              <Alert key={index} variant="info">
                <strong>Cluster {insight.cluster_id}:</strong> {insight.insight}
                <br />
                <strong>Processes:</strong> {insight.processes.join(', ')}
                <br />
                <strong>Average Score:</strong> {insight.average_score}
              </Alert>
            ))}
          </Card.Body>
        </Card>
      )}

      {predictionResult && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Automation Success Prediction</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-center">
                  <h2 className="text-success">{predictionResult.success_probability}%</h2>
                  <p className="text-muted">Success Probability</p>
                </div>
              </Col>
              <Col md={8}>
                <h6>Recommendation:</h6>
                <p>{predictionResult.recommendation}</p>
                {predictionResult.risk_factors.length > 0 && (
                  <>
                    <h6>Risk Factors:</h6>
                    <ul>
                      {predictionResult.risk_factors.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </>
                )}
                <small className="text-muted">Confidence: {predictionResult.confidence}%</small>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {optimizationResult && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Optimization Suggestions</h5>
          </Card.Header>
          <Card.Body>
            {optimizationResult.high_priority_suggestions.length > 0 && (
              <>
                <h6 className="text-danger">High Priority Suggestions:</h6>
                {optimizationResult.high_priority_suggestions.map((suggestion, index) => (
                  <Alert key={index} variant="danger">
                    <strong>{suggestion.factor}</strong> (Current: {suggestion.current_score}/5)
                    <br />
                    {suggestion.suggestion}
                    <br />
                    <small>Potential improvement: {suggestion.potential_improvement}</small>
                  </Alert>
                ))}
              </>
            )}
            
            {optimizationResult.medium_priority_suggestions.length > 0 && (
              <>
                <h6 className="text-warning">Medium Priority Suggestions:</h6>
                {optimizationResult.medium_priority_suggestions.map((suggestion, index) => (
                  <Alert key={index} variant="warning">
                    <strong>{suggestion.factor}</strong> (Current: {suggestion.current_score}/5)
                    <br />
                    {suggestion.suggestion}
                    <br />
                    <small>Potential improvement: {suggestion.potential_improvement}</small>
                  </Alert>
                ))}
              </>
            )}
            
            <p className="small text-muted">
              Total suggestions: {optimizationResult.total_suggestions}
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Analysis History</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Process</th>
                    <th>Analysis Type</th>
                    <th>Confidence</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisHistory.map((analysis) => (
                    <tr key={analysis.id}>
                      <td>{analysis.process_name}</td>
                      <td>
                        <Badge bg="primary">{analysis.analysis_type}</Badge>
                      </td>
                      <td>{(analysis.confidence_score * 100).toFixed(1)}%</td>
                      <td>{new Date(analysis.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AIFeatures;
