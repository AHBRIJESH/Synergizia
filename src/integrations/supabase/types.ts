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
      payment_verifications: {
        Row: {
          id: string
          registration_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string
          verification_metadata: Json | null
          verification_timestamp: string | null
          verified_by: string | null
        }
        Insert: {
          id?: string
          registration_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string
          verification_metadata?: Json | null
          verification_timestamp?: string | null
          verified_by?: string | null
        }
        Update: {
          id?: string
          registration_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string
          verification_metadata?: Json | null
          verification_timestamp?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_verifications_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_metadata: Json | null
          payment_method: string
          registration_id: string
          status: string
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_metadata?: Json | null
          payment_method: string
          registration_id: string
          status?: string
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_metadata?: Json | null
          payment_method?: string
          registration_id?: string
          status?: string
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          college: string | null
          created_at: string | null
          custom_department: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          lunch_option: string | null
          payment_details: Json | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          payment_timestamp: string | null
          payment_verified: boolean | null
          phone: string | null
          registration_date: string | null
          selected_events: string[]
          updated_at: string | null
          year: string | null
        }
        Insert: {
          college?: string | null
          created_at?: string | null
          custom_department?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          lunch_option?: string | null
          payment_details?: Json | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          payment_timestamp?: string | null
          payment_verified?: boolean | null
          phone?: string | null
          registration_date?: string | null
          selected_events?: string[]
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          college?: string | null
          created_at?: string | null
          custom_department?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          lunch_option?: string | null
          payment_details?: Json | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          payment_timestamp?: string | null
          payment_verified?: boolean | null
          phone?: string | null
          registration_date?: string | null
          selected_events?: string[]
          updated_at?: string | null
          year?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      payment_status: "pending" | "verified" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_status: ["pending", "verified", "failed"],
    },
  },
} as const
