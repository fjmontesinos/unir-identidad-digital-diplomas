# Unir :: Identidad Digital - Diplomas

Este proyecto ha sido generado con [Angular CLI](https://github.com/angular/angular-cli) version 8.3.21. 
Recoge el código entregado por Javier Montesinos como práctica de la asignatura 
`Desarrollo de Aplicaciones Blockchain` del curso
`Experto Universitario en Desarrollo de Aplicaciones Blockchain` en su promoción de `Octubre 2019 a Marzo 2020`.

## 1. Desplegar la aplicación

Para desplegar la app necesitaremos 3 sencillos pasos:
 * Iniciar una red blockchain en local utilizando ganache-cli
 * Iniciar el servicio web de la aplicación.
 * Desplegar los smart contracts de Identidades Digitales asociados a cada entidad del proyecto: Universidad, Alumno y Empresa.

A continuación se recoge de forma breve como ejecutar cada uno de estos pasos.

## 1.1. Iniciar ganache-cli
La aplicación utilizará como red blockchain local ganache-cli.

### 1.1.1. Instalar ganache-cli
Para instalar ganache-cli no tenemos más que ejecutar el siguiente comando desde una ventana de terminal:

```console
$ npm install -g ganache-cli
```

### 1.1.2. Lanzar ganache-cli
Para lanzar ganache-cli usaremos un `mnemonic` concreto que nos garantizará que las direcciones generadas
serán las necesarias según la configuración de la aplicación. Se deberá lanzar en el puerto `8545`.

Lanzaremos el servicio con el siguiente comando desde una ventana de terminal:

```console
$ ganache-cli -m="belt allow snack gain mom rug wave inflict risk verb health notable" -p=8545
```

## 1.2. Iniciar la aplicación

### 1.2.1. SimpleHTTPServer
Usando `SimpleHTTPServer` de python iniciaremos el servicio de la aplicación sobre el build entregado con el código del proyecto.

Para ello no tendremos más que ejecutar en otra ventana de terminal el siguiente comando:

```console
$ cd code/dist/unir-identidad-digital
$ python -m SimpleHTTPServer 4200
```

Una vez iniciada podremos acceder a nuestra app desde cualquier navegador accediendo a la url: [http://localhost:4200/](http://localhost:4200/)

### 1.2.2. ng serve
La segunda opción para poder iniciar la aplicación es haciendo el build con el cliente de angular `(angular-cli)`

Para ello no tendremos más que ejecutar los siguientes comandos en una ventana de terminal:

Instalar los paquetes npm necesarios de la app:

```console
$ cd code/
$ npm install
```
Levantar la app

```console
$ ng serve
```

>La ventaja de lanzar la app mediante `ng serve` es que si hacemos cambios en el ćodigo estos se refrescarán
>en la aplicación automáticamente.

Una vez iniciada podremos acceder a nuestra app desde cualquier navegador accediendo a la url: [http://localhost:4200/](http://localhost:4200/)

## 1.3. Desplegar los contratos de identidad digital

Una vez levantado ganache-cli y nuestra apliación web, para poder comenzar a trabajar con ella no tendremos más que desplegar 
en Ganache los contratos ClaimHolder del alumno y la universidad así como el contrato ClaimVerifier asociado a la 
empresa.

Para realizar esto será suficiente con hacer clic en el botón `"Desplegar Identidades Digitales"`.


# 2. Remixd

Ayuda para levantar el servicio de remixd:

```console
$ remixd -s path-to-contrats --remix-ide http://remix.ethereum.org
```