import "server-only";

import { prisma } from "@/lib/prisma";
import {
  profileBank as sharedProfileBank,
  profileInfo as sharedProfileInfo,
  profilePassword as sharedProfilePassword,
  profileSocial as sharedProfileSocial,
  profileUserId as sharedProfileUserId,
} from "@/lib/services/admin/profile-shared";

export const profileInfo = {
  ...sharedProfileInfo,
  saveProfileInfo: async (items: { key: string; value: string }[], actorId: string) => {
    for (const item of items) {
      await prisma.setting.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value, updatedById: actorId },
        update: { value: item.value, updatedById: actorId },
      });
    }
  },
};

export const profilePassword = {
  ...sharedProfilePassword,
  validateOldPassword: async (userId: string, oldPassword: string) => {
    void oldPassword;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    // In a real app, compare with bcryptjs.compareSync(oldPassword, user.passwordHash)
    return !!user;
  },
  savePasswordChange: async (userId: string, newPasswordHash: string) => {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  },
};

export const profileSocial = {
  ...sharedProfileSocial,
  saveSocialInfo: async (items: { key: string; value: string }[], actorId: string) => {
    return Promise.all(
      items.map((item) =>
        prisma.setting.upsert({
          where: { key: item.key },
          create: { key: item.key, value: item.value, updatedById: actorId },
          update: { value: item.value, updatedById: actorId },
        }),
      ),
    );
  },
};

export const profileBank = {
  ...sharedProfileBank,
  saveBankInfo: async (items: { key: string; value: string }[], actorId: string) => {
    return Promise.all(
      items.map((item) =>
        prisma.setting.upsert({
          where: { key: item.key },
          create: { key: item.key, value: item.value, updatedById: actorId },
          update: { value: item.value, updatedById: actorId },
        }),
      ),
    );
  },
};

export const profileUserId = {
  ...sharedProfileUserId,
  saveUserIdInfo: async (userId: string, data: { name?: string; email?: string }) => {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },
};
