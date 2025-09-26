import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileSpreadsheet } from 'lucide-react';
import { BySheetView } from './BySheetView';
import { ByConfidenceView } from './ByConfidenceView';
import { ManualRangeView } from './ManualRangeView';
import type { SplitManagerResponse } from '@/services/splitService';

interface TabBasedSplitManagerProps {
  splitData: SplitManagerResponse | null;
  decisions: Record<string, 0 | 1>;
  onDecision: (questionId: string, decision: 0 | 1) => void;
  onBulkDecision: (questionIds: string[], decision: 0 | 1) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  selectedSheet?: string;
  onSheetChange?: (sheet: string) => void;
}

export const TabBasedSplitManager = ({
  splitData,
  decisions,
  onDecision,
  onBulkDecision,
  onSubmit,
  isSubmitting,
  selectedSheet = 'all',
  onSheetChange
}: TabBasedSplitManagerProps) => {
  const [activeTab, setActiveTab] = useState('by-sheet');

  if (!splitData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Loading Split Questions</h3>
            <p className="text-sm text-gray-400">
              File may still be processing. Please wait...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter sheets based on selected sheet
  const filteredSheets = selectedSheet === 'all' 
    ? splitData.sheets 
    : splitData.sheets.filter(sheet => sheet.sheet_name === selectedSheet);
  
  // Create filtered splitData object
  const filteredSplitData = {
    ...splitData,
    sheets: filteredSheets
  };
  
  const allQuestions = filteredSheets.flatMap(sheet => sheet.questions);
  const answeredCount = Object.keys(decisions).length;
  const totalQuestions = allQuestions.length;

  if (totalQuestions === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
            <p className="text-sm text-gray-500">
              This file doesn't have any split questions to review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 pt-2">
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="by-sheet" className="text-xs font-medium">
                By Sheet
              </TabsTrigger>
              <TabsTrigger value="by-confidence" className="text-xs font-medium">
                By Confidence
              </TabsTrigger>
              <TabsTrigger value="manual-range" className="text-xs font-medium">
                Manual Range
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="by-sheet" className="h-full m-0 p-0">
              <div className="h-full flex flex-col">
                {/* Sheet Selection */}
                {splitData && splitData.sheets && splitData.sheets.length > 1 && (
                  <div className="flex-shrink-0 p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Filter by Sheet:</span>
                      <Select value={selectedSheet} onValueChange={onSheetChange}>
                        <SelectTrigger className="w-48 h-8">
                          <SelectValue placeholder="Select sheet" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sheets</SelectItem>
                          {splitData.sheets.map((sheet) => (
                            <SelectItem key={sheet.sheet_id} value={sheet.sheet_name}>
                              {sheet.sheet_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {/* Sheet View Content */}
                <div className="flex-1 overflow-hidden">
                  <BySheetView
                    splitData={filteredSplitData}
                    decisions={decisions}
                    onDecision={onDecision}
                    onBulkDecision={onBulkDecision}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="by-confidence" className="h-full m-0 p-0">
              <ByConfidenceView
                splitData={filteredSplitData}
                decisions={decisions}
                onDecision={onDecision}
                onBulkDecision={onBulkDecision}
              />
            </TabsContent>

            <TabsContent value="manual-range" className="h-full m-0 p-0">
              <ManualRangeView
                splitData={filteredSplitData}
                decisions={decisions}
                onDecision={onDecision}
                onBulkDecision={onBulkDecision}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Submit Button */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || answeredCount === 0}
          className="w-full h-10"
          size="sm"
        >
          {isSubmitting ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
              Submitting Decisions...
            </>
          ) : (
            <>
              Submit All Decisions ({answeredCount}/{totalQuestions})
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
