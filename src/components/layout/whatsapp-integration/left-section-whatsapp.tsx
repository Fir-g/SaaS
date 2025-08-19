import { Button } from "@/components/ui/button";
import Stepper from "@/components/ui/stepper";
import { WhatsappSteps } from "@/constants/steps";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type LeftSectionWhatsappPropType = {
  currentStep: string;
  stepNo: number;
};

const LeftSectionWhatsapp = ({
  currentStep,
  stepNo,
}: LeftSectionWhatsappPropType) => {
  return (
    <div className="flex flex-col min-h-screen w-3/5 bg-[#EEEFFA] py-6 px-12">
      <div className="mb-8">
        <p className="text-gray-700 text-muted-foreground text-base mb-6">
          WhatsApp Integration
        </p>
        <div className="text-gray-800 text-2xl font-semibold mb-2">
          Hello, User !
        </div>
        <p className="text-gray-700 text-muted-foreground text-base">
          Please complete the following steps for smooth integration of whatsapp
        </p>
      </div>
      <div>
        <Stepper
          steps={WhatsappSteps}
          currentStep={currentStep}
          stepNo={stepNo}
        />
      </div>
      <div className="mt-auto">
        <Button
          variant="outline"
          className="flex text-gray-800 items-center text-lg font-medium"
        >
          See how it works <FontAwesomeIcon icon={faChevronRight} />
        </Button>
      </div>
    </div>
  );
};

export default LeftSectionWhatsapp;
