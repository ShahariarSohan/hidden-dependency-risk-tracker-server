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
import { envVariables } from '../../config/env';

// ============================
// RISK CALCULATION ENGINE
// ============================
const calculateRiskScore = (crit: number, prio: number, weight: number) => {
  const wCrit = Number(envVariables.RISK_WEIGHT_CRITICALITY);
  const wPrio = Number(envVariables.RISK_WEIGHT_PRIORITY);
  const wWork = Number(envVariables.RISK_WEIGHT_WORKLOAD);
  
  // Base normalization (Expected Max Sum = 10)
  const score = ((crit * wCrit) + (prio * wPrio) + (weight * wWork)) * 10;
  return Math.min(Math.round(score), 100);
};

const getRiskLevel = (score: number) => {
  if (score >= 70) return RiskLevel.HIGH;
  if (score >= 30) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
};

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

  let totalWeight = 0;
  let totalPrio = 0;
 
  tasks.forEach((task) => {
    totalWeight += task.workWeight || 1;
    totalPrio += task.priority;
  });

  const avgPrio = tasks.length > 0 ? (totalPrio / tasks.length) : 0;
  const riskScore = tasks.length > 0 ? calculateRiskScore(3, avgPrio, totalWeight) : 0;

  return {
    totalActiveTasks: tasks.length,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
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

  const totalWeight = activeTasks.reduce((sum, task) => sum + (task.workWeight || 1), 0);
  const avgPrio = activeTasks.length > 0 
    ? activeTasks.reduce((sum, task) => sum + task.priority, 0) / activeTasks.length 
    : 0;

  const riskScore = calculateRiskScore(system.criticality, avgPrio, totalWeight / 2); // Systems use adjusted weight

  return {
    systemId: system.id,
    systemName: system.name,
    criticality: system.criticality,
    activeTasks: activeTasks.length,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
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

  let teamTotalScore = 0;

  const employeeRisks: any[] = team.employees.map((employee: any) => {
    const activeTasks = employee.tasks.filter((t: any) => 
      t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS
    );

    const totalWeight = activeTasks.reduce((sum: number, t: any) => sum + (t.workWeight || 1), 0);
    const avgPrio = activeTasks.length > 0 
      ? activeTasks.reduce((sum: number, t: any) => sum + t.priority, 0) / activeTasks.length 
      : 0;

    const riskScore = activeTasks.length > 0 ? calculateRiskScore(3, avgPrio, totalWeight) : 0;
    teamTotalScore += riskScore;

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      riskScore,
      employeeRiskLevel: getRiskLevel(riskScore)
    };
  });

  const teamRiskScore = team.employees.length > 0 ? Math.round(teamTotalScore / team.employees.length) : 0;

  return {
    teamId: team.id,
    team,
    teamName: team.name,
    totalEmployees: team.employees.length,
    teamRiskScore,
    teamRiskLevel: getRiskLevel(teamRiskScore),
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
    const totalWeight = employee.tasks.reduce((sum: number, t: any) => sum + (t.workWeight || 1), 0);
    const avgPrio = employee.tasks.length > 0 
      ? employee.tasks.reduce((sum: number, t: any) => sum + t.priority, 0) / employee.tasks.length 
      : 0;

    const riskScore = employee.tasks.length > 0 ? calculateRiskScore(3, avgPrio, totalWeight) : 0;

    return {
      type: "EMPLOYEE",
      employeeId: employee.id,
      name: employee.name,
      email: employee.email,
      taskCount: employee.tasks.length,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
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
    const totalWeight = system.tasks.reduce((sum: number, t: any) => sum + (t.workWeight || 1), 0);
    const avgPrio = system.tasks.length > 0 
      ? system.tasks.reduce((sum: number, t: any) => sum + t.priority, 0) / system.tasks.length 
      : 0;

    const riskScore = calculateRiskScore(system.criticality, avgPrio, totalWeight / 2);

    return {
      type: "SYSTEM",
      systemId: system.id,
      name: system.name,
      criticality: system.criticality,
      taskCount: system.tasks.length,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
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
    let teamTotalScore = 0;
    
    team.employees.forEach(emp => {
      const activeTasks = emp.tasks;
      const totalWeight = activeTasks.reduce((sum: number, t: any) => sum + (t.workWeight || 1), 0);
      const avgPrio = activeTasks.length > 0 ? activeTasks.reduce((sum: number, t: any) => sum + t.priority, 0) / activeTasks.length : 0;
      teamTotalScore += activeTasks.length > 0 ? calculateRiskScore(3, avgPrio, totalWeight) : 0;
    });

    const riskScore = team.employees.length > 0 ? Math.round(teamTotalScore / team.employees.length) : 0;

    return {
      type: "TEAM",
      teamId: team.id,
      name: team.name,
      employeeCount: team.employees.length,
      systemCount: team.systems.length,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
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
      const totalWeight = employee.tasks.reduce((sum: number, t: any) => sum + (t.workWeight || 1), 0);
      const avgPrio = employee.tasks.length > 0 
        ? employee.tasks.reduce((sum: number, t: any) => sum + t.priority, 0) / employee.tasks.length 
        : 0;

      const riskScore = employee.tasks.length > 0 ? calculateRiskScore(3, avgPrio, totalWeight) : 0;

      return {
        employeeId: employee.id,
        name: employee.name,
        riskScore,
        riskLevel: getRiskLevel(riskScore),
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
      const totalWeight = system.tasks.reduce((sum: number, t: any) => sum + (t.workWeight || 1), 0);
      const avgPrio = system.tasks.length > 0 
        ? system.tasks.reduce((sum: number, t: any) => sum + t.priority, 0) / system.tasks.length 
        : 0;

      const riskScore = calculateRiskScore(system.criticality, avgPrio, totalWeight / 2);

      return {
        systemId: system.id,
        name: system.name,
        riskScore,
        riskLevel: getRiskLevel(riskScore),
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
      let teamTotalScore = 0;
      
      team.employees.forEach(emp => {
        const activeTasks = emp.tasks;
        const totalWeight = activeTasks.reduce((sum: number, t: any) => sum + (t.workWeight || 1), 0);
        const avgPrio = activeTasks.length > 0 ? activeTasks.reduce((sum: number, t: any) => sum + t.priority, 0) / activeTasks.length : 0;
        teamTotalScore += activeTasks.length > 0 ? calculateRiskScore(3, avgPrio, totalWeight) : 0;
      });

      const riskScore = team.employees.length > 0 ? Math.round(teamTotalScore / team.employees.length) : 0;

      return {
        teamId: team.id,
        name: team.name,
        riskScore,
        riskLevel: getRiskLevel(riskScore),
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
