export interface Company {
  id: string;
  fteid: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  mailingAddress?: string;
  contactUserFteid?: string;
  adminDeskFteid?: string;
  isActive: boolean;
  isDeleted: boolean;
  advancePercentageSupplier?: number;
  premiumFrom?: string;
  supplierPoc?: string;
  pincode?: string;
  bankDetailsFteid?: string;
  crmType: string[];
  tdsAccepted?: boolean;
  fleetOwnerEngagementTermsAccepted?: boolean;
  kycDocuments?: KycDocument[];
  supplierScoreCard?: ScoreCard;
  supplierScore?: number;
  transporterScoreCard?: ScoreCard;
  transporterScore?: number;
  createdAt: string;
  updatedAt: string;
  updatedByFteid?: string;
}

export interface KycDocument {
  kycId?: string;
  docType?: string;
  docId?: string;
  verifiedAt?: string;
}

export type ScoreCard = 'PLATINUM' | 'GOLD' | 'SILVER' | 'RED' | 'BLACK' | 'NEW';

export type CrmType = 'TRANSPORTER' | 'SUPPLIER' | 'SHIPPER';

export interface CompanySearchCriteria {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  crmTypes?: string[];
  supplierScoreCard?: ScoreCard;
  supplierScoreMin?: number;
  supplierScoreMax?: number;
  transporterScoreCard?: ScoreCard;
  transporterScoreMin?: number;
  transporterScoreMax?: number;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
}

export interface CompanyPage {
  content: Company[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface BulkUploadResult {
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: string[];
  warnings: string[];
  message: string;
}

export interface CompanyScoreCardUpdate {
  fteid: string;
  supplierScoreCard?: ScoreCard;
  supplierScore?: number;
  transporterScoreCard?: ScoreCard;
  transporterScore?: number;
  updatedByFteid?: string;
}
