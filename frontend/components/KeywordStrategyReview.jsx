/* KeywordStrategyReview.jsx */
import React, { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

import {
  Target,
  TrendingUp,
  Users,
  FileText,
  Award,
  Settings,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const getSectionIcon = (heading = '') => {
  const h = heading.toLowerCase();

  if (h.includes('executive')) return <Target className="h-4 w-4 text-primary" />;
  if (h.includes('keyword')) return <TrendingUp className="h-4 w-4 text-primary" />;
  if (h.includes('competitive')) return <Users className="h-4 w-4 text-primary" />;
  if (h.includes('content outline')) return <FileText className="h-4 w-4 text-primary" />;
  if (h.includes('title')) return <Award className="h-4 w-4 text-primary" />;

  return <Settings className="h-4 w-4 text-primary" />;
};

/* -------- obtain first markdown-table + residual text -------------- */
const extractMarkdownTable = (text = '') => {
  if (!text) return null;

  const lines = text.split('\n');
  let start = -1;
  let end = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|')) {
      if (start === -1) start = i;
      end = i;
    } else if (start !== -1) {
      break; // contiguous block finished
    }
  }

  if (start === -1) return null;

  const tableLines = lines.slice(start, end + 1);
  const tableString = tableLines.join('\n').trim();
  const cleanedText = [...lines.slice(0, start), ...lines.slice(end + 1)]
    .join('\n')
    .trim();

  return { tableString, cleanedText };
};

const parseTable = (tableString = '') => {
  if (!tableString) return null;

  const rows = tableString
    .split('\n')
    .filter(Boolean)
    .map((r) =>
      r
        .split('|')
        .filter(Boolean)
        .map((c) => c.trim())
    );

  if (rows.length < 2) return null; // header + at least one row required

  return {
    headers: rows[0],
    rows: rows.slice(1),
  };
};

/* ---------- inline markdown (**bold**, *italic*) renderer ---------- */
const inlineMd = (str = '') => {
  const out = [];
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let idx = 0;
  let last = 0;
  let m;

  while ((m = regex.exec(str)) !== null) {
    if (m.index > last) out.push(str.slice(last, m.index));
    if (m[1]) out.push(<strong key={idx++}>{m[2]}</strong>);
    else if (m[3]) out.push(<em key={idx++}>{m[4]}</em>);
    last = regex.lastIndex;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
};

/* ---------- render paragraphs & lists with extra keyword markup ----- */
const RichText = ({ text = '' }) => {
  if (!text) return null;

  const blocks = text.split(/\n{2,}/); // split on double line-breaks

  /* transforms "* Target Keywords: ..." fragments */
  const renderLine = (line) => {
    const kwMatch = line.match(/\s\*\s*Target Keywords\s*:\s*(.*)/i);

    if (kwMatch) {
      const pre = line.slice(0, kwMatch.index).trim();
      const kws = kwMatch[1].trim();

      return (
        <>
          {inlineMd(pre)}
          {' — '}
          <span className="italic text-sm text-gray-300">
            Target Keywords: {kws}
          </span>
        </>
      );
    }

    return inlineMd(line);
  };

  return blocks.map((blk, i) => {
    const lines = blk.split('\n').filter(Boolean);

    /* unordered list (- or * as bullet) */
    const isBulletBlock = lines.every((ln) => ln.trim().match(/^[-*]\s+/));

    if (isBulletBlock) {
      const items = lines.map((ln) => ln.replace(/^[-*]\s+/, '').trim());

      return (
        <ul
          key={i}
          className="mb-4 list-disc pl-6 leading-7 text-base text-white"
        >
          {items.map((it, j) => (
            <li key={j}>{renderLine(it)}</li>
          ))}
        </ul>
      );
    }

    /* ordered lists (1., 2.) */
    const isOrdered = lines.every((ln) => ln.trim().match(/^\d+\.\s+/));

    if (isOrdered) {
      const items = lines.map((ln) => ln.replace(/^\d+\.\s+/, '').trim());

      return (
        <ol
          key={i}
          className="mb-4 list-decimal pl-6 leading-7 text-base text-white"
        >
          {items.map((it, j) => (
            <li key={j}>{renderLine(it)}</li>
          ))}
        </ol>
      );
    }

    /* plain paragraph block */
    return (
      <p key={i} className="mb-4 leading-7 text-base text-white">
        {renderLine(blk)}
      </p>
    );
  });
};


/* ------------------------------------------------------------------ */
/*  Deduplication Helper                                              */
/* ------------------------------------------------------------------ */

// Deduplicate sections by heading, merging content and tables
const deduplicateSections = (sections) => {
  const seen = new Set();
  const deduplicated = [];
  sections.forEach((section) => {
    if (!seen.has(section.heading)) {
      seen.add(section.heading);
      deduplicated.push({ ...section });
    } else {
      const existingIndex = deduplicated.findIndex(s => s.heading === section.heading);
      if (existingIndex !== -1) {
        // Combine content
        deduplicated[existingIndex].content =
          (deduplicated[existingIndex].content || '') +
          (section.content ? '\n\n' + section.content : '');
        // Use table from the section that has it
        if (section.table && section.table !== 'N/A') {
          deduplicated[existingIndex].table = section.table;
        }
        // Combine additional_content
        if (section.additional_content) {
          deduplicated[existingIndex].additional_content =
            (deduplicated[existingIndex].additional_content || '') +
            '\n\n' + section.additional_content;
        }
      }
    }
  });
  return deduplicated;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function KeywordStrategyReview({
  executionId,
  workflowStatus,
  onApproval,
  processing,
}) {
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const strategy = workflowStatus?.keyword_strategy;
  const attemptNumber = workflowStatus?.attempt_number ?? 1;

  /* -------------------------------------------------------------- */
  /*  Actions                                                       */
  /* -------------------------------------------------------------- */

  const handleAction = async (action) => {
    if (isProcessing || processing) return;

    setIsProcessing(true);
    try {
      await onApproval({
        action,
        strategy_feedback: feedback.trim(),
      });
      if (action === 'approve') setFeedback('');
    } catch (err) {
      console.error(err);
      alert(`Failed to process request: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  /* -------------------------------------------------------------- */

  if (!strategy)
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        This may take a moment. Please wait.
      </div>
    );

  return (
    <ScrollArea className="pr-4">
      <Card className="border-none shadow-none text-white">
        {/* ---------------- Sections ---------------- */}
        {strategy?.sections &&
          deduplicateSections(
            strategy.sections.filter(
              (sec) =>
                !sec.heading.toLowerCase().includes('seo title') &&
                !sec.heading.toLowerCase().includes('proposed seo')
            )
          ).map((sec, idx, arr) => {
            // ...existing code for section rendering...
            let mdTable = sec.table?.trim() || '';
            let remainingText = sec.additional_content || '';

            if (!mdTable) {
              const res = extractMarkdownTable(sec.additional_content);
              mdTable = res?.tableString || '';
              remainingText = res?.cleanedText || remainingText;
            }

            const tableData = parseTable(mdTable);

            return (
              <div key={idx}>
                {/* Heading */}
                <CardHeader className="flex flex-row items-center gap-2">
                  {getSectionIcon(sec.heading)}
                  <CardTitle className="text-lg text-white">
                    {sec.heading.replace(/^##\s*/, '')}
                  </CardTitle>
                </CardHeader>

                {/* Body */}
                <CardContent className="space-y-4">
                  {sec.content && <RichText text={sec.content} />}
                  {remainingText && <RichText text={remainingText} />}

                  {tableData && (
                    <Table className="mt-2 text-sm text-white">
                      <TableHeader>
                        <TableRow>
                          {tableData.headers.map((h, i) => (
                            <TableHead key={i} className="text-white">
                              {inlineMd(h)}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {tableData.rows.map((row, rIdx) => (
                          <TableRow key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <TableCell key={cIdx} className="text-white">
                                {inlineMd(cell)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>

                {idx !== arr.length - 1 && <Separator className="my-6" />}
              </div>
            );
          })}

        {/* ---------------- Feedback & Actions ---------------- */}
        <Separator className="my-4" />

        <CardContent>
          <Label
            htmlFor="feedback"
            className="mb-2 block text-white font-semibold"
          >
            Feedback&nbsp;(optional)
          </Label>

          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Let the AI know what should be changed or improved…"
            className="mb-6 text-white placeholder:text-gray-400"
          />

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 font-bold px-6 py-2"
              disabled={isProcessing || processing}
              onClick={() => handleAction('reject')}
            >
              Request&nbsp;Revision
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2"
              disabled={isProcessing || processing}
              onClick={() => handleAction('approve')}
            >
              Approve
            </Button>
          </div>
        </CardContent>

        <CardDescription className="p-4 text-xs text-gray-400">
          Attempt #{attemptNumber} &nbsp;|&nbsp; Execution&nbsp;ID:&nbsp;
          {executionId}
        </CardDescription>
      </Card>
    </ScrollArea>
  );
}
