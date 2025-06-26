import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
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
  Shield
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

export default function ResearchReview({ executionId, workflowStatus, onApproval, processing }) {
  const [researchFeedback, setResearchFeedback] = useState('');
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleAction = async (action) => {
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

  // ✅ Enhanced dark mode research data renderer
  const renderResearchData = (researchData) => {
    console.log('🔍 Received research data:', researchData);
    
    if (!researchData) {
      console.log('❌ No research data provided');
      return (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-900/50 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-amber-200 font-medium">No research data available</p>
              <p className="text-amber-400/70 text-sm">Please wait for the research to complete.</p>
            </div>
          </div>
        </div>
      );
    }

    let dataArray = researchData;
    if (!Array.isArray(researchData)) {
      console.log('⚠️ Research data is not an array, converting:', typeof researchData);
      dataArray = [researchData];
    }

    if (dataArray.length === 0) {
      console.log('❌ Research data array is empty');
      return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800/50 rounded-full">
              <Database className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-slate-200 font-medium">Research data is empty</p>
              <p className="text-slate-400 text-sm">Please wait for processing to complete.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {dataArray.map((item, index) => {
          console.log(`📄 Processing research item ${index}:`, item);
          
          // Handle research findings with citations
          if (item?.output?.text) {
            const text = item.output.text;
            const sources = item.output.Sources || item.output.sources || [];
            
            console.log(`✅ Found research findings with ${sources.length} sources`);
            
            const formatTextWithCitations = (text, sources) => {
              const citationRegex = /\[(\d+)\]/g;
              const parts = text.split(citationRegex);
              const formattedContent = [];

              for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 0) {
                  if (parts[i]) {
                    formattedContent.push(
                      <span key={`text-${index}-${i}`} className="text-slate-100 leading-relaxed">
                        {parts[i]}
                      </span>
                    );
                  }
                } else {
                  const citationNum = parseInt(parts[i]);
                  const source = sources[citationNum - 1];
                  
                  formattedContent.push(
                    <Badge 
                      key={`citation-${index}-${i}`} 
                      variant="outline" 
                      className="mx-1 cursor-pointer hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-200 text-blue-300 border-blue-500/30 bg-blue-950/30 backdrop-blur-sm"
                      title={source?.url_citation?.title || 'Source'}
                    >
                      [{citationNum}]
                    </Badge>
                  );
                }
              }
              return formattedContent;
            };

            return (
              <Card key={`research-${index}`} className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-l-4 border-l-blue-500 border border-slate-700/50 shadow-2xl backdrop-blur-sm hover:shadow-blue-500/10 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-950/30 to-slate-900/30 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl backdrop-blur-sm border border-blue-500/30">
                        <Brain className="h-6 w-6 text-blue-300" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                          Research Intelligence
                        </CardTitle>
                        <CardDescription className="text-blue-300/80 text-base font-medium">
                          Comprehensive insights from {sources.length} authoritative sources
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border-blue-400/30 px-3 py-1">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {sources.length} Sources
                      </Badge>
                      <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border-emerald-400/30 px-3 py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Analyzed
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 p-6">
                  <div className="relative">
                    <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full opacity-30"></div>
                    <div className="max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                      <div className="text-slate-100 leading-relaxed space-y-3 text-sm font-medium pl-4">
                        {formatTextWithCitations(text, sources)}
                      </div>
                    </div>
                  </div>
                  
                  {sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg">
                          <Globe className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-emerald-200">Source References</h4>
                          <p className="text-emerald-300/70 text-sm">Verified and authoritative sources</p>
                        </div>
                      </div>
                      <div className="grid gap-4">
                        {sources.map((source, sourceIndex) => (
                          <div key={`source-${index}-${sourceIndex}`} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/20 rounded-xl border border-slate-600/30 hover:border-emerald-500/40 hover:bg-gradient-to-r hover:from-emerald-950/20 hover:to-slate-800/40 transition-all duration-300 backdrop-blur-sm">
                            <Badge variant="outline" className="text-xs font-mono bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border-emerald-400/30 px-2 py-1 rounded-lg">
                              [{sourceIndex + 1}]
                            </Badge>
                            <div className="flex-1 min-w-0 space-y-2">
                              <a 
                                href={source?.url_citation?.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block text-slate-100 hover:text-emerald-300 font-semibold text-sm group-hover:text-emerald-200 transition-colors line-clamp-2"
                              >
                                {source?.url_citation?.title}
                              </a>
                              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors truncate">
                                {source?.url_citation?.url}
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }
          
          // Handle company knowledge
          if (item?.response || typeof item === 'string') {
            const responseText = item?.response || item;
            
            console.log(`✅ Found company knowledge: ${responseText.substring(0, 100)}...`);
            
            return (
              <Card key={`knowledge-${index}`} className="bg-gradient-to-br from-emerald-900/60 to-green-800/40 border-l-4 border-l-emerald-500 border border-emerald-700/50 shadow-2xl backdrop-blur-sm hover:shadow-emerald-500/10 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-4 bg-gradient-to-r from-emerald-950/30 to-green-900/30 rounded-t-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl backdrop-blur-sm border border-emerald-500/30">
                      <Shield className="h-6 w-6 text-emerald-300" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">
                        Company Intelligence
                      </CardTitle>
                      <CardDescription className="text-emerald-300/80 text-base font-medium">
                        Internal knowledge base and proprietary insights
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="p-6 bg-gradient-to-br from-slate-800/30 to-emerald-900/20 rounded-xl border border-emerald-700/30 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg flex-shrink-0">
                        <Quote className="h-5 w-5 text-emerald-300" />
                      </div>
                      <p className="text-slate-100 leading-relaxed text-sm font-medium">
                        {responseText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          // Handle unknown formats
          console.log(`⚠️ Unknown research item format at index ${index}:`, item);
          return (
            <Card key={`unknown-${index}`} className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 border-l-4 border-l-amber-500 border border-slate-600/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-950/30 to-slate-900/30 rounded-t-lg">
                <CardTitle className="text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Unknown Data Format
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="text-xs bg-slate-900/50 p-4 rounded-lg overflow-x-auto text-slate-300 border border-slate-700/50">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (!workflowStatus) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="relative">
              <Spinner className="mx-auto h-8 w-8 text-blue-400" />
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
            </div>
            <div>
              <p className="text-slate-200 font-medium text-lg">Loading research data...</p>
              <p className="text-slate-400 text-sm">Analyzing and processing insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { selected_topic, selected_idea, research_data } = workflowStatus;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-br from-slate-900 via-blue-950/50 to-slate-900 border border-slate-700/50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="p-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl backdrop-blur-sm border border-blue-500/30">
              <Search className="h-8 w-8 text-blue-300" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Research Review & Intelligence
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg font-medium max-w-2xl">
                Review comprehensive research findings and provide strategic feedback for content optimization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Topic Overview */}
      <Card className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-pink-950/40 border border-purple-700/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="p-6 bg-gradient-to-r from-purple-950/30 to-pink-950/30 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
              <Target className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                Content Strategy Overview
              </CardTitle>
              <CardDescription className="text-purple-300/80">
                Selected topic and strategic direction
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {selected_topic && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-purple-200 uppercase tracking-wide">Content Title</Label>
                <div className="p-4 bg-gradient-to-r from-slate-800/60 to-purple-900/30 rounded-lg border border-purple-700/30">
                  <p className="text-slate-100 font-semibold text-lg">{selected_topic.title}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-purple-200 uppercase tracking-wide">Content Approach</Label>
                <div className="p-4 bg-gradient-to-r from-slate-800/60 to-purple-900/30 rounded-lg border border-purple-700/30">
                  <p className="text-slate-300 text-sm leading-relaxed">{selected_topic.content_approach}</p>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-3">
                <Label className="text-sm font-bold text-purple-200 uppercase tracking-wide">Meta Description</Label>
                <div className="p-4 bg-gradient-to-r from-slate-800/60 to-purple-900/30 rounded-lg border border-purple-700/30">
                  <p className="text-slate-300 text-sm leading-relaxed">{selected_topic.meta_description}</p>
                </div>
              </div>
            </div>
          )}
          
          {selected_idea && (
            <div className="mt-8 pt-6 border-t border-purple-700/30">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-pink-200 uppercase tracking-wide">Blog Concept</Label>
                  <div className="p-4 bg-gradient-to-r from-slate-800/60 to-pink-900/30 rounded-lg border border-pink-700/30">
                    <p className="text-slate-100 font-semibold">{selected_idea.idea_name}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-pink-200 uppercase tracking-wide">Unique Angle</Label>
                  <div className="p-4 bg-gradient-to-r from-slate-800/60 to-pink-900/30 rounded-lg border border-pink-700/30">
                    <p className="text-slate-300 text-sm leading-relaxed">{selected_idea.unique_angle}</p>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <Label className="text-sm font-bold text-pink-200 uppercase tracking-wide">Strategic Description</Label>
                  <div className="p-4 bg-gradient-to-r from-slate-800/60 to-pink-900/30 rounded-lg border border-pink-700/30">
                    <p className="text-slate-300 text-sm leading-relaxed">{selected_idea.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Results */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                <Layers className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  Research Intelligence Hub
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Comprehensive analysis and insights
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-200 border-indigo-400/30 px-4 py-2 text-sm font-medium">
              {workflowStatus?.attempt_number ? `Attempt ${workflowStatus.attempt_number}` : 'Initial Research'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {renderResearchData(research_data)}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl backdrop-blur-sm">
        <CardHeader className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
              <Lightbulb className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-100">Strategic Review & Decision</CardTitle>
              <CardDescription className="text-slate-300">
                Provide feedback and approve or request strategic improvements
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* Feedback Section */}
          <div className="space-y-4">
            <Label htmlFor="research-feedback" className="text-base font-bold text-slate-200 uppercase tracking-wide">
              Strategic Feedback (Optional)
            </Label>
            <Textarea
              id="research-feedback"
              placeholder="Share strategic insights, quality assessments, or specific areas for enhancement..."
              value={researchFeedback}
              onChange={(e) => setResearchFeedback(e.target.value)}
              className="min-h-[120px] resize-y bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-lg backdrop-blur-sm"
            />
          </div>

          {/* Rejection Form */}
          {showRejectionForm && (
            <div className="p-6 bg-gradient-to-r from-red-950/30 to-red-900/20 border border-red-800/50 rounded-xl space-y-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <Label className="text-red-200 font-bold text-lg">Request Strategic Improvements</Label>
              </div>
              <Textarea
                placeholder="Provide specific feedback on research quality, depth, relevance, or strategic direction..."
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                className="min-h-[140px] bg-red-950/20 border-red-700/50 text-red-100 placeholder:text-red-300/70 focus:border-red-500/50 focus:ring-red-500/20 rounded-lg backdrop-blur-sm"
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700/50">
            {!showRejectionForm ? (
              <>
                <Button
                  onClick={() => handleAction('approve')}
                  disabled={loading || processing}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-3 h-5 w-5" />
                      Processing Decision...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-3 h-5 w-5" />
                      Approve Research
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowRejectionForm(true)}
                  variant="outline"
                  disabled={loading || processing}
                  className="flex-1 border-red-600/50 text-red-400 hover:bg-red-950/30 hover:border-red-500/70 hover:text-red-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  <XCircle className="mr-3 h-5 w-5" />
                  Request Improvements
                </Button>
              </>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={() => handleAction('reject')}
                  disabled={loading || processing || !rejectionFeedback.trim()}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                >
                  {loading ? (
                    <>
                      <Spinner className="mr-3 h-5 w-5" />
                      Submitting Feedback...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-3 h-5 w-5" />
                      Submit Improvements Request
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectionForm(false);
                    setRejectionFeedback('');
                  }}
                  variant="outline"
                  disabled={loading || processing}
                  className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500/70 font-semibold py-3 px-6 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
