import { Router } from "express";
import { privateAccess,authorizationCall } from "../../../utils.js";
import {chat} from '../../controllers/misc.controller.js'

const router = Router();
router.get('/',privateAccess,authorizationCall('User'), chat)

export default router;