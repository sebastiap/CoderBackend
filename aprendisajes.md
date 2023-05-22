### Tipo Modulo en Package.json
When you have "type": "module" in the package.json file, your source code should use import syntax. When you do not have, you should use require syntax; that is, adding "type": "module" to the package.json enables ES 6 modules. For more info, see here.

## API
Una API es un contrato entre 2 partes(que pueden ser 2 aplicaciones, cliente y servidor, una aplicacion y un browser,etcetera), en la que se acuerdan la forma de comunicacion. Esto incluye:
* El Endpoint a donde se accedera
* El meto a utilizar 
* La informacion a enviar cuando se accede.

## API REST
Al decir que una API es REST significa que tambien se acuerda un formato para la informacion. Generalmente se utiliza el formato JSON, pero no es el unico.

## Diferencia entre Objeto Javascript y JSON
https://es.stackoverflow.com/questions/164943/cu%C3%A1l-es-la-diferencia-entre-json-y-un-objeto

## MongoDB no se lleva bien con filtrar por id
MongoDB administra su propio id con _id, las busquedas que realicemos con el campo id, no llegas a bien puerto pues ignora dicho campo. De hecho, no lo graba aunque lo incluyamos.

## MongoDB al paginar
Si pasamos el parametro, lean:true en la parte de paginacion, completara con un campo id (con el valor de _id). En caso de que tengamos un id propio lo pisara con el nuestro.

## Que es Dao?
En software de computadores, un objeto de acceso a datos (en inglés, data access object, abreviado DAO) es un componente de software que suministra una interfaz común entre la aplicación y uno o más dispositivos de almacenamiento de datos, tales como una Base de datos o un archivo. El término se aplica frecuentemente al Patrón de diseño Object.

## El patrón DAO 
Consiste en separar la lógica de acceso a la fuente de datos en un archivo. Éste contará con métodos homologados de manera que, si en algún momento necesitamos cambiar el acceso a los datos, el DAO de la nueva fuente de datos tenga exactamente el mismo nombre de métodos que el anterior

## Patrón Factory
La idea del patrón Factory, es basarse en una variable de entorno o configuración por argumentos, la cual tomará para decidir qué tipo de persistencia manejar.
Esta “Fábrica” se encargará de devolver sólo el DAO que necesitemos acorde con lo solicitado en el entorno o los argumentos. 

## Cadena de responsabilidades

Permite que, cuando algún elemento envía información (sender) y existe alguien que lo reciba (receiver), a esa petición puedan recibirla y procesarla múltiples objetos (o funciones). Esto permite tener un mejor control de la petición, agregar filtros y reenviar el objeto con sus respectivas alteraciones.

## Decorador

Permite mantener un objeto inicial genérico para poder procesar información, pero al ser utilizado éste está abierto a ser transformado a lo largo del flujo del proceso. 
De no querer que un objeto tenga añadiduras nuevas, podemos congelar el objeto con “Object.freeze()”, sin embargo, rompería con el patrón decorador al no permitir que se le cambie.

## Proxy

También conocido como Proxy routing o simplemente Routing pattern, implica tener un sustituto (surrogate), el cual reciba una petición y controlar el acceso hacia otro objeto (subject). El sustituto recibirá todas las peticiones, para después corroborar a quién debería corresponder dicha petición y enviársela.
El sustituto y el objeto final deben contar con la misma interfaz. 

## Patrón MVC
Es un patrón que ya se ha platicado ampliamente en las últimas clases, éste consistiendo en la separación de capas de modelo (persistencia), Vista (presentación) y Controlador (Negocio).
Recordemos que al final el objetivo es mantener un flujo con actividades bien delegadas y así poder tener mejor control sobre el código. 

## Patrón Singleton
Es un patrón utilizado para tener una instancia global a nivel aplicación. 
En ocasiones, se requiere que la aplicación tenga una única instancia de dicha clase (Por ejemplo, al abrir una conexión en base de datos). 
El patrón singleton corrobora si ya existe una instancia de esta clase. En caso de que sí, devolverá la instancia, caso contrario creará la instancia.

