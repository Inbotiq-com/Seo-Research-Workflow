import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, Download, FileText, Calendar, Globe } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

export default function WorkflowResults({ executionId, workflowType }) {
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflowData();
    const interval = setInterval(fetchWorkflowData, 5000);
    return () => clearInterval(interval);
  }, [executionId]);

  const fetchWorkflowData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.workflow}/${executionId}`);
      setWorkflowData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch workflow data:', error);
      setLoading(false);
    }
  };

  const downloadResult = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <h3>🔄 Loading Results...</h3>
      </div>
    );
  }

  if (!workflowData) {
    return (
      <div className="error-state">
        <h3>❌ Failed to Load Results</h3>
        <p>Unable to retrieve workflow results. Please try again.</p>
      </div>
    );
  }

  const renderKeywordResults = () => {
    const { final_output } = workflowData;
    if (!final_output) return <p>No keyword research results available yet.</p>;

    return (
      <div className="keyword-results">
        <h3>🎯 Keyword Research Results</h3>
        <div className="results-content">
          <div dangerouslySetInnerHTML={{ 
            __html: final_output.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          }} />
        </div>
        <div className="download-section">
          <button 
            onClick={() => downloadResult(final_output, `keyword-strategy-${executionId}.md`)}
            className="download-btn"
          >
            📄 Download Keyword Strategy
          </button>
        </div>
      </div>
    );
  };

  const renderCompleteResults = () => {
    const { final_content, status } = workflowData;
    
    if (status !== 'completed' || !final_content) {
      return (
        <div className="workflow-progress">
          <h3>⏳ Workflow In Progress</h3>
          <p><strong>Current Status:</strong> {status}</p>
          <p><strong>Phase:</strong> {workflowData.phase}</p>
          <p>The workflow is still running. Check back for updates.</p>
        </div>
      );
    }

    return (
      <div className="complete-results">
        <h3>🎉 Complete SEO Workflow Results</h3>
        
        <div className="content-overview">
          <div className="content-stats">
            <div className="stat">
              <strong>Title:</strong> {final_content.seo_title || 'N/A'}
            </div>
            <div className="stat">
              <strong>Word Count:</strong> {final_content.word_count || 'N/A'}
            </div>
            <div className="stat">
              <strong>Keywords Used:</strong> {final_content.keywords_used?.join(', ') || 'N/A'}
            </div>
            <div className="stat">
              <strong>Sources Cited:</strong> {final_content.sources_cited?.length || 0}
            </div>
          </div>
        </div>

        <div className="content-sections">
          <div className="section">
            <h4>📝 SEO Title</h4>
            <p>{final_content.seo_title}</p>
          </div>

          <div className="section">
            <h4>📋 Meta Description</h4>
            <p>{final_content.meta_description}</p>
          </div>

          {final_content.outline && (
            <div className="section">
              <h4>📋 Content Outline</h4>
              <ul>
                {final_content.outline.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="section">
            <h4>📄 Blog Content</h4>
            <div className="content-body" dangerouslySetInnerHTML={{ 
              __html: final_content.blog_content?.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || 'No content available'
            }} />
          </div>

          {final_content.internal_link_opportunities && (
            <div className="section">
              <h4>🔗 Internal Link Opportunities</h4>
              <ul>
                {final_content.internal_link_opportunities.map((link, index) => (
                  <li key={index}>{link}</li>
                ))}
              </ul>
            </div>
          )}

          {final_content.call_to_action && (
            <div className="section">
              <h4>📢 Call to Action</h4>
              <p>{final_content.call_to_action}</p>
            </div>
          )}
        </div>

        <div className="download-section">
          <button 
            onClick={() => downloadResult(JSON.stringify(final_content, null, 2), `blog-content-${executionId}.json`)}
            className="download-btn"
          >
            📄 Download JSON
          </button>
          <button 
            onClick={() => downloadResult(final_content.blog_content || '', `blog-post-${executionId}.md`)}
            className="download-btn"
          >
            📝 Download Blog Post
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="workflow-results">
      <div className="results-header">
        <h2>📊 Workflow Results</h2>
        <div className="workflow-meta">
          <p><strong>Execution ID:</strong> {executionId}</p>
          <p><strong>Type:</strong> {workflowType?.replace(/_/g, ' ') || 'Unknown'}</p>
          <p><strong>Status:</strong> {workflowData.status}</p>
          <p><strong>Started:</strong> {new Date(workflowData.timestamp).toLocaleString()}</p>
          {workflowData.completion_time && (
            <p><strong>Completed:</strong> {new Date(workflowData.completion_time).toLocaleString()}</p>
          )}
        </div>
      </div>

      {workflowType === 'keyword_research' ? renderKeywordResults() : renderCompleteResults()}
    </div>
  );
}
