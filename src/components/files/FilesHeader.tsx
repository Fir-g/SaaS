import { Button } from "@/components/ui/button";
import { Upload, Split } from "lucide-react";

interface FilesHeaderProps {
  onUploadClick: () => void;
  onSplitManagerClick: () => void;
}

export const FilesHeader = ({ onUploadClick, onSplitManagerClick }: FilesHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Files</h2>
        <p className="text-sm text-muted-foreground">
          Upload and manage your PDF and XLSX files
        </p>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onSplitManagerClick}
          variant="outline"
          className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
        >
          <Split className="h-4 w-4 mr-2" />
          Import Wizard
        </Button>

        <Button 
          onClick={onUploadClick}
          className="bg-brand-primary hover:bg-brand-accent text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>
    </div>
  );
};