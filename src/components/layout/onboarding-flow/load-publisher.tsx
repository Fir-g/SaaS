import { useState } from "react";
import OptionCard from "../../ui/option-card";
import { Button } from "../../ui/button";
import { useNavigate } from "react-router-dom";
import { channels } from "@/constants/channels-crms";

const LoadPublisher = () => {
  const [channel, setChannel] = useState<string>("");
  const navigate = useNavigate();

  const handleChannelSelect = (value: string) => {
    setChannel(value);
  };

  const handleNext = () => {
    channel.toLowerCase() === "whatsapp"
      ? navigate("/whatsapp")
      : navigate("/email");
  };

  return (
    <div className="flex flex-col w-full h-screen py-6 px-12 pt-20">
      <div className="space-y-12">
        <div className="space-y-4">
          <div className="text-gray-800 text-3xl font-semibold">
            Connect channels
          </div>
          <p className="text-gray-500 text-muted-foreground text-xl">
            Connect your channels in a few clicks. We will pull your demands and
            supply from the sources and publish them in the destination you
            define.
          </p>
        </div>
        <OptionCard
          options={channels}
          selectedOption={channel}
          onSelect={handleChannelSelect}
        />
      </div>
      <div
        title={channel === "" ? "Select an option to proceed" : ""}
        className="mt-auto flex justify-end border-t-2 pt-6"
      >
        <Button
          onClick={handleNext}
          disabled={channel === ""}
          aria-disabled={channel === ""}
          className="px-12 bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default LoadPublisher;
