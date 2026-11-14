export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      business_claims: {
        Row: {
          business_id: string
          claimant_id: string
          contact: string
          corrections: string
          created_at: string
          decided_at: string | null
          evidence: string[]
          expires_at: string | null
          id: string
          identity_name: string
          previous_owner_id: string | null
          reason: string
          reviewer_id: string | null
          status: string
          verified_contacts: string[]
        }
        Insert: {
          business_id: string
          claimant_id: string
          contact: string
          corrections?: string
          created_at?: string
          decided_at?: string | null
          evidence?: string[]
          expires_at?: string | null
          id?: string
          identity_name: string
          previous_owner_id?: string | null
          reason?: string
          reviewer_id?: string | null
          status?: string
          verified_contacts?: string[]
        }
        Update: {
          business_id?: string
          claimant_id?: string
          contact?: string
          corrections?: string
          created_at?: string
          decided_at?: string | null
          evidence?: string[]
          expires_at?: string | null
          id?: string
          identity_name?: string
          previous_owner_id?: string | null
          reason?: string
          reviewer_id?: string | null
          status?: string
          verified_contacts?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "business_claims_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_offerings: {
        Row: {
          business_id: string
          business_type: string
          category: string
          created_at: string
          description: string
          exclusions: string
          id: string
          inclusions: string
          kind: string
          minimum_area: number | null
          minimum_quantity: number | null
          name: string
          photos: string[]
          pricing: Json
          product_details: Json
          published: boolean
          review_feedback: string
          review_state: string
          specifications: Json
          updated_at: string
        }
        Insert: {
          business_id: string
          business_type?: string
          category?: string
          created_at?: string
          description?: string
          exclusions?: string
          id?: string
          inclusions?: string
          kind?: string
          minimum_area?: number | null
          minimum_quantity?: number | null
          name: string
          photos?: string[]
          pricing?: Json
          product_details?: Json
          published?: boolean
          review_feedback?: string
          review_state?: string
          specifications?: Json
          updated_at?: string
        }
        Update: {
          business_id?: string
          business_type?: string
          category?: string
          created_at?: string
          description?: string
          exclusions?: string
          id?: string
          inclusions?: string
          kind?: string
          minimum_area?: number | null
          minimum_quantity?: number | null
          name?: string
          photos?: string[]
          pricing?: Json
          product_details?: Json
          published?: boolean
          review_feedback?: string
          review_state?: string
          specifications?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_offerings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
      business_subscriptions: {
        Row: {
          actor_id: string
          business_id: string
          cancel_at_end: boolean
          created_at: string
          ends_at: string
          id: string
          plan_id: string
          reason: string
          starts_at: string
          status: string
        }
        Insert: {
          actor_id: string
          business_id: string
          cancel_at_end?: boolean
          created_at?: string
          ends_at: string
          id?: string
          plan_id: string
          reason: string
          starts_at: string
          status?: string
        }
        Update: {
          actor_id?: string
          business_id?: string
          cancel_at_end?: boolean
          created_at?: string
          ends_at?: string
          id?: string
          plan_id?: string
          reason?: string
          starts_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      business_verifications: {
        Row: {
          business_id: string
          checked_at: string
          evidence_reference: string
          expires_at: string | null
          id: string
          public_summary: string
          reason: string
          reviewer_id: string
          scope: string
          status: string
        }
        Insert: {
          business_id: string
          checked_at?: string
          evidence_reference: string
          expires_at?: string | null
          id?: string
          public_summary: string
          reason: string
          reviewer_id: string
          scope: string
          status?: string
        }
        Update: {
          business_id?: string
          checked_at?: string
          evidence_reference?: string
          expires_at?: string | null
          id?: string
          public_summary?: string
          reason?: string
          reviewer_id?: string
          scope?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_verifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string
          admin_note: string | null
          archive_status: string | null
          archived_at: string | null
          area: string
          attributes: Json
          category: string
          category_id: string | null
          city: string
          city_id: string | null
          coordinates: Json
          created_at: string
          days_open: string[]
          description: string
          email: string
          hours: string
          id: string
          landmark: string
          locality_id: string | null
          logo: string | null
          name: string
          organization_id: string | null
          owner_feedback: string
          owner_id: string
          payment_methods: string[]
          phone: string
          photos: string[]
          pincode: string
          pincode_id: string | null
          plan: string
          price: string
          public_slug: string | null
          requested_plan: string | null
          service_areas: Json
          services: Json
          sponsored: boolean
          status: string
          structured_hours: Json
          sub: string
          tags: string[]
          updated_at: string
          verified: boolean
          website: string
          whatsapp: string
          year_established: number | null
        }
        Insert: {
          address?: string
          admin_note?: string | null
          archive_status?: string | null
          archived_at?: string | null
          area?: string
          attributes?: Json
          category: string
          category_id?: string | null
          city: string
          city_id?: string | null
          coordinates?: Json
          created_at?: string
          days_open?: string[]
          description?: string
          email?: string
          hours?: string
          id?: string
          landmark?: string
          locality_id?: string | null
          logo?: string | null
          name: string
          organization_id?: string | null
          owner_feedback?: string
          owner_id: string
          payment_methods?: string[]
          phone?: string
          photos?: string[]
          pincode?: string
          pincode_id?: string | null
          plan?: string
          price?: string
          public_slug?: string | null
          requested_plan?: string | null
          service_areas?: Json
          services?: Json
          sponsored?: boolean
          status?: string
          structured_hours?: Json
          sub?: string
          tags?: string[]
          updated_at?: string
          verified?: boolean
          website?: string
          whatsapp?: string
          year_established?: number | null
        }
        Update: {
          address?: string
          admin_note?: string | null
          archive_status?: string | null
          archived_at?: string | null
          area?: string
          attributes?: Json
          category?: string
          category_id?: string | null
          city?: string
          city_id?: string | null
          coordinates?: Json
          created_at?: string
          days_open?: string[]
          description?: string
          email?: string
          hours?: string
          id?: string
          landmark?: string
          locality_id?: string | null
          logo?: string | null
          name?: string
          organization_id?: string | null
          owner_feedback?: string
          owner_id?: string
          payment_methods?: string[]
          phone?: string
          photos?: string[]
          pincode?: string
          pincode_id?: string | null
          plan?: string
          price?: string
          public_slug?: string | null
          requested_plan?: string | null
          service_areas?: Json
          services?: Json
          sponsored?: boolean
          status?: string
          structured_hours?: Json
          sub?: string
          tags?: string[]
          updated_at?: string
          verified?: boolean
          website?: string
          whatsapp?: string
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "directory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "directory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "directory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "business_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_pincode_id_fkey"
            columns: ["pincode_id"]
            isOneToOne: false
            referencedRelation: "directory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      buy_requirements: {
        Row: {
          category: string
          city: string
          created_at: string
          description: string
          id: string
          name: string
          phone: string
          requester_id: string
          status: string
          topic: string
        }
        Insert: {
          category: string
          city: string
          created_at?: string
          description: string
          id?: string
          name: string
          phone: string
          requester_id: string
          status?: string
          topic: string
        }
        Update: {
          category?: string
          city?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          phone?: string
          requester_id?: string
          status?: string
          topic?: string
        }
        Relationships: []
      }
      commercial_records: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          external_reference: string
          id: string
          method: string
          reason: string
          recorded_by: string
          reference: string
          status: string
          subscription_id: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency?: string
          external_reference?: string
          id?: string
          method: string
          reason: string
          recorded_by: string
          reference: string
          status: string
          subscription_id: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          external_reference?: string
          id?: string
          method?: string
          reason?: string
          recorded_by?: string
          reference?: string
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_records_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "business_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_revisions: {
        Row: {
          action: string
          actor_id: string
          content_id: string
          created_at: string
          id: string
          payload: Json
          reason: string
          revision: number
        }
        Insert: {
          action: string
          actor_id: string
          content_id: string
          created_at?: string
          id?: string
          payload: Json
          reason: string
          revision: number
        }
        Update: {
          action?: string
          actor_id?: string
          content_id?: string
          created_at?: string
          id?: string
          payload?: Json
          reason?: string
          revision?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_revisions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "site_content"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_audit: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          business_id: string | null
          created_at: string
          entity_id: string | null
          id: string
          note: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          note?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          business_id?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_audit_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_categories: {
        Row: {
          active: boolean
          aliases: string[]
          cta_label: string
          description: string
          fields: Json
          group_name: string
          icon: string
          id: string
          legacy_slug: string
          name: string
          parent_id: string | null
          position: number
          public_visible: boolean
          slug: string
        }
        Insert: {
          active?: boolean
          aliases?: string[]
          cta_label?: string
          description?: string
          fields?: Json
          group_name?: string
          icon?: string
          id?: string
          legacy_slug?: string
          name: string
          parent_id?: string | null
          position?: number
          public_visible?: boolean
          slug: string
        }
        Update: {
          active?: boolean
          aliases?: string[]
          cta_label?: string
          description?: string
          fields?: Json
          group_name?: string
          icon?: string
          id?: string
          legacy_slug?: string
          name?: string
          parent_id?: string | null
          position?: number
          public_visible?: boolean
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "directory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_events: {
        Row: {
          business_id: string | null
          campaign: string
          category: string
          city: string
          created_at: string
          dedupe_key: string
          event: string
          id: string
          medium: string
          offering_id: string | null
          outcome: string
          source: string
          term: string
        }
        Insert: {
          business_id?: string | null
          campaign?: string
          category?: string
          city?: string
          created_at?: string
          dedupe_key: string
          event: string
          id?: string
          medium?: string
          offering_id?: string | null
          outcome?: string
          source?: string
          term?: string
        }
        Update: {
          business_id?: string | null
          campaign?: string
          category?: string
          city?: string
          created_at?: string
          dedupe_key?: string
          event?: string
          id?: string
          medium?: string
          offering_id?: string | null
          outcome?: string
          source?: string
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directory_events_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "business_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_import_batches: {
        Row: {
          applied_at: string | null
          applied_ids: string[]
          created_at: string
          created_by: string
          filename: string
          id: string
          mapping: Json
          rows: Json
          status: string
        }
        Insert: {
          applied_at?: string | null
          applied_ids?: string[]
          created_at?: string
          created_by: string
          filename: string
          id?: string
          mapping?: Json
          rows: Json
          status?: string
        }
        Update: {
          applied_at?: string | null
          applied_ids?: string[]
          created_at?: string
          created_by?: string
          filename?: string
          id?: string
          mapping?: Json
          rows?: Json
          status?: string
        }
        Relationships: []
      }
      directory_locations: {
        Row: {
          active: boolean
          id: string
          kind: string
          name: string
          parent_id: string | null
          source_url: string
          verified: boolean
        }
        Insert: {
          active?: boolean
          id?: string
          kind: string
          name: string
          parent_id?: string | null
          source_url?: string
          verified?: boolean
        }
        Update: {
          active?: boolean
          id?: string
          kind?: string
          name?: string
          parent_id?: string | null
          source_url?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "directory_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "directory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_quality_issues: {
        Row: {
          assignee: string | null
          business_id: string
          created_at: string
          fields: string[]
          fingerprint: string
          id: string
          kind: string
          notes: string
          offering_id: string | null
          severity: string
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          business_id: string
          created_at?: string
          fields?: string[]
          fingerprint: string
          id?: string
          kind: string
          notes?: string
          offering_id?: string | null
          severity: string
          status?: string
          summary: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          business_id?: string
          created_at?: string
          fields?: string[]
          fingerprint?: string
          id?: string
          kind?: string
          notes?: string
          offering_id?: string | null
          severity?: string
          status?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_quality_issues_assignee_fkey"
            columns: ["assignee"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directory_quality_issues_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directory_quality_issues_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "business_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_redirects: {
        Row: {
          from_key: string
          id: string
          kind: string
          to_key: string
        }
        Insert: {
          from_key: string
          id?: string
          kind: string
          to_key: string
        }
        Update: {
          from_key?: string
          id?: string
          kind?: string
          to_key?: string
        }
        Relationships: []
      }
      directory_staff_notes: {
        Row: {
          business_id: string
          note: string
          ownership_evidence: string
          ownership_status: string
        }
        Insert: {
          business_id: string
          note?: string
          ownership_evidence?: string
          ownership_status?: string
        }
        Update: {
          business_id?: string
          note?: string
          ownership_evidence?: string
          ownership_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_staff_notes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      favourites: {
        Row: {
          business_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favourites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      in_app_notifications: {
        Row: {
          attempted_at: string | null
          attempts: number
          business_id: string | null
          created_at: string
          delivered_at: string | null
          entity_id: string
          event_key: string
          failure_reason: string
          id: string
          recipient_id: string
          sent_at: string | null
          status: string
          template: string
          title: string
        }
        Insert: {
          attempted_at?: string | null
          attempts?: number
          business_id?: string | null
          created_at?: string
          delivered_at?: string | null
          entity_id: string
          event_key: string
          failure_reason?: string
          id?: string
          recipient_id: string
          sent_at?: string | null
          status?: string
          template: string
          title: string
        }
        Update: {
          attempted_at?: string | null
          attempts?: number
          business_id?: string | null
          created_at?: string
          delivered_at?: string | null
          entity_id?: string
          event_key?: string
          failure_reason?: string
          id?: string
          recipient_id?: string
          sent_at?: string | null
          status?: string
          template?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assignee: string | null
          business_id: string
          created_at: string
          first_response_at: string | null
          id: string
          message: string
          name: string
          outcome_reason: string
          phone: string
          quotation_sent_at: string | null
          quotation_text: string
          requirement_id: string | null
          response_due_at: string | null
          status: string
        }
        Insert: {
          assignee?: string | null
          business_id: string
          created_at?: string
          first_response_at?: string | null
          id?: string
          message?: string
          name: string
          outcome_reason?: string
          phone: string
          quotation_sent_at?: string | null
          quotation_text?: string
          requirement_id?: string | null
          response_due_at?: string | null
          status?: string
        }
        Update: {
          assignee?: string | null
          business_id?: string
          created_at?: string
          first_response_at?: string | null
          id?: string
          message?: string
          name?: string
          outcome_reason?: string
          phone?: string
          quotation_sent_at?: string | null
          quotation_text?: string
          requirement_id?: string | null
          response_due_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "buy_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_change_requests: {
        Row: {
          before_data: Json
          business_id: string
          created_at: string
          feedback: string
          id: string
          proposed_data: Json
          requester_id: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          before_data: Json
          business_id: string
          created_at?: string
          feedback?: string
          id?: string
          proposed_data: Json
          requester_id: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          before_data?: Json
          business_id?: string
          created_at?: string
          feedback?: string
          id?: string
          proposed_data?: Json
          requester_id?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_change_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_offers: {
        Row: {
          approved: boolean
          business_id: string
          city: string
          eligibility: string
          ends_at: string
          id: string
          locality: string
          redemption_mode: string
          starts_at: string
          status: string
          terms: string
          title: string
          usage_limit: number
        }
        Insert: {
          approved?: boolean
          business_id: string
          city: string
          eligibility: string
          ends_at: string
          id?: string
          locality?: string
          redemption_mode?: string
          starts_at: string
          status?: string
          terms: string
          title: string
          usage_limit?: number
        }
        Update: {
          approved?: boolean
          business_id?: string
          city?: string
          eligibility?: string
          ends_at?: string
          id?: string
          locality?: string
          redemption_mode?: string
          starts_at?: string
          status?: string
          terms?: string
          title?: string
          usage_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "merchant_offers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          email_consent: boolean
          in_app: boolean
          sms_consent: boolean
          updated_at: string
          user_id: string
          whatsapp_consent: boolean
        }
        Insert: {
          email_consent?: boolean
          in_app?: boolean
          sms_consent?: boolean
          updated_at?: string
          user_id: string
          whatsapp_consent?: boolean
        }
        Update: {
          email_consent?: boolean
          in_app?: boolean
          sms_consent?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_consent?: boolean
        }
        Relationships: []
      }
      offer_redemptions: {
        Row: {
          created_at: string
          id: string
          offer_id: string
          reason: string
          recorded_by: string
          reference: string
        }
        Insert: {
          created_at?: string
          id?: string
          offer_id: string
          reason: string
          recorded_by: string
          reference: string
        }
        Update: {
          created_at?: string
          id?: string
          offer_id?: string
          reason?: string
          recorded_by?: string
          reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_redemptions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "merchant_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offering_revisions: {
        Row: {
          actor_id: string | null
          after_data: Json
          before_data: Json | null
          created_at: string
          id: string
          offering_id: string
        }
        Insert: {
          actor_id?: string | null
          after_data: Json
          before_data?: Json | null
          created_at?: string
          id?: string
          offering_id: string
        }
        Update: {
          actor_id?: string | null
          after_data?: Json
          before_data?: Json | null
          created_at?: string
          id?: string
          offering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offering_revisions_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "business_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_events: {
        Row: {
          created_at: string
          event_key: string
          id: string
          kind: string
          lead_id: string | null
          placement_id: string
        }
        Insert: {
          created_at?: string
          event_key: string
          id?: string
          kind: string
          lead_id?: string | null
          placement_id: string
        }
        Update: {
          created_at?: string
          event_key?: string
          id?: string
          kind?: string
          lead_id?: string | null
          placement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placement_events_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "sponsored_placements"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_definitions: {
        Row: {
          active: boolean
          currency: string
          entitlements: Json
          id: string
          key: string
          name: string
          period_days: number
          price_minor: number
        }
        Insert: {
          active?: boolean
          currency?: string
          entitlements?: Json
          id?: string
          key: string
          name: string
          period_days?: number
          price_minor?: number
        }
        Update: {
          active?: boolean
          currency?: string
          entitlements?: Json
          id?: string
          key?: string
          name?: string
          period_days?: number
          price_minor?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      review_reports: {
        Row: {
          appeal: string
          created_at: string
          decided_at: string | null
          decision_reason: string
          evidence: string
          id: string
          reason: string
          reporter_id: string
          review_id: string
          reviewer_id: string | null
          status: string
        }
        Insert: {
          appeal?: string
          created_at?: string
          decided_at?: string | null
          decision_reason?: string
          evidence?: string
          id?: string
          reason: string
          reporter_id: string
          review_id: string
          reviewer_id?: string | null
          status?: string
        }
        Update: {
          appeal?: string
          created_at?: string
          decided_at?: string | null
          decision_reason?: string
          evidence?: string
          id?: string
          reason?: string
          reporter_id?: string
          review_id?: string
          reviewer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string
          created_at: string
          id: string
          moderation_reason: string
          name: string
          owner_reply: string | null
          rating: number
          status: string
          text: string
          user_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          moderation_reason?: string
          name: string
          owner_reply?: string | null
          rating: number
          status?: string
          text: string
          user_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          moderation_reason?: string
          name?: string
          owner_reply?: string | null
          rating?: number
          status?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          draft: Json
          id: string
          key: string
          kind: string
          published: Json | null
          published_at: string | null
          revision: number
          updated_at: string
        }
        Insert: {
          draft?: Json
          id?: string
          key: string
          kind: string
          published?: Json | null
          published_at?: string | null
          revision?: number
          updated_at?: string
        }
        Update: {
          draft?: Json
          id?: string
          key?: string
          kind?: string
          published?: Json | null
          published_at?: string | null
          revision?: number
          updated_at?: string
        }
        Relationships: []
      }
      sponsored_placements: {
        Row: {
          approved: boolean
          budget_minor: number
          business_id: string
          category: string
          city: string
          created_at: string
          creative: string
          ends_at: string
          id: string
          placement: string
          starts_at: string
          status: string
          terms: string
        }
        Insert: {
          approved?: boolean
          budget_minor?: number
          business_id: string
          category?: string
          city: string
          created_at?: string
          creative: string
          ends_at: string
          id?: string
          placement: string
          starts_at: string
          status: string
          terms: string
        }
        Update: {
          approved?: boolean
          budget_minor?: number
          business_id?: string
          category?: string
          city?: string
          created_at?: string
          creative?: string
          ends_at?: string
          id?: string
          placement?: string
          starts_at?: string
          status?: string
          terms?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_placements_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_assignments: {
        Row: {
          category: string | null
          city: string | null
          created_at: string
          granted_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string
          granted_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          actor_id: string | null
          body: string
          created_at: string
          id: string
          kind: string
          ticket_id: string
        }
        Insert: {
          actor_id?: string | null
          body: string
          created_at?: string
          id?: string
          kind: string
          ticket_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string
          created_at?: string
          id?: string
          kind?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assignee: string | null
          business_id: string | null
          claim_id: string | null
          created_at: string
          description: string
          escalated_at: string | null
          id: string
          lead_id: string | null
          payment_reference: string
          priority: string
          reference: string
          requester_email: string
          requester_id: string | null
          requester_name: string
          resolution_reason: string
          response_due_at: string | null
          status: string
          topic: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          business_id?: string | null
          claim_id?: string | null
          created_at?: string
          description: string
          escalated_at?: string | null
          id?: string
          lead_id?: string | null
          payment_reference?: string
          priority?: string
          reference?: string
          requester_email: string
          requester_id?: string | null
          requester_name: string
          resolution_reason?: string
          response_due_at?: string | null
          status?: string
          topic: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          business_id?: string | null
          claim_id?: string | null
          created_at?: string
          description?: string
          escalated_at?: string | null
          id?: string
          lead_id?: string | null
          payment_reference?: string
          priority?: string
          reference?: string
          requester_email?: string
          requester_id?: string | null
          requester_name?: string
          resolution_reason?: string
          response_due_at?: string | null
          status?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "business_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_claim_evidence: {
        Args: { claim_id: string; paths: string[] }
        Returns: undefined
      }
      appeal_review_report: {
        Args: { appeal_text: string; report_id: string }
        Returns: undefined
      }
      apply_directory_import: {
        Args: { batch_id: string; reverse_batch: boolean }
        Returns: undefined
      }
      assign_requirement: {
        Args: { bid: string; deadline: string; rid: string; staff_id: string }
        Returns: string
      }
      change_listing_trust: {
        Args: { bid: string; decision_reason: string; patch: Json }
        Returns: undefined
      }
      commerce_action: {
        Args: { decision_reason: string; kind: string; payload: Json }
        Returns: string
      }
      content_permission: { Args: never; Returns: boolean }
      create_buy_requirement: { Args: { payload: Json }; Returns: string }
      create_support_ticket: { Args: { payload: Json }; Returns: Json }
      decide_claim: {
        Args: {
          claim_id: string
          contact_checks: string[]
          decision_reason: string
          expiry?: string
          next_state: string
        }
        Returns: undefined
      }
      decide_review_report: {
        Args: { decision_reason: string; report_id: string; uphold: boolean }
        Returns: undefined
      }
      effective_business_plan: { Args: { bid: string }; Returns: Json }
      has_permission: {
        Args: { bid?: string; permission: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: never; Returns: boolean }
      lead_operations_action: {
        Args: { lid: string; payload: Json }
        Returns: undefined
      }
      merge_directory_businesses: {
        Args: { reason: string; source_id: string; target_id: string }
        Returns: undefined
      }
      moderate_review: {
        Args: { decision_reason: string; hide: boolean; review_id: string }
        Returns: undefined
      }
      obvious_placeholder: { Args: { t: string }; Returns: boolean }
      operations_records: {
        Args: { filters: Json; page_number?: number; queue_key: string }
        Returns: Json
      }
      operations_summary: {
        Args: { filters: Json; owner_only?: boolean }
        Returns: Json
      }
      ops_permission: {
        Args: { bid?: string; permission: string }
        Returns: boolean
      }
      process_in_app_notification: {
        Args: { mark_read?: boolean; nid: string }
        Returns: string
      }
      public_content: {
        Args: never
        Returns: {
          key: string
          kind: string
          payload: Json
          updated_at: string
        }[]
      }
      public_placements: {
        Args: {
          selected_category?: string
          selected_city: string
          selected_placement?: string
        }
        Returns: {
          business_id: string
          creative: string
          id: string
        }[]
      }
      public_verification: {
        Args: { bid: string }
        Returns: {
          checked_at: string
          expires_at: string
          scope: string
          summary: string
        }[]
      }
      queue_in_app: {
        Args: {
          bid: string
          entity: string
          event_key_value: string
          recipient: string
          template_value: string
          title_value: string
        }
        Returns: undefined
      }
      record_business_verification: {
        Args: {
          bid: string
          checked_scope: string
          decision_reason: string
          evidence_ref: string
          expiry?: string
          revoke_id?: string
          summary: string
        }
        Returns: undefined
      }
      record_directory_event: { Args: { payload: Json }; Returns: undefined }
      record_placement_event: {
        Args: { ek: string; event_kind: string; pid: string }
        Returns: undefined
      }
      resolve_site_redirect: { Args: { path: string }; Returns: string }
      review_listing_change: {
        Args: { approve: boolean; feedback_text: string; request_id: string }
        Returns: undefined
      }
      save_site_content: {
        Args: {
          decision_reason?: string
          payload: Json
          publish_content?: boolean
        }
        Returns: string
      }
      set_staff_assignment: {
        Args: {
          decision_reason: string
          remove_role: boolean
          scope_category: string
          scope_city: string
          staff_role: string
          target_user: string
        }
        Returns: undefined
      }
      support_ticket_action: {
        Args: { action_payload: Json; ticket: string }
        Returns: undefined
      }
      unpublish_site_content: {
        Args: { cid: string; decision_reason: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "business_owner" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "business_owner", "user"],
    },
  },
} as const
