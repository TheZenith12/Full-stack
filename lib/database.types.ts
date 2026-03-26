// Auto-generated types from Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:         string;
          full_name:  string | null;
          phone:      string | null;
          avatar_url: string | null;
          role:       'user' | 'manager' | 'super_admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id:          string;
          full_name?:  string | null;
          phone?:      string | null;
          avatar_url?: string | null;
          role?:       'user' | 'manager' | 'super_admin';
        };
        Update: {
          full_name?:  string | null;
          phone?:      string | null;
          avatar_url?: string | null;
          role?:       'user' | 'manager' | 'super_admin';
          updated_at?: string;
        };
      };
      places: {
        Row: {
          id:              string;
          type:            'resort' | 'nature';
          name:            string;
          description:     string | null;
          short_desc:      string | null;
          price_per_night: number | null;
          phone:           string | null;
          email:           string | null;
          website:         string | null;
          latitude:        number | null;
          longitude:       number | null;
          address:         string | null;
          province:        string | null;
          district:        string | null;
          cover_image:     string | null;
          images:          string[];
          video_url:       string | null;
          view_count:      number;
          like_count:      number;
          rating_avg:      number;
          rating_count:    number;
          is_published:    boolean;
          is_featured:     boolean;
          manager_id:      string | null;
          created_by:      string | null;
          created_at:      string;
          updated_at:      string;
        };
        Insert: Omit<Database['public']['Tables']['places']['Row'],
          'id' | 'view_count' | 'like_count' | 'rating_avg' | 'rating_count' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['places']['Insert']>;
      };
      bookings: {
        Row: {
          id:              string;
          place_id:        string;
          user_id:         string | null;
          guest_name:      string;
          guest_phone:     string;
          guest_email:     string | null;
          guest_count:     number;
          check_in:        string;
          check_out:       string;
          nights:          number;
          total_amount:    number;
          payment_method:  'stripe' | 'qpay' | null;
          payment_status:  'pending' | 'paid' | 'failed' | 'refunded';
          payment_intent:  string | null;
          qpay_invoice_id: string | null;
          status:          'pending' | 'confirmed' | 'cancelled' | 'completed';
          notes:           string | null;
          created_at:      string;
          updated_at:      string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'],
          'id' | 'nights' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      reviews: {
        Row: {
          id:          string;
          place_id:    string;
          user_id:     string | null;
          booking_id:  string | null;
          rating:      number;
          title:       string | null;
          body:        string | null;
          images:      string[];
          is_verified: boolean;
          created_at:  string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      likes: {
        Row: {
          user_id:    string;
          place_id:   string;
          created_at: string;
        };
        Insert: { user_id: string; place_id: string };
        Update: never;
      };
      site_stats: {
        Row: {
          key:        string;
          value:      number;
          updated_at: string;
        };
        Insert: { key: string; value?: number };
        Update: { value?: number; updated_at?: string };
      };
    };
    Functions: {
      increment_view_count: {
        Args: { place_id: string };
        Returns: void;
      };
    };
    Enums: {
      place_type:     'resort' | 'nature';
      user_role:      'user' | 'manager' | 'super_admin';
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
      payment_method: 'stripe' | 'qpay';
    };
  };
}
