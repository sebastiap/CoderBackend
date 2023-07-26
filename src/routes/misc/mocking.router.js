import { Router } from "express";
import { privateAccess } from "../../../utils.js";
import {mock} from '../../controllers/misc.controller.js'


const router = Router();
router.get('/',privateAccess,mock);

export default router;