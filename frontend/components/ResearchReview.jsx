import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Target, 
  Users, 
  Zap, 
  FileText, 
  ExternalLink, 
  BookOpen, 
  Quote, 
  Clock, 
  TrendingUp, 
  Database, 
  Globe, 
  Lightbulb, 
  Sparkles, 
  BarChart3, 
  Brain, 
  Layers, 
  Shield,
  Hash,
  Tag,
  Eye,
  Star,
  Bookmark,
  ChevronDown,
  ChevronUp,
  MousePointer2
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const getSectionIcon = (heading = '') => {
  const h = heading.toLowerCase();
  if (h.includes('source')) return <Globe className="h-4 w-4" />;
  if (h.includes('topic')) return <Target className="h-4 w-4" />;
  if (h.includes('idea')) return <Lightbulb className="h-4 w-4" />;
  if (h.includes('research')) return <Search className="h-4 w-4" />;
  if (h.includes('insight')) return <Brain className="h-4 w-4" />;
  if (h.includes('content')) return <FileText className="h-4 w-4" />;
  if (h.includes('keyword')) return <Hash className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

const truncateUrl = (url, maxLength = 50) => {
  if (!url || url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
};

/* Inline markdown-style text processing */
const inlineMd = (str = '') => {
  if (!str) return null;
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  const out = [];
  let last = 0;
  let m;
  
  while ((m = regex.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index));
    if (m[2]) out.push(<strong key={m.index}>{m[2]}</strong>);
    else if (m[4]) out.push(<em key={m.index}>{m[4]}</em>);
    last = regex.lastIndex;
  }
  
  if (last < str.length) out.push(str.slice(last));
  return out;
};

/* Rich text renderer with markdown support */
const RichText = ({ text = '' }) => {
  if (!text) return null;
  const blocks = text.split(/\n{2,}/);
  
  const renderLine = (line) => {
    const kwMatch = line.match(/\s\*\s*Target Keywords\s*:\s*(.*)/i);
    if (kwMatch) {
      const pre = line.slice(0, kwMatch.index).trim();
      const kws = kwMatch[1].trim();
      return (
        <>
          {inlineMd(pre)}
          {' — '}
          <Badge variant="secondary" className="ml-1">
            Target Keywords: {kws}
          </Badge>
        </>
      );
    }
    return inlineMd(line);
  };

  return blocks.map((blk, i) => {
    const lines = blk.split('\n').filter(Boolean);
    const isBulletBlock = lines.every((ln) => ln.trim().match(/^[-*]\s+/));
    
    if (isBulletBlock) {
      const items = lines.map((ln) => ln.replace(/^[-*]\s+/, '').trim());
      return (
        <ul key={i} className="list-disc list-inside space-y-2 mb-4 text-sm text-muted-foreground">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">{renderLine(item)}</li>
          ))}
        </ul>
      );
    }
    
    return (
      <p key={i} className="mb-4 text-sm text-muted-foreground leading-relaxed">
        {renderLine(blk)}
      </p>
    );
  });
};

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export default function ResearchReview({ executionId, workflowStatus, onApproval, processing }) {
  const [researchFeedback, setResearchFeedback] = useState('');
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);

  const handleAction = async (action) => {
    if (loading || processing) return;
    setLoading(true);
    
    try {
      const payload = {
        action: action,
        research_feedback: action === 'reject' ? rejectionFeedback : researchFeedback
      };
      
      console.log('Sending research action payload:', payload);
      await onApproval(payload);
      
      if (action === 'approve') {
        console.log('Research approved successfully');
        setResearchFeedback('');
      } else {
        setShowRejectionForm(false);
        setRejectionFeedback('');
      }
    } catch (error) {
      console.error('Failed to process action:', error);
      alert('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResearchData = (researchData) => {
    console.log('🔍 Received research data:', researchData);
    
    if (!researchData) {
      console.log('❌ No research data provided');
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No research data available</h3>
            <p className="text-muted-foreground text-center">
              Please wait for the research to complete.
            </p>
          </CardContent>
        </Card>
      );
    }

    const sections = [];

    // Parse the research data - handle multiple possible structures
    let output = researchData.output || researchData;
    let sources = output?.Sources || researchData.sources || [];
    let researchText = output?.text || researchData.text || researchData.research_insights || '';
    
    // Try multiple possible paths for selected_topic and selected_idea
    let selectedTopic = researchData.selected_topic || output?.selected_topic;
    let selectedIdea = researchData.selected_idea || output?.selected_idea;

    // Debug logging
    console.log('📝 Selected Topic:', selectedTopic);
    console.log('💡 Selected Idea:', selectedIdea);
    console.log('📄 Sources:', sources);
    console.log('📖 Research Text:', researchText);

    // Selected Topic Section - Always render first if available
    if (selectedTopic && typeof selectedTopic === 'object') {
      sections.push(
        <Card key="selected-topic" className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-500" />
              Selected Topic
              <Badge variant="outline" className="ml-2">
                Recommended
              </Badge>
            </CardTitle>
            <CardDescription>
              Recommended content direction and strategic approach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <FileText className="h-4 w-4" />
                  Content Title
                </Label>
                <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 leading-tight">
                    {selectedTopic.title}
                  </h3>
                </div>
              </div>

              {/* Meta Description */}
              {selectedTopic.meta_description && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Eye className="h-4 w-4" />
                    Meta Description
                  </Label>
                  <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200 italic leading-relaxed">
                      "{selectedTopic.meta_description}"
                    </p>
                  </div>
                </div>
              )}

              {/* Content Approach */}
              {selectedTopic.content_approach && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <BarChart3 className="h-4 w-4" />
                    Content Approach
                  </Label>
                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                      {selectedTopic.content_approach}
                    </p>
                  </div>
                </div>
              )}

              {/* Keywords */}
              {selectedTopic.keywords_used?.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Hash className="h-4 w-4" />
                    Target Keywords
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.keywords_used.map((keyword, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border-0"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Selected Idea Section - Render second if available
    if (selectedIdea && typeof selectedIdea === 'object') {
      sections.push(
        <Card key="selected-idea" className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Selected Idea
              <Badge variant="outline" className="ml-2">
                Creative Concept
              </Badge>
            </CardTitle>
            <CardDescription>
              Creative concept and unique positioning strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Idea Name */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  Idea Name
                </Label>
                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 leading-tight">
                    {selectedIdea.idea_name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              {selectedIdea.description && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <FileText className="h-4 w-4" />
                    Description
                  </Label>
                  <div className="bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                      {selectedIdea.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Unique Angle */}
              {selectedIdea.unique_angle && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <Star className="h-4 w-4" />
                    Unique Angle
                  </Label>
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                      {selectedIdea.unique_angle}
                    </p>
                  </div>
                </div>
              )}

              {/* Target Keywords */}
              {selectedIdea.target_keywords?.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <Tag className="h-4 w-4" />
                    Target Keywords
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.target_keywords.map((keyword, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 border-0"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Gaps Addressed */}
              {selectedIdea.content_gaps_addressed?.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <Shield className="h-4 w-4" />
                    Content Gaps Addressed
                  </Label>
                  <div className="space-y-2">
                    {selectedIdea.content_gaps_addressed.map((gap, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 p-3 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Research Insights Section with Fixed Dark Mode
    if (researchText) {
      sections.push(
        <Card key="research-insights" className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Research Insights
              <Badge variant="outline" className="ml-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300">
                Scrollable Content
              </Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive analysis and findings - Scroll to explore detailed insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <ScrollArea className="h-[500px] w-full">
                <div className="p-6 space-y-4 bg-card text-card-foreground min-h-full">
                  <div className="prose prose-sm max-w-none prose-slate dark:prose-invert text-foreground">
                    <RichText text={researchText} />
                  </div>
                </div>
                <div className="flex justify-center py-3 border-t border-border bg-muted/50">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MousePointer2 className="h-3 w-3" />
                    Scroll to explore more research content
                  </div>
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Sources Section with Fixed Dark Mode for URLs
    if (sources?.length > 0) {
      const initialSourcesCount = 3;
      const displayedSources = showAllSources ? sources : sources.slice(0, initialSourcesCount);
      const hasMoreSources = sources.length > initialSourcesCount;

      sections.push(
        <Card key="sources" className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Source References
              <Badge variant="outline" className="ml-2 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300">
                {sources.length} sources
              </Badge>
            </CardTitle>
            <CardDescription>
              Verified and authoritative sources used in research
              {hasMoreSources && !showAllSources && (
                <span className="text-muted-foreground">
                  {' '}• Showing {initialSourcesCount} of {sources.length} sources
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayedSources.map((source, idx) => {
                const urlCitation = source.url_citation || source;
                const actualIndex = showAllSources ? idx : idx;
                return (
                  <div key={idx} className="bg-muted/50 border border-border rounded-lg p-4 hover:bg-muted/80 transition-colors duration-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0 mt-1 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50">
                        [{actualIndex + 1}]
                      </Badge>
                      <div className="flex-1 min-w-0 space-y-3">
                        <h4 className="font-medium text-sm leading-tight text-foreground">
                          {urlCitation.title || `Source ${actualIndex + 1}`}
                        </h4>
                        {urlCitation.url && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-3 w-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                            <code className="text-xs bg-background border border-border text-foreground px-2 py-1 rounded font-mono max-w-full overflow-hidden">
                              <span className="block truncate" title={urlCitation.url}>
                                {truncateUrl(urlCitation.url, 80)}
                              </span>
                            </code>
                          </div>
                        )}
                        {source.content && (
                          <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 border border-border p-3 rounded">
                            {source.content.substring(0, 200)}
                            {source.content.length > 200 && '...'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More/Less Button */}
            {hasMoreSources && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllSources(!showAllSources)}
                  className="flex items-center gap-2 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                >
                  {showAllSources ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less Sources
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show {sources.length - initialSourcesCount} More Sources
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Debug section - show if no main sections found
    if (sections.length === 0) {
      sections.push(
        <Card key="debug" className="border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-orange-600" />
              Debug: Raw Research Data
            </CardTitle>
            <CardDescription>
              Debug information - showing raw data structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 border border-border p-4 rounded-lg font-mono">
                {JSON.stringify(researchData, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }

    return <div className="space-y-6">{sections}</div>;
  };

  const researchData = workflowStatus?.research_data;
  const attemptNumber = workflowStatus?.attempt_number ?? 1;

  if (processing) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Spinner className="h-8 w-8 mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Processing research data...</h3>
          <p className="text-muted-foreground text-center">
            Analyzing and formatting insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Research Review
            {attemptNumber > 1 && (
              <Badge variant="secondary">Attempt {attemptNumber}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review the research findings and provide approval or feedback for improvements.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Research Data */}
      {renderResearchData(researchData)}

      {/* Action Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review Actions</CardTitle>
          <CardDescription>
            Approve the research or provide feedback for improvements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Feedback Textarea */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Research Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Provide specific feedback about the research quality, relevance, or suggestions for improvement..."
              value={researchFeedback}
              onChange={(e) => setResearchFeedback(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleAction('approve')}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve Research
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowRejectionForm(!showRejectionForm)}
              disabled={loading}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Request Changes
            </Button>
          </div>

          {/* Rejection Form */}
          {showRejectionForm && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="rejection-feedback">Change Request Details</Label>
                <Textarea
                  id="rejection-feedback"
                  placeholder="Please specify what changes or improvements are needed in the research..."
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAction('reject')}
                  disabled={loading || !rejectionFeedback.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {loading ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Submit Changes Request
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectionForm(false);
                    setRejectionFeedback('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
