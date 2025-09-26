import { Calendar, Folder, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatters';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
}

export const ProjectCard = ({ project, onClick, onDelete }: ProjectCardProps) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-brand-primary text-white group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-brand-accent">
              <div className="h-6 w-6 rounded-full flex items-center justify-center">
                <Folder className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg text-white">
                {project.name}
              </CardTitle>
              <CardDescription className="text-sm text-white/80">
                {project.description || "No description"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-white/20 text-white shadow-none transition-colors"
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-5 h-5 text-white" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-white/80">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-white/80" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};