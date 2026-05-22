export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      raffles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          draw_at: string | null;
          status: "draft" | "active" | "finished" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          draw_at?: string | null;
          status?: "draft" | "active" | "finished" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["raffles"]["Insert"]>;
        Relationships: [];
      };
      ticket_packs: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          chances: number;
          price_cents: number;
          currency: string;
          badge: string | null;
          active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          chances: number;
          price_cents: number;
          currency?: string;
          badge?: string | null;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ticket_packs"]["Insert"]>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          purchase_code: string;
          raffle_id: string;
          ticket_pack_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_dni: string | null;
          pack_name: string;
          quantity: number;
          amount_cents: number;
          currency: string;
          status: "pending" | "paid" | "cancelled" | "rejected";
          transfer_reference: string | null;
          receipt_bucket: string | null;
          receipt_path: string | null;
          receipt_original_name: string | null;
          receipt_mime_type: string | null;
          customer_notes: string | null;
          admin_notes: string | null;
          assigned_numbers: string[];
          paid_at: string | null;
          cancelled_at: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_code?: string;
          raffle_id: string;
          ticket_pack_id?: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_dni?: string | null;
          pack_name: string;
          quantity: number;
          amount_cents: number;
          currency?: string;
          status?: "pending" | "paid" | "cancelled" | "rejected";
          transfer_reference?: string | null;
          receipt_bucket?: string | null;
          receipt_path?: string | null;
          receipt_original_name?: string | null;
          receipt_mime_type?: string | null;
          customer_notes?: string | null;
          admin_notes?: string | null;
          assigned_numbers?: string[];
          paid_at?: string | null;
          cancelled_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
        Relationships: [];
      };
      raffle_numbers: {
        Row: {
          id: string;
          raffle_id: string;
          number: string;
          status: "available" | "reserved" | "sold";
          purchase_id: string | null;
          assigned_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          raffle_id: string;
          number: string;
          status?: "available" | "reserved" | "sold";
          purchase_id?: string | null;
          assigned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["raffle_numbers"]["Insert"]>;
        Relationships: [];
      };
      email_events: {
        Row: {
          id: string;
          purchase_id: string | null;
          recipient_email: string;
          event_type: string;
          status: "queued" | "sent" | "failed";
          subject: string | null;
          resend_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id?: string | null;
          recipient_email: string;
          event_type: string;
          status?: "queued" | "sent" | "failed";
          subject?: string | null;
          resend_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      approve_purchase: {
        Args: {
          p_purchase_id: string;
          p_admin_notes?: string | null;
        };
        Returns: Json;
      };
      cancel_purchase: {
        Args: {
          p_purchase_id: string;
          p_admin_notes?: string | null;
        };
        Returns: Json;
      };
      reject_purchase: {
        Args: {
          p_purchase_id: string;
          p_admin_notes?: string | null;
        };
        Returns: Json;
      };
      create_raffle_numbers: {
        Args: {
          p_raffle_id: string;
          p_start?: number;
          p_end?: number;
          p_width?: number;
        };
        Returns: number;
      };
      record_email_event: {
        Args: {
          p_purchase_id: string | null;
          p_recipient_email: string;
          p_event_type: string;
          p_status: "queued" | "sent" | "failed";
          p_subject?: string | null;
          p_resend_id?: string | null;
          p_error_message?: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      raffle_status: "draft" | "active" | "finished" | "cancelled";
      purchase_status: "pending" | "paid" | "cancelled" | "rejected";
      raffle_number_status: "available" | "reserved" | "sold";
      email_event_status: "queued" | "sent" | "failed";
    };
    CompositeTypes: Record<never, never>;
  };
};

export type Raffle = Database["public"]["Tables"]["raffles"]["Row"];
export type TicketPack = Database["public"]["Tables"]["ticket_packs"]["Row"];
export type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
