import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { mainMenu } from "@/constants/main-menu";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

type MainMenuProp = {
  handleClose: () => void;
};

const MainMenu = ({ handleClose }: MainMenuProp) => {
  const navigate = useNavigate();
  const handleMenuItemClick = (route: string) => {
    navigate(route);
  };
  return (
    <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-6 z-50">
      {/* User Info */}
      <div className="flex justify-between">
        <img src="/freight-tiger.svg" alt="freight-tiger" width={"150px"} />
        <Button variant="ghost" onClick={handleClose}>
          <FontAwesomeIcon icon={faXmark} />
        </Button>
      </div>
      {/* <div className="relative my-6 w-full">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <Input
          type="text"
          placeholder="Search"
          className="pl-10 pr-4 py-2 w-full border rounded-lg active:outline-none focus:outline-none"
        />
      </div> */}
      <Separator className="my-4" />

      {/* Menu Items */}
      <div className="py-1 text-md font-semibold">
        {mainMenu.map(({ menuItem, logo, route }) => (
          <button
            onClick={() => handleMenuItemClick(route)}
            className="flex items-center w-full px-4 py-4 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <img src={logo} />
            <p className="pl-4">{menuItem}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MainMenu;
