import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/ui/spinner';
import { CheckCircle, Clock, AlertCircle, Rocket, Target, FileText, Search, Zap } from 'lucide-react';
import KeywordStrategyReview from '../../components/KeywordStrategyReview';
import TopicSelection from '../../components/TopicSelection';
import TitleSelection from '../../components/TitleSelection';
import ResearchReview from '../../components/ResearchReview';
import ContentReview from '../../components/ContentReview';
import BlogIdeaSelection from '../../components/BlogIdeaSelection';
import { API_BASE_URL, API_ENDPOINTS } from '../../lib/config';

export default function CompleteWorkflowDashboard() {
  const router = useRouter();
  const { executionId } = router.query;
  const [currentPhase, setCurrentPhase] = useState('loading');
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (executionId) {
      checkWorkflowPhase();
      const interval = setInterval(checkWorkflowPhase, 3000);
      return () => clearInterval(interval);
    }
  }, [executionId]);

  const checkWorkflowPhase = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.workflow}/${executionId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setWorkflowStatus(data);
      setCurrentPhase(data.phase || 'loading');
      setError(null);
    } catch (error) {
      console.error('Failed to check workflow phase:', error);
      setError(error.message);
    }
  };

  // ✅ SIMPLIFIED: Handlers for each phase
  const handleKeywordStrategyApproval = async (approvalData) => {
    setProcessingAction(true);
    setError(null);
    
    try {
      console.log('Sending approval data:', approvalData);
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.approveKeywordStrategy}/${executionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData)
      });

      const result = await response.json();
      console.log('Approval response:', result);

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (result.success) {
        console.log('Strategy processed successfully');
        setTimeout(() => {
          checkWorkflowPhase();
        }, 1000);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Failed to process strategy:', error);
      setError(`Failed to process request: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleBlogIdeaSelection = async (selectionData) => {
    setProcessingAction(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.approveBlogIdea}/${executionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectionData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success) {
        setTimeout(() => {
          checkWorkflowPhase();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to process blog idea selection:', error);
      setError(`Failed to process request: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleTitleSelection = async (selectionData) => {
    setProcessingAction(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.approveTitle}/${executionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectionData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success) {
        setTimeout(() => {
          checkWorkflowPhase();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to process title selection:', error);
      setError(`Failed to process request: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleResearchApproval = async (approvalData) => {
    setProcessingAction(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.approveResearch}/${executionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success) {
        setTimeout(() => {
          checkWorkflowPhase();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to process research approval:', error);
      setError(`Failed to process request: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleContentApproval = async (approvalData) => {
    setProcessingAction(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.approveContent}/${executionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success) {
        setTimeout(() => {
          checkWorkflowPhase();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to process content approval:', error);
      setError(`Failed to process request: ${error.message}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const getPhaseInfo = (phase) => {
    const phaseMap = {
      'initializing': {
        icon: Rocket,
        title: 'Initializing Workflow',
        description: 'Setting up keyword research and competitor analysis...',
        color: 'text-blue-400'
      },
      'workflow_started': {
        icon: Zap,
        title: 'Workflow Started',
        description: 'Beginning the SEO content creation process...',
        color: 'text-blue-400'
      },
      'keyword_strategy_review': {
        icon: Target,
        title: 'Keyword Strategy Review',
        description: 'Review and approve keyword strategy',
        color: 'text-orange-400'
      },
      'blog_idea_selection': {
        icon: FileText,
        title: 'Blog Idea Selection',
        description: 'Choose your preferred blog topic and angle',
        color: 'text-purple-400'
      },
      'title_selection': {
        icon: FileText,
        title: 'Title Selection',
        description: 'Select your preferred title option',
        color: 'text-purple-400'
      },
      'research_review': {
        icon: Search,
        title: 'Research Review',
        description: 'Review competitor analysis and research data',
        color: 'text-indigo-400'
      },
      'content_review': {
        icon: FileText,
        title: 'Content Review',
        description: 'Final review and approval of generated content',
        color: 'text-green-400'
      },
      'completed': {
        icon: CheckCircle,
        title: 'Workflow Completed',
        description: 'Your SEO-optimized content is ready!',
        color: 'text-green-400'
      }
    };

    return phaseMap[phase] || {
      icon: Clock,
      title: 'Processing',
      description: 'Please wait...',
      color: 'text-gray-400'
    };
  };

  const renderPhase = () => {
    if (error) {
      return (
        <Card className="border-red-600 bg-red-900/20 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Workflow Error
            </CardTitle>
            <CardDescription className="text-red-300">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setError(null);
                checkWorkflowPhase();
              }} 
              variant="outline" 
              className="mr-2 border-red-600 text-red-400 hover:bg-red-900/20"
            >
              Retry
            </Button>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!workflowStatus) {
      return (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardContent className="flex items-center justify-center p-6">
            <Spinner className="mr-2 text-blue-400" />
            <span className="text-gray-300">Loading workflow status...</span>
          </CardContent>
        </Card>
      );
    }

    switch (currentPhase) {
      case 'keyword_strategy_review':
        return (
          <KeywordStrategyReview
            executionId={executionId}
            workflowStatus={workflowStatus}
            onApproval={handleKeywordStrategyApproval}
            processing={processingAction}
          />
        );

      case 'blog_idea_selection':
      return (
         <BlogIdeaSelection
            executionId={executionId}
            workflowStatus={workflowStatus}
            onSelection={handleBlogIdeaSelection}
            processing={processingAction}
         />
       );


      case 'title_selection':
        return (
          <TitleSelection
            executionId={executionId}
            workflowStatus={workflowStatus}
            onSelection={handleTitleSelection}
            processing={processingAction}
          />
        );

      case 'research_review':
        return (
          <ResearchReview
            executionId={executionId}
            workflowStatus={workflowStatus}
            onApproval={handleResearchApproval}
            processing={processingAction}
          />
        );

      case 'content_review':
        return (
          <ContentReview
            executionId={executionId}
            workflowStatus={workflowStatus}
            onApproval={handleContentApproval}
            processing={processingAction}
          />
        );

      default:
        const phaseInfo = getPhaseInfo(currentPhase);
        const PhaseIcon = phaseInfo.icon;
        
        return (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhaseIcon className={`h-5 w-5 ${phaseInfo.color}`} />
                <span className="text-gray-100">{phaseInfo.title}</span>
              </CardTitle>
              <CardDescription className="text-gray-300">{phaseInfo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-gray-600 text-gray-300 bg-gray-800/50">
                    {workflowStatus?.type || 'complete_seo'}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300 bg-gray-800/50">
                    Phase: {currentPhase}
                  </Badge>
                </div>
                
                {currentPhase !== 'completed' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Spinner className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-400">
                        This may take a few moments...
                      </span>
                    </div>
                    <Progress value={30} className="w-full bg-gray-700" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            SEO Workflow Dashboard
          </h1>
          <p className="text-gray-400">
            Execution ID: <code className="bg-gray-800 px-2 py-1 rounded text-sm font-mono text-blue-400">{executionId}</code>
          </p>
        </div>

        {renderPhase()}
      </div>
    </div>
  );
}
