/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";


export const router = Router();
interface IModuleRoutes{
    path: string;
    route: any;
}
const moduleRoutes:IModuleRoutes[] = []
 

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
