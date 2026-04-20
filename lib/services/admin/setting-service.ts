import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Modular Service for Admin Global Settings Management
 * Organized into categorized subfunctions for modularity and scalability.
 */

// Global generic save helper
const saveSettingsGroup = async (items: { key: string; value: string }[], actorId: string) => {
  return Promise.all(
    items.map((item) =>
      prisma.setting.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value, updatedById: actorId },
        update: { value: item.value, updatedById: actorId },
      })
    )
  );
};

// ============================================================================
// A. BREADCRUMB
// ============================================================================
export const settingBreadcrumb = {
  uploadDefaultBreadcrumbImage: (url: string) => ({ key: "breadcrumb.default", value: url }),
  uploadTeamBreadcrumbImage: (url: string) => ({ key: "breadcrumb.team", value: url }),
  uploadAuthorizationBreadcrumbImage: (url: string) => ({ key: "breadcrumb.auth", value: url }),
  uploadFaqBreadcrumbImage: (url: string) => ({ key: "breadcrumb.faq", value: url }),
  uploadDonorBreadcrumbImage: (url: string) => ({ key: "breadcrumb.donor", value: url }),
  uploadTestimonialBreadcrumbImage: (url: string) => ({ key: "breadcrumb.testimonial", value: url }),
  uploadComplaintBreadcrumbImage: (url: string) => ({ key: "breadcrumb.complaint", value: url }),
  uploadMemberBreadcrumbImage: (url: string) => ({ key: "breadcrumb.member", value: url }),
  
  validateBreadcrumbImages: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveBreadcrumbSettings: saveSettingsGroup,
};

// ============================================================================
// B. SEO
// ============================================================================
export const settingSEO = {
  updateDomainName: (value: string) => ({ key: "seo.domain", value }),
  updateMetaTitle: (value: string) => ({ key: "seo.title", value }),
  updateMetaKeyword: (value: string) => ({ key: "seo.keyword", value }),
  updateMetaDescription: (value: string) => ({ key: "seo.description", value }),
  
  validateSEOData: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveSEOSettings: saveSettingsGroup,
};

// ============================================================================
// C. INVOICE
// ============================================================================
export const settingInvoice = {
  updatePanNumber: (value: string) => ({ key: "invoice.pan", value }),
  updateTermsAndConditions: (value: string) => ({ key: "invoice.terms", value }),
  
  validateInvoiceData: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveInvoiceSettings: saveSettingsGroup,
};

// ============================================================================
// D. CERTIFICATE & I-CARD
// ============================================================================
export const settingCertificateAndICard = {
  uploadVolunteerCertificate: (url: string) => ({ key: "cert.volunteer", value: url }),
  uploadInternshipCertificate: (url: string) => ({ key: "cert.internship", value: url }),
  uploadMemberVolunteerIdCard: (url: string) => ({ key: "cert.idcard", value: url }),
  uploadEventCertificate: (url: string) => ({ key: "cert.event", value: url }),
  uploadBloodDonationCertificate: (url: string) => ({ key: "cert.blood", value: url }),
  uploadDirectorSignature: (url: string) => ({ key: "cert.signature", value: url }),
  
  validateCertificateFiles: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveCertificateSettings: saveSettingsGroup,
};

// ============================================================================
// E. COLOUR
// ============================================================================
export const settingColour = {
  updateThemePrimaryColour: (value: string) => ({ key: "color.primary", value }),
  updateThemeSecondaryColour: (value: string) => ({ key: "color.secondary", value }),
  updateTopBarBackgroundColour: (value: string) => ({ key: "color.topbarBg", value }),
  updateTopBarTextColour: (value: string) => ({ key: "color.topbarText", value }),
  updateHeaderTextColour: (value: string) => ({ key: "color.headerText", value }),
  updateHColour: (value: string) => ({ key: "color.heading", value }),
  updatePColour: (value: string) => ({ key: "color.paragraph", value }),
  updateButtonBackgroundColours: (value: string) => ({ key: "color.btnBg", value }),
  updateButtonHoverColours: (value: string) => ({ key: "color.btnHover", value }),
  updateSectionColours: (value: string) => ({ key: "color.section", value }),
  updateFooterColours: (value: string) => ({ key: "color.footer", value }),
  updateScrollTopColours: (value: string) => ({ key: "color.scrollTop", value }),
  
  validateColourSettings: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveColourSettings: saveSettingsGroup,
};

// ============================================================================
// F. FONT
// ============================================================================
export const settingFont = {
  updateBodyFont: (value: string) => ({ key: "font.body", value }),
  updateHeadingTagFont: (value: string) => ({ key: "font.heading", value }),
  updateParagraphTagFont: (value: string) => ({ key: "font.paragraph", value }),
  updateHeadingSectionTagFont: (value: string) => ({ key: "font.sectionHeading", value }),
  updateParagraphSectionTagFont: (value: string) => ({ key: "font.sectionParagraph", value }),
  
  validateFontSettings: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveFontSettings: saveSettingsGroup,
};

// ============================================================================
// G. GATEWAY
// ============================================================================
export const settingGateway = {
  updateRazorpayKey: (value: string) => ({ key: "gateway.razorpayKey", value }),
  updateRazorpaySecret: (value: string) => ({ key: "gateway.razorpaySecret", value }),
  
  validateGatewaySettings: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveGatewaySettings: saveSettingsGroup,
};

// ============================================================================
// H. CAPTCHA
// ============================================================================
export const settingCaptcha = {
  updateRecaptchaSiteKey: (value: string) => ({ key: "captcha.siteKey", value }),
  updateRecaptchaSecretKey: (value: string) => ({ key: "captcha.secretKey", value }),
  
  validateCaptchaSettings: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveCaptchaSettings: saveSettingsGroup,
};

// ============================================================================
// I. MAIL INTEGRATION
// ============================================================================
export const settingMailIntegration = {
  updateMainMailIntegration: (value: string) => ({ key: "mail.main", value }),
  updateMemberEmailSettings: (value: string) => ({ key: "mail.member", value }),
  updateVolunteerEmailSettings: (value: string) => ({ key: "mail.volunteer", value }),
  updateInternshipEmailSettings: (value: string) => ({ key: "mail.internship", value }),
  updateUserEmailSettings: (value: string) => ({ key: "mail.user", value }),
  updateEventEmailSettings: (value: string) => ({ key: "mail.event", value }),
  updateDonationEmailSettings: (value: string) => ({ key: "mail.donation", value }),
  
  validateMailSettings: (_data: Record<string, unknown>) => {
    void _data;
    return true;
  },
  saveMailIntegrationSettings: saveSettingsGroup,
};

// ============================================================================
// J. HIDE PAGE
// ============================================================================
export const settingHidePage = {
  toggleAboutPage: (value: boolean) => ({ key: "hide.about", value: String(value) }),
  toggleTestimonialPage: (value: boolean) => ({ key: "hide.testimonial", value: String(value) }),
  toggleCampaignPage: (value: boolean) => ({ key: "hide.campaign", value: String(value) }),
  toggleMemberDesignationPage: (value: boolean) => ({ key: "hide.memberDesignation", value: String(value) }),
  toggleInternshipPage: (value: boolean) => ({ key: "hide.internship", value: String(value) }),
  toggleTeamPage: (value: boolean) => ({ key: "hide.team", value: String(value) }),
  toggleComplaintPage: (value: boolean) => ({ key: "hide.complaint", value: String(value) }),
  toggleDonorPage: (value: boolean) => ({ key: "hide.donor", value: String(value) }),
  toggleUserPage: (value: boolean) => ({ key: "hide.user", value: String(value) }),
  togglePledgePage: (value: boolean) => ({ key: "hide.pledge", value: String(value) }),
  toggleAuthorizationPage: (value: boolean) => ({ key: "hide.auth", value: String(value) }),
  toggleComplaintStatusPage: (value: boolean) => ({ key: "hide.complaintStatus", value: String(value) }),
  toggleMemberPage: (value: boolean) => ({ key: "hide.member", value: String(value) }),
  toggleVolunteerPage: (value: boolean) => ({ key: "hide.volunteer", value: String(value) }),
  toggleHighlightsPage: (value: boolean) => ({ key: "hide.highlights", value: String(value) }),
  toggleFaqPage: (value: boolean) => ({ key: "hide.faq", value: String(value) }),
  toggleWorkPage: (value: boolean) => ({ key: "hide.work", value: String(value) }),
  toggleMemberListPage: (value: boolean) => ({ key: "hide.memberList", value: String(value) }),
  toggleVolunteerListPage: (value: boolean) => ({ key: "hide.volunteerList", value: String(value) }),
  toggleBlogPage: (value: boolean) => ({ key: "hide.blog", value: String(value) }),
  
  saveHidePageSettings: saveSettingsGroup,
};
