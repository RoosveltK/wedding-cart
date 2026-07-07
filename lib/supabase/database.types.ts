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
          code: string
          created_at: string
          event_id: string
          id: string
          nom_complet: string
          table_nom: string | null
          telephone: string | null
          token: string
        }
        Insert: {
          code?: string
          created_at?: string
          event_id: string
          id?: string
          nom_complet: string
          table_nom?: string | null
          telephone?: string | null
          token: string
        }
        Update: {
          code?: string
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
      guestbook_entries: {
        Row: {
          created_at: string
          guest_id: string
          id: string
          message: string | null
        }
        Insert: {
          created_at?: string
          guest_id: string
          id?: string
          message?: string | null
        }
        Update: {
          created_at?: string
          guest_id?: string
          id?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_entries_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook_photos: {
        Row: {
          created_at: string
          entry_id: string
          guest_id: string
          id: string
          path: string
          size_bytes: number
        }
        Insert: {
          created_at?: string
          entry_id: string
          guest_id: string
          id?: string
          path: string
          size_bytes: number
        }
        Update: {
          created_at?: string
          entry_id?: string
          guest_id?: string
          id?: string
          path?: string
          size_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_photos_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "guestbook_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guestbook_photos_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
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
          code: string
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
      get_storage_usage: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_guestbook: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          message: string | null
          nom_complet: string
          photos: string[]
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
