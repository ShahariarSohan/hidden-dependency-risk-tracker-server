/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { teamRoutes } from "../modules/team/team.route";


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
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/team",
    route: teamRoutes,
  },
];
 

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
