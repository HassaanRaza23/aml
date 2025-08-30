--Main Onboarding form

-- Customer Table
create table public.customers (
  id uuid not null default extensions.uuid_generate_v4 (),
  core_system_id character varying(50) null,
  customer_type character varying(20) not null,
  email character varying(255) null,
  phone character varying(50) null,
  channel character varying(50) null,
  transaction_product character varying(100) null,
  risk_score integer null default 0,
  risk_level character varying(20) null default 'Low'::character varying,
  kyc_status character varying(20) null default 'Pending'::character varying,
  kyc_remarks text null,
  due_diligence_level character varying(20) null default 'Standard'::character varying,
  status character varying(20) null default 'Active'::character varying,
  created_by uuid null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  updated_by uuid null,
  transaction_amount_limit numeric(15, 2) null,
  transaction_limit numeric(15, 2) null,
  constraint customers_pkey primary key (id),
  constraint customers_core_system_id_key unique (core_system_id),
  constraint customers_created_by_fkey foreign KEY (created_by) references users (id),
  constraint customers_updated_by_fkey foreign KEY (updated_by) references users (id)
) TABLESPACE pg_default;

create index IF not exists idx_customers_core_system_id on public.customers using btree (core_system_id) TABLESPACE pg_default;

create index IF not exists idx_customers_risk_level on public.customers using btree (risk_level) TABLESPACE pg_default;

create index IF not exists idx_customers_kyc_status on public.customers using btree (kyc_status) TABLESPACE pg_default;

create index IF not exists idx_customers_status on public.customers using btree (status) TABLESPACE pg_default;

create index IF not exists idx_customers_created_at on public.customers using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_customers_updated_by on public.customers using btree (updated_by) TABLESPACE pg_default;

create index IF not exists idx_customers_transaction_amount_limit on public.customers using btree (transaction_amount_limit) TABLESPACE pg_default;

create index IF not exists idx_customers_transaction_limit on public.customers using btree (transaction_limit) TABLESPACE pg_default;

create trigger audit_customers_trigger
after INSERT
or DELETE
or
update on customers for EACH row
execute FUNCTION audit_log_trigger ();


-- Natural Person Details Table
create table public.natural_person_details (
  customer_id uuid not null,
  profession character varying(100) null,
  firstname character varying(100) null,
  lastname character varying(100) null,
  alias character varying(100) null,
  dateofbirth date null,
  nationality character varying(3) null,
  residencystatus character varying(50) null,
  idtype character varying(50) null,
  idnumber character varying(100) null,
  issuedate date null,
  expirydate date null,
  isdualnationality boolean null default false,
  dualnationality character varying(3) null,
  dualpassportnumber character varying(100) null,
  dualpassportissuedate date null,
  dualpassportexpirydate date null,
  countryofbirth character varying(3) null,
  address text null,
  city character varying(100) null,
  occupation character varying(100) null,
  sourceofwealth character varying(100) null,
  pep character varying(10) null,
  sourceoffunds character varying(100) null,
  pobox character varying(50) null,
  gender character varying(10) null,
  employer character varying(100) null,
  constraint natural_person_details_pkey primary key (customer_id),
  constraint natural_person_details_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_natural_person_first_name on public.natural_person_details using btree (firstname) TABLESPACE pg_default;

create index IF not exists idx_natural_person_last_name on public.natural_person_details using btree (lastname) TABLESPACE pg_default;

create index IF not exists idx_natural_person_nationality on public.natural_person_details using btree (nationality) TABLESPACE pg_default;


-- Legal Entity Details Table
create table public.legal_entity_details (
  customer_id uuid not null,
  businessactivity text null,
  legalname character varying(255) null,
  alias character varying(100) null,
  dateofincorporation date null,
  countryofincorporation character varying(3) null,
  licensetype character varying(100) null,
  licensenumber character varying(100) null,
  licenseissuedate date null,
  licenseexpirydate date null,
  registeredofficeaddress text null,
  city character varying(100) null,
  countriessourceoffunds text null,
  managementcompany character varying(255) null,
  countriesofoperation text null,
  jurisdiction character varying(100) null,
  sourceoffunds character varying(100) null,
  residencystatus character varying(50) null,
  licensingauthority text null,
  trn character varying(100) null,
  licensecategory text null,
  addressexpirydate date null,
  constraint legal_entity_details_pkey primary key (customer_id),
  constraint legal_entity_details_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_legal_entity_legal_name on public.legal_entity_details using btree (legalname) TABLESPACE pg_default;

create index IF not exists idx_legal_entity_license_number on public.legal_entity_details using btree (licensenumber) TABLESPACE pg_default;

create index IF not exists idx_legal_entity_trn on public.legal_entity_details using btree (trn) TABLESPACE pg_default;

--Expandable Sections


-- Expandable Section 1
-- Shareholders Table
create table public.customer_shareholders (
  id uuid not null default extensions.uuid_generate_v4 (),
  customer_id uuid null,
  entity_type character varying(20) not null,
  shareholding_percentage numeric(5, 2) null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint customer_shareholders_pkey primary key (id),
  constraint customer_shareholders_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_customer_shareholders_customer_id on public.customer_shareholders using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_customer_shareholders_entity_type on public.customer_shareholders using btree (entity_type) TABLESPACE pg_default;


-- Shareholders Natural Person Details Table
create table public.shareholder_natural_person_details (
  id uuid not null default extensions.uuid_generate_v4 (),
  shareholder_id uuid not null,
  full_name character varying(255) null,
  alias character varying(100) null,
  country_of_residence character varying(3) null,
  nationality character varying(3) null,
  date_of_birth date null,
  place_of_birth character varying(3) null,
  phone character varying(50) null,
  email character varying(255) null,
  address text null,
  source_of_funds character varying(100) null,
  source_of_wealth character varying(100) null,
  occupation character varying(100) null,
  expected_income_range character varying(100) null,
  pep_status character varying(10) null,
  dual_nationality character varying(3) null,
  is_director boolean null default false,
  is_ubo boolean null default false,
  constraint shareholder_natural_person_details_pkey primary key (id),
  constraint fk_natural_person_shareholder foreign KEY (shareholder_id) references customer_shareholders (id) on delete CASCADE
) TABLESPACE pg_default;


-- Shareholders Legal Entity Details Table
create table public.shareholder_legal_entity_details (
  id uuid not null default extensions.uuid_generate_v4 (),
  shareholder_id uuid not null,
  legal_name character varying(255) null,
  alias character varying(100) null,
  date_of_incorporation date null,
  country_of_incorporation character varying(3) null,
  entity_class character varying(100) null,
  license_type character varying(100) null,
  license_number character varying(100) null,
  license_issue_date date null,
  license_expiry_date date null,
  business_activity text null,
  countries_of_operation text null,
  countries_source_of_funds text null,
  registered_office_address text null,
  email character varying(255) null,
  phone character varying(50) null,
  other_details text null,
  source_of_funds character varying(100) null,
  constraint shareholder_legal_entity_details_pkey primary key (id),
  constraint fk_legal_entity_shareholder foreign KEY (shareholder_id) references customer_shareholders (id) on delete CASCADE
) TABLESPACE pg_default;


-- Shareholders Trust details Table
create table public.shareholder_trust_details (
  id uuid not null default extensions.uuid_generate_v4 (),
  shareholder_id uuid not null,
  trust_name character varying(255) null,
  alias character varying(100) null,
  trust_registered boolean null,
  trust_type character varying(100) null,
  jurisdiction_of_law character varying(3) null,
  registered_address text null,
  trustee_name character varying(255) null,
  trustee_type character varying(100) null,
  constraint shareholder_trust_details_pkey primary key (id),
  constraint fk_trust_shareholder foreign KEY (shareholder_id) references customer_shareholders (id) on delete CASCADE
) TABLESPACE pg_default;


-- Expandable Section 2
-- Directors Table
create table public.customer_directors (
  id uuid not null default extensions.uuid_generate_v4 (),
  customer_id uuid null,
  first_name character varying(100) null,
  alias character varying(100) null,
  last_name character varying(100) null,
  country_of_residence character varying(3) null,
  nationality character varying(3) null,
  date_of_birth date null,
  phone character varying(50) null,
  place_of_birth character varying(3) null,
  email character varying(255) null,
  address text null,
  city character varying(100) null,
  occupation character varying(100) null,
  pep_status character varying(10) null,
  is_ceo boolean null default false,
  is_representative boolean null default false,
  dual_nationality character varying(3) null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint customer_directors_pkey primary key (id),
  constraint customer_directors_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_customer_directors_customer_id on public.customer_directors using btree (customer_id) TABLESPACE pg_default;


-- Expandable Section 3
-- Bank Details Table
create table public.customer_bank_details (
  id uuid not null default extensions.uuid_generate_v4 (),
  customer_id uuid null,
  bank_name character varying(255) null,
  alias character varying(100) null,
  account_type character varying(20) null,
  currency character varying(3) null,
  bank_account_details text null,
  account_number character varying(100) null,
  iban character varying(100) null,
  swift character varying(50) null,
  mode_of_signatory character varying(20) null,
  internet_banking character varying(10) null,
  bank_signatories character varying(50) null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint customer_bank_details_pkey primary key (id),
  constraint customer_bank_details_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_customer_bank_details_customer_id on public.customer_bank_details using btree (customer_id) TABLESPACE pg_default;


-- Expandable Section 4
-- UBOs Table
create table public.customer_ubos (
  id uuid not null default extensions.uuid_generate_v4 (),
  customer_id uuid not null,
  full_name character varying(255) not null,
  alias character varying(255) null,
  country_of_residence character varying(3) null,
  nationality character varying(3) null,
  date_of_birth date null,
  place_of_birth character varying(3) null,
  phone character varying(50) null,
  email character varying(255) null,
  address text null,
  source_of_funds character varying(100) null,
  source_of_wealth character varying(100) null,
  occupation character varying(100) null,
  expected_income character varying(100) null,
  pep character varying(10) null default 'No'::character varying,
  shareholding numeric(5, 2) null,
  dual_nationality character varying(3) null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint customer_ubos_pkey primary key (id),
  constraint customer_ubos_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_customer_ubos_customer_id on public.customer_ubos using btree (customer_id) TABLESPACE pg_default;

create index IF not exists idx_customer_ubos_full_name on public.customer_ubos using btree (full_name) TABLESPACE pg_default;

