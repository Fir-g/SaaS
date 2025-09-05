import { Button } from "@/components/ui/button";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ContactListPropType = {
  contacts: string[];
  handleRemoveNumber: (number: string) => void;
};

const ContactList = ({ contacts, handleRemoveNumber }: ContactListPropType) => {
  const formatPhoneNumber = (input: string): string => {
    const match = input.match(/^(\+\d{1,2})(\d{4,})$/);
    if (!match) return input;
    const [, countryCode, number] = match;
    return `${countryCode}-${number}`;
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No contacts to display</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile View - Card Layout */}
      <div className="block sm:hidden space-y-3">
        {contacts.map((number: string, index: number) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Phone Number
                </div>
                <div className="text-sm text-gray-600">
                  {formatPhoneNumber(number)}
                </div>
              </div>
              <Button
                onClick={() => handleRemoveNumber(number)}
                className="ml-3 p-2 text-gray-400 hover:text-red-500"
                aria-label="delete-contact"
                title="Delete"
                variant="ghost"
                size="sm"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden sm:block">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th scope="col" className="px-4 py-3 w-1/2">
                Phone Number
              </th>
              <th scope="col" className="px-4 py-3 text-right w-1/2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((number: string, index: number) => (
              <tr
                key={index}
                className="bg-white border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {formatPhoneNumber(number)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    onClick={() => handleRemoveNumber(number)}
                    className="text-gray-400 hover:text-red-500 p-2"
                    aria-label="delete-contact"
                    title="Delete"
                    variant="ghost"
                    size="sm"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contacts.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Showing {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactList;