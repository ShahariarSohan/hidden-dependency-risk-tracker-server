/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../config/prisma";
import { TaskStatus } from "../../interfaces/taskStatus";

// ============================
// SINGLE EMPLOYEE RISK
// ============================
const getEmployeeRisk = async (employeeId: string) => {
  const tasks = await prisma.task.findMany({
    where: {
      employeeId,
      status: {
        in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
      },
    },
    include: {
      system: true,
    },
  });

  let riskScore = 0;
  tasks.forEach((task) => {
    riskScore += task.priority * task.system.criticality;
  });

  return {
    employeeId,
    totalActiveTasks: tasks.length,
    riskScore,
    riskLevel: riskScore > 30 ? "HIGH" : riskScore > 15 ? "MEDIUM" : "LOW",
    tasks,
  };
};

// ============================
// SINGLE SYSTEM RISK
// ============================
const getSystemRisk = async (systemId: string) => {
  const system = await prisma.system.findUniqueOrThrow({
    where: { id: systemId },
    include: { tasks: true },
  });

  const activeTasks = system.tasks.filter(
    (task) =>
      task.status === TaskStatus.PENDING ||
      task.status === TaskStatus.IN_PROGRESS
  );

  const riskScore =
    activeTasks.reduce((sum, task) => sum + task.priority, 0) *
    system.criticality;

  return {
    systemId: system.id,
    systemName: system.name,
    criticality: system.criticality,
    activeTasks: activeTasks.length,
    riskScore,
    riskLevel: riskScore > 30 ? "HIGH" : riskScore > 15 ? "MEDIUM" : "LOW",
  };
};

// ============================
// SINGLE TEAM RISK
// ============================
const getTeamRisk = async (teamId: string) => {
  const team = await prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    include: {
      employees: {
        include: {
          tasks: {
            include: { system: true },
          },
        },
      },
    },
  });

  let teamRiskScore = 0;

  const employeeRisks: any[] = [];

  team.employees.forEach((employee) => {
    let employeeRisk = 0;

    employee.tasks.forEach((task) => {
      if (
        task.status === TaskStatus.PENDING ||
        task.status === TaskStatus.IN_PROGRESS
      ) {
        employeeRisk += task.priority * task.system.criticality;
      }
    });

    teamRiskScore += employeeRisk;

    employeeRisks.push({
      employeeId: employee.id,
      employeeName: employee.name,
      riskScore: employeeRisk,
    });
  });

  return {
    teamId: team.id,
    teamName: team.name,
    totalEmployees: team.employees.length,
    teamRiskScore,
    teamRiskLevel:
      teamRiskScore > 30 ? "HIGH" : teamRiskScore > 15 ? "MEDIUM" : "LOW",
    employeeRisks,
  };
};
// ALL EMPLOYEE RISKS
const getAllEmployeeRisk = async () => {
  const employees = await prisma.employee.findMany({
    where: { isDeleted: false },
    include: {
      tasks: {
        where: {
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        include: { system: true },
      },
    },
  });

  return employees.map((employee) => {
    const riskScore = employee.tasks.reduce(
      (sum, task) => sum + task.priority * task.system.criticality,
      0
    );

    return {
      type: "EMPLOYEE",
      employeeId: employee.id,
      name: employee.name,
      riskScore,
      riskLevel: riskScore > 30 ? "HIGH" : riskScore > 15 ? "MEDIUM" : "LOW",
    };
  });
};
//ALL SYSTEM RISKS
const getAllSystemRisk = async () => {
  const systems = await prisma.system.findMany({
    where: { status: "ACTIVE" },
    include: {
      tasks: {
        where: {
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      },
    },
  });

  return systems.map((system) => {
    const riskScore =
      system.tasks.reduce((sum, task) => sum + task.priority, 0) *
      system.criticality;

    return {
      type: "SYSTEM",
      systemId: system.id,
      name: system.name,
      riskScore,
      riskLevel: riskScore > 30 ? "HIGH" : riskScore > 15 ? "MEDIUM" : "LOW",
      criticality: system.criticality,
    };
  });
};
//ALL TEAM RISKS
const getAllTeamRisk = async () => {
  const teams = await prisma.team.findMany({
    where: { status: "ACTIVE" },
    include: {
      employees: {
        include: {
          tasks: {
            where: {
              status: { in: ["PENDING", "IN_PROGRESS"] },
            },
            include: { system: true },
          },
        },
      },
    },
  });

  return teams.map((team) => {
    let riskScore = 0;

    team.employees.forEach((employee) => {
      employee.tasks.forEach((task) => {
        riskScore += task.priority * task.system.criticality;
      });
    });

    return {
      type: "TEAM",
      teamId: team.id,
      name: team.name,
      riskScore,
      riskLevel: riskScore > 30 ? "HIGH" : riskScore > 15 ? "MEDIUM" : "LOW",
    };
  });
};

// ============================
// DASHBOARD RISK (GLOBAL)
// ============================

const getRiskDashboard = async () => {
  const [employeeRisks, systemRisks, teamRisks] = await Promise.all([
    getAllEmployeeRisk(),
    getAllSystemRisk(),
    getAllTeamRisk(),
  ]);

  // ========================
  // DASHBOARD METRICS
  // ========================

  const highRiskEmployees = employeeRisks.filter((e) => e.riskLevel === "HIGH");
  const highRiskSystems = systemRisks.filter((s) => s.riskLevel === "HIGH");
  const highRiskTeams = systemRisks.filter((t) => t.riskLevel === "HIGH");

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
      teamRisks,
    },
  };
};

// ============================
// EXPORT
// ============================
export const riskAnalysisService = {
  getEmployeeRisk,
  getSystemRisk,
  getTeamRisk,
  getRiskDashboard,
  getAllEmployeeRisk,
  getAllSystemRisk,
  getAllTeamRisk,
};
