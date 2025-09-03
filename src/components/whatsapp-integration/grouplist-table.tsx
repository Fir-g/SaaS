// import { FixedSizeList as List } from "react-window";

import Loader from "@/components/ui/loader";
import Toggle from "@/components/ui/toggle2";
import { CombinedGroupType, WhitelistedGroupType } from "@/types/groups";

interface GrouplistTable {
  combinedGroup: CombinedGroupType[];
  whitelistedGroups: WhitelistedGroupType[];
  handleToggle: (group_id: string, checked: boolean) => void;
  error: string;
  loading: boolean;
}

const GrouplistTable = ({
  combinedGroup,
  handleToggle,
  error,
  loading,
}: GrouplistTable) => {
  if (error) {
    return (
      <div className="w-full h-full text-red-500 flex justify-center items-center pt-10">
        <tr>error loading whitelisted groups. please try again later</tr>
      </div>
    );
  }

  return loading ? (
    <div className="h-full w-full flex justify-center items-center">
      <Loader />
    </div>
  ) : (
    <table className="w-full  text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead className="sticky offset-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Conversations
          </th>
          <th scope="col" className="px-6 py-3"></th>
          <th scope="col" className="px-6 py-3">
            #Participants
          </th>
          <th scope="col" className="px-6 py-3">
            Use for Integration
          </th>
        </tr>
      </thead>

      <tbody>
        {combinedGroup.map(
          ({
            id,
            whitelisted_name,
            whitelisted_type,
            participantsCount,
            checked,
          }: CombinedGroupType) => {
            return (
              <tr
                key={id}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200  dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {whitelisted_name}
                </th>
                <td className="px-6 py-4 ">
                  <span className="text-xs bg-blue-200 px-2 py-1 rounded-md text-blue-800">
                    {whitelisted_type}
                  </span>
                </td>
                <td className="px-6 py-4">{participantsCount}</td>
                <td className="px-6 py-4 ">
                  <Toggle
                    group_id={id}
                    handleToggle={handleToggle}
                    checked={checked}
                  />
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
};

export default GrouplistTable;
