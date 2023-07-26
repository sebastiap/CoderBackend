import { Router } from "express";
import { privateAccess } from "../../../utils.js";
import { currentSession } from "../../controllers/misc.controller.js";

const router = Router();
router.get('/current',privateAccess, currentSession)


export default router;