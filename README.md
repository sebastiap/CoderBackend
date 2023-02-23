# Curso Backend Coderhouse

Este proyecto sirve como repositorio de las entregas semanales del curso de Programacion Backend de Coderhouse.

## Sobre el curso
Curso iniciado el primer cuatrimestre del 2023.

### Que es Backend?

El BackEnd comprende toda la parte lógica y de manejo de información. Es decir, la base lógica de nuestra página o aplicación. El usuario NO sabe lo que hay detrás.
* El almacenamiento de información
* Los cálculos complejos
* Los servidores donde viven las páginas
* Manejo de información en general

### Express
La libreria express nos permite montar de forma rapida y sencilla un servidor con los endpoints que necesitemos.

### Router
Un router en express nos permitirá separar los endpoints “comunes” en entidades separadas que fungirán como “mini aplicaciones”, las cuales tomarán peticiones que concuerden con dicho endpoint y así redireccionarse a esta mini aplicación.

### Websocket

Websocket es un protocolo de comunicación basado en TCP para poder establecer esa conexión entre el cliente y el servidor. A diferencia de HTTP la comunicacion es bidireccional con la utilizacion de endpoints(Sockets) que emiten y reciben informacion.

## Entrega Actual 
La entrega actual corresponde a la clase 14.

## Contenido

* Clases - (Product y cartManager)
* Uso de Archivos - (Libreria fs)
* Express - (Uso de Server y Render en app.js)
* path (Libreria path y  funcion fileURLToPath)
* Router y Middleware - (Carpeta Routes)
* Uso de Postman - (Carpeta Postman con proyecto Coleccion de Test).
* Plantillas con Handlebars - (En app.js se configuran las vistas de la carpeta views)
* WebSockets - (En app.js se utilizan sockets para comunicarse con realtimeproducts.js)
* MongoDB