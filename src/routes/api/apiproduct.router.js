import { Router } from "express";
import __dirname from '../../../utils.js';
import ProductController from "../../controllers/product.controller.js";
import path from 'path';
import { fileURLToPath } from "url";

const router = Router();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const controller = new ProductController(path.join(dirname,"../../data",'productos.json'));

router.get("/",controller.getApi);

router.get('/:pid',controller.getByIdApi);

router.post('/', controller.postProduct);

router.put('/:pid', controller.putProduct);

router.delete('/:pid', controller.deleteApi);

export default router;