// User data utilities for accessing stored user information

export interface StoredUserData {
  fteid: string;
  old_user_id: number;
  display_id: string;
  firstname: string;
  lastname: string;
  primary_country_code: number;
  primary_mobile_number: string;
  primary_mobile_number_validated: boolean;
  email_address: string;
  email_address_validated: boolean;
  is_active: boolean;
  desk_fteids: string[];
  company: {
    fteid: string;
    old_company_id: number;
    name: string;
    types: string[];
  };
}

/**
 * Get user phone number from localStorage
 */
export const getUserPhoneNumber = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userPhoneNumber');
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): StoredUserData | null => {
  if (typeof window === 'undefined') return null;
  
  const userDataString = localStorage.getItem('userData');
  if (!userDataString) return null;
  
  try {
    return JSON.parse(userDataString) as StoredUserData;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Clear user data from localStorage
 */
export const clearUserData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('userPhoneNumber');
  localStorage.removeItem('userData');
};

/**
 * Check if user data is available
 */
export const hasUserData = (): boolean => {
  return getUserPhoneNumber() !== null && getUserData() !== null;
};
