import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";

import { UserRole } from "../interfaces/userRole";
import { envVariables } from "../config/env";

const seedAdmin = async () => {
  try {
    const isAdminExist = await prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (isAdminExist) {
      console.log("Admin already exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      envVariables.ADMIN_PASSWORD as string,
      Number(envVariables.BCRYPT_SALT_ROUND)
    );

    const adminData = await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email: envVariables.ADMIN_EMAIL as string,
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });

      return await tx.admin.create({
        data: {
          name: envVariables.ADMIN_NAME as string,
          email: envVariables.ADMIN_EMAIL as string,
          contactNumber: envVariables.ADMIN_CONTACT_NUMBER as string,
        },
      });
    });
    console.log("Super Admin Created Successfully!", adminData);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
};

export default seedAdmin;
