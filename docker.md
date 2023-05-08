# Docker
Se agrega este documento para informar de la implementacion de Docker en este proyecto.

## Configuracion 
* Cree el archivo Dockerfile con los pasos a seguir para crear la imagen y correr la aplicacion.


## Configuracion extra
* Cree un dockerignore para solucionar el problema detallado en :
https://github.com/kelektiv/node.bcrypt.js/issues/824

* Configure como puerto por defecto el 3000 que es el que usa mi proyecto por defecto.

## Comandos utilizados

* Para crear la imagen:
docker build -t app-node .
* Para correr la imagen:
docker run --name app-node -p 8080:8080 app-node