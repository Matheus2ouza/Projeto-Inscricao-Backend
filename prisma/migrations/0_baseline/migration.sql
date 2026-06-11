-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "InscriptionMode" AS ENUM ('NORMAL', 'GUEST');

-- CreateEnum
CREATE TYPE "CashRegisterStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CashEntryType" AS ENUM ('INCOME', 'EXPENSE', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "CashEntryOrigin" AS ENUM ('ASAAS', 'INTERNAL', 'ONSITE', 'EXPENSE', 'TICKET', 'TRANSFER', 'MANUAL');

-- CreateEnum
CREATE TYPE "InscriptionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'PAID', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TicketSaleStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "roleType" AS ENUM ('USER', 'MANAGER', 'ADMIN', 'SUPER');

-- CreateEnum
CREATE TYPE "statusEvent" AS ENUM ('OPEN', 'CLOSE', 'FINALIZED');

-- CreateEnum
CREATE TYPE "genderType" AS ENUM ('MASCULINO', 'FEMININO');

-- CreateEnum
CREATE TYPE "StatusPayment" AS ENUM ('APPROVED', 'UNDER_REVIEW', 'PENDING', 'REFUSED');

-- CreateEnum
CREATE TYPE "CategoryExpense" AS ENUM ('BRINDES', 'COZINHA', 'DECORACAO', 'DECORACAO_ESTACAO', 'DECORACAO_COMPERADORES', 'MIDIA', 'SOM', 'MANUTENCAO', 'SEGURANCA', 'OUTROS');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('DINHEIRO', 'PIX', 'CARTAO');

-- CreateEnum
CREATE TYPE "ShirtSize" AS ENUM ('PP', 'P', 'M', 'G', 'GG', 'XG');

-- CreateEnum
CREATE TYPE "ShirtType" AS ENUM ('TRADICIONAL', 'BABYLOOK');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "roleType" NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "regionId" TEXT,
    "email" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_participants" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" "genderType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "preferred_name" TEXT,
    "shirt_size" "ShirtSize",
    "shirt_type" "ShirtType",
    "cpf" TEXT,

    CONSTRAINT "account_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_participant_in_event" (
    "id" TEXT NOT NULL,
    "account_participant_id" TEXT NOT NULL,
    "inscription_id" TEXT NOT NULL,
    "type_inscription_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_participant_in_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "outstanding_balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regionId" TEXT NOT NULL,
    "amount_collected" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "image_url" TEXT,
    "quantity_participants" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "statusEvent" NOT NULL,
    "payment_enabled" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" TEXT,
    "ticket_enabled" BOOLEAN NOT NULL DEFAULT false,
    "allow_card" BOOLEAN NOT NULL DEFAULT false,
    "amount_spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "amount_net_value_collected" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "allowed_inscription_modes" "InscriptionMode"[] DEFAULT ARRAY['NORMAL']::"InscriptionMode"[],

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_responsibles" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,

    CONSTRAINT "event_responsibles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_inscriptions" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "event_id" TEXT NOT NULL,
    "special_type" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rule" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "participant_limit" INTEGER NOT NULL,
    "limit_is_strict" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "type_inscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscriptions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT,
    "event_id" TEXT NOT NULL,
    "totalValue" DECIMAL(10,2) NOT NULL,
    "status" "InscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "email" TEXT,
    "total_paid" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "accessToken" TEXT,
    "confirmationCode" TEXT,
    "guestEmail" TEXT,
    "guestName" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "guestLocality" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "observation" TEXT,
    "exclusive_link_id" TEXT,

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exclusive_inscription_links" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exclusive_inscription_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exclusive_inscription_link_types" (
    "id" TEXT NOT NULL,
    "exclusive_link_id" TEXT NOT NULL,
    "type_inscription_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exclusive_inscription_link_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "inscription_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "type_inscription_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gender" "genderType" NOT NULL,
    "preferred_name" TEXT,
    "shirt_size" "ShirtSize",
    "shirt_type" "ShirtType",
    "cpf" TEXT,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "on_site_registrations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "phone" TEXT,
    "status" "InscriptionStatus" NOT NULL DEFAULT 'PAID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "responsible" TEXT NOT NULL,
    "totalValue" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "on_site_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "on_site_participants" (
    "id" TEXT NOT NULL,
    "on_site_registration_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "genderType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "on_site_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "on_site_participant_payments" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "on_site_participant_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "account_id" TEXT,
    "status" "StatusPayment" NOT NULL,
    "totalValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "approvedBy" TEXT,
    "method_payment" "PaymentMethod" NOT NULL DEFAULT 'PIX',
    "asaas_checkout_id" TEXT,
    "external_reference" TEXT,
    "installment" INTEGER DEFAULT 1,
    "totalPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalNetValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paid_installments" INTEGER DEFAULT 0,
    "accessToken" TEXT,
    "guestEmail" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "guestName" TEXT,
    "totalReceived" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "rejection_reason" TEXT,
    "payment_link_id" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_link" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "asaas_payment_link_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "end_date_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_installments" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "asaas_payment_id" TEXT,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "net_value" DECIMAL(10,2) NOT NULL,
    "financial_movement_id" TEXT,
    "estimated_at" TIMESTAMP(3) NOT NULL,
    "received" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payment_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "inscription_id" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_movement" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "account_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "guestEmail" TEXT,
    "inscription_id" TEXT,

    CONSTRAINT "financial_movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tickets" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "available" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "event_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_sales" (
    "id" TEXT NOT NULL,
    "totalValue" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "status" "TicketSaleStatus" NOT NULL DEFAULT 'PENDING',
    "event_id" TEXT NOT NULL,
    "approved_by" TEXT,

    CONSTRAINT "ticket_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_sale_payments" (
    "id" TEXT NOT NULL,
    "ticket_sale_id" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "financialMovementId" TEXT,
    "image_url" TEXT,

    CONSTRAINT "ticket_sale_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_sale_items" (
    "id" TEXT NOT NULL,
    "ticket_sale_id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_value" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_units" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticket_sale_item_id" TEXT NOT NULL,

    CONSTRAINT "ticket_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_expenses" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "responsible" TEXT NOT NULL,
    "category" "CategoryExpense" NOT NULL DEFAULT 'OUTROS',
    "image_urls" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_registers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,
    "status" "CashRegisterStatus" NOT NULL DEFAULT 'OPEN',
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "initial_balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "cash_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_register_events" (
    "id" TEXT NOT NULL,
    "cash_register_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_register_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_register_entries" (
    "id" TEXT NOT NULL,
    "cash_register_id" TEXT NOT NULL,
    "type" "CashEntryType" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "value" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "event_id" TEXT,
    "payment_installment_id" TEXT,
    "on_site_registration_id" TEXT,
    "transfer_id" TEXT,
    "responsible" TEXT,
    "image_urls" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "event_expense_id" TEXT,
    "origin" "CashEntryOrigin" NOT NULL,
    "ticket_sale_id" TEXT,

    CONSTRAINT "cash_register_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_register_transfers" (
    "id" TEXT NOT NULL,
    "from_cash_id" TEXT NOT NULL,
    "to_cash_id" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "responsible" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_register_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_participants_cpf_key" ON "account_participants"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "account_participant_in_event_account_participant_id_inscrip_key" ON "account_participant_in_event"("account_participant_id", "inscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "regions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "event_responsibles_event_id_account_id_key" ON "event_responsibles"("event_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_accessToken_key" ON "inscriptions"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_confirmationCode_key" ON "inscriptions"("confirmationCode");

-- CreateIndex
CREATE INDEX "inscriptions_guestEmail_idx" ON "inscriptions"("guestEmail");

-- CreateIndex
CREATE INDEX "inscriptions_confirmationCode_idx" ON "inscriptions"("confirmationCode");

-- CreateIndex
CREATE INDEX "inscriptions_accessToken_idx" ON "inscriptions"("accessToken");

-- CreateIndex
CREATE INDEX "inscriptions_expires_at_idx" ON "inscriptions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "exclusive_inscription_links_token_key" ON "exclusive_inscription_links"("token");

-- CreateIndex
CREATE UNIQUE INDEX "exclusive_inscription_link_types_exclusive_link_id_type_ins_key" ON "exclusive_inscription_link_types"("exclusive_link_id", "type_inscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_cpf_inscription_id_key" ON "participants"("cpf", "inscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_asaas_checkout_id_key" ON "payments"("asaas_checkout_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_external_reference_key" ON "payments"("external_reference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_accessToken_key" ON "payments"("accessToken");

-- CreateIndex
CREATE INDEX "payments_guestEmail_idx" ON "payments"("guestEmail");

-- CreateIndex
CREATE UNIQUE INDEX "payment_link_asaas_payment_link_id_key" ON "payment_link"("asaas_payment_link_id");

-- CreateIndex
CREATE INDEX "payment_link_asaas_payment_link_id_idx" ON "payment_link"("asaas_payment_link_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_installments_asaas_payment_id_key" ON "payment_installments"("asaas_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_installments_payment_id_installment_number_key" ON "payment_installments"("payment_id", "installment_number");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocations_payment_id_inscription_id_key" ON "payment_allocations"("payment_id", "inscription_id");

-- CreateIndex
CREATE INDEX "financial_movement_inscription_id_idx" ON "financial_movement"("inscription_id");

-- CreateIndex
CREATE INDEX "financial_movement_guestEmail_idx" ON "financial_movement"("guestEmail");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_units_qrCode_key" ON "ticket_units"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "cash_register_events_cash_register_id_event_id_key" ON "cash_register_events"("cash_register_id", "event_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_participants" ADD CONSTRAINT "account_participants_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_participant_in_event" ADD CONSTRAINT "account_participant_in_event_account_participant_id_fkey" FOREIGN KEY ("account_participant_id") REFERENCES "account_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_participant_in_event" ADD CONSTRAINT "account_participant_in_event_inscription_id_fkey" FOREIGN KEY ("inscription_id") REFERENCES "inscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_participant_in_event" ADD CONSTRAINT "account_participant_in_event_type_inscription_id_fkey" FOREIGN KEY ("type_inscription_id") REFERENCES "type_inscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_responsibles" ADD CONSTRAINT "event_responsibles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_responsibles" ADD CONSTRAINT "event_responsibles_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_inscriptions" ADD CONSTRAINT "type_inscriptions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_exclusive_link_id_fkey" FOREIGN KEY ("exclusive_link_id") REFERENCES "exclusive_inscription_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_inscription_links" ADD CONSTRAINT "exclusive_inscription_links_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_inscription_links" ADD CONSTRAINT "exclusive_inscription_links_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_inscription_link_types" ADD CONSTRAINT "exclusive_inscription_link_types_exclusive_link_id_fkey" FOREIGN KEY ("exclusive_link_id") REFERENCES "exclusive_inscription_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exclusive_inscription_link_types" ADD CONSTRAINT "exclusive_inscription_link_types_type_inscription_id_fkey" FOREIGN KEY ("type_inscription_id") REFERENCES "type_inscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_inscription_id_fkey" FOREIGN KEY ("inscription_id") REFERENCES "inscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_type_inscription_id_fkey" FOREIGN KEY ("type_inscription_id") REFERENCES "type_inscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "on_site_registrations" ADD CONSTRAINT "on_site_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "on_site_participants" ADD CONSTRAINT "on_site_participants_on_site_registration_id_fkey" FOREIGN KEY ("on_site_registration_id") REFERENCES "on_site_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "on_site_participant_payments" ADD CONSTRAINT "on_site_participant_payments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "on_site_participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_link_id_fkey" FOREIGN KEY ("payment_link_id") REFERENCES "payment_link"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_installments" ADD CONSTRAINT "payment_installments_financial_movement_id_fkey" FOREIGN KEY ("financial_movement_id") REFERENCES "financial_movement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_installments" ADD CONSTRAINT "payment_installments_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_inscription_id_fkey" FOREIGN KEY ("inscription_id") REFERENCES "inscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movement" ADD CONSTRAINT "financial_movement_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movement" ADD CONSTRAINT "financial_movement_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_movement" ADD CONSTRAINT "financial_movement_inscription_id_fkey" FOREIGN KEY ("inscription_id") REFERENCES "inscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sale_payments" ADD CONSTRAINT "ticket_sale_payments_financialMovementId_fkey" FOREIGN KEY ("financialMovementId") REFERENCES "financial_movement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sale_payments" ADD CONSTRAINT "ticket_sale_payments_ticket_sale_id_fkey" FOREIGN KEY ("ticket_sale_id") REFERENCES "ticket_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sale_items" ADD CONSTRAINT "ticket_sale_items_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "event_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sale_items" ADD CONSTRAINT "ticket_sale_items_ticket_sale_id_fkey" FOREIGN KEY ("ticket_sale_id") REFERENCES "ticket_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_units" ADD CONSTRAINT "ticket_units_ticket_sale_item_id_fkey" FOREIGN KEY ("ticket_sale_item_id") REFERENCES "ticket_sale_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_expenses" ADD CONSTRAINT "event_expenses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_registers" ADD CONSTRAINT "cash_registers_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_events" ADD CONSTRAINT "cash_register_events_cash_register_id_fkey" FOREIGN KEY ("cash_register_id") REFERENCES "cash_registers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_events" ADD CONSTRAINT "cash_register_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_entries" ADD CONSTRAINT "cash_register_entries_cash_register_id_fkey" FOREIGN KEY ("cash_register_id") REFERENCES "cash_registers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_entries" ADD CONSTRAINT "cash_register_entries_event_expense_id_fkey" FOREIGN KEY ("event_expense_id") REFERENCES "event_expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_entries" ADD CONSTRAINT "cash_register_entries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_entries" ADD CONSTRAINT "cash_register_entries_on_site_registration_id_fkey" FOREIGN KEY ("on_site_registration_id") REFERENCES "on_site_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_entries" ADD CONSTRAINT "cash_register_entries_payment_installment_id_fkey" FOREIGN KEY ("payment_installment_id") REFERENCES "payment_installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_entries" ADD CONSTRAINT "cash_register_entries_ticket_sale_id_fkey" FOREIGN KEY ("ticket_sale_id") REFERENCES "ticket_sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_entries" ADD CONSTRAINT "cash_register_entries_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "cash_register_transfers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_transfers" ADD CONSTRAINT "cash_register_transfers_from_cash_id_fkey" FOREIGN KEY ("from_cash_id") REFERENCES "cash_registers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_register_transfers" ADD CONSTRAINT "cash_register_transfers_to_cash_id_fkey" FOREIGN KEY ("to_cash_id") REFERENCES "cash_registers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

