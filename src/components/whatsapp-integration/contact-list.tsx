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
  return (
    <div className="w-full">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="sticky top-0 text-xs text-gray-700  bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Phone Number
            </th>
            <th scope="col" className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((number: string, index: number) => (
            <tr
              key={index}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
            >
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                -
              </th>
              <td className="px-6 py-4 font-semibold">
                {formatPhoneNumber(number)}
              </td>

              <td className="px-6 py-4 text-right">
                <Button
                  onClick={() => handleRemoveNumber(number)}
                  className="hover:text-red-500 active:text-gray-300"
                  aria-label="delete-contact"
                  title="Delete"
                  variant="ghost"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactList;
