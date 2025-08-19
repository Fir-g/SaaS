import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OptionCard from "../../ui/option-card";
import { UserTypes } from "@/constants/userTypes";

export default function LoadSync() {
  //states
  const [publisherType, setPublisherType] = useState<string>("");
  const navigate = useNavigate();

  const handlePublisherType = (value: string) => {
    setPublisherType(value);
  };
  const handleNext = () => {
    publisherType.toLowerCase() === "Load Publisher".toLowerCase()
      ? navigate("/load-publisher")
      : navigate("/inventory-publisher");
  };

  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-20">
      <div className="space-y-12">
        <div className="space-y-4">
          <div className="text-gray-800 text-3xl font-semibold">
            How do you want to use Load sync
          </div>
          <p className="text-gray-500 text-muted-foreground text-xl">
            Select one option below
          </p>
        </div>
        {/* Option Cards */}
        <OptionCard
          options={UserTypes}
          onSelect={handlePublisherType}
          selectedOption={publisherType}
        />
      </div>

      <div
        title={publisherType === "" ? "Select an option to proceed" : ""}
        className="mt-auto flex justify-end border-t-2 pt-6"
      >
        <Button
          onClick={handleNext}
          disabled={publisherType === ""}
          aria-disabled={publisherType === ""}
          className="px-12 bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
