import { Link } from "react-router-dom";
import { Button } from "./button";
import { useState } from "react";
import Loader from "./loader";

type NextButtonPropsType = {
  nextPageUrl: string;
  text: string;
  handleClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const NextButton = ({
  handleClick,
  nextPageUrl,
  text,
  disabled = false,
}: NextButtonPropsType) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (isLoading || disabled) return;
    try {
      setIsLoading(true);
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex mt-auto justify-end border-t-2 pt-6">
      <Link to={nextPageUrl}>
        <Button
          asChild
          className="px-12 bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || isLoading}
          onClick={handleClick}
        >
          {isLoading ? <Loader /> : text}
        </Button>
      </Link>
    </div>
  );
};

export default NextButton;
