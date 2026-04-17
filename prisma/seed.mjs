import bcrypt from "bcryptjs";
import {
  CallConnectionStatus,
  CampaignChannel,
  CampaignStatus,
  DocumentType,
  LedgerEntryType,
  LeadInterestStatus,
  LoanStatus,
  PaymentGateway,
  PaymentStatus,
  PayoutMethod,
  PrismaClient,
  RecipientGroup,
  UserRole,
  WalletOwnerType,
  WithdrawalStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const FARMERS = [
  ["Mahesh Patil", "Maharashtra", "Nashik", "Sinnar", "Khambale", "KCC", LoanStatus.APPROVED, PaymentStatus.SUCCESS],
  ["Sunita Shinde", "Maharashtra", "Nashik", "Sinnar", "Dapur", "Crop", LoanStatus.DOCUMENT_PENDING, PaymentStatus.SUCCESS],
  ["Anil Verma", "Madhya Pradesh", "Indore", "Mhow", "Pithampur", "Tractor", LoanStatus.UNDER_REVIEW, PaymentStatus.SUCCESS],
  ["Kavita Bai", "Madhya Pradesh", "Indore", "Mhow", "Rau", "Dairy", LoanStatus.REJECTED, PaymentStatus.SUCCESS],
  ["Harish Kale", "Maharashtra", "Nashik", "Sinnar", "Pimpalgaon", "Personal", LoanStatus.DISBURSED, PaymentStatus.SUCCESS],
  ["Lalit Yadav", "Madhya Pradesh", "Indore", "Mhow", "Mhowgaon", "KCC", LoanStatus.SUBMITTED, PaymentStatus.PENDING],
  ["Ritu Jadhav", "Maharashtra", "Nashik", "Sinnar", "Mhalsakore", "Crop", LoanStatus.UNDER_REVIEW, PaymentStatus.SUCCESS],
  ["Vikram Rao", "Maharashtra", "Pune", "Baramati", "Medad", "Dairy", LoanStatus.SUBMITTED, PaymentStatus.PENDING],
];

async function hashPassword(value) {
  return bcrypt.hash(value, 10);
}

async function createUser(input) {
  return prisma.user.create({
    data: {
      name: input.name,
      mobile: input.mobile,
      email: input.email,
      role: input.role,
      passwordHash: await hashPassword(input.password),
    },
  });
}

async function resetDatabase() {
  await prisma.campaignDispatch.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.applicationTimeline.deleteMany();
  await prisma.farmerDocument.deleteMany();
  await prisma.commissionSplit.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.loanApplication.deleteMany();
  await prisma.employeeTracking.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.walletEntry.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.dynamicFormField.deleteMany();
  await prisma.dynamicForm.deleteMany();
  await prisma.paymentGatewayConfig.deleteMany();
  await prisma.commissionSetting.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();

  const admin = await createUser({
    name: "Aarav Admin",
    mobile: "9999999999",
    email: "admin@loancrm.local",
    role: UserRole.ADMIN,
    password: "Admin@123",
  });

  const commissionSetting = await prisma.commissionSetting.create({
    data: {
      adminSharePercent: 40,
      partnerSharePercent: 35,
      employeeSharePercent: 25,
      fixedEmployeeSalaryPaise: 2500000,
      updatedById: admin.id,
    },
  });

  await prisma.dynamicForm.create({
    data: {
      name: "farmer-loan-intake",
      title: "Farmer Loan Registration",
      description: "Capture farmer details, KYC documents, and payment before routing the case to field operations.",
      paymentEnabled: true,
      paymentMandatory: true,
      paymentAmountPaise: 24900,
      fields: {
        create: [
          { label: "Farmer Name", key: "name", type: "TEXT", required: true, placeholder: "Enter full name", sortOrder: 1 },
          { label: "Mobile Number", key: "mobile", type: "TEXT", required: true, placeholder: "10 digit mobile", sortOrder: 2 },
          { label: "State", key: "state", type: "TEXT", required: true, placeholder: "State", sortOrder: 3 },
          { label: "District", key: "district", type: "TEXT", required: true, placeholder: "District", sortOrder: 4 },
          { label: "Village", key: "village", type: "TEXT", required: true, placeholder: "Village", sortOrder: 5 },
          { label: "Loan Type", key: "loanType", type: "SELECT", required: true, optionsJson: JSON.stringify(["KCC", "Tractor", "Dairy", "Personal", "Crop"]), sortOrder: 6 },
          { label: "Requested Amount", key: "requestedAmount", type: "NUMBER", required: true, placeholder: "e.g. 250000", sortOrder: 7 },
          { label: "Additional Notes", key: "notes", type: "TEXTAREA", required: false, placeholder: "Optional notes", sortOrder: 8 },
        ],
      },
    },
  });

  await prisma.setting.createMany({
    data: [
      { key: "brand.logoUrl", value: "/logo.svg", updatedById: admin.id },
      { key: "brand.companyName", value: "Kesari Loan CRM", updatedById: admin.id },
      { key: "theme.primary", value: "#1d4ed8", updatedById: admin.id },
      { key: "theme.accent", value: "#0f766e", updatedById: admin.id },
      { key: "smtp.host", value: "", updatedById: admin.id },
      { key: "smtp.port", value: "587", updatedById: admin.id },
      { key: "smtp.user", value: "", updatedById: admin.id },
      { key: "smtp.from", value: "noreply@example.com", updatedById: admin.id },
      { key: "sms.baseUrl", value: "", updatedById: admin.id },
      { key: "sms.apiKey", value: "", updatedById: admin.id },
      { key: "whatsapp.baseUrl", value: "", updatedById: admin.id },
      { key: "whatsapp.apiKey", value: "", updatedById: admin.id },
    ],
  });

  await prisma.paymentGatewayConfig.createMany({
    data: [
      { gateway: PaymentGateway.RAZORPAY, displayName: "Razorpay", enabled: false, successUrl: "/apply?payment=success", failureUrl: "/apply?payment=failed" },
      { gateway: PaymentGateway.PHONEPE, displayName: "PhonePe", enabled: false, successUrl: "/apply?payment=success", failureUrl: "/apply?payment=failed" },
      { gateway: PaymentGateway.KESARI, displayName: "Kesari Gateway", enabled: false, successUrl: "/apply?payment=success", failureUrl: "/apply?payment=failed" },
    ],
  });

  const partnerUser1 = await createUser({ name: "Suman Partner", mobile: "9000000001", email: "suman.partner@example.com", role: UserRole.PARTNER, password: "Partner@123" });
  const partnerUser2 = await createUser({ name: "Raghav Partner", mobile: "9000000002", email: "raghav.partner@example.com", role: UserRole.PARTNER, password: "Partner@123" });

  const partner1 = await prisma.partner.create({
    data: { userId: partnerUser1.id, code: "ADS001", state: "Maharashtra", district: "Nashik", tehsil: "Sinnar", address: "Agri Plaza, Nashik", revenuePaise: 218250, commissionEarnedPaise: 76288 },
  });
  const partner2 = await prisma.partner.create({
    data: { userId: partnerUser2.id, code: "ADS002", state: "Madhya Pradesh", district: "Indore", tehsil: "Mhow", address: "Biz Hub, Indore", revenuePaise: 149400, commissionEarnedPaise: 52290 },
  });

  const employeeUser1 = await createUser({ name: "Neha Field Officer", mobile: "9100000001", email: "neha.employee@example.com", role: UserRole.EMPLOYEE, password: "Employee@123" });
  const employeeUser2 = await createUser({ name: "Ritesh Caller", mobile: "9100000002", email: "ritesh.caller@example.com", role: UserRole.CALLER, password: "Caller@123" });
  const employeeUser3 = await createUser({ name: "Priya Operations", mobile: "9100000003", email: "priya.employee@example.com", role: UserRole.EMPLOYEE, password: "Employee@123" });

  const employee1 = await prisma.employee.create({
    data: { userId: employeeUser1.id, partnerId: partner1.id, designation: "Senior Field Officer", state: "Maharashtra", district: "Nashik", tehsil: "Sinnar", village: "Madhavgaon", fixedSalaryPaise: 350000, commissionRate: 25, leadsGenerated: 32, conversions: 18, performanceScore: 86 },
  });
  const caller = await prisma.employee.create({
    data: { userId: employeeUser2.id, partnerId: partner1.id, designation: "Lead Caller", state: "Maharashtra", district: "Nashik", tehsil: "Sinnar", isCaller: true, fixedSalaryPaise: 280000, commissionRate: 18, leadsGenerated: 44, conversions: 12, performanceScore: 78 },
  });
  const employee2 = await prisma.employee.create({
    data: { userId: employeeUser3.id, partnerId: partner2.id, designation: "Territory Manager", state: "Madhya Pradesh", district: "Indore", tehsil: "Mhow", village: "Rau", fixedSalaryPaise: 420000, commissionRate: 25, leadsGenerated: 27, conversions: 15, performanceScore: 82 },
  });

  const wallets = await Promise.all([
    prisma.wallet.create({ data: { ownerType: WalletOwnerType.PARTNER, partnerId: partner1.id, balancePaise: 48200, lifetimeEarningsPaise: 126000, pendingWithdrawalPaise: 15000 } }),
    prisma.wallet.create({ data: { ownerType: WalletOwnerType.PARTNER, partnerId: partner2.id, balancePaise: 36150, lifetimeEarningsPaise: 92300 } }),
    prisma.wallet.create({ data: { ownerType: WalletOwnerType.EMPLOYEE, employeeId: employee1.id, balancePaise: 28400, lifetimeEarningsPaise: 85500, pendingWithdrawalPaise: 5000 } }),
    prisma.wallet.create({ data: { ownerType: WalletOwnerType.EMPLOYEE, employeeId: caller.id, balancePaise: 13600, lifetimeEarningsPaise: 40200 } }),
    prisma.wallet.create({ data: { ownerType: WalletOwnerType.EMPLOYEE, employeeId: employee2.id, balancePaise: 21450, lifetimeEarningsPaise: 71350 } }),
  ]);

  await prisma.walletEntry.createMany({
    data: [
      { walletId: wallets[0].id, type: LedgerEntryType.COMMISSION, amountPaise: 31500, description: "Commission from April applications" },
      { walletId: wallets[0].id, type: LedgerEntryType.WITHDRAWAL, amountPaise: -15000, description: "Withdrawal request under review" },
      { walletId: wallets[1].id, type: LedgerEntryType.COMMISSION, amountPaise: 26250, description: "Commission from Indore cluster" },
      { walletId: wallets[2].id, type: LedgerEntryType.COMMISSION, amountPaise: 15800, description: "Field conversion commission" },
      { walletId: wallets[2].id, type: LedgerEntryType.SALARY, amountPaise: 350000, description: "April salary credit" },
      { walletId: wallets[3].id, type: LedgerEntryType.SALARY, amountPaise: 280000, description: "April salary credit" },
      { walletId: wallets[4].id, type: LedgerEntryType.COMMISSION, amountPaise: 14150, description: "Approved lead commission" },
    ],
  });

  await prisma.withdrawalRequest.createMany({
    data: [
      { walletId: wallets[0].id, amountPaise: 15000, status: WithdrawalStatus.PENDING, payoutMethod: PayoutMethod.UPI, notes: "Requested by partner for weekly settlement" },
      { walletId: wallets[2].id, amountPaise: 5000, status: WithdrawalStatus.APPROVED, payoutMethod: PayoutMethod.BANK, notes: "Approved by finance", processedById: admin.id, processedAt: new Date(Date.now() - 1000 * 60 * 60 * 10) },
    ],
  });

  for (let index = 0; index < FARMERS.length; index += 1) {
    const partnerId = index === 7 ? null : index % 2 === 0 ? partner1.id : partner2.id;
    const employeeId = partnerId === partner1.id ? employee1.id : partnerId === partner2.id ? employee2.id : null;
    const callerId = partnerId === partner1.id ? caller.id : null;
    const farmer = await prisma.farmer.create({
      data: {
        name: FARMERS[index][0],
        mobile: `88000000${String(index + 1).padStart(2, "0")}`,
        state: FARMERS[index][1],
        district: FARMERS[index][2],
        tehsil: FARMERS[index][3],
        village: FARMERS[index][4],
        source: index % 2 === 0 ? "SELF_SERVICE" : "BULK_IMPORT",
      },
    });

    const application = await prisma.loanApplication.create({
      data: {
        referenceNo: `APP-${String(index + 1).padStart(4, "0")}`,
        farmerId: farmer.id,
        partnerId,
        employeeId,
        callerId,
        verifiedById: FARMERS[index][6] === LoanStatus.APPROVED || FARMERS[index][6] === LoanStatus.DISBURSED ? admin.id : null,
        loanType: FARMERS[index][5],
        requestedAmountPaise: 25000000 + index * 500000,
        status: FARMERS[index][6],
        paymentStatus: FARMERS[index][7],
        paymentRequired: true,
        paymentAmountPaise: 24900,
        callConnectionStatus: index % 3 === 0 ? CallConnectionStatus.CONNECTED : CallConnectionStatus.NOT_CONNECTED,
        leadInterestStatus: index % 2 === 0 ? LeadInterestStatus.INTERESTED : LeadInterestStatus.DOCUMENTS_PENDING,
        followUpDate: new Date(Date.now() + index * 86400000),
        callerNotes: index % 2 === 0 ? "Strong eligibility indicators" : "Needs land documents",
        assignedToCallerAt: callerId ? new Date(Date.now() - 1000 * 60 * 60 * 48) : null,
        reviewedAt: FARMERS[index][6] !== LoanStatus.SUBMITTED ? new Date(Date.now() - 1000 * 60 * 60 * 24) : null,
        approvedAt: FARMERS[index][6] === LoanStatus.APPROVED || FARMERS[index][6] === LoanStatus.DISBURSED ? new Date(Date.now() - 1000 * 60 * 60 * 12) : null,
        rejectedAt: FARMERS[index][6] === LoanStatus.REJECTED ? new Date(Date.now() - 1000 * 60 * 60 * 18) : null,
        disbursedAt: FARMERS[index][6] === LoanStatus.DISBURSED ? new Date(Date.now() - 1000 * 60 * 60 * 6) : null,
        rejectionReason: FARMERS[index][6] === LoanStatus.REJECTED ? "Banking score below threshold" : null,
        documentCompletion: FARMERS[index][6] === LoanStatus.DOCUMENT_PENDING ? 65 : 100,
      },
    });

    await prisma.applicationTimeline.createMany({
      data: [
        { applicationId: application.id, actorId: admin.id, title: "Application received", description: "Farmer record created and queued for validation.", status: "SUBMITTED" },
        { applicationId: application.id, actorId: admin.id, title: "Assigned to operations", description: employeeId ? "Lead assigned to field team for follow-up." : "Awaiting team assignment.", status: "ASSIGNED" },
      ],
    });

    if (FARMERS[index][7] === PaymentStatus.SUCCESS) {
      const payment = await prisma.payment.create({
        data: {
          applicationId: application.id,
          gateway: index % 2 === 0 ? PaymentGateway.RAZORPAY : PaymentGateway.PHONEPE,
          orderId: `ORD-${String(index + 1).padStart(4, "0")}`,
          transactionId: `TXN-${String(index + 1).padStart(4, "0")}`,
          status: PaymentStatus.SUCCESS,
          amountPaise: 24900,
          payerName: farmer.name,
          payerMobile: farmer.mobile,
          paidAt: new Date(Date.now() - index * 1000 * 60 * 60),
          metaJson: JSON.stringify({ source: farmer.source }),
        },
      });

      const partnerAmountPaise = partnerId ? Math.round(24900 * (commissionSetting.partnerSharePercent / 100)) : 0;
      const employeeAmountPaise = employeeId ? Math.round(24900 * (commissionSetting.employeeSharePercent / 100)) : 0;
      const adminAmountPaise = 24900 - partnerAmountPaise - employeeAmountPaise;

      await prisma.commissionSplit.create({
        data: {
          paymentId: payment.id,
          applicationId: application.id,
          partnerId,
          employeeId,
          adminAmountPaise,
          partnerAmountPaise,
          employeeAmountPaise,
          snapshotJson: JSON.stringify({
            adminSharePercent: commissionSetting.adminSharePercent,
            partnerSharePercent: commissionSetting.partnerSharePercent,
            employeeSharePercent: commissionSetting.employeeSharePercent,
          }),
        },
      });
    }

    if (callerId) {
      await prisma.callLog.create({
        data: {
          applicationId: application.id,
          callerId,
          connectionStatus: index % 2 === 0 ? CallConnectionStatus.CONNECTED : CallConnectionStatus.NOT_CONNECTED,
          interestStatus: index % 2 === 0 ? LeadInterestStatus.INTERESTED : LeadInterestStatus.FOLLOW_UP,
          notes: index % 2 === 0 ? "Farmer requested doorstep document collection." : "Follow-up requested tomorrow.",
          followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        },
      });
    }

    if (index < 5) {
      await prisma.farmerDocument.createMany({
        data: [
          {
            applicationId: application.id,
            uploadedById: admin.id,
            type: DocumentType.AADHAAR,
            fileName: `${farmer.name.toLowerCase().replaceAll(" ", "-")}-aadhaar.pdf`,
            filePath: `/storage/documents/${application.referenceNo}-aadhaar.pdf`,
            mimeType: "application/pdf",
            sizeBytes: 204800,
          },
          {
            applicationId: application.id,
            uploadedById: admin.id,
            type: DocumentType.PAN,
            fileName: `${farmer.name.toLowerCase().replaceAll(" ", "-")}-pan.pdf`,
            filePath: `/storage/documents/${application.referenceNo}-pan.pdf`,
            mimeType: "application/pdf",
            sizeBytes: 153600,
          },
        ],
      });
    }
  }

  await prisma.employeeTracking.createMany({
    data: [
      { employeeId: employee1.id, latitude: 19.9975, longitude: 73.7898, lastActive: new Date(), isOnline: true },
      { employeeId: caller.id, latitude: 19.9822, longitude: 73.7963, lastActive: new Date(Date.now() - 1000 * 60 * 4), isOnline: true },
      { employeeId: employee2.id, latitude: 22.7196, longitude: 75.8577, lastActive: new Date(Date.now() - 1000 * 60 * 36), isOnline: false },
    ],
  });

  const campaign = await prisma.campaign.create({
    data: {
      name: "Document Completion Drive",
      channel: CampaignChannel.WHATSAPP,
      recipientGroup: RecipientGroup.FARMERS,
      message: "Please upload your pending land papers to avoid loan processing delays.",
      status: CampaignStatus.SENT,
      sentById: admin.id,
      sentAt: new Date(Date.now() - 1000 * 60 * 90),
    },
  });

  const farmerRecipients = await prisma.farmer.findMany({ take: 3 });
  await prisma.campaignDispatch.createMany({
    data: farmerRecipients.map((recipient) => ({
      campaignId: campaign.id,
      recipientType: "FARMER",
      recipientId: recipient.id,
      recipientLabel: recipient.name,
      status: "SENT",
      providerResponse: JSON.stringify({ provider: "WHATSAPP", accepted: true }),
    })),
  });

  await prisma.auditLog.createMany({
    data: [
      { actorId: admin.id, entityType: "COMMISSION_SETTING", entityId: commissionSetting.id, action: "UPDATE", description: "Commission configuration initialized during seed." },
      { actorId: admin.id, entityType: "CAMPAIGN", entityId: campaign.id, action: "SEND", description: "Bulk document reminder sent to farmers." },
    ],
  });

  console.log("Seed completed. Default logins:");
  console.log("Admin: 9999999999 / Admin@123");
  console.log("Partner: 9000000001 / Partner@123");
  console.log("Employee: 9100000001 / Employee@123");
  console.log("Caller: 9100000002 / Caller@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
