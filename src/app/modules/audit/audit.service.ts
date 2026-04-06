import { prisma } from "../../config/prisma";
import { paginationHelper } from "../../shared/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { Prisma } from "@prisma/client";
import { auditSearchAbleFields } from "./audit.constant";

const getAllAuditLogs = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.AuditLogWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: auditSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.AuditLogWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.auditLog.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  const total = await prisma.auditLog.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

export const auditService = {
  getAllAuditLogs,
};
