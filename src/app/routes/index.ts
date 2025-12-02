/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";


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
];
 

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
