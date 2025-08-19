import { initialMembers } from "@/constants/team-member-roles";

// Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  accessLevel: "Admin" | "Editor" | "Viewer";
}

// Dummy API functions
export const TeamMemberApi = {
  getMembers: async () => {
    try {
      const teamMembers = new Promise((resolve) => resolve(initialMembers));
      return teamMembers;
    } catch (error) {
      console.log(error);
    }
  },
  addMember: async (member: Omit<TeamMember, "id">): Promise<TeamMember> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate potential error
    if (Math.random() < 0.1) {
      throw new Error("Failed to add member. Please try again.");
    }

    const newMember = {
      ...member,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    return newMember;
  },

  removeMember: async (id: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate potential error
    if (Math.random() < 0.15) {
      throw new Error("Failed to remove member. Please try again.");
    }

    // In real API, this would delete from database
    console.log(`Member ${id} removed successfully`);
  },
};
