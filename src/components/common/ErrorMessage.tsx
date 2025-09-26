import { CircleAlert as AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  return (
    <Alert className={`border-destructive/30 bg-destructive/10 ${className}`}>
      <AlertCircle className="h-4 w-4 text-destructive" />
      <AlertDescription className="text-destructive">
        {message}
      </AlertDescription>
    </Alert>
  );
};