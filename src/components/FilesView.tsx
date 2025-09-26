import { useFiles } from '@/hooks/useFiles';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useFilters } from '@/hooks/useFilters';
import { Card, CardContent } from "@/components/ui/card";
import EnhancedFileUpload from "./FileUploadComponent";
import { FilesHeader, FilesFilters, FilesList } from "./files";
import { useSplitManager } from '@/hooks/useSplitManager';
import type { FileData } from "@/types";

export function FilesView() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const projectUuid = params.projectId || location.state?.projectId;

  const { files, isLoading, deleteFile, refreshFiles } = useFiles(projectUuid);
  const { fetchXlsxFiles } = useSplitManager();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; file: FileData | null }>({ 
    open: false, 
    file: null 
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    documentTypeFilter,
    setDocumentTypeFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filteredAndSortedFiles,
    clearFilters,
  } = useFilters(files);

  const handleOpenSplitManager = async () => {
    console.log('Opening Import Wizard page');
    if (projectUuid) {
      await fetchXlsxFiles(projectUuid);
      navigate(`/workspace/files/${projectUuid}/splitmanager`, {
        state: location.state
      });
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteDialog.file || !projectUuid) return;

    setIsDeleting(true);
    try {
      await deleteFile(projectUuid, deleteDialog.file.id);
      setDeleteDialog({ open: false, file: null });
    } catch (error) {
      // Error is handled by useFiles hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadSuccess = async () => {
    if (projectUuid) {
      await refreshFiles(projectUuid);
      // After uploads, also refresh processing jobs for Import Wizard
      await fetchXlsxFiles(projectUuid);
    }
  };

  const handleXlsxFilesUploaded = (xlsxFiles: { id: string; name: string }[]) => {
    console.log('XLSX files uploaded:', xlsxFiles);
    // Auto-navigate to Import Wizard after upload
    setTimeout(() => {
      fetchXlsxFiles(projectUuid!).then(() => {
        navigate(`/workspace/files/${projectUuid}/splitmanager`, {
          state: location.state
        });
      });
    }, 1000); // Small delay to allow UI to update
  };
  return (
    <div className="h-screen flex flex-col p-6 space-y-6 max-w-7xl mx-auto overflow-hidden">
      <Card className="border-0 bg-white/60 backdrop-blur shadow-sm flex-shrink-0">
        <CardContent className="p-4">
          <FilesHeader 
            onUploadClick={() => setUploadDialogOpen(true)}
            onSplitManagerClick={handleOpenSplitManager}
          />

          <FilesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            documentTypeFilter={documentTypeFilter}
            setDocumentTypeFilter={setDocumentTypeFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
            filteredCount={filteredAndSortedFiles.length}
            totalCount={files.length}
            onClearFilters={clearFilters}
          />
        </CardContent>
      </Card>

      <FilesList
        files={filteredAndSortedFiles}
        loading={isLoading}
        onRequestDelete={(file) => setDeleteDialog({ open: true, file })}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, file: deleteDialog.file })}
        title="Delete File"
        description={`Are you sure you want to delete "${deleteDialog.file?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteFile}
        isDestructive
        isLoading={isDeleting}
      />

      <EnhancedFileUpload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        projectUuid={projectUuid}
        onUploadSuccess={handleUploadSuccess}
        onXlsxFilesUploaded={handleXlsxFilesUploaded}
      />
    </div>
  );
}