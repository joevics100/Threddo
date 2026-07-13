/**
 * Hand-written to match `supabase/migrations/0001_init_schema.sql`.
 *
 * Once the project is linked to the Supabase CLI, regenerate with:
 *   supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts
 */

export type ListingStatus = "pending" | "approved" | "rejected";
export type ListingCondition = "new" | "like_new" | "gently_used" | "needs_fixing";
export type SuitableFor = "unisex" | "male" | "female" | "kids";
export type DeliveryMethod = "pickup" | "delivery" | "meet_up";
export type UserRole = "user" | "admin";
export type ReportReason = "scam" | "inappropriate" | "wrong_category" | "sold_elsewhere" | "other";
export type ReportStatus = "open" | "resolved";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          whatsapp_number: string | null;
          avatar_url: string | null;
          is_verified: boolean;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          avatar_url?: string | null;
          is_verified?: boolean;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          description: string | null;
          price: number | null;
          is_free: boolean;
          is_negotiable: boolean;
          condition: ListingCondition;
          size: string | null;
          suitable_for: SuitableFor | null;
          brand: string | null;
          color: string | null;
          material: string | null;
          delivery_method: DeliveryMethod | null;
          state: string | null;
          lga: string | null;
          town: string | null;
          images: string[];
          status: ListingStatus;
          rejection_reason: string | null;
          allow_calls: boolean;
          whatsapp_number: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          title: string;
          description?: string | null;
          price?: number | null;
          is_free?: boolean;
          is_negotiable?: boolean;
          condition: ListingCondition;
          size?: string | null;
          suitable_for?: SuitableFor | null;
          brand?: string | null;
          color?: string | null;
          material?: string | null;
          delivery_method?: DeliveryMethod | null;
          state?: string | null;
          lga?: string | null;
          town?: string | null;
          images?: string[];
          status?: ListingStatus;
          rejection_reason?: string | null;
          allow_calls?: boolean;
          whatsapp_number?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          is_free?: boolean;
          is_negotiable?: boolean;
          condition?: ListingCondition;
          size?: string | null;
          suitable_for?: SuitableFor | null;
          brand?: string | null;
          color?: string | null;
          material?: string | null;
          delivery_method?: DeliveryMethod | null;
          state?: string | null;
          lga?: string | null;
          town?: string | null;
          images?: string[];
          status?: ListingStatus;
          rejection_reason?: string | null;
          allow_calls?: boolean;
          whatsapp_number?: string | null;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          listing_id: string | null;
          reviewer_id: string;
          seller_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id?: string | null;
          reviewer_id: string;
          seller_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string | null;
          reviewer_id?: string;
          seller_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reports: {
        Row: {
          id: string;
          listing_id: string;
          reporter_id: string;
          reason: ReportReason;
          details: string | null;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          reporter_id: string;
          reason: ReportReason;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          reporter_id?: string;
          reason?: ReportReason;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_listings: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_listings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "saved_listings_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_listing_views: {
        Args: { listing_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
