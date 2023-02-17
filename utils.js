import path from 'path';
import { fileURLToPath } from "url";
// Se agrega esto para asegurarnos que corra donde corra este codigo
// se utilize el path relativo a donde este corriendo
const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);

export default __dirname;