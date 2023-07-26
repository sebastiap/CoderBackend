import { Router } from "express";
import UserManager from '../../controllers/user.controller.js';
import path from 'path';
import { fileURLToPath } from "url";

import nodemailer from 'nodemailer';
import config from "../../config/config.js";
import __dirname from '../../../utils.js';
import {uploader} from "../../../utils.js";

const transport = nodemailer.createTransport({
    service:'gmail',
    port:587,
    auth:{
        user:config.mail,
        pass:config.mailPassword
    }
})

const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const manager = new UserManager(path.join(dirname,"../../data",'carrito.json'));

router.post('/:uid/documents',uploader.single('file'), manager.upload);

router.get('/', manager.getAll);

// router.get('/:mail', await manager.getOne);

// ESTO FALLA SI LO CAMBIO
router.get('/:mail',manager.mail);

router.get('/premium/:uid',  manager.getByIdPremium);
    
router.delete('/', manager.deleteInactives);
router.delete('/:email', manager.delete);
    

export default router;
