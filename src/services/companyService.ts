import { Company, CompanySearchCriteria, CompanyPage, BulkUploadResult } from '@/types/company';
import { ApiService } from './api';

// Extend the existing ApiService to inherit authentication patterns
class CompanyService extends ApiService {
  private async fetchWithAuth(url: string, options: RequestInit = {}, token?: string | null) {
    try {
      const headers: Record<string, string> = {};

      // Add existing headers if they exist
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      }

      // Add Authorization header if token provided
      if (token) {
        headers['authorization'] = `Bearer ${token}`;
      }

      // Only set Content-Type for non-FormData requests
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      console.log('CompanyService API request:', url);
      console.log('CompanyService headers:', headers);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('CompanyService response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please check your API configuration.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the API server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  async getCompanies(criteria: CompanySearchCriteria = {}, token?: string | null): Promise<CompanyPage> {
    const params: Record<string, any> = {};
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });

    // Use the inherited get method with proper URL construction
    return this.get<CompanyPage>('/companies', params, token, true);
  }

  async getCompanyById(id: string, token?: string | null): Promise<Company> {
    return this.get<Company>(`/companies/${id}`, undefined, token, true);
  }

  async getCompanyByFteid(fteid: string, token?: string | null): Promise<Company> {
    return this.get<Company>(`/companies/fteid/${fteid}`, undefined, token, true);
  }

  async createCompany(company: Partial<Company>, token?: string | null): Promise<Company> {
    return this.post<Company>('/companies', company, token, true);
  }

  async updateCompany(id: string, company: Partial<Company>, token?: string | null): Promise<Company> {
    return this.put<Company>(`/companies/${id}`, company, token);
  }

  async updateCompanyByFteid(fteid: string, company: Partial<Company>, token?: string | null): Promise<Company> {
    return this.put<Company>(`/companies/fteid/${fteid}`, company, token);
  }

  async deleteCompany(id: string, token?: string | null): Promise<void> {
    await this.delete(`/companies/${id}`, token);
  }

  async softDeleteCompany(id: string, token?: string | null): Promise<void> {
    await this.put(`/companies/${id}/soft-delete`, {}, token);
  }

  async restoreCompany(id: string, token?: string | null): Promise<void> {
    await this.put(`/companies/${id}/restore`, {}, token);
  }

  async searchCompanies(searchTerm: string, page = 0, size = 20, token?: string | null): Promise<CompanyPage> {
    const params = { searchTerm, page, size };
    return this.get<CompanyPage>('/companies/search', params, token, true);
  }

  async getDistinctCrmTypes(token?: string | null): Promise<string[]> {
    return this.get<string[]>('/companies/crm-types', undefined, token, true);
  }

  async getDistinctPincodes(token?: string | null): Promise<string[]> {
    return this.get<string[]>('/companies/pincodes', undefined, token, true);
  }

  async bulkImportCompanies(file: File, updatedByFteid?: string, token?: string | null): Promise<BulkUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (updatedByFteid) {
      formData.append('updatedByFteid', updatedByFteid);
    }

    // For file uploads, we need to use the custom fetchWithAuth method
    const apiUrl = this.getApiUrl('/companies/bulk-import');
    const url = apiUrl.startsWith('http') ? apiUrl : new URL(apiUrl, window.location.origin).toString();
    
    const response = await this.fetchWithAuth(url, {
      method: 'POST',
      body: formData,
    }, token);

    return response.json();
  }

  async bulkUpdateScoreCards(file: File, updatedByFteid?: string, token?: string | null): Promise<BulkUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (updatedByFteid) {
      formData.append('updatedByFteid', updatedByFteid);
    }

    // For file uploads, we need to use the custom fetchWithAuth method
    const apiUrl = this.getApiUrl('/companies/bulk-update-scorecards');
    const url = apiUrl.startsWith('http') ? apiUrl : new URL(apiUrl, window.location.origin).toString();
    
    const response = await this.fetchWithAuth(url, {
      method: 'PUT',
      body: formData,
    }, token);

    return response.json();
  }
}

export const companyService = new CompanyService();
