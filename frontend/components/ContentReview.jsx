import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import { FileText, BarChart3, CheckCircle, Edit3, XCircle, RefreshCw, ExternalLink, AlertTriangle, Target, Users, Zap, Clock, Hash, BookOpen, Quote, LinkIcon, List } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

export default function ContentReview({ executionId, workflowStatus, onApproval, processing }) {
  const [contentFeedback, setContentFeedback] = useState('');
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const payload = {
        action: action,
        content_feedback: action === 'reject' ? rejectionFeedback : contentFeedback
      };

      console.log('Sending content action payload:', payload);
      await onApproval(payload);
      
      if (action === 'approve') {
        console.log('Content approved successfully');
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

  // ✅ Add this function to ContentReview.jsx
  const renderObjectSafely = (obj, label) => {
    if (!obj) return null;
    
    if (typeof obj === 'string') {
      return <span>{obj}</span>;
    }
    
    if (typeof obj === 'object') {
      // Handle specific object types
      if (obj.idea_name) {
        return (
          <div>
            <div className="font-medium">{obj.idea_name}</div>
            {obj.description && <div className="text-sm text-gray-600 mt-1">{obj.description}</div>}
            {obj.unique_angle && <div className="text-sm text-blue-600 mt-1">Angle: {obj.unique_angle}</div>}
          </div>
        );
      }
      
      if (obj.title) {
        return (
          <div>
            <div className="font-medium">{obj.title}</div>
            {obj.meta_description && <div className="text-sm text-gray-600 mt-1">{obj.meta_description}</div>}
          </div>
        );
      }
      
      // Fallback for other objects
      return <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(obj, null, 2)}</pre>;
    }
    
    return <span>{String(obj)}</span>;
  };

  if (!workflowStatus?.blog_content) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-gray-300">Generating comprehensive, SEO-optimized blog content based on your research and selections...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const blogContent = workflowStatus.blog_content;
  const selectedTopic = workflowStatus.selected_topic;
  const selectedIdea = workflowStatus.selected_idea;
  const attemptNumber = workflowStatus.attempt_number || 1;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-green-600 bg-green-900/20 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <FileText className="h-5 w-5" />
            Content Review
            {attemptNumber > 1 && (
              <Badge variant="outline" className="ml-2 border-green-500 text-green-400 bg-green-900/30">
                Attempt #{attemptNumber}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-green-300">
            Review your generated blog content and approve or request regeneration
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Content Context */}
      {selectedTopic && (
        <Card className="bg-blue-900/20 border-blue-600 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Content Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-blue-300 font-medium">Final Title</Label>
              <p className="text-blue-100 text-sm mt-1">{renderObjectSafely(selectedTopic, "Selected Topic")}</p>
            </div>
            {selectedIdea && (
              <div>
                <Label className="text-blue-300 font-medium">Blog Idea</Label>
                <p className="text-gray-300 text-sm mt-1">{renderObjectSafely(selectedIdea, "Selected Idea")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {attemptNumber > 1 && (
        <Card className="bg-yellow-900/20 border-yellow-600 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                This content was regenerated based on your previous feedback
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ ENHANCED: Content Metrics with All Fields */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Content Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{blogContent.word_count || 'N/A'}</div>
              <div className="text-xs text-gray-400">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{blogContent.keywords_used?.length || 0}</div>
              <div className="text-xs text-gray-400">Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{blogContent.sources_cited?.length || 0}</div>
              <div className="text-xs text-gray-400">Sources</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ ENHANCED: SEO Title & Meta Description */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            SEO Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-green-400 font-medium">SEO Title</Label>
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-2">
              <p className="text-gray-100 text-sm">{blogContent.seo_title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                  {blogContent.seo_title?.length || 0} chars
                </Badge>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-blue-400 font-medium">Meta Description</Label>
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-2">
              <p className="text-gray-300 text-sm">{blogContent.meta_description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                  {blogContent.meta_description?.length || 0} chars
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ NEW: Content Outline */}
      {blogContent.outline && blogContent.outline.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <List className="h-4 w-4" />
              Content Outline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <ol className="space-y-2">
                {blogContent.outline.map((item, idx) => (
                  <li key={idx} className="text-gray-300 text-sm flex items-start gap-3">
                    <span className="text-blue-400 font-medium min-w-6">{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ ENHANCED: Keywords Used */}
      {blogContent.keywords_used && blogContent.keywords_used.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Keywords Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {blogContent.keywords_used.map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="border-green-600 text-green-400 bg-green-900/20">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ NEW: Sources Cited */}
      {blogContent.sources_cited && blogContent.sources_cited.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Sources Cited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {blogContent.sources_cited.map((source, idx) => (
                <div key={idx} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex items-center gap-3">
                  <Badge variant="outline" className="min-w-8 h-6 flex items-center justify-center text-xs border-blue-600 text-blue-400 bg-blue-900/20">
                    {idx + 1}
                  </Badge>
                  <span className="text-gray-300 text-sm flex-1">{source}</span>
                  <ExternalLink className="h-3 w-3 text-gray-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ NEW: Internal Link Opportunities */}
      {blogContent.internal_link_opportunities && blogContent.internal_link_opportunities.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Internal Link Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {blogContent.internal_link_opportunities.map((link, idx) => (
                <div key={idx} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex items-center gap-3">
                  <LinkIcon className="h-3 w-3 text-purple-400" />
                  <span className="text-gray-300 text-sm">{link}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ ENHANCED: Blog Content Preview */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Full Content Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 max-h-96 overflow-auto">
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {blogContent.blog_content || blogContent.content || 'No content available'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ ENHANCED: Call to Action */}
      {blogContent.call_to_action && (
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Call to Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 p-4 rounded-lg border border-orange-600">
              <p className="text-orange-300 text-sm leading-relaxed font-medium">{blogContent.call_to_action}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ SUGGESTIONS Section */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Your Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showRejectionForm ? (
            <div>
              <Label className="text-gray-300">Content Feedback (Optional)</Label>
              <Textarea
                placeholder="Share your thoughts on the content quality, style, structure, or any specific improvements you'd like..."
                value={contentFeedback}
                onChange={(e) => setContentFeedback(e.target.value)}
                disabled={loading || processing}
                className="mt-2 bg-gray-900/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-green-500"
                rows={3}
              />
            </div>
          ) : (
            <div>
              <Label className="text-red-400">Regeneration Instructions (Required)</Label>
              <Textarea
                placeholder="Please explain what you'd like to see differently in the content. Be specific about tone, structure, depth, examples, or any other improvements..."
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                disabled={loading || processing}
                className="mt-2 bg-gray-900/50 border-red-600 text-gray-100 placeholder-gray-500 focus:border-red-500"
                rows={4}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ ACTION BUTTONS with both Approve and Regenerate */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardContent className="pt-6">
          {!showRejectionForm ? (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleAction('approve')}
                disabled={loading || processing}
                className="bg-green-600 hover:bg-green-700 text-white min-w-32 px-8 py-3"
              >
                {loading || processing ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Content
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowRejectionForm(true)}
                disabled={loading || processing}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white min-w-32 px-8 py-3"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Regenerate Content
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleAction('reject')}
                  disabled={loading || processing || !rejectionFeedback.trim()}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white min-w-32 px-8 py-3"
                >
                  {loading || processing ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Confirm Regeneration
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowRejectionForm(false)}
                  disabled={loading || processing}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 min-w-32 px-8 py-3"
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
