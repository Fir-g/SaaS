
import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface CSVFileUploadProps {
  onFileUpload?: (file: File) => void;
  onFileRemove?: () => void;
  maxSizeMB?: number;
}

interface UploadState {
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string;
}

const CSVFileUpload: React.FC<CSVFileUploadProps> = ({ 
  onFileUpload, 
  onFileRemove,
  maxSizeMB = 5
}) => {
  const [state, setState] = useState<UploadState>({
    file: null,
    isUploading: false,
    uploadProgress: 0,
    error: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_SIZE = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const validateFile = (selectedFile: File): boolean => {
    // Check file type
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.toLowerCase().endsWith('.csv')) {
      setState(prev => ({ ...prev, error: 'Only CSV files are allowed' }));
      return false;
    }

    // Check file size
    if (selectedFile.size > MAX_SIZE) {
      setState(prev => ({ ...prev, error: `File size must be less than ${maxSizeMB}MB` }));
      return false;
    }

    setState(prev => ({ ...prev, error: '' }));
    return true;
  };

  const simulateUpload = (): void => {
    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));

    const interval = setInterval(() => {
      setState(prev => {
        const newProgress = prev.uploadProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return { ...prev, isUploading: false, uploadProgress: 100 };
        }
        return { ...prev, uploadProgress: newProgress };
      });
    }, 400);
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    
    if (selectedFile && validateFile(selectedFile)) {
      setState(prev => ({ ...prev, file: selectedFile }));
      simulateUpload();
      
      if (onFileUpload) {
        onFileUpload(selectedFile);
      }
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleRemoveFile = (): void => {
    setState({
      file: null,
      uploadProgress: 0,
      error: '',
      isUploading: false
    });
    
    if (onFileRemove) {
      onFileRemove();
    }
  };

  const handleButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const truncateFileName = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) return name;
    const extension = name.split('.').pop() || '';
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    return truncated + '.' + extension;
  };

  const { file, isUploading, uploadProgress, error } = state;

  return (
    <div 
    // className="w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!file ? (
        <button
          onClick={handleButtonClick}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg transition-colors group"
          type="button"
        >
          <Upload size={16} className="text-blue-600 group-hover:text-blue-700" />
          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
            Upload CSV
          </span>
        </button>
      ) : (
        <div className="space-y-2">
          {/* File Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : uploadProgress === 100 ? (
                <Check size={16} className="text-green-600 flex-shrink-0" />
              ) : error ? (
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              ) : (
                <Check size={16} className="text-green-600 flex-shrink-0" />
              )}
              
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {truncateFileName(file.name)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-red-50 rounded-full transition-colors group flex-shrink-0"
              type="button"
              aria-label="Remove file"
            >
              <X size={14} className="text-gray-400 group-hover:text-red-500" />
            </button>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Status */}
          <div className="text-xs">
            {isUploading ? (
              <span className="text-blue-600">Uploading... {uploadProgress}%</span>
            ) : uploadProgress === 100 ? (
              <span className="text-green-600">Upload complete</span>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : null}
          </div>
        </div>
      )}

      {/* File Requirements */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400">
          CSV files only • Max {maxSizeMB}MB
        </p>
      </div>
    </div>
  );
};

export default CSVFileUpload