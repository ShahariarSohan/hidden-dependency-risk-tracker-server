/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "../../../../prisma/generated/client";
import { prisma } from "../../config/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../shared/paginationHelper";
import { managerSearchAbleFields } from "./manager.constant";


const getAllManager = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.ManagerWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: managerSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.ManagerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.manager.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.manager.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

export const managerService = {
  getAllManager,
};
