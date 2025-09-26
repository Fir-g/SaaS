import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Target, ChevronDown, ChevronRight } from 'lucide-react';

interface AutoDecisionSummary {
  totalQuestions: number;
  answeredByUser: number;
  autoNoSplit: Array<{ questionId: string; confidence: number; column: string; sheetName: string }>;
  autoSplit: Array<{ questionId: string; confidence: number; column: string; sheetName: string }>;
}

interface SubmitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  autoDecisionSummary: AutoDecisionSummary | null;
  isSubmitting: boolean;
}

export const SubmitConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  autoDecisionSummary,
  isSubmitting
}: SubmitConfirmationDialogProps) => {
  const [expandedNoSplit, setExpandedNoSplit] = useState(false);
  const [expandedSplit, setExpandedSplit] = useState(false);

  if (!autoDecisionSummary) return null;

  const { totalQuestions, answeredByUser, autoNoSplit, autoSplit } = autoDecisionSummary;
  const totalAutoDecisions = autoNoSplit.length + autoSplit.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Auto-Complete Missing Decisions
          </DialogTitle>
          <DialogDescription>
            You haven't answered all questions. We'll automatically complete the remaining ones based on AI confidence levels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-medium">{totalQuestions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Answered by You:</span>
              <span className="font-medium text-brand-primary">{answeredByUser}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Auto-Completed:</span>
              <span className="font-medium text-warning">{totalAutoDecisions}</span>
            </div>
          </div>

          {/* Auto-Complete Rules */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900">Auto-Complete Rules:</h4>
            
            {autoNoSplit.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">No Split</span>
                  <Badge variant="secondary" className="text-xs">
                    {autoNoSplit.length} questions
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  Questions with confidence &lt; 85% automatically set to "No Split"
                </p>
                <div className="space-y-1">
                  <div className={`space-y-1 ${!expandedNoSplit ? 'max-h-16' : 'max-h-32'} overflow-y-auto`}>
                    {(expandedNoSplit ? autoNoSplit : autoNoSplit.slice(0, 3)).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">Column {item.column}</span>
                          <span className="text-gray-500 ml-1">• {item.sheetName}</span>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          <Target className="h-2 w-2 mr-1" />
                          {item.confidence}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {autoNoSplit.length > 3 && (
                    <button
                      onClick={() => setExpandedNoSplit(!expandedNoSplit)}
                      className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-accent transition-colors"
                    >
                      {expandedNoSplit ? (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3 w-3" />
                          ...and {autoNoSplit.length - 3} more
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {autoSplit.length > 0 && (
              <div className="border border-success/30 rounded-lg p-3 bg-success/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Split</span>
                  <Badge variant="default" className="text-xs bg-success/10 text-success">
                    {autoSplit.length} questions
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  Unanswered questions with confidence ≥ 85% automatically set to "Split"
                </p>
                <div className="space-y-1">
                  <div className={`space-y-1 ${!expandedSplit ? 'max-h-16' : 'max-h-32'} overflow-y-auto`}>
                    {(expandedSplit ? autoSplit : autoSplit.slice(0, 3)).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">Column {item.column}</span>
                          <span className="text-gray-500 ml-1">• {item.sheetName}</span>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          <Target className="h-2 w-2 mr-1" />
                          {item.confidence}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {autoSplit.length > 3 && (
                    <button
                      onClick={() => setExpandedSplit(!expandedSplit)}
                      className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-accent transition-colors"
                    >
                      {expandedSplit ? (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3 w-3" />
                          ...and {autoSplit.length - 3} more
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <AlertTriangle className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Confirm & Submit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};