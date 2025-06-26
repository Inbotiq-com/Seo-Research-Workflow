import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { PenTool, CheckCircle, Target, List, Lightbulb, ArrowRight } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../lib/config';

export default function TopicSelection({ executionId }) {
  const [workflowData, setWorkflowData] = useState(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [modifications, setModifications] = useState({});
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    fetchWorkflowData();
  }, [executionId]);

  const fetchWorkflowData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.workflow}/${executionId}`);
      setWorkflowData(response.data);
    } catch (error) {
      console.error('Failed to fetch workflow data:', error);
    }
  };

  const handleTopicSelection = async () => {
    try {
      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.approveTopic}/${executionId}`, {
        selected_topic_index: selectedTopicIndex,
        modifications: modifications,
        additional_instructions: instructions
      });

      alert('Topic selected! Proceeding to research phase...');
    } catch (error) {
      console.error('Failed to select topic:', error);
    }
  };

  if (!workflowData?.blog_ideas) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <PenTool className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-purple-800">Generating Blog Ideas</CardTitle>
            <CardDescription>
              Creating engaging topic ideas based on your keyword strategy...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  const { blog_ideas } = workflowData;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <PenTool className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-purple-800">Blog Topic Selection</CardTitle>
              <CardDescription>
                Choose your preferred topic and customize it before proceeding to research
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Topic Options */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Available Topic Ideas</h3>
          <div className="space-y-4">
            {blog_ideas.map((idea, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTopicIndex === index 
                    ? 'border-green-500 bg-green-50 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedTopicIndex(index)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight pr-4">
                      {idea.title}
                    </CardTitle>
                    {selectedTopicIndex === index && (
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {idea.meta_description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Target Keywords */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Target Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {idea.target_keywords?.map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Outline */}
                  {idea.outline && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <List className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Content Outline</span>
                      </div>
                      <ul className="text-sm text-slate-600 space-y-1 ml-4">
                        {idea.outline.map((item, i) => (
                          <li key={i} className="list-disc">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Unique Angle */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Unique Angle</span>
                    </div>
                    <p className="text-sm text-slate-600">{idea.unique_angle}</p>
                  </div>

                  {/* Strategic Rationale */}
                  {idea.strategic_rationale && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-medium text-slate-500">Strategic Rationale:</span>
                      <p className="text-xs text-slate-600 mt-1">{idea.strategic_rationale}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Customization Panel */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-green-700">Customize Selected Topic</CardTitle>
              <CardDescription>
                Make any adjustments to the selected topic before proceeding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-title">Custom Title</Label>
                <Input
                  id="custom-title"
                  placeholder="Override the default title..."
                  value={modifications.title || ''}
                  onChange={(e) => setModifications({...modifications, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-meta">Custom Meta Description</Label>
                <Textarea
                  id="custom-meta"
                  placeholder="Override the default meta description..."
                  value={modifications.meta_description || ''}
                  onChange={(e) => setModifications({...modifications, meta_description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Additional Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Specific requirements, tone, examples to include..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleTopicSelection} 
                className="w-full mt-6"
                size="lg"
              >
                <ArrowRight className="mr-2 w-4 h-4" />
                Select Topic & Proceed to Research
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
