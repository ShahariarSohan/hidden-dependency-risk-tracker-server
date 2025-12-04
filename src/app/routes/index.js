/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { teamRoutes } from "../modules/team/team.route";
import { systemRoutes } from "../modules/system/system.route";
import { taskRoutes } from "../modules/task/task.route";
import { employeeRoutes } from "../modules/employee/employee.route";
import { riskAnalysisRoutes } from "../modules/riskAnalysis/riskAnalysis.route";
import { managerRoutes } from "../modules/manager/manager.route";
export const router = Router();
const moduleRoutes = [
    {
        path: "/user",
        route: userRoutes,
    },
    {
        path: "/employee",
        route: employeeRoutes,
    },
    {
        path: "/manager",
        route: managerRoutes,
    },
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/team",
        route: teamRoutes,
    },
    {
        path: "/system",
        route: systemRoutes,
    },
    {
        path: "/task",
        route: taskRoutes,
    },
    {
        path: "/riskAnalysis",
        route: riskAnalysisRoutes,
    },
];
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
