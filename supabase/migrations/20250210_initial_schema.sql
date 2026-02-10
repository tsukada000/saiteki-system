-- サイテキシステム - 初期スキーマ作成
-- フェーズ1 MVP用テーブル

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. カートマスタ
-- ============================================
CREATE TABLE cart_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_name VARCHAR(100) NOT NULL UNIQUE,
    has_project_info_in_csv BOOLEAN DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE cart_master IS 'ECカートシステムの種類を管理';
COMMENT ON COLUMN cart_master.has_project_info_in_csv IS '商品登録CSVに案件情報が含まれるか';

-- 初期データ投入
INSERT INTO cart_master (cart_name, has_project_info_in_csv, remarks) VALUES
('サイテキカート', true, NULL),
('ネルケオンラインショップ', true, NULL),
('BASE', false, NULL),
('カラーミー', false, NULL),
('STORES', false, NULL);

-- ============================================
-- 2. ECサイトマスタ
-- ============================================
CREATE TABLE ec_site_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ec_site_name VARCHAR(100) NOT NULL,
    cart_id UUID NOT NULL REFERENCES cart_master(id) ON DELETE CASCADE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE ec_site_master IS 'ECサイトを管理（同じカートでも複数サイトに分かれる場合あり）';

CREATE INDEX idx_ec_site_cart ON ec_site_master(cart_id);

-- ============================================
-- 3. WMSマスタ
-- ============================================
CREATE TABLE wms_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wms_name VARCHAR(100) NOT NULL UNIQUE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE wms_master IS '倉庫管理システム（WMS）を管理';

-- ============================================
-- 4. 倉庫マスタ
-- ============================================
CREATE TABLE warehouse_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_name VARCHAR(100) NOT NULL UNIQUE,
    wms_id UUID NOT NULL REFERENCES wms_master(id) ON DELETE CASCADE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE warehouse_master IS '物理的な倉庫を管理';

CREATE INDEX idx_warehouse_wms ON warehouse_master(wms_id);

-- ============================================
-- 5. 請求区分マスタ
-- ============================================
CREATE TABLE billing_category_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE billing_category_master IS '請求の区分を管理';

-- ============================================
-- 6. クライアントマスタ
-- ============================================
CREATE TABLE client_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    postal_code VARCHAR(10),
    address1 VARCHAR(200),
    address2 VARCHAR(200),
    bank_name VARCHAR(100),
    branch_name VARCHAR(100),
    account_type VARCHAR(20),
    account_number VARCHAR(20),
    account_holder VARCHAR(100),
    storage_fee DECIMAL(10,2) DEFAULT 0,
    operation_fixed_cost DECIMAL(10,2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE client_master IS 'クライアント企業の基本情報を管理';

-- クライアント番号の自動採番用シーケンス
CREATE SEQUENCE client_number_seq START WITH 1000;

-- クライアント番号自動生成関数
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.client_number IS NULL OR NEW.client_number = '' THEN
        NEW.client_number := 'CL' || LPAD(nextval('client_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER trigger_generate_client_number
    BEFORE INSERT ON client_master
    FOR EACH ROW
    EXECUTE FUNCTION generate_client_number();

-- ============================================
-- 7. クライアント担当者
-- ============================================
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES client_master(id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(20),
    send_invoice BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE client_contacts IS 'クライアントの担当者情報（複数登録可能）';

CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);

-- ============================================
-- 8. 案件マスタ
-- ============================================
CREATE TABLE project_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_number VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    client_id UUID NOT NULL REFERENCES client_master(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    sales_commission_rate DECIMAL(5,2) DEFAULT 0,
    warehouse_id UUID REFERENCES warehouse_master(id),
    billing_category_id UUID REFERENCES billing_category_master(id),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE project_master IS '販売案件の基本情報を管理';

-- 案件番号の自動採番用シーケンス
CREATE SEQUENCE project_number_seq START WITH 1000;

-- 案件番号自動生成関数
CREATE OR REPLACE FUNCTION generate_project_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.project_number IS NULL OR NEW.project_number = '' THEN
        NEW.project_number := 'PJ' || LPAD(nextval('project_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER trigger_generate_project_number
    BEFORE INSERT ON project_master
    FOR EACH ROW
    EXECUTE FUNCTION generate_project_number();

CREATE INDEX idx_project_client ON project_master(client_id);
CREATE INDEX idx_project_warehouse ON project_master(warehouse_id);

-- ============================================
-- 9. 商品CSVマスタ
-- ============================================
CREATE TABLE product_csv_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID UNIQUE NOT NULL REFERENCES cart_master(id) ON DELETE CASCADE,
    project_name_column VARCHAR(10),
    category_column VARCHAR(10),
    product_code_column VARCHAR(10) NOT NULL,
    product_name_column VARCHAR(10),
    variation_column VARCHAR(10),
    unit_price_column VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE product_csv_master IS 'カートごとの商品CSVフォーマット定義';

-- ============================================
-- 10. 商品マスタ
-- ============================================
CREATE TABLE product_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ec_site_id UUID NOT NULL REFERENCES ec_site_master(id) ON DELETE CASCADE,
    project_id UUID REFERENCES project_master(id),
    category VARCHAR(100),
    product_code VARCHAR(100) NOT NULL,
    product_name VARCHAR(200),
    variation VARCHAR(200),
    unit_price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    UNIQUE(ec_site_id, product_code)
);

COMMENT ON TABLE product_master IS '商品の基本情報を管理';

CREATE INDEX idx_product_ec_site ON product_master(ec_site_id);
CREATE INDEX idx_product_project ON product_master(project_id);
CREATE INDEX idx_product_code ON product_master(product_code);

-- ============================================
-- 11. WMS CSVマスタ
-- ============================================
CREATE TABLE wms_csv_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wms_id UUID UNIQUE NOT NULL REFERENCES wms_master(id) ON DELETE CASCADE,
    order_number_column VARCHAR(10) NOT NULL,
    product_code_column VARCHAR(10) NOT NULL,
    shipment_quantity_column VARCHAR(10) NOT NULL,
    unit_price_column VARCHAR(10) NOT NULL,
    shipment_date_column VARCHAR(10) NOT NULL,
    shipping_fee_column VARCHAR(10),
    shipping_fee_target VARCHAR(50),
    payment_fee_column VARCHAR(10),
    payment_fee_target VARCHAR(50),
    cod_fee_column VARCHAR(10),
    cod_fee_target VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE wms_csv_master IS 'WMSごとの出荷実績CSVフォーマット定義';
COMMENT ON COLUMN wms_csv_master.shipping_fee_target IS '対象項目名（＊=受注番号毎に最初の1件のみ有効）';
COMMENT ON COLUMN wms_csv_master.payment_fee_target IS '対象項目名（＊=受注番号毎に最初の1件のみ有効）';
COMMENT ON COLUMN wms_csv_master.cod_fee_target IS '対象項目名（＊=受注番号毎に最初の1件のみ有効）';

-- ============================================
-- 12. 出荷実績データ
-- ============================================
CREATE TABLE shipment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouse_master(id) ON DELETE CASCADE,
    order_number VARCHAR(100) NOT NULL,
    product_code VARCHAR(100),
    purchase_quantity INTEGER DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    cod_fee DECIMAL(10,2) DEFAULT 0,
    payment_fee DECIMAL(10,2) DEFAULT 0,
    shipment_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

COMMENT ON TABLE shipment_records IS 'WMSから取り込んだ出荷実績を管理';
COMMENT ON COLUMN shipment_records.product_code IS '商品コード（手数料の場合はNULL）';

CREATE INDEX idx_shipment_warehouse_date ON shipment_records(warehouse_id, shipment_date);
CREATE INDEX idx_shipment_order ON shipment_records(order_number);

-- ============================================
-- updated_atの自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにupdated_at更新トリガーを設定
CREATE TRIGGER update_cart_master_updated_at BEFORE UPDATE ON cart_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ec_site_master_updated_at BEFORE UPDATE ON ec_site_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wms_master_updated_at BEFORE UPDATE ON wms_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_master_updated_at BEFORE UPDATE ON warehouse_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_category_master_updated_at BEFORE UPDATE ON billing_category_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_master_updated_at BEFORE UPDATE ON client_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_contacts_updated_at BEFORE UPDATE ON client_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_master_updated_at BEFORE UPDATE ON project_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_csv_master_updated_at BEFORE UPDATE ON product_csv_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_master_updated_at BEFORE UPDATE ON product_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wms_csv_master_updated_at BEFORE UPDATE ON wms_csv_master FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipment_records_updated_at BEFORE UPDATE ON shipment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) の設定
-- ============================================
-- 後続フェーズで認証実装時に有効化
-- 現在はすべてのユーザーが全データにアクセス可能（開発用）

-- ALTER TABLE cart_master ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ec_site_master ENABLE ROW LEVEL SECURITY;
-- etc...
