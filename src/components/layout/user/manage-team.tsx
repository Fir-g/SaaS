import { Input } from "@/components/ui/input";
import DashboardHeader from "../dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { TeamMemberRoles } from "@/constants/team-member-roles";
import { useEffect, useState } from "react";
import { TeamMember, TeamMemberApi } from "@/services/userService";

const ManageTeam = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response: any = await TeamMemberApi.getMembers();
        setTeamMembers(response);
      } catch (error) {
        throw new Error("Error fetching team member data");
      }
    };
    fetchMembers();
  }, []);

  const handleDeleteMember = (email: string) => {
    setTeamMembers(teamMembers.filter((member) => member.email !== email));
  };

  return (
    <div>
      <DashboardHeader />
      <div className="flex flex-col w-full h-screen py-6 px-12">
        <div>
          <h1 className="text-2xl font-semibold py-2 text-gray-700">Team</h1>
          <p className="text-gray-500 mb-4">
            Manage who has access to this workspace{" "}
          </p>
        </div>
        <div className=" border-t-2 border-b-2 border-gray-100 py-4">
          <div className="bg-gray-100 flex p-2 gap-4 items-center justify-start">
            <p className="font-semibold text-md">Add a new member</p>
            <div className="w-1/4 relative">
              <Input
                className=""
                type="text"
                placeholder="Entre invitee email address"
              />
              <select className="absolute top-2 right-1 cursor-pointer">
                {TeamMemberRoles.map((role) => (
                  <option>{role}</option>
                ))}
              </select>
            </div>
            <Button>Send Invite</Button>
          </div>
        </div>
        <div className="my-8 w-full h-1/2 overflow-auto">
          <table className="w-full max-h-96 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border ">
            <thead className="sticky offset-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Access Level
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map(({ id, name, email, accessLevel }) => {
                return (
                  <tr
                    key={id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200  dark:hover:bg-gray-600"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {name}
                    </th>
                    <td className="px-6 py-4 ">
                      <span className="text-xs bg-blue-200 px-2 py-1 rounded-md text-blue-800">
                        {email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select className="cursor-pointer p-2">
                        <option>{accessLevel}</option>
                        {TeamMemberRoles.filter(
                          (role) => role !== accessLevel
                        ).map((role) => (
                          <option>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 ">
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteMember(email)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageTeam;
