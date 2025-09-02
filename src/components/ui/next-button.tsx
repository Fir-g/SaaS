import { Link } from "react-router-dom";
import { Button } from "./button";
import { useState } from "react";
import Loader from "./loader";

type NextButtonPropsType = {
  nextPageUrl: string;
  text: string;
  handleClick?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

const NextButton = ({
  handleClick,
  nextPageUrl,
  text,
  disabled = false,
  loading = false,
}: NextButtonPropsType) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (isLoading || disabled || loading) return;
    
    if (handleClick) {
      try {
        setIsLoading(true);
        await handleClick(); // ✅ Call the passed handleClick function
      } catch (error) {
        console.error("Error in handleClick:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isButtonLoading = isLoading || loading;

  return (
    <div className="flex mt-auto justify-end border-t-2 pt-6">
      <Link to={nextPageUrl}>
        <Button
          className="px-12 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || isButtonLoading}
          onClick={onClick}
        >
          {isButtonLoading ? <Loader /> : text}
        </Button>
      </Link>
    </div>
  );
};

export default NextButton;