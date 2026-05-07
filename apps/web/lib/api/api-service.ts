import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

interface ApiResult<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

// API Response Helper
export class ApiResponse {
  static success<T>(data: T, message?: string, statusCode: number = 200): ApiResult<T> {
    return {
      success: true,
      data,
      message,
      error: undefined,
    };
  }

  static error<T>(message: string, code?: string, details?: Record<string, unknown> | ApiError, statusCode: number = 500): ApiResult<T> {
    return {
      success: false,
      data: null as T,
      message,
      error: {
        code: code || 'API_ERROR',
        message,
        details: details as Record<string, unknown> | undefined,
      },
    };
  }

  static async handleRequest<T>(
    handler: () => Promise<T>,
    successMessage: string,
  ): Promise<ApiResult<T>> {
    try {
      const data = await handler();
      return ApiResponse.success(data, successMessage);
    } catch (error: any) {
      console.error(`API Error: ${error}`, error);
      return ApiResponse.error('An error occurred during processing', 'REQUEST_FAILED', { error: error.message });
    }
  }

  static async handlePageRequest<T>(
    items: T[],
    totalCount: number,
    page: number,
    limit: number,
  ): Promise<ApiResult<PageResult<T>>> {
    return ApiResponse.success({
      items,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasPrevious: page > 1,
        hasNext: page < Math.ceil(totalCount / limit),
      },
    }, 'Data retrieved successfully');
  }
}

// API Client Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
  auth: {
    token: string;
    tokenType: 'Bearer';
    refreshToken: string;
  };
}

// HTTP Client
export class ApiClient {
  private readonly config: ApiConfig;
  private readonly httpClient: AxiosInstance;

  constructor(config: ApiConfig) {
    this.config = config;
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: config.headers,
    });

    this.setupInterceptors();
  }

  // Request Interceptors
  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = this.getAuthToken();
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }

        // Add request metadata
        config.headers.set('X-Request-ID', this.generateRequestId());
        config.headers.set('X-Timestamp', Date.now().toString());

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Response interceptor error:', error);
        return this.handleResponseError(error);
      }
    );
  }

  // Authentication
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async handleResponseError(error: AxiosError): Promise<any> {
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data as ApiError;

      switch (statusCode) {
        case 401:
          return ApiResponse.error('Authentication required', 'UNAUTHORIZED', { tokenExpiry: error.message });
        case 403:
          return ApiResponse.error('Access denied', 'FORBIDDEN', errorData);
        case 404:
          return ApiResponse.error('Resource not found', 'NOT_FOUND', errorData);
        case 500:
          return ApiResponse.error('Internal server error', 'SERVER_ERROR', errorData);
        default:
          return ApiResponse.error('An unexpected error occurred', 'UNKNOWN_ERROR', errorData);
      }
    }

    return ApiResponse.error('Network error occurred', 'NETWORK_ERROR', { message: error.message });
  }

  // API Methods
  async get<T>(path: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
    return ApiResponse.handleRequest(async () => {
      const response = await this.httpClient.get<T>(path, { params });
      return response.data;
    }, 'Data retrieved successfully');
  }

  async post<T>(path: string, data: T): Promise<ApiResult<T>> {
    return ApiResponse.handleRequest(async () => {
      const response = await this.httpClient.post<T>(path, data);
      return response.data;
    }, 'Data created successfully');
  }

  async put<T>(path: string, data: T): Promise<ApiResult<T>> {
    return ApiResponse.handleRequest(async () => {
      const response = await this.httpClient.put<T>(path, data);
      return response.data;
    }, 'Data updated successfully');
  }

  async delete<T>(path: string): Promise<ApiResult<T>> {
    return ApiResponse.handleRequest(async () => {
      const response = await this.httpClient.delete<T>(path);
      return response.data;
    }, 'Resource deleted successfully');
  }

  async patch<T>(path: string, data: Partial<T>): Promise<ApiResult<T>> {
    return ApiResponse.handleRequest(async () => {
      const response = await this.httpClient.patch<T>(path, data);
      return response.data;
    }, 'Resource patched successfully');
  }
}

// Error Boundaries
export class ServiceError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ServiceError';
  }

  static fromError(error: Error, statusCode: number = 500): ServiceError {
    return new ServiceError(
      error.message || 'An unexpected error occurred',
      statusCode,
      'UNEXPECTED_ERROR',
      { stack: error.stack },
    );
  }
}

// Types and Interfaces
export interface SortConfig {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PageResult<T> {
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

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: ServiceError;
  metadata?: ServiceMetadata;
}

export interface ServiceMetadata {
  requestId: string;
  timestamp: Date;
  processingTime: number;
  cacheHit: boolean;
  version: string;
}
