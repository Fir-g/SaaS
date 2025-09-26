import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';
import type { Question } from '@/services/splitService';

interface QuestionListProps {
  questions: Question[];
  decisions: Record<string, 0 | 1>;
  onDecision: (questionId: string, decision: 0 | 1) => void;
  showRange?: boolean;
}

export const QuestionList = ({
  questions,
  decisions,
  onDecision,
  showRange = false
}: QuestionListProps) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No questions in this group</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((question, index) => {
        const decision = decisions[question.question_id];
        const confidence = Math.round(question.decision.confidence * 100);
        
        return (
          <div 
            key={question.question_id} 
            className={`border rounded-lg p-3 ${
              decision !== undefined 
                ? decision === 1 
                  ? 'border-green-200 bg-green-50/30' 
                  : 'border-gray-300 bg-gray-50/30'
                : 'border-gray-200 bg-white'
            } transition-all duration-200`}
          >
            {/* Question Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-gray-500">
                  Q{index + 1}
                </div>
                {showRange && (
                  <Badge variant="outline" className="text-xs">
                    {question.range.left_letter}{question.range.top}:
                    {question.range.right_letter}{question.range.bottom}
                  </Badge>
                )}
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  confidence >= 85 ? 'border-green-300 text-green-700' :
                  confidence >= 70 ? 'border-yellow-300 text-yellow-700' :
                  'border-red-300 text-red-700'
                }`}
              >
                {confidence}%
              </Badge>
            </div>

            {/* Question Content with Inline Buttons */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Split Column {question.range.left_letter}?
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {question.decision.reasoning}
                </div>
              </div>
              
              {/* Inline Decision Buttons */}
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant={decision === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDecision(question.question_id, 0)}
                  className="h-7 px-2 text-xs"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  No Split
                </Button>
                <Button
                  variant={decision === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDecision(question.question_id, 1)}
                  className="h-7 px-2 text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Split
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
