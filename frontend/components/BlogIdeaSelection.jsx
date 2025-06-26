import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import { Lightbulb, CheckCircle, XCircle, AlertTriangle, Target, Users, Zap } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

export default function BlogIdeaSelection({ executionId, workflowStatus, onSelection, processing }) {
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState(null);
  const [selectionFeedback, setSelectionFeedback] = useState('');
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleAction = async (action) => {
    if (action === 'select' && selectedIdeaIndex === null) {
      alert('Please select a blog idea first');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        action: action,
        selection_feedback: action === 'select' ? selectionFeedback : rejectionFeedback,
        selected_idea_index: action === 'select' ? selectedIdeaIndex : 0
      };

      console.log('Sending blog idea selection payload:', payload);
      await onSelection(payload);
      
      if (action === 'select') {
        console.log('Blog idea selected successfully');
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

  if (!workflowStatus?.blog_ideas) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <Lightbulb className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-300">Creating unique blog post ideas based on your approved keyword strategy...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const blogIdeas = workflowStatus.blog_ideas;
  const attemptNumber = workflowStatus.attempt_number || 1;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-purple-600 bg-purple-900/20 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Lightbulb className="h-5 w-5" />
            Blog Idea Selection
            {attemptNumber > 1 && (
              <Badge variant="outline" className="ml-2 border-purple-500 text-purple-400 bg-purple-900/30">
                Attempt #{attemptNumber}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-purple-300">
            Choose the blog post idea that best aligns with your content strategy
          </CardDescription>
        </CardHeader>
      </Card>

      {attemptNumber > 1 && (
        <Card className="bg-yellow-900/20 border-yellow-600 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                These ideas were regenerated based on your previous feedback
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog Ideas Grid */}
      <div className="grid gap-4">
        {blogIdeas.map((idea, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all duration-200 ${
              selectedIdeaIndex === index 
                ? 'border-purple-500 bg-purple-900/30 backdrop-blur' 
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 backdrop-blur'
            }`}
            onClick={() => setSelectedIdeaIndex(index)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedIdeaIndex === index ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  {idea.idea_name}
                </CardTitle>
                {selectedIdeaIndex === index && (
                  <CheckCircle className="h-5 w-5 text-purple-400 mt-1" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {idea.description}
                </p>
              </div>

              {/* Unique Angle */}
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <Label className="text-purple-400 font-medium flex items-center gap-1 mb-2">
                  <Zap className="h-3 w-3" />
                  Unique Angle
                </Label>
                <p className="text-gray-300 text-sm">
                  {idea.unique_angle}
                </p>
              </div>

              {/* Target Keywords */}
              <div>
                <Label className="text-blue-400 font-medium flex items-center gap-1 mb-2">
                  <Target className="h-3 w-3" />
                  Target Keywords
                </Label>
                <div className="flex flex-wrap gap-1">
                  {idea.target_keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-blue-600 text-blue-400 bg-blue-900/20">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content Gaps Addressed */}
              <div>
                <Label className="text-green-400 font-medium flex items-center gap-1 mb-2">
                  <Users className="h-3 w-3" />
                  Content Gaps Addressed
                </Label>
                <div className="flex flex-wrap gap-1">
                  {idea.content_gaps_addressed.map((gap, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-green-600 text-green-400 bg-green-900/20">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ SUGGESTIONS/FEEDBACK Section */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Your Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showRejectionForm ? (
            <div>
              <Label className="text-gray-300">Additional Instructions (Optional)</Label>
              <Textarea
                placeholder="Share any specific requirements or modifications for the selected blog idea..."
                value={selectionFeedback}
                onChange={(e) => setSelectionFeedback(e.target.value)}
                disabled={loading || processing}
                className="mt-2 bg-gray-900/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-purple-500"
                rows={3}
              />
            </div>
          ) : (
            <div>
              <Label className="text-red-400">Rejection Reason (Required)</Label>
              <Textarea
                placeholder="Please explain what you didn't like about these ideas and what you'd prefer instead..."
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

      {/* ✅ ACTION BUTTONS with both Select and Regenerate */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardContent className="pt-6">
          {!showRejectionForm ? (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleAction('select')}
                disabled={loading || processing || selectedIdeaIndex === null}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-32 px-8 py-3"
              >
                {loading || processing ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Select This Idea
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
                Regenerate Ideas
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
                      <Lightbulb className="h-4 w-4 mr-2" />
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
