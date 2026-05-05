import { NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export interface ApiPageProps {
  params: Record<string, string>;
  searchParams: Record<string, string | string[]>;
}

// Route Parameters
export interface RouteParams {
  patientId: string;
  patientSlug: string;
}

// API Route Handlers
export const API_ROUTES = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/profile',
    settings: '/settings',
  },

  // Patient Management
  patients: {
    list: '/patients',
    detail: (id: string) => `/patients/${id}`,
    medicalRecords: (id: string) => `/patients/${id}/medical-records`,
    billing: (id: string) => `/patients/${id}/billing`,
    notifications: (id: string) => `/patients/${id}/notifications`,
  },

  // Family Portal
  family: {
    overview: '/family/overview',
    portal: '/family/portal',
    memberDetail: (memberId: string) => `/family/members/${memberId}`,
  },

  // Admin Dashboard
  admin: {
    dashboard: '/admin/dashboard',
    patients: '/admin/patients',
    staff: '/admin/staff',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
  },
};

// API Service Layer
export class APIService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  // Request Headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : 'Bearer',
    };

    return headers;
  }

  // API Methods
  async get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${path}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString(), {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as T;
      return {
        success: true,
        data,
        message: 'Data retrieved successfully',
      };
    } catch (error) {
      console.error('API GET Error:', error);
      return {
        success: false,
        data: null as T,
        message: 'Failed to retrieve data',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async post<T>(path: string, data: T): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as T;
      return {
        success: true,
        data: result,
        message: 'Data created successfully',
      };
    } catch (error) {
      console.error('API POST Error:', error);
      return {
        success: false,
        data: null as T,
        message: 'Failed to create data',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async put<T>(path: string, data: T): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as T;
      return {
        success: true,
        data: result,
        message: 'Data updated successfully',
      };
    } catch (error) {
      console.error('API PUT Error:', error);
      return {
        success: false,
        data: null as T,
        message: 'Failed to update data',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as T;
      return {
        success: true,
        data: result,
        message: 'Data deleted successfully',
      };
    } catch (error) {
      console.error('API DELETE Error:', error);
      return {
        success: false,
        data: null as T,
        message: 'Failed to delete data',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Type Definitions
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean;
}

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

export interface SortConfig {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface SortConfig {
  sortBy: keyof unknown;
  sortOrder: 'ASC' | 'DESC';
}

// Utility Functions
export function formatDate(date: Date | string, format: string = 'full'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (format === 'short') {
    options.year = 'numeric';
    options.month = 'numeric';
    options.day = 'numeric';
  }

  return d.toLocaleDateString('en-US', options);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function generatePaginationNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  const numbers: number[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  for (let i = Math.max(1, currentPage - halfVisible); i <= Math.min(totalPages, currentPage + halfVisible); i++) {
    numbers.push(i);
  }

  return numbers;
}

// Middleware Support
export async function getServerSideProps(
  context: {
    params: Record<string, string>;
    query: Record<string, string>;
    req: NextApiRequest;
    res: NextApiResponse;
  },
): Promise<Props> {
  const { params, query, req, res } = context;

  // Fetch initial props data
  const props = await APIService.getInitialProps(
    req,
    res,
    params,
    query,
  );

  return { props };
}