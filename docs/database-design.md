# データベース設計書

## 概要
サイテキシステム（データ統合とデスク業務自動化）のデータベース設計

## フェーズ1 MVP - テーブル一覧

### 1. cart_master - カートマスタ
ECカートシステムの種類を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | カートID |
| cart_name | VARCHAR(100) | NOT NULL | カート名 |
| has_project_info_in_csv | BOOLEAN | DEFAULT false | 商品登録CSVに案件情報あり |
| remarks | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

**初期データ:**
- サイテキカート
- ネルケオンラインショップ
- BASE
- カラーミー
- STORES

---

### 2. ec_site_master - ECサイトマスタ
ECサイトを管理（同じカートでも複数サイトに分かれる場合あり）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | ECサイトID |
| ec_site_name | VARCHAR(100) | NOT NULL | ECサイト名 |
| cart_id | UUID | FK(cart_master) | カートID |
| remarks | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 3. wms_master - WMSマスタ
倉庫管理システムを管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | WMS ID |
| wms_name | VARCHAR(100) | NOT NULL | WMS名 |
| remarks | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 4. warehouse_master - 倉庫マスタ
物理的な倉庫を管理（WMSと関連付け）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 倉庫ID |
| warehouse_name | VARCHAR(100) | NOT NULL | 倉庫名 |
| wms_id | UUID | FK(wms_master) | WMS ID |
| remarks | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 5. billing_category_master - 請求区分マスタ
請求の区分を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 請求区分ID |
| category_name | VARCHAR(100) | NOT NULL | 請求区分名 |
| remarks | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 6. client_master - クライアントマスタ
クライアント企業の基本情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | クライアントID |
| client_number | VARCHAR(50) | UNIQUE NOT NULL | クライアント番号（自動採番） |
| client_name | VARCHAR(200) | NOT NULL | クライアント名 |
| is_active | BOOLEAN | DEFAULT true | 有効フラグ |
| postal_code | VARCHAR(10) | | 郵便番号 |
| address1 | VARCHAR(200) | | 住所① |
| address2 | VARCHAR(200) | | 住所② |
| bank_name | VARCHAR(100) | | 金融機関名 |
| branch_name | VARCHAR(100) | | 支店名 |
| account_type | VARCHAR(20) | | 口座種別 |
| account_number | VARCHAR(20) | | 口座番号 |
| account_holder | VARCHAR(100) | | 口座名義 |
| storage_fee | DECIMAL(10,2) | DEFAULT 0 | 保管費（税込） |
| operation_fixed_cost | DECIMAL(10,2) | DEFAULT 0 | 運営固定費（税込） |
| remarks | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 7. client_contacts - クライアント担当者
クライアントの担当者情報（複数登録可能）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 担当者ID |
| client_id | UUID | FK(client_master) | クライアントID |
| contact_name | VARCHAR(100) | NOT NULL | 担当者名 |
| email | VARCHAR(100) | | メールアドレス |
| phone_number | VARCHAR(20) | | 電話番号 |
| send_invoice | BOOLEAN | DEFAULT false | 請求書送付フラグ |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 8. project_master - 案件マスタ
販売案件の基本情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 案件ID |
| project_number | VARCHAR(50) | UNIQUE NOT NULL | 案件番号（自動採番） |
| project_name | VARCHAR(200) | NOT NULL | 案件名 |
| client_id | UUID | FK(client_master) | クライアントID |
| start_date | DATE | | 開始日 |
| end_date | DATE | | 終了日 |
| sales_commission_rate | DECIMAL(5,2) | DEFAULT 0 | 販売手数料率（%） |
| warehouse_id | UUID | FK(warehouse_master) | 出荷倉庫ID |
| billing_category_id | UUID | FK(billing_category_master) | 請求区分ID |
| remarks | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 9. product_csv_master - 商品CSVマスタ
カートごとの商品CSVフォーマット定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | ID |
| cart_id | UUID | FK(cart_master) UNIQUE | カートID |
| project_name_column | VARCHAR(10) | | 案件名のCSV列（例: C） |
| category_column | VARCHAR(10) | | カテゴリのCSV列 |
| product_code_column | VARCHAR(10) | NOT NULL | 商品コードのCSV列 |
| product_name_column | VARCHAR(10) | | 商品名のCSV列 |
| variation_column | VARCHAR(10) | | バリエーションのCSV列 |
| unit_price_column | VARCHAR(10) | | 販売単価（税込）のCSV列 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 10. product_master - 商品マスタ
商品の基本情報を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 商品ID |
| ec_site_id | UUID | FK(ec_site_master) | ECサイトID |
| project_id | UUID | FK(project_master) NULL | 案件ID（案件情報がCSVにない場合はNULL） |
| category | VARCHAR(100) | | カテゴリ |
| product_code | VARCHAR(100) | NOT NULL | 商品コード |
| product_name | VARCHAR(200) | | 商品名 |
| variation | VARCHAR(200) | | バリエーション |
| unit_price | DECIMAL(10,2) | DEFAULT 0 | 単価（税込） |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

**ユニーク制約:** (ec_site_id, product_code)

---

### 11. wms_csv_master - WMS CSVマスタ
WMSごとの出荷実績CSVフォーマット定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | ID |
| wms_id | UUID | FK(wms_master) UNIQUE | WMS ID |
| order_number_column | VARCHAR(10) | NOT NULL | 受注番号のCSV列 |
| product_code_column | VARCHAR(10) | NOT NULL | 商品コードのCSV列 |
| shipment_quantity_column | VARCHAR(10) | NOT NULL | 出荷数のCSV列 |
| unit_price_column | VARCHAR(10) | NOT NULL | 販売単価のCSV列 |
| shipment_date_column | VARCHAR(10) | NOT NULL | 出荷完了日のCSV列 |
| shipping_fee_column | VARCHAR(10) | | 送料のCSV列 |
| shipping_fee_target | VARCHAR(50) | | 送料の対象項目名（＊=最初の1件のみ） |
| payment_fee_column | VARCHAR(10) | | コンビニ決済手数料のCSV列 |
| payment_fee_target | VARCHAR(50) | | 決済手数料の対象項目名 |
| cod_fee_column | VARCHAR(10) | | 引取手数料のCSV列 |
| cod_fee_target | VARCHAR(50) | | 引取手数料の対象項目名 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

---

### 12. shipment_records - 出荷実績データ
WMSから取り込んだ出荷実績を管理

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PK | 出荷実績ID |
| warehouse_id | UUID | FK(warehouse_master) | 倉庫ID |
| order_number | VARCHAR(100) | NOT NULL | 受注番号 |
| product_code | VARCHAR(100) | | 商品コード（手数料の場合はNULL） |
| purchase_quantity | INTEGER | DEFAULT 0 | 購入点数 |
| total_amount | DECIMAL(10,2) | DEFAULT 0 | 商品合計金額 |
| shipping_fee | DECIMAL(10,2) | DEFAULT 0 | 送料 |
| cod_fee | DECIMAL(10,2) | DEFAULT 0 | 引取手数料 |
| payment_fee | DECIMAL(10,2) | DEFAULT 0 | コンビニ決済手数料 |
| shipment_date | DATE | NOT NULL | 出荷完了日 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |
| created_by | VARCHAR(100) | | 作成者 |
| updated_by | VARCHAR(100) | | 更新者 |

**インデックス:** (warehouse_id, shipment_date), (order_number)

---

## ER図の関係性

```
cart_master (1) ----< (N) ec_site_master
cart_master (1) ----< (1) product_csv_master

wms_master (1) ----< (N) warehouse_master
wms_master (1) ----< (1) wms_csv_master

client_master (1) ----< (N) client_contacts
client_master (1) ----< (N) project_master

project_master (N) >---- (1) warehouse_master
project_master (N) >---- (1) billing_category_master
project_master (1) ----< (N) product_master

ec_site_master (1) ----< (N) product_master

warehouse_master (1) ----< (N) shipment_records
```

---

## 今後の拡張（フェーズ2以降）

- 売上データ管理テーブル群
- 請求書関連テーブル群
- イレギュラー請求テーブル
- 在庫管理テーブル群
- 入荷・出荷管理テーブル群
- ユーザー権限管理テーブル群
