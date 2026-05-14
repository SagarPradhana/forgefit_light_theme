import { useState, useCallback } from "react";

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  code?: number;
}

export interface ApiError {
  message: string;
  code?: number;
}

// Generic fetch wrapper with auth
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  // Get access token from auth store
  let accessToken: string | null = null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const parsed = JSON.parse(raw);
      accessToken = parsed?.state?.token || null;
    }
  } catch {}
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Network error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Helper to build query string
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

// API endpoints base
const API_BASE = import.meta.env.VITE_API_URL || "";

export const endpoints = {
  // Public endpoints
  public: {
    config: "/public/app-config",
    FAQs: "/public/faqs",
    testimonials: "/public/testimonials",
    banners: (type: string) => `/public/banners/${type}`,
    locations: "/public/locations",
    plans: "/public/subscription-plans",
    inquiry: "/public/inquiry",
  },
  // Admin endpoints
  admin: {
    users: "/admin/users",
    subscriptions: "/admin/subscriptions",
    payments: "/admin/payments",
    products: "/admin/products",
    attendance: "/admin/attendance",
    plans: "/admin/plans",
    inquiries: "/admin/inquiries",
    settings: "/admin/settings",
  },
  // User endpoints
  user: {
    profile: "/user/profile",
    subscription: "/user/subscription",
    attendance: "/user/attendance",
    payments: "/user/payments",
    products: "/user/products",
  },
};

export { API_BASE };