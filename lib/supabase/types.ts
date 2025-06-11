// Updated types based on new schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      governorates: {
        Row: {
          id: string
          name: string
          governorate_code: string | null
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string | null
          is_deleted: boolean | null
          deleted_at: string | null
          deleted_by: string | null
          created_at: string | null
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          governorate_code?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          deleted_by?: string | null
          created_at?: string | null
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          governorate_code?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          deleted_by?: string | null
          created_at?: string | null
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
      }
      service_categories: {
        Row: {
          id: string
          name: string
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string | null
          is_deleted: boolean | null
          deleted_at: string | null
          deleted_by: string | null
          created_at: string | null
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          icon: string | null
          slug: string | null
        }
        Insert: {
          id?: string
          name: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          deleted_by?: string | null
          created_at?: string | null
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          icon?: string | null
          slug?: string | null
        }
        Update: {
          id?: string
          name?: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          is_deleted?: boolean | null
          deleted_at?: string | null
          deleted_by?: string | null
          created_at?: string | null
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          icon?: string | null
          slug?: string | null
        }
      }
      service_providers: {
        Row: {
          id: string
          user_id: string | null
          years_of_experience: number | null
          service_name: string | null
          governorate_id: string | null
          service_category_id: string | null
          service_delivery_method: "online" | "offline" | "both" | null
          service_description: string | null
          bio: string | null
          facebook_url: string | null
          instagram_url: string | null
          whatsapp_url: string | null
          other_urls: Json | null
          logo_image: string | null
          id_card_front_image: string | null
          id_card_back_image: string | null
          certificates_images: string | null
          document_list: string | null
          video_url: string | null
          keywords: string | null
          notes: string | null
          status: "pending" | "approved" | "rejected"
          is_deleted: boolean | null
          deleted_at: string | null
          deleted_by: string | null
          created_at: string | null
          created_by: string | null
          updated_at: string | null
          updated_by: string | null
          slug: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          years_of_experience?: number | null
          service_name?: string | null
          governorate_id?: string | null
          service_category_id?: string | null
          service_delivery_method?: "online" | "offline" | "both" | null
          service_description?: string | null
          bio?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          whatsapp_url?: string | null
          other_urls?: Json | null
          logo_image?: string | null
          id_card_front_image?: string | null
          id_card_back_image?: string | null
          certificates_images?: string | null
          document_list?: string | null
          video_url?: string | null
          keywords?: string | null
          notes?: string | null
          status?: "pending" | "approved" | "rejected"
          is_deleted?: boolean | null
          deleted_at?: string | null
          deleted_by?: string | null
          created_at?: string | null
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          slug?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          years_of_experience?: number | null
          service_name?: string | null
          governorate_id?: string | null
          service_category_id?: string | null
          service_delivery_method?: "online" | "offline" | "both" | null
          service_description?: string | null
          bio?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          whatsapp_url?: string | null
          other_urls?: Json | null
          logo_image?: string | null
          id_card_front_image?: string | null
          id_card_back_image?: string | null
          certificates_images?: string | null
          document_list?: string | null
          video_url?: string | null
          keywords?: string | null
          notes?: string | null
          status?: "pending" | "approved" | "rejected"
          is_deleted?: boolean | null
          deleted_at?: string | null
          deleted_by?: string | null
          created_at?: string | null
          created_by?: string | null
          updated_at?: string | null
          updated_by?: string | null
          slug?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar: string | null
          phone: string | null
          created_at: string
          updated_at: string | null
          deleted_at: string | null
          is_deleted: boolean | null
          is_banned: boolean | null
          created_by: string | null
          updated_by: string | null
          deleted_by: string | null
          user_id: string | null
          is_admin: boolean | null
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
          deleted_at?: string | null
          is_deleted?: boolean | null
          is_banned?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          user_id?: string | null
          is_admin?: boolean | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
          deleted_at?: string | null
          is_deleted?: boolean | null
          is_banned?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          deleted_by?: string | null
          user_id?: string | null
          is_admin?: boolean | null
        }
      }
    }
    Views: {
      // No views in the new schema
    }
    Functions: {}
    Enums: {
      service_delivery_method: "online" | "offline" | "both"
      service_provider_status: "pending" | "approved" | "rejected"
    }
  }
}

export type ServiceCategory = Database["public"]["Tables"]["service_categories"]["Row"]
export type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]
export type Governorate = Database["public"]["Tables"]["governorates"]["Row"]
export type ServiceProviderStatus = Database["public"]["Enums"]["service_provider_status"]
