import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";

type MembersModalPropType = {
  handleViewModal: () => void;
  children: ReactNode;
};

const MembersModal = ({ handleViewModal, children }: MembersModalPropType) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh]  flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            All Excluded Contacts
          </h2>
          <button
            onClick={handleViewModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <div >{children}</div>
      </div>
    </div>
  );
};

export default MembersModal;
