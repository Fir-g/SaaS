import { CardInfo } from "@/types/card-info";

type OptionCardProps = {
  options: CardInfo[];
  selectedOption?: string;
  onSelect: (value: string) => void;
};

const OptionCard = ({ options, selectedOption, onSelect }: OptionCardProps) => {
  return (
    <div className="space-y-4">
      {options.map(({ title, details, logo, alt }) => (
        <button
          key={title}
          onClick={() => onSelect(title)}
          className={`${
            selectedOption === title
              ? "border-blue-500 bg-blue-50 hover:bg-blue-100 "
              : "hover:border-primary "
          }space-y-2 w-full p-4 border rounded-lg transition-colors text-left items-start`}
        >
          <div className="flex gap-4 items-center">
            <img src={logo} alt={alt} />
            <div className="font-medium mb-1">{title}</div>
            {/* <p className="bg-blue-200 text-blue-700 rounded-md px-2 py-1 text-xs font-semibold ml-auto">
              1 Connection active
            </p> */}
          </div>
          <p className="text-sm text-muted-foreground">{details}</p>
        </button>
      ))}
    </div>
  );
};

export default OptionCard;
