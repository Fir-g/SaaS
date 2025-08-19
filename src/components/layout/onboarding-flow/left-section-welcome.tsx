import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import SideBarHeader from "@/components/ui/side-bar-header";

export default function LeftSectionWelcome() {
  return (
    <div className="flex flex-col h-screen w-3/5 bg-[#EEEFFA] py-6 px-12">
      <SideBarHeader />
      <div className="mb-8">
        <div className="text-gray-800 text-2xl font-semibold mb-2">Welcome</div>
        <p className="text-gray-700 text-muted-foreground text-base">
          Seamless integration platform for all your supply and demand needs
        </p>
      </div>
      <div className="mt-auto">
        <Button
          variant="outline"
          className="flex text-gray-800 items-center text-lg font-medium"
        >
          See how it works <FontAwesomeIcon icon={faChevronRight} />
        </Button>
      </div>
      <img src="/wireframe.svg" alt="Wireframe logo" className="h-4/6" />
    </div>
  );
}
