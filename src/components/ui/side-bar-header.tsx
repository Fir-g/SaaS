import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function SideBarHeader(){
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <span>•</span>
        <Button variant="ghost" className="text-sm text-gray-500 font-semibold px-1">
          What's New?
        </Button>
      </div>
      <Button variant="outline" className="flex text-gray-800 items-center text-base font-medium">
        View Release <FontAwesomeIcon icon={faChevronRight}/>
      </Button>
    </div>
  );
}