export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          business_name: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          plan_tier: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          name?: string | null;
          business_name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          plan_tier?: string | null;
        };
        Update: {
          email?: string;
          name?: string | null;
          business_name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          plan_tier?: string | null;
        };
      };
      icp_profiles: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          generated_queries: string[];
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          description: string;
          generated_queries?: string[];
          active?: boolean;
        };
        Update: {
          description?: string;
          generated_queries?: string[];
          active?: boolean;
          updated_at?: string;
        };
      };
      delivery_emails: {
        Row: {
          id: string;
          user_id: string;
          email_address: string;
          verified: boolean;
          verification_token: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email_address: string;
          verified?: boolean;
          verification_token?: string | null;
        };
        Update: {
          email_address?: string;
          verified?: boolean;
          verification_token?: string | null;
        };
      };
      leads: {
        Row: {
          id: string;
          user_id: string;
          icp_profile_id: string;
          company_name: string;
          company_url: string;
          description: string;
          signals: Record<string, string>;
          relevance_score: number;
          source_query: string;
          delivered_at: string | null;
          feedback: "good" | "bad" | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          icp_profile_id: string;
          company_name: string;
          company_url: string;
          description?: string;
          signals?: Record<string, string>;
          relevance_score?: number;
          source_query?: string;
          delivered_at?: string | null;
          feedback?: "good" | "bad" | null;
        };
        Update: {
          company_name?: string;
          company_url?: string;
          description?: string;
          signals?: Record<string, string>;
          relevance_score?: number;
          source_query?: string;
          delivered_at?: string | null;
          feedback?: "good" | "bad" | null;
        };
      };
      search_runs: {
        Row: {
          id: string;
          user_id: string;
          icp_profile_id: string;
          executed_at: string;
          query_count: number;
          result_count: number;
          status: "success" | "failed";
        };
        Insert: {
          user_id: string;
          icp_profile_id: string;
          executed_at?: string;
          query_count?: number;
          result_count?: number;
          status?: "success" | "failed";
        };
        Update: {
          executed_at?: string;
          query_count?: number;
          result_count?: number;
          status?: "success" | "failed";
        };
      };
    };
  };
};

export type User = Database["public"]["Tables"]["users"]["Row"];
export type IcpProfile = Database["public"]["Tables"]["icp_profiles"]["Row"];
export type DeliveryEmail = Database["public"]["Tables"]["delivery_emails"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type SearchRun = Database["public"]["Tables"]["search_runs"]["Row"];
