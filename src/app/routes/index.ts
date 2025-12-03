/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { teamRoutes } from "../modules/team/team.route";
import { systemRoutes } from "../modules/system/system.route";
import { taskRoutes } from "../modules/task/task.route";
import { employeeRoutes } from "../modules/employee/employee.route";


export const router = Router();
interface IModuleRoutes{
    path: string;
    route: any;
}
const moduleRoutes: IModuleRoutes[] = [
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
    route: userRoutes,
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
];
 

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
