import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TabBasedSplitManager } from '@/components/split-manager/TabBasedSplitManager';
import { SpreadsheetViewer } from '@/components/split-manager/SpreadsheetViewer';
import { SubmitConfirmationDialog } from '@/components/split-manager/SubmitConfirmationDialog';
import { splitService } from '@/services/splitService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useSplitManager } from '@/hooks/useSplitManager';
import type { FileData } from '@/types';
import type { SplitManagerResponse, SplitDecision } from '@/services/splitService';

const SplitManagerPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [splitData, setSplitData] = useState<SplitManagerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, 0 | 1>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileStatus, setFileStatus] = useState<string>('uploaded');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [autoDecisionSummary, setAutoDecisionSummary] = useState<any>(null);
  const [finalDecisions, setFinalDecisions] = useState<Record<string, 0 | 1>>({});
  const [selectedSheet, setSelectedSheet] = useState<string>('all');
  
  // Resizable split state
  const [leftPanePercent, setLeftPanePercent] = useState<number>(35);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const pendingPercentRef = useRef<number | null>(null);
  
  const { xlsxFiles, fetchXlsxFiles, removeFileFromPool } = useSplitManager();
  
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

  // Check if polling should continue based on status
  const shouldContinuePolling = (status: string): boolean => {
    const pollingStatuses = ['uploaded', 'in_progress', 'processing'];
    return pollingStatuses.includes(status);
  };

  // Start polling for the current file
  const startPolling = async (fileId: string) => {
    currentPollingFileRef.current = fileId;
    
    try {
      const data = await splitService.getFileQuestions(projectId!, fileId);
      if (currentPollingFileRef.current === fileId) {
        setFileStatus(data.status);
        
        if (data.file_url && data.sheets) {
          setSplitData(data);
          if (!shouldContinuePolling(data.status)) {
            stopPolling();
            return;
          }
        } else {
          setSplitData(null);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('is either not found or is still being processed')) {
        if (currentPollingFileRef.current === fileId) {
          setSplitData(null);
          setFileStatus('processing');
        }
      } else {
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

    const poll = async () => {
      if (currentPollingFileRef.current !== fileId) return;

      try {
        const data = await splitService.getFileQuestions(projectId!, fileId);
        
        if (currentPollingFileRef.current === fileId) {
          setFileStatus(data.status);
          
          if (data.file_url && data.sheets) {
            setSplitData(data);
            if (!shouldContinuePolling(data.status)) {
              stopPolling();
              return;
            }
          } else {
            setSplitData(null);
          }
          
          pollTimeoutRef.current = setTimeout(poll, 5000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('is either not found or is still being processed')) {
          if (currentPollingFileRef.current === fileId) {
            setSplitData(null);
            setFileStatus('processing');
          }
        } else {
          if (currentPollingFileRef.current === fileId) {
            setFileStatus('failed');
          }
        }
        
        if (currentPollingFileRef.current === fileId) {
          pollTimeoutRef.current = setTimeout(poll, 5000);
        }
      }
    };

    pollTimeoutRef.current = setTimeout(poll, 5000);
  };

  const stopPolling = () => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = undefined;
    }
    currentPollingFileRef.current = null;
  };

  // Resizer handlers
  const startDrag = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    const prevUserSelect = document.body.style.userSelect;
    document.body.dataset.prevUserSelect = prevUserSelect;
    document.body.style.userSelect = 'none';
  };

  const endDrag = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    if (document.body.dataset.prevUserSelect !== undefined) {
      document.body.style.userSelect = document.body.dataset.prevUserSelect as string;
      delete document.body.dataset.prevUserSelect;
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingPercentRef.current = null;
  };

  const onMouseDownResizer = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startDrag();
    window.addEventListener('mousemove', onMouseMoveResizer);
    window.addEventListener('mouseup', onMouseUpResizer);
  };

  const onMouseMoveResizer = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - bounds.left;
    const percent = (relativeX / bounds.width) * 100;
    const clamped = Math.min(80, Math.max(20, percent));
    // Throttle with rAF for smoother dragging
    pendingPercentRef.current = clamped;
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (pendingPercentRef.current !== null) {
          setLeftPanePercent(pendingPercentRef.current);
        }
      });
    }
  };

  const onMouseUpResizer = () => {
    endDrag();
    window.removeEventListener('mousemove', onMouseMoveResizer);
    window.removeEventListener('mouseup', onMouseUpResizer);
  };

  // Touch support
  const onTouchStartResizer = (e: React.TouchEvent<HTMLDivElement>) => {
    startDrag();
    window.addEventListener('touchmove', onTouchMoveResizer, { passive: false });
    window.addEventListener('touchend', onTouchEndResizer);
  };

  const onTouchMoveResizer = (e: TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const bounds = containerRef.current.getBoundingClientRect();
    const relativeX = touch.clientX - bounds.left;
    const percent = (relativeX / bounds.width) * 100;
    const clamped = Math.min(80, Math.max(20, percent));
    pendingPercentRef.current = clamped;
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (pendingPercentRef.current !== null) {
          setLeftPanePercent(pendingPercentRef.current);
        }
      });
    }
  };

  const onTouchEndResizer = () => {
    endDrag();
    window.removeEventListener('touchmove', onTouchMoveResizer);
    window.removeEventListener('touchend', onTouchEndResizer);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endDrag();
      window.removeEventListener('mousemove', onMouseMoveResizer);
      window.removeEventListener('mouseup', onMouseUpResizer);
      window.removeEventListener('touchmove', onTouchMoveResizer);
      window.removeEventListener('touchend', onTouchEndResizer);
    };
  }, []);

  // Load files on mount
  useEffect(() => {
    if (projectId) {
      fetchXlsxFiles(projectId);
    }
  }, [projectId, fetchXlsxFiles]);

  // Load data when file changes
  useEffect(() => {
    if (currentFile && projectId) {
      setLoading(true);
      setSplitData(null);
      setDecisions({});
      setSelectedSheet('all'); // Reset sheet selection when file changes
      
      stopPolling();
      startPolling(currentFile.id).finally(() => {
        setLoading(false);
      });
    }

    return () => {
      stopPolling();
    };
  }, [currentFile?.id, projectId, currentFileIndex]);

  // Navigation handlers
  const goToPrevious = () => {
    if (currentFileIndex > 0) {
      stopPolling();
      const newIndex = currentFileIndex - 1;
      setCurrentFileIndex(newIndex);
      setDecisions({});
    }
  };

  const goToNext = () => {
    if (currentFileIndex < xlsxFiles.length - 1) {
      stopPolling();
      const newIndex = currentFileIndex + 1;
      setCurrentFileIndex(newIndex);
      setDecisions({});
    }
  };

  const handleFileSelect = (index: number) => {
    if (index !== currentFileIndex) {
      stopPolling();
      setCurrentFileIndex(index);
      setDecisions({});
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

    // Filter questions based on selected sheet
    const filteredSheets = selectedSheet === 'all' 
      ? splitData.sheets 
      : splitData.sheets.filter(sheet => sheet.sheet_name === selectedSheet);
    
    const allQuestions = filteredSheets.flatMap(sheet => sheet.questions);
    const answeredCount = Object.keys(decisions).length;
    const totalQuestions = allQuestions.length;

    // If all questions are answered, submit directly
    if (answeredCount === totalQuestions) {
      await performSubmit(decisions, selectedSheet === 'all' ? null : selectedSheet);
      return;
    }

    // Auto-complete missing decisions and show confirmation
    const autoDecisions = { ...decisions };
    const autoNoSplit: Array<{ questionId: string; confidence: number; column: string; sheetName: string }> = [];
    const autoSplit: Array<{ questionId: string; confidence: number; column: string; sheetName: string }> = [];

    filteredSheets.forEach(sheet => {
      sheet.questions.forEach(question => {
        if (decisions[question.question_id] === undefined) {
          const confidence = Math.round(question.decision.confidence * 100);
          
          if (confidence < 85) {
            autoDecisions[question.question_id] = 0;
            autoNoSplit.push({
              questionId: question.question_id,
              confidence,
              column: question.range.left_letter,
              sheetName: sheet.sheet_name
            });
          } else {
            autoDecisions[question.question_id] = 1;
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

  const performSubmit = async (submissionDecisions: Record<string, 0 | 1>, sheetName?: string | null) => {
    if (!currentFile || !splitData || !projectId) return;

    // Filter questions based on selected sheet
    const filteredSheets = sheetName === null || sheetName === 'all'
      ? splitData.sheets 
      : splitData.sheets.filter(sheet => sheet.sheet_name === sheetName);
    
    const allQuestions = filteredSheets.flatMap(sheet => sheet.questions);
    const splitDecisions: SplitDecision[] = allQuestions.map(q => ({
      question_id: q.question_id,
      decision: submissionDecisions[q.question_id] ?? 0
    }));

    setIsSubmitting(true);
    try {
      await splitService.submitSplitDecisions(
        projectId, 
        currentFile.id, 
        splitDecisions,
        sheetName === 'all' ? null : sheetName
      );
      
      toast({
        title: "Success",
        description: "Split decisions submitted successfully",
      });

      removeFileFromPool(currentFile.id);
      setDecisions({});
      setShowConfirmDialog(false);
      setAutoDecisionSummary(null);
      setFinalDecisions({});

      // Move to next file if available, otherwise go back to files
      if (currentFileIndex < xlsxFiles.length - 1) {
        setCurrentFileIndex(currentFileIndex + 1);
      } else {
        // No more files, navigate back to files view
        navigate(`/workspace/files/${projectId}`, { 
          state: location.state 
        });
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
    performSubmit(finalDecisions, selectedSheet === 'all' ? null : selectedSheet);
  };

  const handleBack = () => {
    navigate(`/workspace/files/${projectId}`, { 
      state: location.state 
    });
  };

  // Show message if no XLSX files
  if (xlsxFiles.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">No XLSX Files</h3>
            <p className="text-muted-foreground mb-4">
              Upload XLSX files first to use the Import Wizard.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <h1 className="text-xl font-semibold">Import Wizard</h1>
        </div>
        {currentFile && (
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium truncate max-w-[50vw]" title={currentFile.name}>
                {currentFile.name}
              </span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
                {currentFileIndex + 1} of {xlsxFiles.length}
              </span>
            </div>
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

      {/* Content */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden select-none">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner text="Loading split questions..." />
          </div>
        ) : !splitData && shouldContinuePolling(fileStatus) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
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
               fileStatus === 'completed' ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                {fileStatus === 'failed' ? (
                 <AlertCircle className="h-6 w-6 text-destructive" />
                ) : fileStatus === 'completed' ? (
                 <Check className="h-6 w-6 text-success" />
                ) : (
                 <AlertCircle className="h-6 w-6 text-warning" />
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
            {/* Left Panel - resizable */}
            <div className="border-r bg-white overflow-y-auto" style={{ width: `${leftPanePercent}%` }}>
              <TabBasedSplitManager
                splitData={splitData}
                decisions={decisions}
                onDecision={handleDecision}
                onBulkDecision={handleBulkDecision}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                selectedSheet={selectedSheet}
                onSheetChange={setSelectedSheet}
              />
            </div>

            {/* Vertical Resizer */}
            <div
              onMouseDown={onMouseDownResizer}
              onTouchStart={onTouchStartResizer}
              onDoubleClick={() => setLeftPanePercent(35)}
              className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panels"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') setLeftPanePercent(p => Math.max(20, p - 2));
                if (e.key === 'ArrowRight') setLeftPanePercent(p => Math.min(80, p + 2));
                if (e.key === 'Enter') setLeftPanePercent(35);
              }}
            />

            {/* Right Panel - remaining */}
            <div className="flex-1 overflow-hidden" style={{ width: `${100 - leftPanePercent}%` }}>
              <SpreadsheetViewer
                fileUrl={splitData?.file_url}
                splitData={splitData}
                decisions={decisions}
              />
            </div>
          </>
        )}
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

export default SplitManagerPage;
