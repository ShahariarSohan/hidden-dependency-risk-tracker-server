import  httpStatus  from 'http-status';
import { Request } from "express";
import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";

const createTeam = async (req: Request) => {
 
    const isTeamExist = await prisma.team.findFirst({
        where: {
          name:req.body.name
      }
    })
    if (isTeamExist) {
        throw new AppError(httpStatus.BAD_REQUEST,"Team already exist")
    }
 

  const result = await prisma.team.create({
    data: req.body,
  });

  return result;
};

export const teamService = {
    createTeam
}