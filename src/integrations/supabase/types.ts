export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_settings: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean | null
          link_text: string | null
          link_url: string | null
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          link_text?: string | null
          link_url?: string | null
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean | null
          link_text?: string | null
          link_url?: string | null
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_automation_schedules: {
        Row: {
          category: string
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          hour: number
          id: string
          is_active: boolean
          last_run_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          hour: number
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          hour?: number
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_visits: {
        Row: {
          blog_id: string
          id: string
          is_authenticated: boolean | null
          user_id: string | null
          visited_at: string | null
          visitor_id: string
        }
        Insert: {
          blog_id: string
          id?: string
          is_authenticated?: boolean | null
          user_id?: string | null
          visited_at?: string | null
          visitor_id: string
        }
        Update: {
          blog_id?: string
          id?: string
          is_authenticated?: boolean | null
          user_id?: string | null
          visited_at?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_visits_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string | null
          excerpt: string
          id: string
          image_url: string | null
          is_published: boolean | null
          json_content: Json | null
          key_takeaways: string | null
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          staff_pick: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string | null
          excerpt: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          json_content?: Json | null
          key_takeaways?: string | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          staff_pick?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          json_content?: Json | null
          key_takeaways?: string | null
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          staff_pick?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_results: {
        Row: {
          calculation_type: string
          created_at: string | null
          id: string
          input_data: Json
          months_to_payoff: number
          output_results: Json
          payoff_date: string
          total_interest: number
          user_id: string | null
        }
        Insert: {
          calculation_type: string
          created_at?: string | null
          id?: string
          input_data: Json
          months_to_payoff: number
          output_results: Json
          payoff_date: string
          total_interest: number
          user_id?: string | null
        }
        Update: {
          calculation_type?: string
          created_at?: string | null
          id?: string
          input_data?: Json
          months_to_payoff?: number
          output_results?: Json
          payoff_date?: string
          total_interest?: number
          user_id?: string | null
        }
        Relationships: []
      }
      debts: {
        Row: {
          balance: number
          banker_name: string
          category: string
          closed_date: string | null
          created_at: string
          currency_symbol: string
          final_payment_date: string | null
          id: string
          interest_rate: number
          is_gold_loan: boolean | null
          loan_term_months: number | null
          metadata: Json | null
          minimum_payment: number
          name: string
          next_payment_date: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance: number
          banker_name: string
          category?: string
          closed_date?: string | null
          created_at?: string
          currency_symbol?: string
          final_payment_date?: string | null
          id?: string
          interest_rate: number
          is_gold_loan?: boolean | null
          loan_term_months?: number | null
          metadata?: Json | null
          minimum_payment: number
          name: string
          next_payment_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number
          banker_name?: string
          category?: string
          closed_date?: string | null
          created_at?: string
          currency_symbol?: string
          final_payment_date?: string | null
          id?: string
          interest_rate?: number
          is_gold_loan?: boolean | null
          loan_term_months?: number | null
          metadata?: Json | null
          minimum_payment?: number
          name?: string
          next_payment_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      one_time_funding: {
        Row: {
          amount: number
          created_at: string | null
          currency_symbol: string
          id: string
          is_applied: boolean | null
          notes: string | null
          payment_date: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency_symbol?: string
          id?: string
          is_applied?: boolean | null
          notes?: string | null
          payment_date: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency_symbol?: string
          id?: string
          is_applied?: boolean | null
          notes?: string | null
          payment_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "one_time_funding_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          created_at: string
          currency_symbol: string
          id: string
          is_redistributed: boolean | null
          payment_date: string
          redistributed_from: string | null
          total_payment: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency_symbol?: string
          id?: string
          is_redistributed?: boolean | null
          payment_date?: string
          redistributed_from?: string | null
          total_payment: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency_symbol?: string
          id?: string
          is_redistributed?: boolean | null
          payment_date?: string
          redistributed_from?: string | null
          total_payment?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_redistributed_from_fkey"
            columns: ["redistributed_from"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          debt_id: string
          id: string
          payment_date: string
          reminder_type: string
          sent_at: string
          user_id: string
        }
        Insert: {
          debt_id: string
          id?: string
          payment_date: string
          reminder_type: string
          sent_at?: string
          user_id: string
        }
        Update: {
          debt_id?: string
          id?: string
          payment_date?: string
          reminder_type?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          has_accepted_policies: boolean | null
          has_completed_tour: boolean | null
          has_marketing_consent: boolean | null
          id: string
          is_admin: boolean | null
          monthly_payment: number | null
          payment_reminders_enabled: boolean | null
          preferred_currency: string | null
          reminder_days_before: number | null
          selected_strategy: string | null
          show_extra_payments: boolean | null
          show_lump_sum_payments: boolean | null
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          has_accepted_policies?: boolean | null
          has_completed_tour?: boolean | null
          has_marketing_consent?: boolean | null
          id: string
          is_admin?: boolean | null
          monthly_payment?: number | null
          payment_reminders_enabled?: boolean | null
          preferred_currency?: string | null
          reminder_days_before?: number | null
          selected_strategy?: string | null
          show_extra_payments?: boolean | null
          show_lump_sum_payments?: boolean | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          has_accepted_policies?: boolean | null
          has_completed_tour?: boolean | null
          has_marketing_consent?: boolean | null
          id?: string
          is_admin?: boolean | null
          monthly_payment?: number | null
          payment_reminders_enabled?: boolean | null
          preferred_currency?: string | null
          reminder_days_before?: number | null
          selected_strategy?: string | null
          show_extra_payments?: boolean | null
          show_lump_sum_payments?: boolean | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          last_active: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          last_active?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          last_active?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      website_visits: {
        Row: {
          city: string | null
          country: string | null
          id: string
          ip_address: string | null
          is_authenticated: boolean | null
          latitude: number | null
          longitude: number | null
          path: string | null
          user_id: string | null
          visited_at: string | null
          visitor_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          is_authenticated?: boolean | null
          latitude?: number | null
          longitude?: number | null
          path?: string | null
          user_id?: string | null
          visited_at?: string | null
          visitor_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          is_authenticated?: boolean | null
          latitude?: number | null
          longitude?: number | null
          path?: string | null
          user_id?: string | null
          visited_at?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_payment_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_all_profiles_monthly_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
