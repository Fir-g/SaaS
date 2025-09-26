import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronDown, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { QuestionList } from './QuestionList';
import { BulkActions } from './BulkActions';
import type { SplitManagerResponse } from '@/services/splitService';

interface BySheetViewProps {
  splitData: SplitManagerResponse;
  decisions: Record<string, 0 | 1>;
  onDecision: (questionId: string, decision: 0 | 1) => void;
  onBulkDecision: (questionIds: string[], decision: 0 | 1) => void;
}

export const BySheetView = ({
  splitData,
  decisions,
  onDecision,
  onBulkDecision
}: BySheetViewProps) => {
  const [expandedSheets, setExpandedSheets] = useState<Set<number>>(new Set());

  const toggleSheet = (sheetIndex: number) => {
    const newExpanded = new Set(expandedSheets);
    if (newExpanded.has(sheetIndex)) {
      newExpanded.delete(sheetIndex);
    } else {
      newExpanded.add(sheetIndex);
    }
    setExpandedSheets(newExpanded);
  };

  const getSheetStats = (sheetIndex: number) => {
    const sheet = splitData.sheets[sheetIndex];
    const questionIds = sheet.questions.map(q => q.question_id);
    const answered = questionIds.filter(id => decisions[id] !== undefined).length;
    const splitDecisions = questionIds.filter(id => decisions[id] === 1).length;
    const noSplitDecisions = questionIds.filter(id => decisions[id] === 0).length;
    
    return {
      total: questionIds.length,
      answered,
      splitDecisions,
      noSplitDecisions,
      pending: questionIds.length - answered
    };
  };

  const handleSheetBulkAction = (sheetIndex: number, decision: 0 | 1) => {
    const sheet = splitData.sheets[sheetIndex];
    const questionIds = sheet.questions.map(q => q.question_id);
    onBulkDecision(questionIds, decision);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {splitData.sheets.map((sheet, sheetIndex) => {
          const stats = getSheetStats(sheetIndex);
          const isExpanded = expandedSheets.has(sheetIndex);
          
          return (
            <Card key={sheetIndex} className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <div
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleSheet(sheetIndex)}
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
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {sheet.sheet_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
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
                    <BulkActions
                      onSplitAll={() => handleSheetBulkAction(sheetIndex, 1)}
                      onNoSplitAll={() => handleSheetBulkAction(sheetIndex, 0)}
                      splitAllText="Split All in Sheet"
                      noSplitAllText="No Split All in Sheet"
                      size="sm"
                    />
                  </div>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <QuestionList
                    questions={sheet.questions}
                    decisions={decisions}
                    onDecision={onDecision}
                    showRange={true}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}

        {splitData.sheets.length === 0 && (
          <div className="text-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Sheets Found</h3>
            <p className="text-sm text-gray-500">
              This file doesn't contain any sheets with questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
