// サイテキシステム - データベース型定義
// Supabaseから自動生成される型定義をベースに手動で定義

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cart_master: {
        Row: {
          id: string
          cart_name: string
          has_project_info_in_csv: boolean
          remarks: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          cart_name: string
          has_project_info_in_csv?: boolean
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          cart_name?: string
          has_project_info_in_csv?: boolean
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      ec_site_master: {
        Row: {
          id: string
          ec_site_name: string
          cart_id: string
          remarks: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          ec_site_name: string
          cart_id: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          ec_site_name?: string
          cart_id?: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      wms_master: {
        Row: {
          id: string
          wms_name: string
          remarks: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          wms_name: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          wms_name?: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      warehouse_master: {
        Row: {
          id: string
          warehouse_name: string
          wms_id: string
          remarks: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          warehouse_name: string
          wms_id: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          warehouse_name?: string
          wms_id?: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      billing_category_master: {
        Row: {
          id: string
          category_name: string
          remarks: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          category_name: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          category_name?: string
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      client_master: {
        Row: {
          id: string
          client_number: string
          client_name: string
          is_active: boolean
          postal_code: string | null
          address1: string | null
          address2: string | null
          bank_name: string | null
          branch_name: string | null
          account_type: string | null
          account_number: string | null
          account_holder: string | null
          storage_fee: number
          operation_fixed_cost: number
          remarks: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          client_number?: string
          client_name: string
          is_active?: boolean
          postal_code?: string | null
          address1?: string | null
          address2?: string | null
          bank_name?: string | null
          branch_name?: string | null
          account_type?: string | null
          account_number?: string | null
          account_holder?: string | null
          storage_fee?: number
          operation_fixed_cost?: number
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          client_number?: string
          client_name?: string
          is_active?: boolean
          postal_code?: string | null
          address1?: string | null
          address2?: string | null
          bank_name?: string | null
          branch_name?: string | null
          account_type?: string | null
          account_number?: string | null
          account_holder?: string | null
          storage_fee?: number
          operation_fixed_cost?: number
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      client_contacts: {
        Row: {
          id: string
          client_id: string
          contact_name: string
          email: string | null
          phone_number: string | null
          send_invoice: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          client_id: string
          contact_name: string
          email?: string | null
          phone_number?: string | null
          send_invoice?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          contact_name?: string
          email?: string | null
          phone_number?: string | null
          send_invoice?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      project_master: {
        Row: {
          id: string
          project_number: string
          project_name: string
          client_id: string
          start_date: string | null
          end_date: string | null
          sales_commission_rate: number
          warehouse_id: string | null
          billing_category_id: string | null
          remarks: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          project_number?: string
          project_name: string
          client_id: string
          start_date?: string | null
          end_date?: string | null
          sales_commission_rate?: number
          warehouse_id?: string | null
          billing_category_id?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          project_number?: string
          project_name?: string
          client_id?: string
          start_date?: string | null
          end_date?: string | null
          sales_commission_rate?: number
          warehouse_id?: string | null
          billing_category_id?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      product_csv_master: {
        Row: {
          id: string
          cart_id: string
          project_name_column: string | null
          category_column: string | null
          product_code_column: string
          product_name_column: string | null
          variation_column: string | null
          unit_price_column: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          cart_id: string
          project_name_column?: string | null
          category_column?: string | null
          product_code_column: string
          product_name_column?: string | null
          variation_column?: string | null
          unit_price_column?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          cart_id?: string
          project_name_column?: string | null
          category_column?: string | null
          product_code_column?: string
          product_name_column?: string | null
          variation_column?: string | null
          unit_price_column?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      product_master: {
        Row: {
          id: string
          ec_site_id: string
          project_id: string | null
          category: string | null
          product_code: string
          product_name: string | null
          variation: string | null
          unit_price: number
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          ec_site_id: string
          project_id?: string | null
          category?: string | null
          product_code: string
          product_name?: string | null
          variation?: string | null
          unit_price?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          ec_site_id?: string
          project_id?: string | null
          category?: string | null
          product_code?: string
          product_name?: string | null
          variation?: string | null
          unit_price?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      wms_csv_master: {
        Row: {
          id: string
          wms_id: string
          order_number_column: string
          product_code_column: string
          shipment_quantity_column: string
          unit_price_column: string
          shipment_date_column: string
          shipping_fee_column: string | null
          shipping_fee_target: string | null
          payment_fee_column: string | null
          payment_fee_target: string | null
          cod_fee_column: string | null
          cod_fee_target: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          wms_id: string
          order_number_column: string
          product_code_column: string
          shipment_quantity_column: string
          unit_price_column: string
          shipment_date_column: string
          shipping_fee_column?: string | null
          shipping_fee_target?: string | null
          payment_fee_column?: string | null
          payment_fee_target?: string | null
          cod_fee_column?: string | null
          cod_fee_target?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          wms_id?: string
          order_number_column?: string
          product_code_column?: string
          shipment_quantity_column?: string
          unit_price_column?: string
          shipment_date_column?: string
          shipping_fee_column?: string | null
          shipping_fee_target?: string | null
          payment_fee_column?: string | null
          payment_fee_target?: string | null
          cod_fee_column?: string | null
          cod_fee_target?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      shipment_records: {
        Row: {
          id: string
          warehouse_id: string
          order_number: string
          product_code: string | null
          purchase_quantity: number
          total_amount: number
          shipping_fee: number
          cod_fee: number
          payment_fee: number
          shipment_date: string
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          warehouse_id: string
          order_number: string
          product_code?: string | null
          purchase_quantity?: number
          total_amount?: number
          shipping_fee?: number
          cod_fee?: number
          payment_fee?: number
          shipment_date: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          warehouse_id?: string
          order_number?: string
          product_code?: string | null
          purchase_quantity?: number
          total_amount?: number
          shipping_fee?: number
          cod_fee?: number
          payment_fee?: number
          shipment_date?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
