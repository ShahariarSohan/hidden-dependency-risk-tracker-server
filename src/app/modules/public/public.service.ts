import { envVariables } from "../../config/env";
import { prisma } from "../../config/prisma";

const getLandingStats = async () => {
  const teamCount = await prisma.team.count({ where: { status: "ACTIVE" } });
  const employeeCount = await prisma.employee.count({ where: { isDeleted: false } });
  const systemCount = await prisma.system.count({ where: { status: "ACTIVE" } });

  const activeSystems = await prisma.system.count({
    where: { 
      status: "ACTIVE",
      tasks: { some: {} } 
    },
  });
 
  const coverage = systemCount > 0 ? Math.round((activeSystems / systemCount) * 100) : 0;

  const resolvedHighRisks = await prisma.task.count({
    where: {
      status: "COMPLETED",
      priority: 5,
    },
  });
  const preventedLosses = resolvedHighRisks * Number(envVariables.COST_SAVINGS_PER_RESOLVED_RISK)

  const completedTasks = await prisma.task.findMany({
    where: { status: "COMPLETED", completedAt: { not: null } },
    select: { createdAt: true, completedAt: true },
    take: 50,
  });

  let totalDurationMs = 0;
  completedTasks.forEach((task) => {
    if (task.completedAt) {
      totalDurationMs += new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime();
    }
  });
  
  const avgDurationDays = completedTasks.length > 0 
    ? Math.round(totalDurationMs / completedTasks.length / (1000 * 60 * 60 * 24)) 
    : 0;

  const deletedEmployees = await prisma.employee.count({ where: { isDeleted: true } });
  const totalEmployeesEver = employeeCount + deletedEmployees;
  const attritionRate = totalEmployeesEver > 0 
    ? Math.round((deletedEmployees / totalEmployeesEver) * 100) 
    : 0;

  const now = new Date();
  const delayedSystemsCount = await prisma.system.count({
    where: {
      status: "ACTIVE",
      tasks: {
        some: {
          status: { in: ["PENDING", "IN_PROGRESS"] },
          dueDate: { lt: now },
        },
      },
    },
  });

  const criticalSystems = await prisma.system.findMany({
    where: {
      status: "ACTIVE",
      criticality: { gte: 3 },
    },
    include: { tasks: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } } } }
  });
  const criticalSystemsCount = criticalSystems.length;

  const currentRiskRevenueLoss = criticalSystemsCount * Number(envVariables.REVENUE_LOSS_PER_CRITICAL_SYSTEM);

  const protectedSystemsCount = await prisma.system.count({
    where: { status: "ACTIVE", criticality: { lt: 3 } }
  });

  const calculateRiskScore = (crit: number, prio: number, weight: number) => {
    const wCrit = Number(envVariables.RISK_WEIGHT_CRITICALITY);
    const wPrio = Number(envVariables.RISK_WEIGHT_PRIORITY);
    const wWork = Number(envVariables.RISK_WEIGHT_WORKLOAD);
    
    const score = ((crit * wCrit) + (prio * wPrio) + (weight * wWork)) * 10;
    return Math.min(Math.round(score), 100);
  };

  const employees = await prisma.employee.findMany({
    where: { isDeleted: false },
    include: { 
      user: { select: { email: true } },
      tasks: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } } } 
    }
  });

  let topEmployeeRisk = { id: "employee", title: "Employee Dependencies", riskLevel: 0, color: "red", description: "No critical bottlenecks detected.", details: { affected: "0 Projects", impact: "Low", trend: "Stable" } };
  
  if (employees.length > 0) {
    const empRisks = employees.map(emp => {
      const totalWeight = emp.tasks.reduce((sum, t) => sum + (t.workWeight || 1), 0);
      const avgPrio = emp.tasks.length > 0 ? (emp.tasks.reduce((sum, t) => sum + t.priority, 0) / emp.tasks.length) : 1;
      const score = calculateRiskScore(Number(envVariables.DEFAULT_EMPLOYEE_CRITICALITY), avgPrio, totalWeight);
      return { emp, score, totalWeight };
    }).sort((a, b) => b.score - a.score);

    if (empRisks[0] && empRisks[0].score > 30) {
      topEmployeeRisk = {
        ...topEmployeeRisk,
        riskLevel: empRisks[0].score,
        description: `Capacity bottleneck: ${empRisks[0].emp.user.email.split('@')[0]} is managing ${empRisks[0].totalWeight} weight units.`,
        details: { affected: `${empRisks[0].emp.tasks.length} Tasks`, impact: empRisks[0].score > 70 ? "Critical" : "Medium", trend: "Increasing" }
      };
    }
  }

  let topSystemRisk = { id: "system", title: "System Vulnerabilities", riskLevel: 0, color: "orange", description: "All systems operating within safe parameters.", details: { affected: "0 Services", impact: "Low", trend: "Stable" } };
  
  if (criticalSystems.length > 0) {
    const sysRisks = criticalSystems.map(sys => {
      const totalWeight = sys.tasks.reduce((sum, t) => sum + (t.workWeight || 1), 0);
      const avgPrio = sys.tasks.length > 0 ? (sys.tasks.reduce((sum, t) => sum + t.priority, 0) / sys.tasks.length) : 1;
      const score = calculateRiskScore(sys.criticality, avgPrio, totalWeight / Number(envVariables.SYSTEM_CAPACITY_FACTOR));
      return { sys, score };
    }).sort((a, b) => b.score - a.score);

    if (sysRisks[0] && sysRisks[0].score > 30) {
      topSystemRisk = {
        ...topSystemRisk,
        riskLevel: sysRisks[0].score,
        description: `High criticality failure point detected in ${sysRisks[0].sys.name}.`,
        details: { affected: `${sysRisks[0].sys.tasks.length} Active Tasks`, impact: sysRisks[0].score > 80 ? "Critical" : "High", trend: "Stable" }
      };
    }
  }

  const trends = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(23, 59, 59, 999);
    
    const activeOnDay = await prisma.task.count({
      where: {
        createdAt: { lte: d },
        OR: [
          { completedAt: null },
          { completedAt: { gt: d } }
        ]
      }
    });

    const dayRisk = Math.min(Math.round((activeOnDay / (employeeCount * Number(envVariables.TEAM_CAPACITY_FACTOR) || 1)) * 100), 100);
    
    trends.push({
      day: days[d.getDay()],
      risk: dayRisk,
      label: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    });
  }

  const teams = await prisma.team.findMany({
    where: { status: "ACTIVE" },
    include: { employees: { include: { tasks: { where: { status: { in: ["PENDING", "IN_PROGRESS"] } } } } } }
  });

  let topTeamRisk = { id: "team", title: "Team Overload", riskLevel: 0, color: "yellow", description: "All teams operating within capacity.", details: { affected: "0 Teams", impact: "Low", trend: "Stable" } };
  
  if (teams.length > 0) {
    const teamRisks = teams.map(team => {
      const activeTasks = team.employees.flatMap(e => e.tasks);
      const totalWeight = activeTasks.reduce((sum, t) => sum + (t.workWeight || 1), 0);
      const avgPrio = activeTasks.length > 0 ? (activeTasks.reduce((sum, t) => sum + t.priority, 0) / activeTasks.length) : 1;
      const score = calculateRiskScore(Number(envVariables.DEFAULT_EMPLOYEE_CRITICALITY), avgPrio, totalWeight / Number(envVariables.TEAM_CAPACITY_FACTOR));
      return { team, score, taskCount: activeTasks.length };
    }).sort((a, b) => b.score - a.score);

    if (teamRisks[0] && teamRisks[0].score > 20) {
      topTeamRisk = {
        ...topTeamRisk,
        riskLevel: teamRisks[0].score,
        description: `High pressure detected in ${teamRisks[0].team.name} with ${teamRisks[0].taskCount} active tasks.`,
        details: { affected: `${teamRisks.filter(r => r.score > 40).length} Teams`, impact: teamRisks[0].score > 60 ? "High" : "Medium", trend: "Increasing" }
      };
    }
  }

  const allRisks = [topEmployeeRisk, topSystemRisk, topTeamRisk].sort((a, b) => b.riskLevel - a.riskLevel);
  const actionItems = allRisks.slice(0, 3).map(risk => {
    if (risk.id === "employee") return `Document critical knowledge held by bottlenecked employees (${risk.details.affected})`;
    if (risk.id === "system") return `Implement redundancy for high-risk system: ${risk.description.split('in ')[1]?.replace('.', '') || 'Critical Services'}`;
    if (risk.id === "team") return `Redistribute tasks in ${risk.description.split('in ')[1]?.split(' with')[0] || 'overloaded teams'}`;
    return "Continuously monitor for emerging dependencies";
  });

  const totalHighTasksEver = await prisma.task.count({ where: { priority: { gte: 4 } } });
  const resolvedHighTasks = await prisma.task.count({ where: { priority: { gte: 4 }, status: "COMPLETED" } });
  const crisisReduction = totalHighTasksEver > 0 ? `${Math.round((resolvedHighTasks / totalHighTasksEver) * 100)}%` : "0%";

  const enterprisePreventedLosses = resolvedHighTasks * Number(envVariables.COST_SAVINGS_PER_RESOLVED_RISK);

  const moraleScoreVal = (10 - (attritionRate / 10)).toFixed(1);
  
  const indicators = [
    teamCount, employeeCount, coverage,
    enterprisePreventedLosses, crisisReduction, coverage,
    avgDurationDays, protectedSystemsCount, currentRiskRevenueLoss,
    criticalSystemsCount, attritionRate, delayedSystemsCount,
    moraleScoreVal, trends.length, topEmployeeRisk.riskLevel,
    topSystemRisk.riskLevel, topTeamRisk.riskLevel, actionItems.length
  ];

  const totalIndicators = indicators.filter(val => val !== undefined && val !== null).length;

  return {
    hero: {
      teams: teamCount,
      employees: employeeCount,
      coverage: coverage > 0 ? coverage : 0, 
    },
    beforeAfter: {
      preventedLosses: enterprisePreventedLosses > 0 ? `$${enterprisePreventedLosses.toLocaleString()}+` : "$0", 
      crisisReduction, 
      visibility: `${coverage}%`,     
      
      avgResolutionTime: avgDurationDays > 0 ? `${avgDurationDays} days` : "Under 24h",
      protectedProjects: protectedSystemsCount > 0 ? protectedSystemsCount : 0, 
      costImpact: currentRiskRevenueLoss > 0 ? `$${currentRiskRevenueLoss.toLocaleString()}` : "$0", 

      downtime: criticalSystemsCount > 0 ? `${criticalSystemsCount * Number(envVariables.DOWNTIME_MINUTES_PER_CRITICAL_SYSTEM)} mins` : "0 mins", 
      systemsAffected: `${criticalSystemsCount} services`, 
      revenueLoss: `$${currentRiskRevenueLoss.toLocaleString()}`,

      attritionRate: `${attritionRate}%`,
      delayedProjects: delayedSystemsCount > 0 ? delayedSystemsCount : 0,
      moraleScore: `${moraleScoreVal}/10`,
      earlyWarning: avgDurationDays > 0 ? `${Math.round(avgDurationDays * 1.5)} days` : "7 days", 
    },
    riskVisuals: {
      trends,
      cards: [topEmployeeRisk, topSystemRisk, topTeamRisk],
      actionItems,
      totalIndicators
    }
  };
};

export const publicService = {
  getLandingStats,
};
