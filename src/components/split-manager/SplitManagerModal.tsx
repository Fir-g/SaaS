import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Check, CircleAlert as AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TabBasedSplitManager } from './TabBasedSplitManager';
import { SpreadsheetViewer } from './SpreadsheetViewer';
import { SubmitConfirmationDialog } from './SubmitConfirmationDialog';
import { splitService } from '@/services/splitService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import type { FileData } from '@/types';
import type { SplitManagerResponse, SplitDecision } from '@/services/splitService';

interface SplitManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  xlsxFiles: FileData[];
  removeFileFromPool: (fileId: string) => void;
  onAfterSubmit?: () => Promise<void> | void;
}

export const SplitManagerModal = ({
  open,
  onOpenChange,
  projectId,
  xlsxFiles,
  removeFileFromPool,
  onAfterSubmit
}: SplitManagerModalProps) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [splitData, setSplitData] = useState<SplitManagerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, 0 | 1>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileStatus, setFileStatus] = useState<string>('uploaded');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [autoDecisionSummary, setAutoDecisionSummary] = useState<any>(null);
  const [finalDecisions, setFinalDecisions] = useState<Record<string, 0 | 1>>({});
  
  const pollTimeoutRef = useRef<NodeJS.Timeout>();
  const currentPollingFileRef = useRef<string | null>(null);
  
  const currentFile = xlsxFiles[currentFileIndex];
  
  // Helper functions for status display
  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'uploaded': return 'File Uploaded';
      case 'in_progress': return 'Processing Started';
      case 'processing': return 'Processing File';
      case 'paused': return 'Processing Paused';
      case 'in-review': return 'Ready for Review';
      case 'completed': return 'Processing Complete';
      case 'failed': return 'Processing Failed';
      default: return 'Unknown Status';
    }
  };

  const getStatusDescription = (status: string): string => {
    switch (status) {
      case 'uploaded': return 'File has been uploaded and is queued for processing.';
      case 'in_progress': return 'File processing has started. Please wait...';
      case 'processing': return 'File is currently being processed and analyzed.';
      case 'paused': return 'Processing has been paused. Contact support if needed.';
      case 'in-review': return 'File is ready for split decision review.';
      case 'completed': return 'File processing is complete and ready for use.';
      case 'failed': return 'File processing failed. Please try uploading again.';
      default: return 'Unknown processing state.';
    }
  };
  
  // Debug logging
  console.log('SplitManagerModal render:', {
    currentFileIndex,
    totalFiles: xlsxFiles.length,
    currentFile: currentFile?.name,
    allFiles: xlsxFiles.map(f => ({ id: f.id, name: f.name }))
  });

  // Reset when files change
  useEffect(() => {
    if (xlsxFiles.length > 0) {
      setCurrentFileIndex(0);
      setSplitData(null);
      setDecisions({});
      setFileStatus('uploaded');
    }
  }, [xlsxFiles]);
  // Check if polling should continue based on status
  const shouldContinuePolling = (status: string): boolean => {
    const pollingStatuses = ['uploaded', 'in_progress', 'processing'];
    return pollingStatuses.includes(status);
  };

  // Start polling for the current file
  const startPolling = async (fileId: string) => {
    // Set the current polling file ID
    currentPollingFileRef.current = fileId;
    
    // Initial request
    try {
      const data = await splitService.getFileQuestions(projectId, fileId);
      // Only update if we're still polling for the same file
      if (currentPollingFileRef.current === fileId) {
        setFileStatus(data.status);
        
        // Check if we have actual data (file_url and sheets) or just status
        if (data.file_url && data.sheets) {
          // Full data available - file is ready
          setSplitData(data);
          
          // Stop polling if status indicates completion
          if (!shouldContinuePolling(data.status)) {
            console.log(`File ${fileId} reached final status: ${data.status}, stopping polling`);
            stopPolling();
            return;
          }
        } else {
          // Only status available - file still processing
          setSplitData(null);
          console.log(`File ${fileId} status: ${data.status} - ${data.message || 'Still processing'}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('is either not found or is still being processed')) {
        console.log(`File ${fileId} is still being processed, will continue polling...`);
        // Only clear data if we're still polling for the same file
        if (currentPollingFileRef.current === fileId) {
          setSplitData(null);
          setFileStatus('processing');
        }
      } else {
        console.error('Failed to fetch initial questions:', error);
        if (currentPollingFileRef.current === fileId) {
          setFileStatus('failed');
          toast({
            title: "Error",
            description: "Failed to load split questions",
            variant: "destructive"
          });
        }
      }
    }

    // Start continuous polling every 5 seconds
    const poll = async () => {
      // Check if we're still supposed to poll for this file
      if (currentPollingFileRef.current !== fileId) {
        console.log(`Stopping poll for file ${fileId} - user switched to different file`);
        return;
      }

      try {
        console.log(`Polling for file ${fileId} at ${new Date().toISOString()}`);
        const data = await splitService.getFileQuestions(projectId, fileId);
        
        // Only update if we're still polling for the same file
        if (currentPollingFileRef.current === fileId) {
          setFileStatus(data.status);
          
          // Check if we have actual data (file_url and sheets) or just status
          if (data.file_url && data.sheets) {
            // Full data available - file is ready
            setSplitData(data);
            
            // Stop polling if status indicates completion
            if (!shouldContinuePolling(data.status)) {
              console.log(`File ${fileId} reached final status: ${data.status}, stopping polling`);
              stopPolling();
              return;
            }
          } else {
            // Only status available - file still processing
            setSplitData(null);
            console.log(`File ${fileId} status: ${data.status} - ${data.message || 'Still processing'}`);
          }
          
          // Continue polling every 5 seconds
          pollTimeoutRef.current = setTimeout(poll, 5000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('is either not found or is still being processed')) {
          console.log(`File ${fileId} still being processed, continuing to poll...`);
          // Only clear data if we're still polling for the same file
          if (currentPollingFileRef.current === fileId) {
            setSplitData(null);
            setFileStatus('processing');
          }
        } else {
          console.error(`Polling failed for file ${fileId} with error:`, error);
          if (currentPollingFileRef.current === fileId) {
            setFileStatus('failed');
          }
        }
        
        // Only continue polling if we're still supposed to poll for this file
        if (currentPollingFileRef.current === fileId) {
          pollTimeoutRef.current = setTimeout(poll, 5000);
        }
      }
    };

    // Start polling after 5 seconds
    pollTimeoutRef.current = setTimeout(poll, 5000);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = undefined;
    }
    currentPollingFileRef.current = null;
  };

  // Load data when file changes
  useEffect(() => {
    if (currentFile && open) {
      console.log('File changed - Loading data for file:', currentFile.id, currentFile.name, 'at index:', currentFileIndex);
      setLoading(true);
      setSplitData(null);
      setDecisions({});
      
      stopPolling();
      startPolling(currentFile.id).finally(() => {
        setLoading(false);
      });
    }

    return () => {
      console.log('Cleanup: stopping polling for file:', currentFile?.id);
      stopPolling();
    };
  }, [currentFile?.id, open, projectId, currentFileIndex]);

  // Clean up on close
  useEffect(() => {
    if (!open) {
      stopPolling();
      setSplitData(null);
      setDecisions({});
      setCurrentFileIndex(0);
    }
  }, [open]);

  // Submit decisions for current file
  const submitCurrentFileDecisions = async (): Promise<boolean> => {
    if (!currentFile || !splitData) return false;

    const allQuestions = splitData.sheets.flatMap(sheet => sheet.questions);
    const submissionDecisions: SplitDecision[] = allQuestions.map(q => ({
      question_id: q.question_id,
      decision: decisions[q.question_id] ?? 0
    }));

    try {
      await splitService.submitSplitDecisions(
        projectId, 
        currentFile.id, 
        submissionDecisions
      );
      return true;
    } catch (error) {
      console.error('Failed to submit decisions:', error);
      return false;
    }
  };

  // Navigation handlers
  const goToPrevious = () => {
    console.log(`Previous button clicked: current index ${currentFileIndex}`);
    if (currentFileIndex > 0) {
      // Stop polling for current file before switching
      stopPolling();
      const newIndex = currentFileIndex - 1;
      setCurrentFileIndex(newIndex);
      setDecisions({}); // Clear decisions when switching files
      console.log(`Moved to previous file: index ${newIndex}, file:`, xlsxFiles[newIndex]?.name);
    }
  };

  const goToNext = () => {
    console.log(`Next button clicked: current index ${currentFileIndex}`);
    if (currentFileIndex < xlsxFiles.length - 1) {
      // Stop polling for current file before switching
      stopPolling();
      const newIndex = currentFileIndex + 1;
      setCurrentFileIndex(newIndex);
      setDecisions({}); // Clear decisions when switching files
      console.log(`Moved to next file: index ${newIndex}, file:`, xlsxFiles[newIndex]?.name);
    }
  };

  // Direct file selection handler
  const handleFileSelect = (index: number) => {
    console.log(`File selection: switching from index ${currentFileIndex} to ${index}`);
    if (index !== currentFileIndex) {
      // Stop polling for current file before switching
      stopPolling();
      setCurrentFileIndex(index);
      setDecisions({}); // Clear decisions when switching files
      console.log(`File switched to index: ${index}, file:`, xlsxFiles[index]?.name);
    }
  };

  // Decision handlers
  const handleDecision = (questionId: string, decision: 0 | 1) => {
    setDecisions(prev => ({
      ...prev,
      [questionId]: decision
    }));
  };

  const handleBulkDecision = (questionIds: string[], decision: 0 | 1) => {
    setDecisions(prev => {
      const newDecisions = { ...prev };
      questionIds.forEach(id => {
        newDecisions[id] = decision;
      });
      return newDecisions;
    });
  };

  const handleSubmit = async () => {
    if (!currentFile || !splitData) return;

    const allQuestions = splitData.sheets.flatMap(sheet => sheet.questions);
    const answeredCount = Object.keys(decisions).length;
    const totalQuestions = allQuestions.length;

    // If all questions are answered, submit directly
    if (answeredCount === totalQuestions) {
      await performSubmit(decisions);
      return;
    }

    // Auto-complete missing decisions and show confirmation
    const autoDecisions = { ...decisions };
    const autoNoSplit: Array<{ questionId: string; confidence: number; column: string; sheetName: string }> = [];
    const autoSplit: Array<{ questionId: string; confidence: number; column: string; sheetName: string }> = [];

    splitData.sheets.forEach(sheet => {
      sheet.questions.forEach(question => {
        if (decisions[question.question_id] === undefined) {
          const confidence = Math.round(question.decision.confidence * 100);
          
          if (confidence < 85) {
            autoDecisions[question.question_id] = 0; // No Split
            autoNoSplit.push({
              questionId: question.question_id,
              confidence,
              column: question.range.left_letter,
              sheetName: sheet.sheet_name
            });
          } else {
            autoDecisions[question.question_id] = 1; // Split
            autoSplit.push({
              questionId: question.question_id,
              confidence,
              column: question.range.left_letter,
              sheetName: sheet.sheet_name
            });
          }
        }
      });
    });

    setFinalDecisions(autoDecisions);
    setAutoDecisionSummary({
      totalQuestions,
      answeredByUser: answeredCount,
      autoNoSplit,
      autoSplit
    });
    setShowConfirmDialog(true);
  };

  const performSubmit = async (submissionDecisions: Record<string, 0 | 1>) => {
    if (!currentFile || !splitData) return;

    const allQuestions = splitData.sheets.flatMap(sheet => sheet.questions);
    const splitDecisions: SplitDecision[] = allQuestions.map(q => ({
      question_id: q.question_id,
      decision: submissionDecisions[q.question_id] ?? 0
    }));

    setIsSubmitting(true);
    try {
      await splitService.submitSplitDecisions(
        projectId, 
        currentFile.id, 
        splitDecisions
      );
      
      toast({
        title: "Success",
        description: "Split decisions submitted successfully",
      });

      // Remove file from pool after successful submission
      removeFileFromPool(currentFile.id);

      // Refresh upstream lists (jobs and files)
      try { await onAfterSubmit?.(); } catch {}

      // Clear decisions for this file
      setDecisions({});
      setShowConfirmDialog(false);
      setAutoDecisionSummary(null);
      setFinalDecisions({});

      // Move to next file if available, otherwise close modal
      if (currentFileIndex < xlsxFiles.length - 1) {
        setCurrentFileIndex(currentFileIndex + 1);
      } else {
        // No more files, close modal
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to submit decisions",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmSubmit = () => {
    performSubmit(finalDecisions);
  };

  if (!open) return null;

  // Show message if no XLSX files
  if (xlsxFiles.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">No XLSX Files</h3>
            <p className="text-muted-foreground mb-4">
              Upload XLSX files first to use the Import Wizard.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Content */}
      <div className="absolute inset-0 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <h2 className="text-xl font-semibold">Import Wizard</h2>
            
            {/* Current File Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {currentFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                  <span className="font-medium truncate" title={currentFile.name}>
                    {currentFile.name}
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
                    {currentFileIndex + 1} of {xlsxFiles.length}
                  </span>
                </div>
              )}
              
              {/* File Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentFileIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex gap-1">
                  {xlsxFiles.map((file, index) => (
                    <button
                      key={file.id}
                      onClick={() => handleFileSelect(index)}
                      title={file.name}
                      className={`h-8 min-w-[2rem] px-2 rounded text-xs font-medium transition-colors ${
                        index === currentFileIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentFileIndex === xlsxFiles.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden h-full">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner text="Loading split questions..." />
            </div>
          ) : !splitData && shouldContinuePolling(fileStatus) ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getStatusDisplay(fileStatus)}
                </h3>
                <p className="text-gray-600">
                  {getStatusDescription(fileStatus)}
                </p>
              </div>
            </div>
          ) : !splitData && !shouldContinuePolling(fileStatus) ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className={`rounded-full h-12 w-12 mx-auto mb-4 flex items-center justify-center ${
                  fileStatus === 'failed' ? 'bg-red-100' : 
                  fileStatus === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {fileStatus === 'failed' ? (
                    <X className="h-6 w-6 text-red-600" />
                  ) : fileStatus === 'completed' ? (
                    <Check className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getStatusDisplay(fileStatus)}
                </h3>
                <p className="text-gray-600">
                  {getStatusDescription(fileStatus)}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Left Panel - 35% */}
              <div className="w-[35%] border-r bg-gray-50 overflow-y-auto h-full">
                <TabBasedSplitManager
                  splitData={splitData}
                  decisions={decisions}
                  onDecision={handleDecision}
                  onBulkDecision={handleBulkDecision}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>

              {/* Right Panel - 65% */}
              <div className="flex-1 overflow-hidden h-full">
                <SpreadsheetViewer
                  fileUrl={splitData?.file_url}
                  splitData={splitData}
                  decisions={decisions}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Submit Confirmation Dialog */}
      <SubmitConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmSubmit}
        autoDecisionSummary={autoDecisionSummary}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};