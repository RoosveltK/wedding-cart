export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      event: {
        Row: {
          date_debut: string | null
          date_fin: string | null
          description: string | null
          id: string
          image_url: string | null
          lieu: string | null
          nom_marie: string | null
          nom_mariee: string | null
          titre: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          lieu?: string | null
          nom_marie?: string | null
          nom_mariee?: string | null
          titre?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          lieu?: string | null
          nom_marie?: string | null
          nom_mariee?: string | null
          titre?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          nom_complet: string
          table_nom: string | null
          telephone: string | null
          token: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          nom_complet: string
          table_nom?: string | null
          telephone?: string | null
          token: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          nom_complet?: string
          table_nom?: string | null
          telephone?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_billet: {
        Args: { p_token: string }
        Returns: {
          date_debut: string
          date_fin: string
          description: string
          lieu: string
          nom_complet: string
          nom_marie: string
          nom_mariee: string
          titre: string
          video_url: string
        }[]
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

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
