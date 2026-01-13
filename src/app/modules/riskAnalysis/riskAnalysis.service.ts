import  httpStatus  from 'http-status-codes';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "../../config/prisma";
import AppError from "../../errorHelpers/AppError";
import { IPaginationOptions } from "../../interfaces/pagination";
import { RiskLevel } from "../../interfaces/riskAnalysis";
import { TaskStatus } from "../../interfaces/taskStatus";
import { IAuthUser } from "../../interfaces/user.interface";
import { ActiveStatus } from "../../interfaces/userRole";
import { paginationHelper } from "../../shared/paginationHelper";
import { employeeRiskSearchableFields, systemRiskSearchableFields, teamRiskSearchableFields } from "./riskAnalysis.constant";
import { Prisma } from '@prisma/client';

// ============================
// SINGLE EMPLOYEE RISK
// ============================
const getEmployeeOwnRisk = async (user:IAuthUser) => {
  const employee = await prisma.employee.findFirstOrThrow({
    where:{email:user.email,isDeleted:false}
  })
  const tasks = await prisma.task.findMany({
    where: {
      employeeId:employee.id,
      status: {
        in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
      },
    },
    include: {
      system: true,
      employee:true
    },
  });

  let riskScore = 0;
 
  tasks.forEach((task) => {
    riskScore +=Number(task.priority )* Number(task.system.criticality);
  });

  return {
    totalActiveTasks: tasks.length,
    riskScore,
    riskLevel: riskScore > 30 ? RiskLevel.HIGH : riskScore > 15 ? RiskLevel.MEDIUM : RiskLevel.LOW,
    tasks,
  };
};

// ============================
// SINGLE SYSTEM RISK
// ============================
const getSystemRisk = async (systemId: string) => {
  const system = await prisma.system.findUniqueOrThrow({
    where: { id: systemId, status: { not: ActiveStatus.DELETED } },
    include: { tasks: true },
  });

  const activeTasks = system.tasks.filter(
    (task) =>
      task.status === TaskStatus.PENDING ||
      task.status === TaskStatus.IN_PROGRESS
  );

  const riskScore =
    activeTasks.reduce((sum, task) => sum + Number(task.priority), 0) *
    Number(system.criticality);

  return {
    systemId: system.id,
    systemName: system.name,
    criticality: system.criticality,
    activeTasks: activeTasks.length,
    riskScore,
    riskLevel: riskScore > 40 ? RiskLevel.HIGH : riskScore > 20 ? RiskLevel.MEDIUM : RiskLevel.LOW,
  };
};

// ============================
// SINGLE TEAM RISK
// ============================
const getManagerTeamRisk = async (user:IAuthUser) => {
  const manager = await prisma.manager.findFirstOrThrow({
    where: { email: user.email, isDeleted: false },
  });
  if (!manager.teamId) {
    throw new AppError(httpStatus.BAD_REQUEST,"Manager do not have a team")
  }
  const team:any = await prisma.team.findUniqueOrThrow({
    where: { id: manager.teamId,status:{not:ActiveStatus.DELETED} },
    include: {
      employees: {
        include: {
          tasks: {
            include: { system: true,employee:true },
          },
        },
      },
    },
  });

  let teamRiskScore = 0;

  const employeeRisks: any[] = [];

  team.employees.forEach((employee:any) => {
    let employeeRisk = 0;
    let employeeRiskLevel;
    employee.tasks.forEach((task:any) => {
      if (
        task.status === TaskStatus.PENDING ||
        task.status === TaskStatus.IN_PROGRESS
      ) {
        employeeRisk += Number(task.priority) * Number(task.system.criticality);
        employeeRiskLevel = employeeRisk > 50 ? RiskLevel.HIGH : employeeRisk > 25 ? RiskLevel.MEDIUM : RiskLevel.LOW;
      }
    });

    teamRiskScore += employeeRisk;

    employeeRisks.push({
      employeeId: employee.id,
      employeeName: employee.name,
      riskScore: employeeRisk,
      employeeRiskLevel
    });
  });

  return {
    teamId: team.id,
    team,
    teamName: team.name,
    totalEmployees: team.employees.length,
    teamRiskScore,
    teamRiskLevel:
      teamRiskScore > 50 ? RiskLevel.HIGH : teamRiskScore > 25 ? RiskLevel.MEDIUM : RiskLevel.LOW,
    employeeRisks,
  };
};
// ALL  EMPLOYEE RISKS
const getAllEmployeeRisk = async (
  filters: any,
  paginationOptions: IPaginationOptions
)=> {
  const { searchTerm, riskLevel } = filters;

  /* ------------------ pagination & sorting ------------------ */
  const { limit, skip, page, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  /* ------------------ where conditions ------------------ */
  const andConditions: Prisma.EmployeeWhereInput[] = [{ isDeleted: false }];

  // ✅ search
  if (searchTerm) {
    andConditions.push({
      OR: employeeRiskSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereCondition: Prisma.EmployeeWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  /* ------------------ fetch employees ------------------ */
  const employees = await prisma.employee.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: sortBy && sortOrder ? { [sortBy]: sortOrder } : undefined,
    include: {
      tasks: {
        where: {
          status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
        },
        include: {
          system: true,
        },
      },
    },
  });

  /* ------------------ risk calculation ------------------ */
  let data = employees.map((employee) => {
    const riskScore = employee.tasks.reduce(
      (sum, task) => sum + Number(task.priority) * Number(task.system.criticality),
      0
    );

    const riskLevelCalculated =
      riskScore > 30 ? RiskLevel.HIGH : riskScore > 15 ? RiskLevel.MEDIUM : RiskLevel.LOW;

    return {
      type: "EMPLOYEE",
      employeeId: employee.id,
      name: employee.name,
      email: employee.email,
      taskCount: employee.tasks.length,
      riskScore,
      riskLevel: riskLevelCalculated,
    };
  });

  /* ------------------ filter by riskLevel (post-calc) ------------------ */
  if (riskLevel) {
    data = data.filter((item) => item.riskLevel === riskLevel);
  }

  /* ------------------ total count ------------------ */
  const total = data.length;

  return {
    meta: {
      page,
      limit,
      total,
    },
    data,
  };
};
//ALL SYSTEM RISKS
const getAllSystemRisk = async (
  filters: any,
  paginationOptions: IPaginationOptions
) => {
  const { searchTerm, riskLevel } = filters;
  const { limit, skip, page } =
    paginationHelper.calculatePagination(paginationOptions);

  const andConditions: Prisma.SystemWhereInput[] = [{ status:{not:ActiveStatus.DELETED}}];

  if (searchTerm) {
    andConditions.push({
      OR: systemRiskSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereCondition: Prisma.SystemWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const systems = await prisma.system.findMany({
    where: whereCondition,
    skip,
    take: limit,
    include: {
      tasks: {
        where: {
          status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
        },
      },
    },
  });

  let data = systems.map((system) => {
    const riskScore = system.tasks.reduce(
      (sum, task) => sum + Number(task.priority) * Number(system.criticality),
      0
    );

    const riskLevelCalculated =
      riskScore > 40 ? RiskLevel.HIGH : riskScore > 20 ? RiskLevel.MEDIUM : RiskLevel.LOW;

    return {
      type: "SYSTEM",
      systemId: system.id,
      name: system.name,
      criticality: system.criticality,
      taskCount: system.tasks.length,
      riskScore,
      riskLevel: riskLevelCalculated,
    };
  });

  if (riskLevel) {
    data = data.filter((item) => item.riskLevel === riskLevel);
  }

  return {
    meta: {
      page,
      limit,
      total: data.length,
    },
    data,
  };
};

//ALL TEAM RISKS
const getAllTeamRisk = async (
  filters: any,
  paginationOptions: IPaginationOptions
) => {
  const { searchTerm, riskLevel } = filters;
  const { limit, skip, page } =
    paginationHelper.calculatePagination(paginationOptions);

  const andConditions: Prisma.TeamWhereInput[] = [{status:{not:ActiveStatus.DELETED}}];

  if (searchTerm) {
    andConditions.push({
      OR: teamRiskSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereCondition: Prisma.TeamWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const teams = await prisma.team.findMany({
    where: whereCondition,
    skip,
    take: limit,
    include: {
      employees: {
        include: {
          tasks: {
            where: {
              status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
            },
            include: {
              system: true,
            },
          },
        },
      },
      systems:true
    },
  });

  let data = teams.map((team) => {
    const riskScore = team.employees
      .flatMap((m) => m.tasks)
      .reduce((sum, task) => sum + Number(task.priority) * Number(task.system.criticality), 0);

    const riskLevelCalculated =
      riskScore > 50 ? RiskLevel.HIGH : riskScore > 25 ? RiskLevel.MEDIUM : RiskLevel.LOW;

    return {
      type: "TEAM",
      teamId: team.id,
      name: team.name,
      employeeCount: team.employees.length,
      systemCount: team.systems.length,
      riskScore,
      riskLevel: riskLevelCalculated,
    };
  });

  if (riskLevel) {
    data = data.filter((item) => item.riskLevel === riskLevel);
  }

  return {
    meta: {
      page,
      limit,
      total: data.length,
    },
    data,
  };
};


// ============================
// DASHBOARD RISK (GLOBAL)
// ============================
const getAllEmployeeRiskForDashboard = async () => {
  const employees = await prisma.employee.findMany({
    where: { isDeleted: false },
    include: {
      tasks: {
        where: {
          status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
        },
        include: {
          system: true,
        },
      },
    },
  });

  return employees
    .map((employee) => {
      const riskScore = employee.tasks.reduce(
        (sum, task) => sum + Number(task.priority) * Number(task.system.criticality),
        0
      );

      return {
        employeeId: employee.id,
        name: employee.name,
        riskScore,
        riskLevel: riskScore > 30 ? RiskLevel.HIGH : riskScore > 15 ? RiskLevel.MEDIUM : RiskLevel.LOW,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
};
const getAllSystemRiskForDashboard = async () => {
  const systems = await prisma.system.findMany({
    where: { status:{not: ActiveStatus.DELETED }},
    include: {
      tasks: {
        where: {
          status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
        },
      },
    },
  });

  return systems
    .map((system) => {
      const riskScore = system.tasks.reduce(
        (sum, task) => sum + Number(task.priority) * Number(system.criticality),
        0
      );

      return {
        systemId: system.id,
        name: system.name,
        riskScore,
        riskLevel: riskScore > 40 ? RiskLevel.HIGH : riskScore > 20 ? RiskLevel.MEDIUM : RiskLevel.LOW,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
};
const getAllTeamRiskForDashboard = async () => {
  const teams = await prisma.team.findMany({
    where: { status: { not: ActiveStatus.DELETED } },
    include: {
      employees: {
        include: {
          tasks: {
            where: {
              status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
            },
            include: {
              system: true,
            },
          },
        },
      },
    },
  });

  return teams
    .map((team) => {
      const riskScore = team.employees
        .flatMap((employee) => employee.tasks)
        .reduce(
          (sum, task) => sum + Number(task.priority) * Number(task.system.criticality),
          0
        );

      return {
        teamId: team.id,
        name: team.name,
        riskScore,
        riskLevel: riskScore > 50 ? RiskLevel.HIGH : riskScore > 25 ? RiskLevel.MEDIUM : RiskLevel.LOW,
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
};

const getRiskDashboard = async () => {
  const [employeeRisks, systemRisks, teamRisks] = await Promise.all([
    getAllEmployeeRiskForDashboard(),
    getAllSystemRiskForDashboard(),
    getAllTeamRiskForDashboard(),
  ]);

  // ========================
  // DASHBOARD METRICS
  // ========================

  const highRiskEmployees = employeeRisks.filter((e) => e.riskLevel === RiskLevel.HIGH);
  const highRiskSystems = systemRisks.filter((s) => s.riskLevel === RiskLevel.HIGH);
  const highRiskTeams = teamRisks.filter((t) => t.riskLevel === RiskLevel.HIGH);

  return {
    summary: {
      highRiskEmployeeCount: highRiskEmployees.length,
      highRiskTeamCount: highRiskTeams.length,
      highRiskSystemCount: highRiskSystems.length,
    },
    rankings: {
      topRiskEmployees: employeeRisks.slice(0, 5),
      topRiskSystems: systemRisks.slice(0, 5),
      topRiskTeams: teamRisks.slice(0, 5),
    },
    charts: {
      employeeRiskChart: employeeRisks,
      systemRiskChart: systemRisks,
      teamRiskChart: teamRisks,
    },

    tables: {
      highRiskEmployees,
      highRiskSystems,
      highRiskTeams,
    },
  };
}

const getRiskHistory = async () => {
    // TODO: Implement actual database call once schema is ready
  return [];
}

// ============================
// EXPORT
// ============================
export const riskAnalysisService = {
  getEmployeeOwnRisk,
  getSystemRisk,
  getManagerTeamRisk,
  getRiskDashboard,
  getAllEmployeeRisk,
  getAllSystemRisk,
  getAllTeamRisk,
  getRiskHistory,
};
