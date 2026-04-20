type ProfileItem = { key: string; value: string };

export const profileInfo = {
  updateFirmName: (value: string): ProfileItem => ({ key: "info.firmName", value }),
  updateEmailAddress1: (value: string): ProfileItem => ({ key: "info.email1", value }),
  updateEmailAddress2: (value: string): ProfileItem => ({ key: "info.email2", value }),
  updateEmailAddress3: (value: string): ProfileItem => ({ key: "info.email3", value }),
  updateMobile: (value: string): ProfileItem => ({ key: "info.mobile", value }),
  updateAddress: (value: string): ProfileItem => ({ key: "info.address", value }),
  updatePrefix: (value: string): ProfileItem => ({ key: "info.prefix", value }),
  uploadProfileImage: (url: string): ProfileItem => ({ key: "info.profileImage", value: url }),
  uploadLogo: (url: string): ProfileItem => ({ key: "info.logo", value: url }),
  uploadFaviconIcon: (url: string): ProfileItem => ({ key: "info.favicon", value: url }),
  validateProfileInfo: (data: Record<string, unknown>) => {
    if (!data.firmName) throw new Error("Firm Name is required");
    if (!data.mobile) throw new Error("Mobile number is required");
    return true;
  },
};

export const profilePassword = {
  updateOldPassword: (value: string) => ({ type: "old", value }),
  updateNewPassword: (value: string) => ({ type: "new", value }),
  updateConfirmPassword: (value: string) => ({ type: "confirm", value }),
  validatePasswordMatch: (newPass: string, confirmPass: string) => {
    if (newPass !== confirmPass) throw new Error("Passwords do not match");
    return true;
  },
  validatePasswordStrength: (password: string) => {
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    return true;
  },
};

export const profileSocial = {
  updateFacebookLink: (value: string): ProfileItem => ({ key: "social.facebook", value }),
  updateInstagramLink: (value: string): ProfileItem => ({ key: "social.instagram", value }),
  updateYoutubeLink: (value: string): ProfileItem => ({ key: "social.youtube", value }),
  updateTwitterLink: (value: string): ProfileItem => ({ key: "social.twitter", value }),
  updateLinkedinLink: (value: string): ProfileItem => ({ key: "social.linkedin", value }),
  updateWhatsappNumber: (value: string): ProfileItem => ({ key: "social.whatsapp", value }),
  validateSocialLinks: (_links: Record<string, unknown>) => {
    void _links;
    return true;
  },
};

export const profileBank = {
  updateAccountHolderName: (value: string): ProfileItem => ({ key: "bank.holderName", value }),
  updateBankName: (value: string): ProfileItem => ({ key: "bank.bankName", value }),
  updateAccountNumber: (value: string): ProfileItem => ({ key: "bank.accountNumber", value }),
  updateIFSCCode: (value: string): ProfileItem => ({ key: "bank.ifsc", value }),
  updateBranchAddress: (value: string): ProfileItem => ({ key: "bank.branch", value }),
  uploadQRImage: (url: string): ProfileItem => ({ key: "bank.qrImage", value: url }),
  validateBankDetails: (data: Record<string, unknown>) => {
    if (!data.accountNumber) throw new Error("Account number is required");
    if (!data.ifsc) throw new Error("IFSC code is required");
    return true;
  },
};

export const profileUserId = {
  updateUserEmail: (value: string) => ({ type: "email", value }),
  updateUserName: (value: string) => ({ type: "name", value }),
  validateUserEmail: (email: string) => {
    if (!email.includes("@")) throw new Error("Invalid email address");
    return true;
  },
  validateUserName: (name: string) => {
    if (name.length < 3) throw new Error("Username too short");
    return true;
  },
};
