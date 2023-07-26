import { Router } from "express";
import ProductController from "../../controllers/product.controller.js";
import path from 'path';
import { fileURLToPath } from "url";

import { privateAccess,authorizationCall } from "../../../utils.js";

const router = Router();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const controller = new ProductController(path.join(dirname,"../../data",'productos.json'));

router.get("/",privateAccess,authorizationCall('User'),controller.renderPage)

export default router;