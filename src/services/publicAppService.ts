import { api } from "../utils/httputils";
import { API_ENDPOINTS } from "../utils/url";

export interface AppConfig {
  id: number;
  brand_name: string;
  logo_image_path: string;
  theme_name: string;
  description: string;
  timezone: string;
  currency: string;
  language: string;
  country: string;
  email: string;
  phone: string;
  whatsapp: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  tiktok_url: string;
  youtube_url: string;
  website_url: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_date: number;
  updated_date: number;
}

export interface Testimonial {
  id: string;
  name: string;
  note: string;
  content?: string;
  avatar?: string;
  created_date: number;
  updated_date: number;
}

export interface PublicBanner {
  id: string;
  type: string;
  file_path: string;
  created_date: number;
  updated_date: number;
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  address: string;
  gym_open_status: boolean;
  working_hours_from_time: string;
  working_hours_to_time: string;
  country: string;
  email: string;
  phone: string;
  whatsapp: string;
  facebook_url: string;
  instagram_url: string;
  website_url: string;
  created_date: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  actual_price: number;
  price: number;
  duration_in_months: number;
  features?: string[];
  status: boolean;
  is_deleted: boolean;
  created_date: number;
}

export const publicAppService = {
  getAppConfig: async () => {
    return api.get(API_ENDPOINTS.PUBLIC.PUBLIC_APP_CONFIG, {}, { showToast: false });
  },

  getFAQs: async (params?: any) => {
    return api.get(API_ENDPOINTS.PUBLIC.FAQ, params, { showToast: false });
  },

  getTestimonials: async (params?: any) => {
    return api.get(API_ENDPOINTS.PUBLIC.TESTIMONIALS, params, { showToast: false });
  },

  getBanners: async (type: string) => {
    return api.get(API_ENDPOINTS.PUBLIC.BANNERS_DETAILS(type), {}, { showToast: false });
  },

  getLocations: async (params?: any) => {
    return api.get(API_ENDPOINTS.ADMIN.LOCATION, params, { showToast: false });
  },

  getSubscriptionPlans: async (params?: any) => {
    return api.get(API_ENDPOINTS.ADMIN.PLANS, params, { showToast: false });
  }
};
