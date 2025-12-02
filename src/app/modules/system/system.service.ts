import httpStatus from "http-status";
import { Request } from "express";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";

const createSystem = async (req: Request) => {
     const isTeamExist = await prisma.team.findFirst({
       where: {
         id: req.body.teamId,
       },
     });
     if (!isTeamExist) {
       throw new AppError(
         httpStatus.BAD_REQUEST,
         "Team does't exist"
       );
     }
  const isSystemExist = await prisma.system.findFirst({
      where: {
        name:req.body.name,
        teamId:req.body.teamId
    },
  });
  if (isSystemExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "This team is managing another system");
  }

  const result = await prisma.system.create({
    data: req.body,
  });

  return result;
};

export const systemService = {
  createSystem,
};
