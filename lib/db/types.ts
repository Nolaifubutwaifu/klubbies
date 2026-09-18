// Generated from the Supabase schema (supabase gen types). Do not edit by hand;
// regenerate after each migration.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      access_events: {
        Row: {
          action: string;
          club_id: string | null;
          created_at: string;
          id: number;
          ip_hash: string | null;
          media_id: string | null;
          membership_id: string | null;
          occurred_at: string;
          updated_at: string;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          club_id?: string | null;
          created_at?: string;
          id?: never;
          ip_hash?: string | null;
          media_id?: string | null;
          membership_id?: string | null;
          occurred_at?: string;
          updated_at?: string;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          club_id?: string | null;
          created_at?: string;
          id?: never;
          ip_hash?: string | null;
          media_id?: string | null;
          membership_id?: string | null;
          occurred_at?: string;
          updated_at?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "access_events_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "access_events_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "access_events_membership_id_fkey";
            columns: ["membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["id"];
          },
        ];
      };
      albums: {
        Row: {
          allow_download: boolean;
          club_id: string;
          contributor_scope: string;
          cover_media_id: string | null;
          cover_path: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          event_date: string | null;
          id: string;
          published_at: string | null;
          status: string;
          title: string;
          updated_at: string;
          visibility: string;
        };
        Insert: {
          allow_download?: boolean;
          club_id: string;
          contributor_scope?: string;
          cover_media_id?: string | null;
          cover_path?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_date?: string | null;
          id?: string;
          published_at?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          visibility?: string;
        };
        Update: {
          allow_download?: boolean;
          club_id?: string;
          contributor_scope?: string;
          cover_media_id?: string | null;
          cover_path?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_date?: string | null;
          id?: string;
          published_at?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "albums_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "albums_cover_media_fk";
            columns: ["cover_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "albums_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      auth_rate_events: {
        Row: {
          bucket: string;
          created_at: string;
          id: number;
          key_hash: string;
          occurred_at: string;
          updated_at: string;
        };
        Insert: {
          bucket: string;
          created_at?: string;
          id?: never;
          key_hash: string;
          occurred_at?: string;
          updated_at?: string;
        };
        Update: {
          bucket?: string;
          created_at?: string;
          id?: never;
          key_hash?: string;
          occurred_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      club_handle_redirects: {
        Row: {
          club_id: string;
          created_at: string;
          old_handle: string;
          updated_at: string;
        };
        Insert: {
          club_id: string;
          created_at?: string;
          old_handle: string;
          updated_at?: string;
        };
        Update: {
          club_id?: string;
          created_at?: string;
          old_handle?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "club_handle_redirects_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
        ];
      };
      clubs: {
        Row: {
          accent_colour: string | null;
          billing_status: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          handle: string;
          id: string;
          logo_path: string | null;
          name: string;
          organisation: string | null;
          paid_at: string | null;
          roster_mapping: Json | null;
          status: string;
          stripe_checkout_session_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
        };
        Insert: {
          accent_colour?: string | null;
          billing_status?: string;
          paid_at?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          handle: string;
          id?: string;
          logo_path?: string | null;
          name: string;
          organisation?: string | null;
          roster_mapping?: Json | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          accent_colour?: string | null;
          billing_status?: string;
          paid_at?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          handle?: string;
          id?: string;
          logo_path?: string | null;
          name?: string;
          organisation?: string | null;
          roster_mapping?: Json | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clubs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      favourites: {
        Row: {
          club_id: string;
          created_at: string;
          media_id: string;
          user_id: string;
        };
        Insert: {
          club_id: string;
          created_at?: string;
          media_id: string;
          user_id: string;
        };
        Update: {
          club_id?: string;
          created_at?: string;
          media_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favourites_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favourites_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favourites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: {
          album_id: string | null;
          byte_size: number | null;
          captured_at: string | null;
          club_id: string;
          created_at: string;
          display_path: string | null;
          duration_seconds: number | null;
          height: number | null;
          id: string;
          kind: string;
          mime_type: string | null;
          original_filename: string | null;
          poster_path: string | null;
          sort_at: string;
          status: string;
          storage_path: string;
          thumb_path: string | null;
          updated_at: string;
          uploaded_by: string | null;
          width: number | null;
        };
        Insert: {
          album_id?: string | null;
          byte_size?: number | null;
          captured_at?: string | null;
          club_id: string;
          created_at?: string;
          display_path?: string | null;
          duration_seconds?: number | null;
          height?: number | null;
          id?: string;
          kind: string;
          mime_type?: string | null;
          original_filename?: string | null;
          poster_path?: string | null;
          status?: string;
          storage_path: string;
          thumb_path?: string | null;
          updated_at?: string;
          uploaded_by?: string | null;
          width?: number | null;
        };
        Update: {
          album_id?: string | null;
          byte_size?: number | null;
          captured_at?: string | null;
          club_id?: string;
          created_at?: string;
          display_path?: string | null;
          duration_seconds?: number | null;
          height?: number | null;
          id?: string;
          kind?: string;
          mime_type?: string | null;
          original_filename?: string | null;
          poster_path?: string | null;
          status?: string;
          storage_path?: string;
          thumb_path?: string | null;
          updated_at?: string;
          uploaded_by?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      memberships: {
        Row: {
          claimed_name: string | null;
          club_id: string;
          created_at: string;
          first_seen_at: string | null;
          last_seen_at: string | null;
          grace_ends_at: string | null;
          grace_notices_sent: number;
          grace_started_at: string | null;
          id: string;
          invited_at: string | null;
          accepted_at: string | null;
          declined_at: string | null;
          name_mismatch: boolean;
          role: string;
          role_id: string | null;
          roster_email: string;
          roster_name: string;
          status: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          claimed_name?: string | null;
          club_id: string;
          created_at?: string;
          first_seen_at?: string | null;
          last_seen_at?: string | null;
          grace_ends_at?: string | null;
          grace_notices_sent?: number;
          grace_started_at?: string | null;
          id?: string;
          invited_at?: string | null;
          accepted_at?: string | null;
          declined_at?: string | null;
          name_mismatch?: boolean;
          role?: string;
          role_id?: string | null;
          roster_email: string;
          roster_name: string;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          claimed_name?: string | null;
          club_id?: string;
          created_at?: string;
          first_seen_at?: string | null;
          last_seen_at?: string | null;
          grace_ends_at?: string | null;
          grace_notices_sent?: number;
          grace_started_at?: string | null;
          id?: string;
          invited_at?: string | null;
          accepted_at?: string | null;
          declined_at?: string | null;
          name_mismatch?: boolean;
          role?: string;
          role_id?: string | null;
          roster_email?: string;
          roster_name?: string;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "memberships_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "club_roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memberships_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      pending_sign_ins: {
        Row: {
          attempts: number;
          claimed_name: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          flow: string;
          updated_at: string;
        };
        Insert: {
          attempts?: number;
          claimed_name?: string | null;
          created_at?: string;
          email: string;
          expires_at: string;
          flow: string;
          updated_at?: string;
        };
        Update: {
          attempts?: number;
          claimed_name?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          flow?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      club_roles: {
        Row: {
          club_id: string;
          created_at: string;
          id: string;
          is_builtin: boolean;
          is_default: boolean;
          key: string;
          manage_albums: boolean;
          manage_club: boolean;
          manage_members: boolean;
          name: string;
          post_feed: boolean;
          sort_order: number;
          updated_at: string;
          upload: boolean;
        };
        Insert: {
          club_id: string;
          created_at?: string;
          id?: string;
          is_builtin?: boolean;
          is_default?: boolean;
          key: string;
          manage_albums?: boolean;
          manage_club?: boolean;
          manage_members?: boolean;
          name: string;
          post_feed?: boolean;
          sort_order?: number;
          updated_at?: string;
          upload?: boolean;
        };
        Update: {
          club_id?: string;
          created_at?: string;
          id?: string;
          is_builtin?: boolean;
          is_default?: boolean;
          key?: string;
          manage_albums?: boolean;
          manage_club?: boolean;
          manage_members?: boolean;
          name?: string;
          post_feed?: boolean;
          sort_order?: number;
          updated_at?: string;
          upload?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "club_roles_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          album_id: string | null;
          author_membership_id: string | null;
          body: string;
          club_id: string;
          created_at: string;
          id: string;
          pinned: boolean;
          updated_at: string;
        };
        Insert: {
          album_id?: string | null;
          author_membership_id?: string | null;
          body: string;
          club_id: string;
          created_at?: string;
          id?: string;
          pinned?: boolean;
          updated_at?: string;
        };
        Update: {
          album_id?: string | null;
          author_membership_id?: string | null;
          body?: string;
          club_id?: string;
          created_at?: string;
          id?: string;
          pinned?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_author_membership_id_fkey";
            columns: ["author_membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
        ];
      };
      post_comments: {
        Row: {
          author_membership_id: string | null;
          body: string;
          club_id: string;
          created_at: string;
          id: string;
          post_id: string;
          updated_at: string;
        };
        Insert: {
          author_membership_id?: string | null;
          body: string;
          club_id: string;
          created_at?: string;
          id?: string;
          post_id: string;
          updated_at?: string;
        };
        Update: {
          author_membership_id?: string | null;
          body?: string;
          club_id?: string;
          created_at?: string;
          id?: string;
          post_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_comments_author_membership_id_fkey";
            columns: ["author_membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_reactions: {
        Row: {
          club_id: string;
          created_at: string;
          emoji: string;
          membership_id: string;
          post_id: string;
          updated_at: string;
        };
        Insert: {
          club_id: string;
          created_at?: string;
          emoji: string;
          membership_id: string;
          post_id: string;
          updated_at?: string;
        };
        Update: {
          club_id?: string;
          created_at?: string;
          emoji?: string;
          membership_id?: string;
          post_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_reactions_membership_id_fkey";
            columns: ["membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_reactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      roster_imports: {
        Row: {
          added_count: number | null;
          club_id: string;
          created_at: string;
          error_count: number | null;
          filename: string | null;
          id: string;
          imported_at: string;
          imported_by: string | null;
          mapping: Json | null;
          matched_count: number | null;
          report: Json | null;
          row_count: number | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          added_count?: number | null;
          club_id: string;
          created_at?: string;
          error_count?: number | null;
          filename?: string | null;
          id?: string;
          imported_at?: string;
          imported_by?: string | null;
          mapping?: Json | null;
          matched_count?: number | null;
          report?: Json | null;
          row_count?: number | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          added_count?: number | null;
          club_id?: string;
          created_at?: string;
          error_count?: number | null;
          filename?: string | null;
          id?: string;
          imported_at?: string;
          imported_by?: string | null;
          mapping?: Json | null;
          matched_count?: number | null;
          report?: Json | null;
          row_count?: number | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roster_imports_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roster_imports_imported_by_fkey";
            columns: ["imported_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_events: {
        Row: {
          club_id: string | null;
          created_at: string;
          id: string;
          payload: Json;
          processed_at: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          club_id?: string | null;
          created_at?: string;
          id: string;
          payload: Json;
          processed_at?: string | null;
          type: string;
          updated_at?: string;
        };
        Update: {
          club_id?: string | null;
          created_at?: string;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          is_super_admin: boolean;
          notify_access_ending: boolean;
          notify_feed_post: boolean;
          notify_new_album: boolean;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          notify_access_ending?: boolean;
          notify_feed_post?: boolean;
          notify_new_album?: boolean;
          display_name?: string | null;
          email: string;
          id: string;
          is_super_admin?: boolean;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          notify_access_ending?: boolean;
          notify_feed_post?: boolean;
          notify_new_album?: boolean;
          display_name?: string | null;
          email?: string;
          id?: string;
          is_super_admin?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      album_media_counts: {
        Row: {
          album_id: string | null;
          first_media_id: string | null;
          photo_count: number | null;
          video_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
        ];
      };
      club_storage_usage: {
        Row: {
          club_id: string | null;
          item_count: number | null;
          total_bytes: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      create_club: {
        Args: {
          p_description: string;
          p_handle_base: string;
          p_name: string;
          p_organisation: string;
        };
        Returns: Database["public"]["Tables"]["clubs"]["Row"];
        SetofOptions: {
          from: "*";
          to: "clubs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      seed_club_roles: { Args: { p_club_id: string }; Returns: undefined };
      touch_club_visit: { Args: { p_club_id: string }; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])> =
  (PublicSchema["Tables"] & PublicSchema["Views"])[T] extends { Row: infer R } ? R : never;

export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];

export type Club = Tables<"clubs">;
export type ClubRole = Tables<"club_roles">;
export type Post = Tables<"posts">;
export type Membership = Tables<"memberships">;
export type Album = Tables<"albums">;
export type Media = Tables<"media">;

export type MembershipStatus = "pending" | "active" | "grace" | "revoked";
export type MembershipRole = "club_admin" | "club_member";
export type MediaKind = "photo" | "video";
