import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Target, CheckCircle, RefreshCw, AlertTriangle, FileText, TrendingUp, Users, Settings, Award } from 'lucide-react';

const getSectionIcon = (heading) => {
    // Using text-primary for theme-aware icon coloring
    if (heading.toLowerCase().includes('executive')) return <FileText className="h-5 w-5 text-primary" />;
    if (heading.toLowerCase().includes('keyword')) return <Target className="h-5 w-5 text-primary" />;
    if (heading.toLowerCase().includes('competitive')) return <Users className="h-5 w-5 text-primary" />;
    if (heading.toLowerCase().includes('content')) return <Settings className="h-5 w-5 text-primary" />;
    if (heading.toLowerCase().includes('titles')) return <Award className="h-5 w-5 text-primary" />;
    return <TrendingUp className="h-5 w-5 text-primary" />;
};

const formatContent = (content) => {
    if (!content) return '';

    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>')
        .replace(/▪️/g, '• ');
};

const parseTable = (tableString) => {
    if (!tableString || tableString.trim() === '') return null;

    const lines = tableString.split('\n').filter(line => line.trim() !== '' && !line.includes('---'));
    if (lines.length < 2) return null; // Need at least header and one row

    const headers = lines[0].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
    const rows = lines.slice(1).map(line =>
        line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())
    );

    return { headers, rows };
};

export default function KeywordStrategyReview({ executionId, workflowStatus, onApproval, processing }) {
    const [feedback, setFeedback] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const strategy = workflowStatus?.keyword_strategy;
    const attemptNumber = workflowStatus?.attempt_number || 1;

    const handleAction = async (action) => {
        if (isProcessing || processing) {
            console.log('Action already in progress, ignoring click');
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                action: action,
                strategy_feedback: feedback.trim()
            };

            console.log('Sending action payload:', payload);
            await onApproval(payload);

            if (action === 'approve') {
                setFeedback('');
            }
        } catch (error) {
            console.error('Failed to process action:', error);
            alert(`Failed to process request: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!strategy) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center space-y-3 text-muted-foreground">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <span className="text-lg font-medium">Generating keyword strategy...</span>
                        <p>This may take a moment. Please wait.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    let parsedStrategy;
    try {
        parsedStrategy = typeof strategy === 'string' ? JSON.parse(strategy) : strategy;
    } catch (error) {
        console.error('Failed to parse strategy:', error);
        return (
            <Card className="w-full max-w-4xl mx-auto border-l-4 border-destructive">
                <CardContent className="p-8">
                    <div className="flex items-center space-x-3 text-destructive">
                        <AlertTriangle className="h-6 w-6" />
                        <div>
                            <p className="font-bold">Error Parsing Strategy Data</p>
                            <p className="text-sm">Could not display the content. Please check the data format.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const sections = (parsedStrategy.sections || []).filter(
        section => !section.heading?.toLowerCase().includes('titles')
    );

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 p-4">
            {/* Header */}
            <Card className="border-l-4 border-primary shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold text-foreground">SEO Keyword Strategy Review</CardTitle>
                            <CardDescription className="text-base text-muted-foreground mt-1">
                                Attempt #{attemptNumber} • Review the generated strategy below and take action.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-sm py-1 px-3">
                            <Target className="h-4 w-4 mr-2" />
                            Strategy Generated
                        </Badge>
                    </div>
                </CardHeader>
            </Card>

            {/* Strategy Sections */}
            <div className="space-y-6">
                {sections.map((section, index) => {
                    const tableData = parseTable(section.table);

                    return (
                        <Card key={index} className="shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        {getSectionIcon(section.heading)}
                                    </div>
                                    <CardTitle className="text-xl font-bold text-foreground">
                                        {section.heading.replace(/^\d+\.\s*/, '').replace(/^#+\s*/, '')}
                                    </CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-2">
                                {/* Section Content */}
                                {section.content && (
                                    <div
                                        className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: formatContent(section.content)
                                        }}
                                    />
                                )}

                                {/* Table */}
                                {tableData && (
                                    <div className="mt-4">
                                        <ScrollArea className="border rounded-lg max-h-[500px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted hover:bg-muted">
                                                        {tableData.headers.map((header, i) => (
                                                            <TableHead key={i} className="font-semibold text-muted-foreground">
                                                                {header}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tableData.rows.map((row, rowIndex) => (
                                                        <TableRow key={rowIndex} className="hover:bg-muted/50">
                                                            {row.map((cell, cellIndex) => (
                                                                <TableCell
                                                                    key={cellIndex}
                                                                    className="align-top"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: formatContent(cell)
                                                                    }}
                                                                />
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                )}

                                {/* Additional Content - NOW ALWAYS DARK for emphasis */}
                                {section.additional_content && (
                                    <div
                                        className="mt-4 prose prose-invert max-w-none leading-relaxed bg-slate-800 border border-slate-700 text-slate-200 p-5 rounded-lg"
                                        dangerouslySetInnerHTML={{
                                            __html: formatContent(section.additional_content)
                                        }}
                                    />
                                )}
                            </CardContent>

                            {index < sections.length - 1 && sections.length > 1 && (
                                <div className="px-6 pb-2">
                                    <Separator />
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Action Panel */}
            <Card className="bg-slate-900 text-slate-50 border-t-4 border-green-500 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-50">Review & Take Action</CardTitle>
                    <CardDescription className="text-slate-400">
                        Approve the strategy or request a revision with your feedback.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="feedback" className="text-sm font-medium text-slate-300">
                            Feedback (Required for revision)
                        </Label>
                        <Textarea
                            id="feedback"
                            placeholder="Provide specific, actionable feedback for improvement..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="min-h-[120px] resize-y bg-slate-800 border-slate-600 text-slate-50 placeholder:text-slate-500 focus:ring-1 focus:ring-offset-0 focus:ring-blue-500"
                            disabled={isProcessing || processing}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-2">
                        <Button
                            onClick={() => handleAction('approve')}
                            disabled={isProcessing || processing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-base py-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            {isProcessing ? 'Processing...' : 'Approve Strategy'}
                        </Button>

                        <Button
                            onClick={() => handleAction('reject')}
                            disabled={isProcessing || processing || !feedback.trim()}
                            variant="outline"
                            className="flex-1 bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold text-base py-6 transition-all duration-300 disabled:border-slate-600 disabled:text-slate-500 disabled:bg-transparent disabled:cursor-not-allowed"
                        >
                            <RefreshCw className="h-5 w-5 mr-2" />
                            {isProcessing ? 'Processing...' : 'Request Revision'}
                        </Button>
                    </div>

                    {!feedback.trim() && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                            💡 Tip: Providing clear feedback leads to better and faster revisions.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}