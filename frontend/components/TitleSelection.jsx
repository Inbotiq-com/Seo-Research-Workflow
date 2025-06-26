import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import { PenTool, CheckCircle, XCircle, AlertTriangle, Target, FileText, Hash, Users, Zap } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

export default function TitleSelection({ executionId, workflowStatus, onSelection, processing }) {
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(null);
  const [selectionFeedback, setSelectionFeedback] = useState('');
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleAction = async (action) => {
    if (action === 'select' && selectedTitleIndex === null) {
      alert('Please select a title first');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        action: action,
        selection_feedback: action === 'select' ? selectionFeedback : rejectionFeedback,
        selected_title_index: action === 'select' ? selectedTitleIndex : 0
      };

      console.log('Sending title selection payload:', payload);
      await onSelection(payload);
      
      if (action === 'select') {
        console.log('Title selected successfully');
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

  if (!workflowStatus?.title_options) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <PenTool className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-300">Creating compelling, SEO-optimized title options for your selected blog idea...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const titleOptions = workflowStatus.title_options;
  const selectedIdea = workflowStatus.selected_idea;
  const attemptNumber = workflowStatus.attempt_number || 1;
  const recommendation = workflowStatus.recommendation;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-purple-600 bg-purple-900/20 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <PenTool className="h-5 w-5" />
            Title Selection
            {attemptNumber > 1 && (
              <Badge variant="outline" className="ml-2 border-purple-500 text-purple-400 bg-purple-900/30">
                Attempt #{attemptNumber}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-purple-300">
            Choose the most compelling title for your blog post
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Selected Blog Idea Reminder */}
      {selectedIdea && (
        <Card className="bg-blue-900/20 border-blue-600 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-blue-400 text-sm">Selected Blog Idea</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-300 text-sm font-medium">{selectedIdea.idea_name}</p>
            <p className="text-gray-400 text-xs mt-1">{selectedIdea.description}</p>
          </CardContent>
        </Card>
      )}

      {attemptNumber > 1 && (
        <Card className="bg-yellow-900/20 border-yellow-600 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                These titles were regenerated based on your previous feedback
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendation */}
      {recommendation && (
        <Card className="bg-green-900/20 border-green-600 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-green-400 text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-300 text-sm">{recommendation}</p>
          </CardContent>
        </Card>
      )}

      {/* Title Options Grid */}
      <div className="grid gap-4">
        {titleOptions.map((titleOption, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all duration-200 ${
              selectedTitleIndex === index 
                ? 'border-purple-500 bg-purple-900/30 backdrop-blur' 
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 backdrop-blur'
            }`}
            onClick={() => setSelectedTitleIndex(index)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedTitleIndex === index ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-100 leading-tight">
                      {titleOption.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        <Hash className="h-3 w-3 mr-1" />
                        {titleOption.character_count} chars
                      </Badge>
                    </div>
                  </div>
                </div>
                {selectedTitleIndex === index && (
                  <CheckCircle className="h-5 w-5 text-purple-400 mt-1" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meta Description */}
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <Label className="text-blue-400 font-medium flex items-center gap-1 mb-2">
                  <FileText className="h-3 w-3" />
                  Meta Description
                </Label>
                <p className="text-gray-300 text-sm">
                  {titleOption.meta_description}
                </p>
              </div>

              {/* Keywords Used */}
              <div>
                <Label className="text-green-400 font-medium flex items-center gap-1 mb-2">
                  <Target className="h-3 w-3" />
                  Keywords Used
                </Label>
                <div className="flex flex-wrap gap-1">
                  {titleOption.keywords_used.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-green-600 text-green-400 bg-green-900/20">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content Approach */}
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                <Label className="text-yellow-400 font-medium flex items-center gap-1 mb-2">
                  <Users className="h-3 w-3" />
                  Content Approach
                </Label>
                <p className="text-gray-300 text-sm capitalize">
                  {titleOption.content_approach}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ SUGGESTIONS Section */}
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-100">Your Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showRejectionForm ? (
            <div>
              <Label className="text-gray-300">Additional Instructions (Optional)</Label>
              <Textarea
                placeholder="Share any specific requirements or modifications for the selected title..."
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
                placeholder="Please explain what you didn't like about these titles and what style you'd prefer..."
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
                disabled={loading || processing || selectedTitleIndex === null}
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
                    Select This Title
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
                Regenerate Titles
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
                      <PenTool className="h-4 w-4 mr-2" />
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
