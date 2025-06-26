const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Store workflow states and execution history
const workflowStates = new Map();
const executionHistory = new Map();
// ✅ Store dynamic webhook URLs from n8n
const webhookUrls = new Map();

// n8n configuration
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://135.235.250.23.nip.io:5678';

// Webhook URLs
const UNIFIED_SEO_WORKFLOW_WEBHOOK = process.env.UNIFIED_SEO_WORKFLOW_WEBHOOK || 
  'http://135.235.250.23.nip.io:5678/webhook-test/unified-seo-workflow-complete';

function generateExecutionId() {
  return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ✅ FIXED: Function to construct complete webhook URL
function constructWebhookURL(baseUrl, suffix) {
  // If baseUrl already includes the suffix, return as is
  if (baseUrl.endsWith(suffix)) {
    return baseUrl;
  }
  // Otherwise append the suffix
  return `${baseUrl}/${suffix}`;
}

// Health check and test endpoints
app.get('/api/health', (req, res) => {
  const EXTERNAL_URL = process.env.EXTERNAL_URL || `http://localhost:${process.env.PORT || 3001}`;
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    active_workflows: workflowStates.size,
    backend_url: EXTERNAL_URL,
    n8n_url: N8N_BASE_URL,
    using_ngrok: !!process.env.EXTERNAL_URL
  });
});

app.get('/api/test', (req, res) => {
  const EXTERNAL_URL = process.env.EXTERNAL_URL || `http://localhost:${process.env.PORT || 3001}`;
  res.json({ 
    message: 'SEO Workflow Backend is running!', 
    timestamp: new Date().toISOString(),
    n8n_url: N8N_BASE_URL,
    unified_seo_webhook: UNIFIED_SEO_WORKFLOW_WEBHOOK,
    workflow_id: 'KPzS5JegCpdIp1XS',
    external_url: EXTERNAL_URL,
    using_ngrok: !!process.env.EXTERNAL_URL
  });
});

// Test n8n connection
app.get('/api/test/n8n', async (req, res) => {
  try {
    const response = await axios.get(`${N8N_BASE_URL}/api/v1/workflows`, {
      timeout: 10000
    });
    res.json({ 
      success: true, 
      message: 'n8n connection successful',
      workflows_count: response.data.data?.length || 0,
      n8n_url: N8N_BASE_URL
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to connect to n8n', 
      details: error.message,
      n8n_url: N8N_BASE_URL
    });
  }
});

// Start Complete SEO workflow
app.post('/api/workflow/complete-seo/start', async (req, res) => {
  try {
    const {
      primary_topic,
      competitor_urls,
      target_audience,
      content_type,
      location,
      language,
      company_name
    } = req.body;

    if (!primary_topic) {
      return res.status(400).json({ error: 'primary_topic is required' });
    }

    const executionId = generateExecutionId();
    const EXTERNAL_URL = process.env.EXTERNAL_URL || `http://localhost:${process.env.PORT || 3001}`;
    
    console.log('🚀 Starting complete SEO workflow...', { 
      executionId, 
      primary_topic,
      webhook: UNIFIED_SEO_WORKFLOW_WEBHOOK,
      external_url: EXTERNAL_URL
    });

    const workflowPayload = {
      body: {
        primary_topic: primary_topic.trim(),
        competitor_urls: competitor_urls || '',
        target_audience: target_audience || 'general audience',
        content_type: content_type || 'blog post',
        location: location || 'United States',
        language: language || 'English',
        company_name: company_name || '',
        execution_id: executionId,
        web_interface_url: EXTERNAL_URL
      }
    };

    console.log('📤 Sending unified SEO workflow payload:', JSON.stringify(workflowPayload, null, 2));

    const response = await axios.post(UNIFIED_SEO_WORKFLOW_WEBHOOK, workflowPayload, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status < 500
    });

    console.log('✅ Unified SEO workflow response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    workflowStates.set(executionId, {
      type: 'complete_seo',
      phase: 'initializing',
      status: 'workflow_started',
      input_data: workflowPayload,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      execution_id: executionId,
      message: 'Complete SEO workflow started successfully',
      status: 'initializing',
      type: 'complete_seo',
      n8n_status: response.status,
      webhook_url: UNIFIED_SEO_WORKFLOW_WEBHOOK,
      workflow_id: 'KPzS5JegCpdIp1XS',
      external_url: EXTERNAL_URL
    });

  } catch (error) {
    console.error('❌ Failed to start complete SEO workflow:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      webhook: UNIFIED_SEO_WORKFLOW_WEBHOOK
    });
    
    res.status(500).json({ 
      error: 'Failed to start complete SEO workflow', 
      details: error.message,
      webhook_url: UNIFIED_SEO_WORKFLOW_WEBHOOK,
      suggestion: 'Check if unified SEO workflow (KPzS5JegCpdIp1XS) is active',
      http_status: error.response?.status
    });
  }
});

// ✅ HITL Endpoints with enhanced webhook URL handling
app.post('/api/hitl/keyword-strategy-review', async (req, res) => {
  const { execution_id, keyword_strategy, research_data, workflow_phase, status, attempt_number, webhook_url } = req.body;
  
  console.log('📨 Received keyword strategy review:', { execution_id, workflow_phase, status, attempt_number });
  
  if (webhook_url) {
    if (!webhookUrls.has(execution_id)) {
      webhookUrls.set(execution_id, {});
    }
    const urls = webhookUrls.get(execution_id);
    // ✅ FIXED: Construct complete webhook URL with suffix
    urls.keyword_strategy = constructWebhookURL(webhook_url, 'keyword-strategy-approval-webhook');
    webhookUrls.set(execution_id, urls);
    console.log('📍 Stored complete keyword webhook URL:', urls.keyword_strategy);
  }
  
  const currentState = workflowStates.get(execution_id) || {};
  workflowStates.set(execution_id, {
    ...currentState,
    phase: workflow_phase,
    status: status,
    keyword_strategy: keyword_strategy,
    research_data: research_data,
    attempt_number: attempt_number || 1,
    timestamp: new Date().toISOString()
  });
  
  res.json({ 
    success: true, 
    message: 'Keyword strategy received for review',
    execution_id,
    attempt_number: attempt_number || 1
  });
});

app.post('/api/hitl/blog-idea-selection', async (req, res) => {
  const { execution_id, blog_ideas, workflow_phase, status, attempt_number, webhook_url } = req.body;
  
  console.log('📨 Received blog idea selection:', { execution_id, workflow_phase, status, attempt_number });
  
  if (webhook_url) {
    if (!webhookUrls.has(execution_id)) {
      webhookUrls.set(execution_id, {});
    }
    const urls = webhookUrls.get(execution_id);
    urls.blog_idea = constructWebhookURL(webhook_url, 'blog-idea-selection-webhook');
    webhookUrls.set(execution_id, urls);
    console.log('📍 Stored complete blog idea webhook URL:', urls.blog_idea);
  }
  
  const currentState = workflowStates.get(execution_id) || {};
  workflowStates.set(execution_id, {
    ...currentState,
    phase: workflow_phase,
    status: status,
    blog_ideas: blog_ideas,
    attempt_number: attempt_number || 1,
    timestamp: new Date().toISOString()
  });
  
  res.json({ 
    success: true, 
    message: 'Blog ideas received for selection',
    execution_id,
    attempt_number: attempt_number || 1
  });
});

app.post('/api/hitl/title-selection', async (req, res) => {
  const { execution_id, title_options, selected_idea, workflow_phase, status, attempt_number, webhook_url } = req.body;
  
  console.log('📨 Received title selection:', { execution_id, workflow_phase, status, attempt_number });
  
  if (webhook_url) {
    if (!webhookUrls.has(execution_id)) {
      webhookUrls.set(execution_id, {});
    }
    const urls = webhookUrls.get(execution_id);
    urls.title = constructWebhookURL(webhook_url, 'title-selection-webhook');
    webhookUrls.set(execution_id, urls);
    console.log('📍 Stored complete title webhook URL:', urls.title);
  }
  
  const currentState = workflowStates.get(execution_id) || {};
  workflowStates.set(execution_id, {
    ...currentState,
    phase: workflow_phase,
    status: status,
    title_options: title_options,
    selected_idea: selected_idea,
    attempt_number: attempt_number || 1,
    timestamp: new Date().toISOString()
  });
  
  res.json({ 
    success: true, 
    message: 'Title options received for selection',
    execution_id,
    attempt_number: attempt_number || 1
  });
});

app.post('/api/hitl/research-review', async (req, res) => {
  const { execution_id, research_data, selected_topic, workflow_phase, status, webhook_url } = req.body;
  
  console.log('📨 Received research review:', { execution_id, workflow_phase, status });
  
  if (webhook_url) {
    if (!webhookUrls.has(execution_id)) {
      webhookUrls.set(execution_id, {});
    }
    const urls = webhookUrls.get(execution_id);
    urls.research = constructWebhookURL(webhook_url, 'research-approval-webhook');
    webhookUrls.set(execution_id, urls);
    console.log('📍 Stored complete research webhook URL:', urls.research);
  }
  
  const currentState = workflowStates.get(execution_id) || {};
  workflowStates.set(execution_id, {
    ...currentState,
    phase: workflow_phase,
    status: status,
    research_data: research_data,
    selected_topic: selected_topic,
    timestamp: new Date().toISOString()
  });
  
  res.json({ 
    success: true, 
    message: 'Research data received for review',
    execution_id 
  });
});

app.post('/api/hitl/content-review', async (req, res) => {
  const { execution_id, blog_content, selected_topic, research_data, workflow_phase, status, attempt_number, webhook_url } = req.body;
  
  console.log('📨 Received content review:', { execution_id, workflow_phase, status, attempt_number });
  
  if (webhook_url) {
    if (!webhookUrls.has(execution_id)) {
      webhookUrls.set(execution_id, {});
    }
    const urls = webhookUrls.get(execution_id);
    urls.content = constructWebhookURL(webhook_url, 'content-approval-webhook');
    webhookUrls.set(execution_id, urls);
    console.log('📍 Stored complete content webhook URL:', urls.content);
  }
  
  const currentState = workflowStates.get(execution_id) || {};
  workflowStates.set(execution_id, {
    ...currentState,
    phase: workflow_phase,
    status: status,
    blog_content: blog_content,
    selected_topic: selected_topic,
    research_data: research_data,
    attempt_number: attempt_number || 1,
    timestamp: new Date().toISOString()
  });
  
  res.json({ 
    success: true, 
    message: 'Content received for review',
    execution_id,
    attempt_number: attempt_number || 1
  });
});

// ✅ ENHANCED: Approval endpoints with timeout handling
app.post('/api/approve/keyword-strategy/:execution_id', async (req, res) => {
  const { execution_id } = req.params;
  const { action, strategy_feedback } = req.body;
  
  try {
    console.log('🔄 Processing keyword strategy response:', execution_id, action);
    
    const approvalPayload = {
      execution_id,
      action: action || 'approve',
      strategy_feedback: strategy_feedback || ''
    };

    const storedUrls = webhookUrls.get(execution_id);
    const webhookURL = storedUrls?.keyword_strategy;
    
    if (!webhookURL) {
      throw new Error('No webhook URL found for this execution. Workflow may not be waiting.');
    }

    console.log('📡 Sending to webhook URL:', webhookURL);
    console.log('📦 Payload:', JSON.stringify(approvalPayload, null, 2));

    // ✅ ENHANCED: Increased timeout and better error handling
    const response = await axios.post(webhookURL, approvalPayload, {
      timeout: 30000, // Increased to 30 seconds
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status < 600 // Accept more status codes for debugging
    });

    console.log('✅ n8n webhook response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    const state = workflowStates.get(execution_id);
    if (state) {
      state.status = action === 'reject' ? 'strategy_rejected' : 'strategy_approved';
      state.last_action = `keyword_strategy_${action}d`;
      state.timestamp = new Date().toISOString();
    }
    
    res.json({ 
      success: true, 
      message: `Keyword strategy ${action}d successfully`,
      action: action,
      webhook_used: webhookURL
    });
  } catch (error) {
    console.error('❌ Failed to send strategy response to n8n:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      execution_id: execution_id,
      webhook_url: webhookUrls.get(execution_id)?.keyword_strategy,
      timeout: error.code === 'ECONNABORTED'
    });
    
    res.status(500).json({ 
      error: 'Failed to send strategy response to n8n',
      details: error.message,
      execution_id: execution_id,
      webhook_url: webhookUrls.get(execution_id)?.keyword_strategy,
      is_timeout: error.code === 'ECONNABORTED'
    });
  }
});

app.post('/api/approve/blog-idea/:execution_id', async (req, res) => {
  const { execution_id } = req.params;
  const { action, selection_feedback, selected_idea_index } = req.body;
  
  try {
    console.log('🔄 Processing blog idea response:', execution_id, action);
    
    const selectionPayload = {
      execution_id,
      action: action || 'approve',
      selection_feedback: selection_feedback || '',
      selected_idea_index: selected_idea_index || 0
    };

    const storedUrls = webhookUrls.get(execution_id);
    const webhookURL = storedUrls?.blog_idea;
    
    if (!webhookURL) {
      throw new Error('No webhook URL found for blog idea selection.');
    }

    console.log('📡 Sending to blog idea webhook URL:', webhookURL);
    await axios.post(webhookURL, selectionPayload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const state = workflowStates.get(execution_id);
    if (state) {
      state.status = action === 'reject' ? 'ideas_rejected' : 'idea_selected';
      state.last_action = `blog_idea_${action}d`;
      state.timestamp = new Date().toISOString();
    }
    
    res.json({ 
      success: true, 
      message: `Blog idea ${action}d`,
      action: action
    });
  } catch (error) {
    console.error('❌ Failed to send idea response to n8n:', error.message);
    res.status(500).json({ 
      error: 'Failed to send idea response to n8n',
      details: error.message
    });
  }
});

app.post('/api/approve/title/:execution_id', async (req, res) => {
  const { execution_id } = req.params;
  const { action, selection_feedback, selected_title_index } = req.body;
  
  try {
    console.log('🔄 Processing title response:', execution_id, action);
    
    const selectionPayload = {
      execution_id,
      action: action || 'approve',
      selection_feedback: selection_feedback || '',
      selected_title_index: selected_title_index || 0
    };

    const storedUrls = webhookUrls.get(execution_id);
    const webhookURL = storedUrls?.title;
    
    if (!webhookURL) {
      throw new Error('No webhook URL found for title selection.');
    }

    console.log('📡 Sending to title webhook URL:', webhookURL);
    await axios.post(webhookURL, selectionPayload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const state = workflowStates.get(execution_id);
    if (state) {
      state.status = action === 'reject' ? 'titles_rejected' : 'title_selected';
      state.last_action = `title_${action}d`;
      state.timestamp = new Date().toISOString();
    }
    
    res.json({ 
      success: true, 
      message: `Title ${action}d`,
      action: action
    });
  } catch (error) {
    console.error('❌ Failed to send title response to n8n:', error.message);
    res.status(500).json({ 
      error: 'Failed to send title response to n8n',
      details: error.message
    });
  }
});

app.post('/api/approve/research/:execution_id', async (req, res) => {
  const { execution_id } = req.params;
  const { action, research_feedback } = req.body;
  
  try {
    console.log('🔄 Sending research approval to n8n:', execution_id);
    
    const approvalPayload = {
      execution_id,
      action: action || 'approve',
      research_feedback: research_feedback || ''
    };

    const storedUrls = webhookUrls.get(execution_id);
    const webhookURL = storedUrls?.research;
    
    if (!webhookURL) {
      throw new Error('No webhook URL found for research approval.');
    }

    console.log('📡 Sending to research webhook URL:', webhookURL);
    await axios.post(webhookURL, approvalPayload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const state = workflowStates.get(execution_id);
    if (state) {
      state.status = 'research_approved';
      state.last_action = 'research_approved';
      state.timestamp = new Date().toISOString();
    }
    
    res.json({ success: true, message: 'Research approved' });
  } catch (error) {
    console.error('❌ Failed to send research approval to n8n:', error.message);
    res.status(500).json({ 
      error: 'Failed to send research approval to n8n',
      details: error.message
    });
  }
});

app.post('/api/approve/content/:execution_id', async (req, res) => {
  const { execution_id } = req.params;
  const { action, content_feedback } = req.body;
  
  try {
    console.log('🔄 Processing content response:', execution_id, action);
    
    const approvalPayload = {
      execution_id,
      action: action || 'approve',
      content_feedback: content_feedback || ''
    };

    const storedUrls = webhookUrls.get(execution_id);
    const webhookURL = storedUrls?.content;
    
    if (!webhookURL) {
      throw new Error('No webhook URL found for content approval.');
    }

    console.log('📡 Sending to content webhook URL:', webhookURL);
    await axios.post(webhookURL, approvalPayload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const state = workflowStates.get(execution_id);
    if (state) {
      if (action === 'reject') {
        state.status = 'content_rejected';
        state.last_action = 'content_rejected';
      } else {
        state.status = 'content_approved';
        state.last_action = 'content_approved';
      }
      state.timestamp = new Date().toISOString();
    }
    
    res.json({ 
      success: true, 
      message: `Content ${action}d`,
      action: action
    });
  } catch (error) {
    console.error('❌ Failed to send content response to n8n:', error.message);
    res.status(500).json({ 
      error: 'Failed to send content response to n8n',
      details: error.message
    });
  }
});

// Get workflow status
app.get('/api/workflow/:execution_id', (req, res) => {
  const { execution_id } = req.params;
  const state = workflowStates.get(execution_id);
  
  if (!state) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  res.json({
    execution_id,
    ...state
  });
});

// Get all workflows
app.get('/api/workflows', (req, res) => {
  const workflows = Array.from(workflowStates.entries()).map(([id, state]) => ({
    execution_id: id,
    ...state
  }));
  
  res.json({ 
    workflows,
    total: workflows.length,
    timestamp: new Date().toISOString()
  });
});

// ✅ ENHANCED: Final delivery endpoint for unified workflow
app.post('/api/publishing/final-delivery', (req, res) => {
  const { 
    execution_id, 
    final_content, 
    workflow_status,
    selected_topic,
    selected_idea,
    research_data,
    workflow_summary,
    original_input,
    content_approval,
    workflow_completion_time
  } = req.body;
  
  console.log('📨 Received final delivery:', execution_id);
  
  const currentState = workflowStates.get(execution_id) || {};
  workflowStates.set(execution_id, {
    ...currentState,
    status: workflow_status,
    phase: 'completed',
    final_content: final_content,
    selected_topic: selected_topic,
    selected_idea: selected_idea,
    research_data: research_data,
    workflow_summary: workflow_summary,
    original_input: original_input,
    content_approval: content_approval,
    completion_time: workflow_completion_time || new Date().toISOString(),
    last_action: 'workflow_completed'
  });
  
  console.log(`✅ Complete workflow ${execution_id} finished successfully`);
  console.log(`📊 Workflow Summary:`, {
    execution_id,
    content_title: final_content?.seo_title,
    word_count: final_content?.word_count,
    total_attempts: workflow_summary ? Object.values(workflow_summary).reduce((a, b) => a + b, 0) : 0
  });
  
  res.json({ 
    success: true, 
    message: 'Content delivered successfully',
    execution_id,
    final_content_preview: {
      title: final_content?.seo_title,
      word_count: final_content?.word_count,
      completion_time: workflow_completion_time
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requested_path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const EXTERNAL_URL = process.env.EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log('🚀 SEO Workflow Backend running successfully!');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌐 External URL: ${EXTERNAL_URL}`);
  console.log(`🔧 N8N Base URL: ${N8N_BASE_URL}`);
  console.log(`📝 Unified SEO Workflow Webhook: ${UNIFIED_SEO_WORKFLOW_WEBHOOK}`);
  console.log(`🆔 Unified Workflow ID: KPzS5JegCpdIp1XS`);
  console.log(`🔗 Using ngrok: ${!!process.env.EXTERNAL_URL ? 'YES' : 'NO'}`);
  console.log('\n✅ Ready to handle workflow requests!');
});
