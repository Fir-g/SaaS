import { Button } from "@/components/ui/button";

const NewDemandAggregator = () => {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center py-12 gap-4">
      <img src="/empty-DemandAggregator.svg" alt="no data" />
      <h3 className="text-xl font-semibold">No demands published yet</h3>
      <p className="text-gray-600">
        Demands will be show up here as soon as they come in. Please setup more
        integrations to get demands from other tools
      </p>
      <Button variant="outline" className="w-fit">
        Setup another Integration
      </Button>
    </div>
  );
};

export default NewDemandAggregator;
