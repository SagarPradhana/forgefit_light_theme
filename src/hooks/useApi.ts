import { useRef, useEffect } from "react";
import { useQuery, useMutation as useRQMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { fetchApi, buildQueryString, API_BASE } from "../utils/api";

// Re-export React Query hooks for compatibility
export { useQuery, useQueryClient };
export { QueryClient };
export type { UseQueryOptions, UseMutationOptions };

// Legacy compatibility - support the old useMutation("post", { onSuccess }) pattern
// Usage: useMutation("post", { onSuccess }) then mutate(endpoint, data)
type LegacyMutationOptions<TData, TResponse> = Omit<UseMutationOptions<TResponse, Error, TData, unknown>, "mutationFn">;

interface LegacyOptions<TResponse> {
  onSuccess?: (data: TResponse) => void;
  onError?: (error: Error) => void;
}

export function useMutation<TData = any, TResponse = any>(
  method: "get" | "post" | "put" | "patch" | "delete",
  options?: LegacyOptions<TResponse>
) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options || {};
  
  const mutation = useRQMutation<[string, TData], Error, TResponse>({
    mutationFn: async ([endpoint, data]: [string, TData]) => {
      const url = `${API_BASE}${endpoint}`;
      
      const response = await fetchApi<TResponse>(url, {
        method: method.toUpperCase(),
        body: method !== "get" && data ? JSON.stringify(data) : undefined,
      });
      
      return response;
    },
    onSuccess: (data, [_, variables], context) => {
      onSuccess?.(data);
    },
    onError: (error, [_, variables], context) => {
      onError?.(error);
    },
    ...restOptions,
  });

  // Wrap mutate to accept (endpoint, data) format
  const wrappedMutate = (endpoint: string, data: TData) => {
    mutation.mutate([endpoint, data]);
  };

  return {
    ...mutation,
    mutate: wrappedMutate as any,
    mutateAsync: mutation.mutateAsync,
    loading: mutation.isPending,
  };
}

// Legacy alias - supports useGet(endpoint), useGet(endpoint, { onSuccess, ... }), useGet(key, endpoint)
// Also handles null/undefined keys (skip queries)
export function useGet<T = any>(
  keyOrEndpoint: string | string[] | null | undefined,
  endpointOrOptions?: string | Record<string, any> | null,
  paramsOrOptions?: Record<string, any> | null,
  options?: UseQueryOptions<T, Error, T, string[]>
) {
  if (keyOrEndpoint == null) {
    return { data: undefined, loading: false, error: null, refetch: () => {} } as any;
  }

  let endpoint: string;
  let params: Record<string, any> | undefined;
  let onSuccessCallback: ((data: T) => void) | undefined;

  if (typeof keyOrEndpoint === "string") {
    endpoint = keyOrEndpoint;
    if (typeof endpointOrOptions === "object" && endpointOrOptions != null) {
      const opts = endpointOrOptions as any;
      onSuccessCallback = opts.onSuccess;
      params = { ...opts };
      delete params.onSuccess;
      delete params.useCache;
      if (Object.keys(params).length === 0) params = undefined;
    }
  } else {
    endpoint = endpointOrOptions as string;
    params = paramsOrOptions ?? undefined;
  }

  // Don't add query params if endpoint already has them
  const hasQueryParams = endpoint.includes("?");
  const finalParams = hasQueryParams ? undefined : params;

  const result = useGetQuery<T>(["legacy", endpoint, JSON.stringify(params || {})], endpoint, finalParams, options);

  // Handle onSuccess callback pattern (React Query v5 dropped onSuccess from options)
  const { data } = result;
  const prevDataRef = useRef(data);
  useEffect(() => {
    if (onSuccessCallback && data && data !== prevDataRef.current) {
      onSuccessCallback(data);
    }
    prevDataRef.current = data;
  }, [data, onSuccessCallback]);

  return { ...result, loading: result.isLoading };
}

export const usePost = usePostMutation;
export const usePut = useUpdateMutation;
export const useDelete = useDeleteMutation;

// API fetch function with base URL
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  return fetchApi<T>(url, options);
}

// ==================== useQuery Hooks ====================

/**
 * Generic GET request hook with React Query
 */
export function useGetQuery<T>(
  key: string[],
  endpoint: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<T, Error, T, string[]>, "queryKey" | "queryFn">
) {
  const queryString = params ? `?${buildQueryString(params)}` : "";
  
  return useQuery<T, Error>({
    queryKey: [...key, params],
    queryFn: () => apiClient<T>(`${endpoint}${queryString}`),
    ...options,
  });
}

/**
 * GET single item by ID
 */
export function useGetById<T>(
  key: string[],
  endpoint: string,
  id: string | number,
  options?: Omit<UseQueryOptions<T, Error, T, string[]>, "queryKey" | "queryFn">
) {
  return useGetQuery<T>(key, `${endpoint}/${id}`, undefined, {
    enabled: !!id,
    ...options,
  });
}

/**
 * GET list with pagination
 */
export function useGetList<T>(
  key: string[],
  endpoint: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  },
  options?: Omit<UseQueryOptions<T, Error, T, string[]>, "queryKey" | "queryFn">
) {
  return useGetQuery<T>(key, endpoint, params, options);
}

// ==================== useMutation Hooks ====================

/**
 * Generic POST request
 */
export function usePostMutation<TData, TResponse>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TResponse, Error, TData, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();
  
  return useMutation<TResponse, Error, TData>({
    mutationFn: (data) => apiClient<TResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: () => true });
    },
    ...options,
  });
}

/**
 * Generic PUT/PATCH request
 */
export function useUpdateMutation<TData, TResponse>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TResponse, Error, TData, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();
  
  return useMutation<TResponse, Error, TData>({
    mutationFn: (data) => apiClient<TResponse>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: () => true });
    },
    ...options,
  });
}

/**
 * Generic DELETE request
 */
export function useDeleteMutation<TResponse>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TResponse, Error, string | number, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();
  
  return useMutation<TResponse, Error, string | number>({
    mutationFn: (id) => apiClient<TResponse>(`${endpoint}/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: () => true });
    },
    ...options,
  });
}

/**
 * POST with file upload (FormData)
 */
export function useUploadMutation<TResponse>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TResponse, Error, FormData, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();
  
  return useMutation<TResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: () => true });
    },
    ...options,
  });
}

// ==================== Specialized Hooks ====================

/**
 * Fetch app config
 */
export function useAppConfig() {
  return useGetQuery(["appConfig"], "/public/app-config");
}

/**
 * Fetch public data (config, FAQs, testimonials, banners)
 */
export function usePublicData(configOnly = false) {
  return useGetQuery(["publicData", configOnly], `/public/data?configOnly=${configOnly}`);
}

/**
 * Fetch subscription plans
 */
export function useSubscriptionPlans() {
  return useGetQuery(["plans"], "/public/subscription-plans");
}

/**
 * Fetch testimonials
 */
export function useTestimonials() {
  return useGetQuery(["testimonials"], "/public/testimonials");
}

/**
 * Fetch FAQs
 */
export function useFAQs() {
  return useGetQuery(["faqs"], "/public/faqs");
}

/**
 * Fetch banners by type
 */
export function useBanners(type: string) {
  return useGetQuery(["banners", type], `/public/banners/${type}`);
}