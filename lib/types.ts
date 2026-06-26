export type Database = {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_at?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          id: string
          household_id: string
          month: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          month: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          month?: string
          amount?: number
          created_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          household_id: string
          user_id: string
          amount: number
          description: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          amount: number
          description: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          amount?: number
          description?: string
          date?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row types
export type Household = Database['public']['Tables']['households']['Row']
export type HouseholdMember = Database['public']['Tables']['household_members']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']

// monthKey returns the first day of the given month as YYYY-MM-DD
export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`
}
