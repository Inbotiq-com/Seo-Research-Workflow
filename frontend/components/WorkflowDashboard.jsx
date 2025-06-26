import { useState, useEffect } from 'react';
import axios from 'axios';
import KeywordStrategyReview from './KeywordStrategyReview';
import BlogIdeaSelection from './BlogIdeaSelection';
import TitleSelection from './TitleSelection';
import ResearchReview from './ResearchReview';
import ContentReview from './ContentReview';
import WorkflowResults from './WorkflowResults';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

export default function WorkflowDashboard() {
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startingWorkflow, setStartingWorkflow] = useState(false);

  // Form state for starting new workflows
  const [workflowForm, setWorkflowForm] = useState({
    type: 'complete_seo', // 'keyword_research' or 'complete_seo'
    primary_topic: '',
    competitor_urls: '',
    target_audience: '',
    content_type: 'blog post',
    location: 'United States',
    language: 'English',
    company_name: ''
  });

  useEffect(() => {
    fetchWorkflows();
    const interval = setInterval(fetchWorkflows, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/workflows`);
      setActiveWorkflows(response.data.workflows || []);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  };

  const startWorkflow = async () => {
    if (!workflowForm.primary_topic.trim()) {
      alert('Please enter a primary topic');
      return;
    }

    setStartingWorkflow(true);
    try {
      const endpoint = workflowForm.type === 'keyword_research' 
        ? '/api/workflow/keyword-research/start'
        : '/api/workflow/complete-seo/start';

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, workflowForm);
      
      if (response.data.success) {
        alert('Workflow started successfully!');
        fetchWorkflows();
        // Reset form
        setWorkflowForm({
          ...workflowForm,
          primary_topic: '',
          competitor_urls: '',
          company_name: ''
        });
      }
    } catch (error) {
      console.error('Failed to start workflow:', error);
      alert('Failed to start workflow. Please try again.');
    } finally {
      setStartingWorkflow(false);
    }
  };

  const renderWorkflowComponent = (workflow) => {
    if (!workflow) return null;

    const { execution_id, phase, status, type } = workflow;

    // Keyword research workflow only shows results
    if (type === 'keyword_research') {
      return <WorkflowResults executionId={execution_id} workflowType="keyword_research" />;
    }

    // Complete SEO workflow with HITL
    switch (phase) {
      case 'keyword_strategy_review':
      case 'awaiting_strategy_approval':
        return <KeywordStrategyReview executionId={execution_id} />;
      case 'blog_idea_selection':
      case 'awaiting_idea_selection':
        return <BlogIdeaSelection executionId={execution_id} />;
      case 'title_selection':
      case 'awaiting_title_selection':
        return <TitleSelection executionId={execution_id} />;
      case 'research_review':
      case 'awaiting_research_approval':
        return <ResearchReview executionId={execution_id} />;
      case 'content_review':
      case 'awaiting_content_review':
        return <ContentReview executionId={execution_id} />;
      case 'completed':
        return <WorkflowResults executionId={execution_id} workflowType="complete_seo" />;
      default:
        return (
          <div className="workflow-status">
            <h3>Workflow Status: {status}</h3>
            <p>Phase: {phase}</p>
            <p>The workflow is currently processing. Please wait...</p>
          </div>
        );
    }
  };

  return (
    <div className="workflow-dashboard">
      <div className="dashboard-header">
        <h1>🚀 SEO Workflow Dashboard</h1>
        <p>Manage your keyword research and blog content generation workflows</p>
      </div>

      <div className="dashboard-content">
        {/* Start New Workflow Section */}
        <div className="new-workflow-section">
          <h2>🆕 Start New Workflow</h2>
          
          <div className="workflow-form">
            <div className="form-group">
              <label>Workflow Type:</label>
              <select 
                value={workflowForm.type} 
                onChange={(e) => setWorkflowForm({...workflowForm, type: e.target.value})}
              >
                <option value="keyword_research">Keyword Research Only</option>
                <option value="complete_seo">Complete SEO Workflow (with Blog Generation)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Primary Topic: *</label>
              <input
                type="text"
                placeholder="e.g., AI automation for small business"
                value={workflowForm.primary_topic}
                onChange={(e) => setWorkflowForm({...workflowForm, primary_topic: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Competitor URLs (comma-separated):</label>
              <textarea
                placeholder="e.g., zapier.com, n8n.io, make.com"
                value={workflowForm.competitor_urls}
                onChange={(e) => setWorkflowForm({...workflowForm, competitor_urls: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Audience:</label>
                <input
                  type="text"
                  placeholder="e.g., small business owners"
                  value={workflowForm.target_audience}
                  onChange={(e) => setWorkflowForm({...workflowForm, target_audience: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Content Type:</label>
                <select 
                  value={workflowForm.content_type} 
                  onChange={(e) => setWorkflowForm({...workflowForm, content_type: e.target.value})}
                >
                  <option value="blog post">Blog Post</option>
                  <option value="article">Article</option>
                  <option value="guide">Guide</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location:</label>
                <select 
                  value={workflowForm.location} 
                  onChange={(e) => setWorkflowForm({...workflowForm, location: e.target.value})}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="form-group">
                <label>Language:</label>
                <select 
                  value={workflowForm.language} 
                  onChange={(e) => setWorkflowForm({...workflowForm, language: e.target.value})}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>

            {workflowForm.type === 'complete_seo' && (
              <div className="form-group">
                <label>Company Name (for research context):</label>
                <input
                  type="text"
                  placeholder="Your company name"
                  value={workflowForm.company_name}
                  onChange={(e) => setWorkflowForm({...workflowForm, company_name: e.target.value})}
                />
              </div>
            )}

            <button 
              onClick={startWorkflow} 
              disabled={startingWorkflow || !workflowForm.primary_topic.trim()}
              className="start-workflow-btn"
            >
              {startingWorkflow ? 'Starting...' : `Start ${workflowForm.type === 'keyword_research' ? 'Keyword Research' : 'Complete SEO'} Workflow`}
            </button>
          </div>
        </div>

        {/* Active Workflows Section */}
        <div className="active-workflows-section">
          <h2>📊 Active Workflows ({activeWorkflows.length})</h2>
          
          {activeWorkflows.length === 0 ? (
            <div className="no-workflows">
              <p>No active workflows. Start a new workflow above.</p>
            </div>
          ) : (
            <div className="workflows-list">
              {activeWorkflows.map((workflow) => (
                <div 
                  key={workflow.execution_id} 
                  className={`workflow-card ${selectedWorkflow?.execution_id === workflow.execution_id ? 'selected' : ''}`}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <div className="workflow-header">
                    <h4>{workflow.input_data?.primary_topic || workflow.input_data?.body?.primary_topic || 'Workflow'}</h4>
                    <span className={`status-badge ${workflow.status.replace(/_/g, '-')}`}>
                      {workflow.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="workflow-meta">
                    <p><strong>Type:</strong> {workflow.type?.replace(/_/g, ' ') || 'Unknown'}</p>
                    <p><strong>Phase:</strong> {workflow.phase?.replace(/_/g, ' ') || 'Unknown'}</p>
                    <p><strong>Started:</strong> {new Date(workflow.timestamp).toLocaleString()}</p>
                    {workflow.attempt_counters && Object.values(workflow.attempt_counters).some(count => count > 0) && (
                      <p><strong>Regenerations:</strong> {JSON.stringify(workflow.attempt_counters)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Workflow Detail Section */}
        {selectedWorkflow && (
          <div className="workflow-detail-section">
            <div className="workflow-detail-header">
              <h2>🔍 Workflow Details: {selectedWorkflow.input_data?.primary_topic || selectedWorkflow.input_data?.body?.primary_topic}</h2>
              <button 
                onClick={() => setSelectedWorkflow(null)}
                className="close-detail-btn"
              >
                ✕
              </button>
            </div>
            
            {renderWorkflowComponent(selectedWorkflow)}
          </div>
        )}
      </div>
    </div>
  );
}
