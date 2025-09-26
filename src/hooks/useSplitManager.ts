import { useState, useCallback } from 'react';
import type { FileData } from '@/types';
import { splitService } from '@/services/splitService';
import { useFilePoolStore } from '@/stores/filePoolStore';

interface UseSplitManagerReturn {
  xlsxFiles: FileData[];
  loading: boolean;
  error: string | null;
  fetchXlsxFiles: (projectId: string) => Promise<void>;
  setXlsxFiles: (files: FileData[]) => void;
  removeFileFromPool: (fileId: string) => void;
}

export const useSplitManager = (): UseSplitManagerReturn => {
  const [xlsxFiles, setXlsxFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { removeFileFromPool: removeFromPool, clearProjectFiles } = useFilePoolStore();

  const fetchXlsxFiles = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const jobs = await splitService.getProcessingJobs(projectId);
      const mapped: FileData[] = jobs.map(j => ({
        id: j.id,
        name: j.name,
        type: 'xlsx',
        document_type: 'spreadsheet',
        file_size: null,
        uploaded_at: '',
        modified_at: '',
        status: 'uploaded',
      }));
      setXlsxFiles(mapped);
      // clear legacy local cache for consistency
      clearProjectFiles(projectId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch processing jobs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [clearProjectFiles]);

  const removeFileFromPool = useCallback((fileId: string) => {
    removeFromPool(fileId);
    setXlsxFiles(prev => prev.filter(file => file.id !== fileId));
  }, [removeFromPool]);

  return {
    xlsxFiles,
    loading,
    error,
    fetchXlsxFiles,
    setXlsxFiles,
    removeFileFromPool,
  };
};