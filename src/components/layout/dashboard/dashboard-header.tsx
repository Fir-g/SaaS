import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBell,
  faChevronDown,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/constants/user-menu";
import { useNavigate } from "react-router-dom";
import UserDropdown from "./user-dropdown";
import MainMenu from "./main-menu";

const DashboardHeader = ({
  //   logoSrc,
  //   logoText = "Your Logo",
  //   userName = "John Doe",
  //   userEmail = "john@example.com",
  //   profileImageSrc,
  //   onSettingsClick,
  //   onProfileClick,
  //   onLogoutClick,
  notificationCount = 0,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  //   Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node | null)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemClick = (route: string) => {
    setIsDropdownOpen(false);
    navigate(route);
  };

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gray-100 shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              onClick={handleToggleMenu}
              variant="ghost"
              className="p-2 mr-4 bg-white border-transparent rounded-full"
            >
              <img src="/menu.svg" alt="grid" />
            </Button>
            {isMenuOpen && <MainMenu handleClose={handleClose} />}
          </div>
          <img src="/freight-tiger.svg" alt="freight-tiger" />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <FontAwesomeIcon icon={faBell} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-300">
                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <FontAwesomeIcon
                    size={"sm"}
                    icon={faUser}
                    className="text-white"
                  />
                </div>
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                size={"sm"}
                className={`text-gray-600 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-sm text-gray-500">admin@mail.com</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {UserMenu.map(({ menuItem, logo, route }) => (
                    <button
                      onClick={() => handleMenuItemClick(route)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FontAwesomeIcon icon={logo} className="mx-3" />
                      {menuItem}
                    </button>
                  ))}

                  <button
                    // onClick={() => handleMenuItemClick(onLogoutClick)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 my-1"
                  >
                    <FontAwesomeIcon
                      size={"sm"}
                      icon={faArrowRightFromBracket}
                      className="mx-3"
                    />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
