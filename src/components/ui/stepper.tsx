import { StepType } from "@/constants/steps";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  useNavigate } from "react-router-dom";

type StepperPropType = {
  steps: StepType[];
  currentStep: string;
  stepNo: number;
};

const Stepper = ({ steps, currentStep, stepNo }: StepperPropType) => {
  const navigate = useNavigate();

  const handleClick = (isCompleted:boolean, url:string) => {
    isCompleted && navigate(url);
  };
  return (
    <div>
      <ol className="relative border-l-2 border-gray-300 dark:border-gray-700 ">
        {steps.map(({ stepName, stepNo: thisStepNo, url }) => {
          const isCompleted = thisStepNo < stepNo;
          const isCurrent = stepName === currentStep;

          return (
            <li
              key={stepName}
              className={`${
                isCurrent ? "text-gray-700" : "text-gray-400 "
              } mb-10 ms-6 `}
            >
              <span
                className={`absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ring-4  ring-blue-400 dark:ring-gray-900 bg-gray-50`}
              >
                {isCompleted ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : isCurrent ? (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500"></span>
                ) : null}
              </span>

              <button
                onClick={() => handleClick(isCompleted, url)}
                className="font-medium leading-tight"
              >
                {stepName}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Stepper;
