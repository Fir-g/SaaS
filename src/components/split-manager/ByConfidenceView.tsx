import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, Target } from 'lucide-react';
import { QuestionList } from './QuestionList';
import { BulkActions } from './BulkActions';
import type { SplitManagerResponse, Question } from '@/services/splitService';

interface ByConfidenceViewProps {
  splitData: SplitManagerResponse;
  decisions: Record<string, 0 | 1>;
  onDecision: (questionId: string, decision: 0 | 1) => void;
  onBulkDecision: (questionIds: string[], decision: 0 | 1) => void;
}

interface ConfidenceRange {
  id: string;
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  bulkActions: 'split' | 'no-split' | 'both';
}

const confidenceRanges: ConfidenceRange[] = [
  {
    id: 'low',
    label: 'Low Confidence',
    min: 0,
    max: 0.7,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: '< 70% confidence',
    bulkActions: 'no-split'
  },
  {
    id: 'medium',
    label: 'Medium Confidence',
    min: 0.7,
    max: 0.85,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: '70-85% confidence',
    bulkActions: 'both'
  },
  {
    id: 'high',
    label: 'High Confidence',
    min: 0.85,
    max: 1,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: '85-100% confidence',
    bulkActions: 'split'
  }
];

export const ByConfidenceView = ({
  splitData,
  decisions,
  onDecision,
  onBulkDecision
}: ByConfidenceViewProps) => {
  const [expandedRanges, setExpandedRanges] = useState<Set<string>>(new Set());

  const toggleRange = (rangeId: string) => {
    const newExpanded = new Set(expandedRanges);
    if (newExpanded.has(rangeId)) {
      newExpanded.delete(rangeId);
    } else {
      newExpanded.add(rangeId);
    }
    setExpandedRanges(newExpanded);
  };

  const getQuestionsInRange = (range: ConfidenceRange): (Question & { sheet_name: string })[] => {
    const allQuestions = splitData.sheets.flatMap(sheet => 
      sheet.questions.map(question => ({
        ...question,
        sheet_name: sheet.sheet_name
      }))
    );
    return allQuestions.filter(question => {
      const confidence = question.decision.confidence;
      return confidence >= range.min && confidence < range.max;
    });
  };

  const getRangeStats = (range: ConfidenceRange) => {
    const questions = getQuestionsInRange(range);
    const questionIds = questions.map(q => q.question_id);
    const answered = questionIds.filter(id => decisions[id] !== undefined).length;
    const splitDecisions = questionIds.filter(id => decisions[id] === 1).length;
    const noSplitDecisions = questionIds.filter(id => decisions[id] === 0).length;
    
    return {
      total: questions.length,
      answered,
      splitDecisions,
      noSplitDecisions,
      pending: questions.length - answered,
      questions
    };
  };

  const handleRangeBulkAction = (range: ConfidenceRange, decision: 0 | 1) => {
    const questions = getQuestionsInRange(range);
    const questionIds = questions.map(q => q.question_id);
    onBulkDecision(questionIds, decision);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        <div className="text-sm text-gray-600 mb-4">
          Questions are grouped by AI confidence levels. Use bulk actions to quickly process similar confidence ranges.
        </div>

        {confidenceRanges.map((range) => {
          const stats = getRangeStats(range);
          const isExpanded = expandedRanges.has(range.id);
          
          if (stats.total === 0) return null;
          
          return (
            <Card key={range.id} className={`border shadow-sm ${range.borderColor}`}>
              <CardHeader className="pb-2">
                <div
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleRange(range.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className={`font-medium group-hover:opacity-80 transition-opacity ${range.color}`}>
                        {range.label}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {range.description}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {stats.total} questions
                        </Badge>
                        {stats.answered > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {stats.answered} answered
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {stats.pending > 0 && (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                        {stats.pending} pending
                      </Badge>
                    )}
                    {stats.splitDecisions > 0 && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200">
                        {stats.splitDecisions} split
                      </Badge>
                    )}
                    {stats.noSplitDecisions > 0 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {stats.noSplitDecisions} no split
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bulk Actions - only show when expanded */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {range.bulkActions === 'both' && (
                      <BulkActions
                        onSplitAll={() => handleRangeBulkAction(range, 1)}
                        onNoSplitAll={() => handleRangeBulkAction(range, 0)}
                        splitAllText="Split All"
                        noSplitAllText="No Split All"
                        size="sm"
                      />
                    )}
                    {range.bulkActions === 'split' && (
                      <Button
                        onClick={() => handleRangeBulkAction(range, 1)}
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Mark All as Split
                      </Button>
                    )}
                    {range.bulkActions === 'no-split' && (
                      <Button
                        onClick={() => handleRangeBulkAction(range, 0)}
                        size="sm"
                        variant="secondary"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Mark All as No Split
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>

              {isExpanded && stats.questions.length > 0 && (
                <CardContent className="pt-0">
                  <QuestionList
                    questions={stats.questions}
                    decisions={decisions}
                    onDecision={onDecision}
                    showRange={true}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Empty state */}
        {confidenceRanges.every(range => getRangeStats(range).total === 0) && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Questions Found</h3>
            <p className="text-sm text-gray-500">
              No questions available for confidence-based grouping.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
