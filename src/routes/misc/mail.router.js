import { Router } from "express";
import {mailSend} from '../../controllers/misc.controller.js'

const router = Router();
router.get('/', mailSend)

export default router;