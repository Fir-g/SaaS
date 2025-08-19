import { Button } from "@/components/ui/button";
import NextButton from "@/components/ui/next-button";
import OptionCard from "@/components/ui/option-card";
import { Separator } from "@/components/ui/separator";
import { channels, CRMS } from "@/constants/channels-crms";
import {
  faCircleCheck,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const DemandSupply = () => {
  const [active, setActive] = useState<String>("Demand");
  const [channel, setChannel] = useState<string>("");
  const [crm, setCRM] = useState<string>("");

  const handleChannelSelect = (value: string) => {
    setChannel(value);
    console.log(channel)
  };

  const handleCRMSelect = (value: string) => {
    setCRM(value);
    console.log(crm)
  };
  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-10">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="bg-gray-100 w-fit flex py-1 px-1 rounded-md ">
            <Button
              variant="outline"
              onClick={() => {
                setActive("Demand");
              }}
              className={`${
                active === "Demand"
                  ? "bg-white shadow-md hover:bg-white"
                  : "hover:bg-gray-100"
              } border-0 `}
            >
              Demand Integration
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setActive("Supply");
              }}
              className={`${
                active === "Supply"
                  ? "bg-white shadow-md hover:bg-white"
                  : "hover:bg-gray-100"
              } border-0 `}
            >
              Supply Intergation
            </Button>
          </div>
          <div className="flex gap-2">
            <p className="text-gray-800 text-2xl font-semibold">
              Source Integration
            </p>
            <Button
              variant="ghost"
              className="no-underline bg-green-200 rounded-md h-fit text-xs text-green-700"
            >
              <FontAwesomeIcon icon={faCircleCheck} />
              Done
            </Button>
          </div>
          <p className="text-gray-500 text-muted-foreground text-md">
            Select tool with which you want to start the integration
          </p>
          <OptionCard options={channels} onSelect={handleChannelSelect} />
          <Separator />
          <div className="flex gap-2">
            <p className="text-gray-800 text-2xl font-semibold">
              Publish Integration
            </p>
            <Button
              variant="ghost"
              className="no-underline bg-orange-200 rounded-md h-fit text-xs text-orange-700"
            >
              <FontAwesomeIcon icon={faExclamationCircle} />
              Action Required
            </Button>
          </div>
          <p className="text-gray-500 text-muted-foreground text-md">
            Select tool with which you want to start the integration
          </p>
          <OptionCard options={CRMS} onSelect={handleCRMSelect} />
        </div>
      </div>
      <NextButton text="Next" nextPageUrl="/dashboard" />
    </div>
  );
};

export default DemandSupply;
