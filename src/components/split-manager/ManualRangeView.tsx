import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DualHandleSlider } from './DualHandleSlider';
import { ChevronRight, ChevronDown, Plus, Trash2, Settings, Target } from 'lucide-react';
import { QuestionList } from './QuestionList';
import { BulkActions } from './BulkActions';
import type { SplitManagerResponse, Question } from '@/services/splitService';

interface CustomRange {
  id: string;
  name: string;
  min: number;
  max: number;
}

interface ManualRangeViewProps {
  splitData: SplitManagerResponse;
  decisions: Record<string, 0 | 1>;
  onDecision: (questionId: string, decision: 0 | 1) => void;
  onBulkDecision: (questionIds: string[], decision: 0 | 1) => void;
}

export const ManualRangeView = ({
  splitData,
  decisions,
  onDecision,
  onBulkDecision
}: ManualRangeViewProps) => {
  const [customRanges, setCustomRanges] = useState<CustomRange[]>([]);
  const [expandedRanges, setExpandedRanges] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newRangeName, setNewRangeName] = useState('');
  const [newRangeValues, setNewRangeValues] = useState([0, 100]);

  const toggleRange = (rangeId: string) => {
    const newExpanded = new Set(expandedRanges);
    if (newExpanded.has(rangeId)) {
      newExpanded.delete(rangeId);
    } else {
      newExpanded.add(rangeId);
    }
    setExpandedRanges(newExpanded);
  };

  const getQuestionsInRange = (range: CustomRange): (Question & { sheet_name: string })[] => {
    const allQuestions = splitData.sheets.flatMap(sheet => 
      sheet.questions.map(question => ({
        ...question,
        sheet_name: sheet.sheet_name
      }))
    );
    return allQuestions.filter(question => {
      const confidence = question.decision.confidence * 100; // Convert to percentage
      return confidence >= range.min && confidence <= range.max;
    });
  };

  const getRangeStats = (range: CustomRange) => {
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

  const handleCreateRange = () => {
    if (!newRangeName.trim()) return;
    
    const newRange: CustomRange = {
      id: `range-${Date.now()}`,
      name: newRangeName,
      min: newRangeValues[0],
      max: newRangeValues[1]
    };
    
    setCustomRanges(prev => [...prev, newRange]);
    setNewRangeName('');
    setNewRangeValues([0, 100]);
    setIsCreating(false);
  };

  const handleDeleteRange = (rangeId: string) => {
    setCustomRanges(prev => prev.filter(r => r.id !== rangeId));
    setExpandedRanges(prev => {
      const newSet = new Set(prev);
      newSet.delete(rangeId);
      return newSet;
    });
  };

  const handleRangeBulkAction = (range: CustomRange, decision: 0 | 1) => {
    const questions = getQuestionsInRange(range);
    const questionIds = questions.map(q => q.question_id);
    onBulkDecision(questionIds, decision);
  };

  const getConfidenceDistribution = () => {
    const allQuestions = splitData.sheets.flatMap(sheet => sheet.questions);
    const confidences = allQuestions.map(q => Math.round(q.decision.confidence * 100));
    const distribution: Record<number, number> = {};
    
    confidences.forEach(conf => {
      distribution[conf] = (distribution[conf] || 0) + 1;
    });
    
    return distribution;
  };

  const distribution = getConfidenceDistribution();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Range Creator */}
        <Card className="border border-gray-200">
          {!isCreating ? (
            <CardContent className="p-3">
              <Button
                onClick={() => setIsCreating(true)}
                size="sm"
                variant="outline"
                className="w-full h-8"
              >
                <Plus className="h-3 w-3 mr-2" />
                Create Custom Range
              </Button>
            </CardContent>
          ) : (
            <CardContent className="p-3 space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Range Name
                </label>
                <Input
                  value={newRangeName}
                  onChange={(e) => setNewRangeName(e.target.value)}
                  placeholder="e.g., Critical Review Range"
                  className="text-sm h-8"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Confidence Range: {newRangeValues[0]}% - {newRangeValues[1]}%
                </label>
                <div className="relative px-2">
                  <div className="relative py-2">
                    <DualHandleSlider
                      value={newRangeValues}
                      onValueChange={setNewRangeValues}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateRange}
                  size="sm"
                  disabled={!newRangeName.trim()}
                  className="flex-1 h-7 text-xs"
                >
                  Create Range
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setNewRangeName('');
                    setNewRangeValues([0, 100]);
                  }}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Confidence Distribution Overview */}
        <Card>
          <CardContent className="p-3">
            <h5 className="text-xs font-medium text-gray-700 mb-3">Confidence Distribution</h5>
            <div className="grid grid-cols-10 gap-1 text-xs">
              {Array.from({ length: 10 }, (_, i) => {
                const rangeStart = i * 10;
                const rangeEnd = (i + 1) * 10;
                const count = Object.entries(distribution)
                  .filter(([conf]) => {
                    const c = parseInt(conf);
                    return c >= rangeStart && c < rangeEnd;
                  })
                  .reduce((sum, [, count]) => sum + count, 0);
                
                const maxCount = Math.max(...Object.values(distribution), 1);
                const barHeight = Math.max(3, (count / maxCount) * 24);
                
                return (
                  <div key={i} className="text-center">
                    <div 
                      className="bg-blue-100 rounded-sm mb-1 transition-all duration-200 hover:bg-blue-200"
                      style={{ height: `${barHeight}px` }}
                      title={`${rangeStart}-${rangeEnd}%: ${count} questions`}
                    />
                    <span className="text-gray-400 text-xs">{rangeStart}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Ranges */}
        {customRanges.map((range) => {
          const stats = getRangeStats(range);
          const isExpanded = expandedRanges.has(range.id);
          
          return (
            <Card key={range.id} className="border border-blue-200 shadow-sm">
              <CardHeader className="pb-2">
                <div
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleRange(range.id)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <div className="p-2 rounded-md bg-blue-50">
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {range.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {range.min}% - {range.max}%
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
                      <Badge variant="default" className="text-xs bg-success/10 text-success border-success/30">
                        {stats.splitDecisions} split
                      </Badge>
                    )}
                    {stats.noSplitDecisions > 0 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {stats.noSplitDecisions} no split
                      </Badge>
                    )}
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRange(range.id);
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Bulk Actions - only show when expanded */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <BulkActions
                      onSplitAll={() => handleRangeBulkAction(range, 1)}
                      onNoSplitAll={() => handleRangeBulkAction(range, 0)}
                      splitAllText="Split All in Range"
                      noSplitAllText="No Split All in Range"
                      size="sm"
                    />
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
        {customRanges.length === 0 && !isCreating && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-600 mb-2">No Custom Ranges</h4>
              <p className="text-xs text-gray-500 mb-3">
                Create custom confidence ranges to organize questions based on your specific needs.
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Your First Range
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
