import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner';
import { Rocket, Target, Globe, Users, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

export default function Home() {
  const [workflowData, setWorkflowData] = useState({
    type: 'complete_seo', // Keep type for backend compatibility, UI for selection is removed.
    primary_topic: '',
    competitor_urls: '',
    target_audience: '',
    content_type: 'blog post',
    location: 'United States',
    language: 'English',
    company_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [executionId, setExecutionId] = useState(''); // Kept for success message and potential future use.
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setWorkflowData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleStartWorkflow = async (e) => {
    e.preventDefault();
    
    if (!workflowData.primary_topic.trim()) {
      setError('Primary topic is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Endpoint is now fixed to 'complete_seo'
      const endpoint = '/api/workflow/complete-seo/start';

      console.log('Starting workflow: complete_seo at endpoint:', endpoint);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData)
      });

      const result = await response.json();
      
      console.log('Workflow response:', result);

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (result.success) {
        setExecutionId(result.execution_id);
        const workflowName = 'Complete SEO';
        setSuccessMessage(`${workflowName} workflow started successfully! Execution ID: ${result.execution_id}`);
        
        // Redirect to workflow dashboard after short delay
        setTimeout(() => {
          router.push(`/workflow/${result.execution_id}`);
        }, 2000);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
      setError(`Failed to start workflow: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setError('');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.health}`);
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Backend Connection: ${result.status}\n🔗 Using ngrok: ${result.using_ngrok ? 'YES' : 'NO'}\n🌐 External URL: ${result.backend_url}\n📊 Active workflows: ${result.active_workflows}`);
      } else {
        alert('❌ Backend connection failed');
      }
    } catch (error) {
      alert('❌ Backend connection failed: ' + error.message);
      setError('Backend connection failed. Please make sure the backend server is running.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            🚀 SEO Workflow Generator
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Start a new SEO content workflow to supercharge your content strategy.
          </p>
          {/* Test Backend Connection button removed */}
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-900/20 shadow-md max-w-3xl mx-auto">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Display */}
        {successMessage && (
          <Card className="mb-6 border-green-500 bg-green-900/20 shadow-md max-w-3xl mx-auto">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <strong>Success:</strong> {successMessage}
              </div>
              <p className="text-sm text-green-400 mt-1">
                🔄 Redirecting to workflow dashboard...
              </p>
            </CardContent>
          </Card>
        )}

        <div className="max-w-3xl mx-auto">
          {/* New Workflow Form */}
          <Card className="bg-slate-800/90 backdrop-blur-sm shadow-2xl border border-slate-700 hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl text-white">
                <Rocket className="w-7 h-7 text-blue-400" />
                Start New SEO Workflow
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Create a new SEO content workflow with AI-powered research and optimization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleStartWorkflow} className="space-y-8">

                {/* Primary Topic */}
                <div className="space-y-3">
                  <Label htmlFor="topic" className="flex items-center gap-2 text-base font-medium text-slate-200">
                    <Target className="w-5 h-5 text-blue-400" />
                    Primary Topic *
                  </Label>
                  <Input
                    id="topic"
                    placeholder="e.g., 'artificial intelligence in healthcare'"
                    value={workflowData.primary_topic}
                    onChange={(e) => handleInputChange('primary_topic', e.target.value)}
                    required
                    className="h-14 text-lg bg-slate-700 border-2 border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-white placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                {/* Competitor URLs */}
                <div className="space-y-3">
                  <Label htmlFor="competitors" className="flex items-center gap-2 text-base font-medium text-slate-200">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Competitor URLs
                  </Label>
                  <Textarea
                    id="competitors"
                    placeholder="https://competitor1.com, https://competitor2.com (optional)"
                    value={workflowData.competitor_urls}
                    onChange={(e) => handleInputChange('competitor_urls', e.target.value)}
                    rows={4}
                    className="text-lg bg-slate-700 border-2 border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-white placeholder:text-slate-400 shadow-sm"
                  />
                </div>
                
                {/* Target Audience */}
                <div className="space-y-3">
                  <Label htmlFor="audience" className="flex items-center gap-2 text-base font-medium text-slate-200">
                    <Users className="w-5 h-5 text-blue-400" />
                    Target Audience
                  </Label>
                  <Input
                    id="audience"
                    placeholder="e.g., 'healthcare professionals, tech entrepreneurs'"
                    value={workflowData.target_audience}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    className="h-14 text-lg bg-slate-700 border-2 border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-white placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="content-type" className="text-base font-medium text-slate-200">Content Type</Label>
                    <select
                      id="content-type"
                      value={workflowData.content_type}
                      onChange={(e) => handleInputChange('content_type', e.target.value)}
                      className="w-full h-14 px-4 py-2 text-lg bg-slate-700 border-2 border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 text-white shadow-sm"
                    >
                      <option value="blog post">Blog Post</option>
                      <option value="article">Article</option>
                      <option value="guide">Guide</option>
                      <option value="tutorial">Tutorial</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-base font-medium text-slate-200">Location</Label>
                    <select
                      id="location"
                      value={workflowData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full h-14 px-4 py-2 text-lg bg-slate-700 border-2 border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 text-white shadow-sm"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Spain">Spain</option>
                      <option value="India">India</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Japan">Japan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="language" className="text-base font-medium text-slate-200">Language</Label>
                    <select
                      id="language"
                      value={workflowData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full h-14 px-4 py-2 text-lg bg-slate-700 border-2 border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 text-white shadow-sm"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="company" className="text-base font-medium text-slate-200">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Your company name (optional)"
                      value={workflowData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className="h-14 text-lg bg-slate-700 border-2 border-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-white placeholder:text-slate-400 shadow-sm"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !workflowData.primary_topic.trim()}
                  className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-3" size="sm" />
                      Starting Workflow...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-3 w-6 h-6" />
                      Start Complete SEO Workflow
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Mobile CTA */}
        <div className="mt-12 text-center lg:hidden">
            <p className="text-slate-300 text-lg mb-4">
                Ready to create amazing SEO content?
            </p>
            <Button
                onClick={() => document.getElementById('topic')?.focus()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-lg"
            >
                🚀 Start New Workflow
            </Button>
        </div>
      </div>
    </div>
  );
}