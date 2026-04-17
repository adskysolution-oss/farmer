CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "mobile" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "avatarUrl" TEXT,
  "lastLoginAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_mobile_key" ON "User"("mobile");
CREATE INDEX IF NOT EXISTS "User_role_status_idx" ON "User"("role", "status");

CREATE TABLE IF NOT EXISTS "Partner" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "tehsil" TEXT NOT NULL,
  "address" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "revenuePaise" INTEGER NOT NULL DEFAULT 0,
  "commissionEarnedPaise" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Partner_userId_key" ON "Partner"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Partner_code_key" ON "Partner"("code");
CREATE INDEX IF NOT EXISTS "Partner_filters_idx" ON "Partner"("status", "state", "district", "tehsil");

CREATE TABLE IF NOT EXISTS "Employee" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "partnerId" TEXT,
  "designation" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "tehsil" TEXT,
  "village" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "isCaller" INTEGER NOT NULL DEFAULT 0,
  "fixedSalaryPaise" INTEGER NOT NULL DEFAULT 0,
  "commissionRate" REAL NOT NULL DEFAULT 0,
  "leadsGenerated" INTEGER NOT NULL DEFAULT 0,
  "conversions" INTEGER NOT NULL DEFAULT 0,
  "performanceScore" REAL NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Employee_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Employee_userId_key" ON "Employee"("userId");
CREATE INDEX IF NOT EXISTS "Employee_partner_status_idx" ON "Employee"("partnerId", "status");
CREATE INDEX IF NOT EXISTS "Employee_isCaller_idx" ON "Employee"("isCaller");

CREATE TABLE IF NOT EXISTS "Farmer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "mobile" TEXT NOT NULL,
  "email" TEXT,
  "state" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "tehsil" TEXT,
  "village" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'SELF_SERVICE',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Farmer_mobile_idx" ON "Farmer"("mobile");
CREATE INDEX IF NOT EXISTS "Farmer_location_idx" ON "Farmer"("state", "district", "village");

CREATE TABLE IF NOT EXISTS "LoanApplication" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "referenceNo" TEXT NOT NULL,
  "farmerId" TEXT NOT NULL,
  "partnerId" TEXT,
  "employeeId" TEXT,
  "callerId" TEXT,
  "verifiedById" TEXT,
  "loanType" TEXT NOT NULL,
  "requestedAmountPaise" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "paymentRequired" INTEGER NOT NULL DEFAULT 1,
  "paymentAmountPaise" INTEGER NOT NULL DEFAULT 24900,
  "callConnectionStatus" TEXT,
  "leadInterestStatus" TEXT,
  "followUpDate" DATETIME,
  "callerNotes" TEXT,
  "assignedToCallerAt" DATETIME,
  "reviewedAt" DATETIME,
  "approvedAt" DATETIME,
  "rejectedAt" DATETIME,
  "disbursedAt" DATETIME,
  "rejectionReason" TEXT,
  "documentCompletion" REAL NOT NULL DEFAULT 0,
  "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoanApplication_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "LoanApplication_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "LoanApplication_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "LoanApplication_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "LoanApplication_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "LoanApplication_referenceNo_key" ON "LoanApplication"("referenceNo");
CREATE INDEX IF NOT EXISTS "LoanApplication_status_payment_idx" ON "LoanApplication"("status", "paymentStatus");
CREATE INDEX IF NOT EXISTS "LoanApplication_assignment_idx" ON "LoanApplication"("partnerId", "employeeId", "callerId");
CREATE INDEX IF NOT EXISTS "LoanApplication_submittedAt_idx" ON "LoanApplication"("submittedAt");

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT,
  "gateway" TEXT NOT NULL,
  "orderId" TEXT,
  "transactionId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "amountPaise" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "payerName" TEXT NOT NULL,
  "payerMobile" TEXT NOT NULL,
  "metaJson" TEXT,
  "paidAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_applicationId_key" ON "Payment"("applicationId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_transactionId_key" ON "Payment"("transactionId");
CREATE INDEX IF NOT EXISTS "Payment_status_gateway_createdAt_idx" ON "Payment"("status", "gateway", "createdAt");

CREATE TABLE IF NOT EXISTS "FarmerDocument" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "uploadedById" TEXT,
  "type" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FarmerDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FarmerDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "FarmerDocument_application_type_idx" ON "FarmerDocument"("applicationId", "type");

CREATE TABLE IF NOT EXISTS "PaymentGatewayConfig" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "gateway" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "enabled" INTEGER NOT NULL DEFAULT 0,
  "keyId" TEXT,
  "secretKey" TEXT,
  "merchantId" TEXT,
  "saltKey" TEXT,
  "saltIndex" TEXT,
  "endpointUrl" TEXT,
  "successUrl" TEXT,
  "failureUrl" TEXT,
  "webhookSecret" TEXT,
  "extraJson" TEXT,
  "updatedById" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentGatewayConfig_gateway_key" ON "PaymentGatewayConfig"("gateway");

CREATE TABLE IF NOT EXISTS "Wallet" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ownerType" TEXT NOT NULL,
  "partnerId" TEXT,
  "employeeId" TEXT,
  "balancePaise" INTEGER NOT NULL DEFAULT 0,
  "lifetimeEarningsPaise" INTEGER NOT NULL DEFAULT 0,
  "pendingWithdrawalPaise" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wallet_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Wallet_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_partnerId_key" ON "Wallet"("partnerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_employeeId_key" ON "Wallet"("employeeId");

CREATE TABLE IF NOT EXISTS "WalletEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "walletId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amountPaise" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "WalletEntry_wallet_createdAt_idx" ON "WalletEntry"("walletId", "createdAt");

CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "walletId" TEXT NOT NULL,
  "amountPaise" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "payoutMethod" TEXT NOT NULL DEFAULT 'MANUAL',
  "notes" TEXT,
  "processedById" TEXT,
  "processedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WithdrawalRequest_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "WithdrawalRequest_status_createdAt_idx" ON "WithdrawalRequest"("status", "createdAt");

CREATE TABLE IF NOT EXISTS "CommissionSetting" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "adminSharePercent" REAL NOT NULL DEFAULT 40,
  "partnerSharePercent" REAL NOT NULL DEFAULT 35,
  "employeeSharePercent" REAL NOT NULL DEFAULT 25,
  "fixedEmployeeSalaryPaise" INTEGER NOT NULL DEFAULT 0,
  "updatedById" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CommissionSplit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "paymentId" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "partnerId" TEXT,
  "employeeId" TEXT,
  "adminAmountPaise" INTEGER NOT NULL,
  "partnerAmountPaise" INTEGER NOT NULL,
  "employeeAmountPaise" INTEGER NOT NULL,
  "snapshotJson" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommissionSplit_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CommissionSplit_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CommissionSplit_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CommissionSplit_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CommissionSplit_paymentId_key" ON "CommissionSplit"("paymentId");
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionSplit_applicationId_key" ON "CommissionSplit"("applicationId");
CREATE INDEX IF NOT EXISTS "CommissionSplit_partner_employee_idx" ON "CommissionSplit"("partnerId", "employeeId");

CREATE TABLE IF NOT EXISTS "employee_tracking" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "employeeId" TEXT NOT NULL,
  "latitude" REAL NOT NULL,
  "longitude" REAL NOT NULL,
  "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isOnline" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "employee_tracking_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "employee_tracking_employee_lastActive_idx" ON "employee_tracking"("employeeId", "lastActive");

CREATE TABLE IF NOT EXISTS "CallLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "callerId" TEXT NOT NULL,
  "connectionStatus" TEXT NOT NULL,
  "interestStatus" TEXT NOT NULL,
  "notes" TEXT,
  "followUpDate" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CallLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CallLog_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CallLog_application_createdAt_idx" ON "CallLog"("applicationId", "createdAt");

CREATE TABLE IF NOT EXISTS "Campaign" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "recipientGroup" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "filtersJson" TEXT,
  "sentById" TEXT NOT NULL,
  "scheduledAt" DATETIME,
  "sentAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Campaign_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CampaignDispatch" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "campaignId" TEXT NOT NULL,
  "recipientType" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "recipientLabel" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "providerResponse" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CampaignDispatch_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CampaignDispatch_campaign_createdAt_idx" ON "CampaignDispatch"("campaignId", "createdAt");

CREATE TABLE IF NOT EXISTS "DynamicForm" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "paymentEnabled" INTEGER NOT NULL DEFAULT 1,
  "paymentMandatory" INTEGER NOT NULL DEFAULT 1,
  "paymentAmountPaise" INTEGER NOT NULL DEFAULT 24900,
  "published" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "DynamicForm_name_key" ON "DynamicForm"("name");

CREATE TABLE IF NOT EXISTS "DynamicFormField" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "formId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "required" INTEGER NOT NULL DEFAULT 0,
  "placeholder" TEXT,
  "optionsJson" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DynamicFormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "DynamicForm"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "DynamicFormField_form_sort_idx" ON "DynamicFormField"("formId", "sortOrder");

CREATE TABLE IF NOT EXISTS "Setting" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedById" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "actorId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "metaJson" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuditLog_entity_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "usedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_user_expires_idx" ON "PasswordResetToken"("userId", "expiresAt");

CREATE TABLE IF NOT EXISTS "ApplicationTimeline" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "actorId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationTimeline_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "LoanApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ApplicationTimeline_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ApplicationTimeline_application_createdAt_idx" ON "ApplicationTimeline"("applicationId", "createdAt");
