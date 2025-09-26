import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Zap } from 'lucide-react';

interface BulkActionsProps {
  onSplitAll: () => void;
  onNoSplitAll: () => void;
  splitAllText?: string;
  noSplitAllText?: string;
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
}

export const BulkActions = ({
  onSplitAll,
  onNoSplitAll,
  splitAllText = "Split All",
  noSplitAllText = "No Split All", 
  size = "default",
  disabled = false
}: BulkActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onNoSplitAll}
        variant="outline"
        size={size}
        disabled={disabled}
        className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      >
        <XCircle className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        {noSplitAllText}
      </Button>
      
      <Button
        onClick={onSplitAll}
        variant="default"
        size={size}
        disabled={disabled}
        className="flex-1 bg-green-600 hover:bg-green-700 border-green-600"
      >
        <CheckCircle className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        {splitAllText}
      </Button>
    </div>
  );
};
