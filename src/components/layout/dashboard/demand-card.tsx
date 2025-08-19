const DemandCard = () => {
  return (
    <div className="border rounded-md p-4 my-4 flex-1">
      <p className="text-sm bg-green-200 text-green-800 px-2 rounded-md w-fit">
        Published
      </p>
      <h2 className="text-lg font-semibold py-2">Amit Logistics</h2>
      <p className="py-2">Mumbai - Delhi</p>
      <div className="flex flex-row justify-between">
        <p>Electronics</p>
        <p>24 tons</p>
      </div>
      <div className="flex flex-row justify-between my-2">
        <button className="border rounded-md px-4 ">View in CRM</button>
        <img src="/whatsapp.svg" alt="whatsapp" className="h-8 w-8" />
      </div>
    </div>
  );
};

export default DemandCard;
