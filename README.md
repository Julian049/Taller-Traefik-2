# Docker Traefik

# Autores
**Diego Alejandro Gil Otálora** Cod:202222152<br>
**Julian David Bocanegra Segura** Cod: 202220214  
Universidad Pedagógica y Tecnológica de Colombia  
Ingeniería de Sistemas y Computación - Sistemas Distribuidos  
Tunja, 2025 


# Punto 1 - Topología y redes

Para esto se modificó la red en el `docker-compose.yml` para que traefik, api (réplicas), neo4j vivan en una aplicación de red única

![alt text](image.png)

Además se comprueba que Neo4J ya no es accesible desde el host

![alt text](image-2.png)

- **Red única**: `traefik_network` (bridge)
- **Servicios en la red**: traefik, backend, neo4j
- **Neo4j**: NO expuesto al host, solo acceso interno via DNS

# Punto 2 - Rutas Estructuradas

Editamos /etc/hosts

![alt text](image-3.png)

Configuramos hosts

- **API**: http://api.localhost/
- **Dashboard**: http://ops.localhost/dashboard/

Comprobamos

![alt text](image-4.png)


# Punto 3 - Middlewares

Primero instalamos htpasswd
`sudo apt-get update` y
`sudo apt-get install apache2-utils`

Generamos el hash con usuario: `admin` y contraseña:`admin`
![alt text](image-5.png)

Modificamos el `docker-compose.yml` poniendo los labels para Basic Auth y rateLimit. En este caso ponemos `average=5` y `burst=10` para que maneje 5 pteciones por segundo y 10 de golpe.

```
labels:
  - "traefik.http.routers.dashboard.rule=Host(`ops.localhost`) && PathPrefix(`/dashboard`)"
  - "traefik.http.routers.dashboard.middlewares=dashboard-stripprefix"
  - "traefik.http.middlewares.dashboard-stripprefix.stripprefix.prefixes=/dashboard"
```

```
labels:
  - "traefik.http.routers.api.middlewares=rate-limit"
  - "traefik.http.middlewares.rate-limit.ratelimit.average=5"
  - "traefik.http.middlewares.rate-limit.ratelimit.burst=10"
```
### Comprobaciones

Comprobamos que para acceder al dashboard pide credenciales
![alt text](image-6.png)

Comprobamos que recibe 10 peticiones de golpe, desde 11 da el codigo 429 `Too Many Requests`

![alt text](image-7.png)


# Punto 4 - Balanceo (Replicas de la API)

Para este ejercicio usamos el metodo `--scale`

![alt text](image-8.png)

Comprobamos

![alt text](image-9.png)
Se evidencian las replicas `taller-traefik-2_backend_1` y `taller-traefik-2_backend_2`

Hacemos un Test 
![alt text](image-10.png)
La Replica 1 recibio 5 peticiones y la replica 2 recibio otras 5 peticiones

- Logs en cada replica
![alt text](image-11.png)


# Punto 5 - Descubrimiento automatico

Antes de escalar (ya tenenemos dos replicas corriendo)
![alt text](image-12.png)

Primero escalamos a 1 replica y luego a 3 (sin hacer `docker-compose down` ni parar servcios)

![alt text](image-13.png)

Dashboard evidenciando que `load balancer` tiene los 3 servidores registrados

### Labels usados

```
traefik:
  command:
    - --providers.docker=true
    - --providers.docker.exposedbydefault=false
    - --providers.docker.network=traefik_network

backend:
  labels:
    - "traefik.enable=true" 
    - "traefik.http.routers.api.rule=Host(`api.localhost`)"
    - "traefik.http.routers.api.service=api-service"
```



# Punto 6 - Observabilidad y pruebas

## Endpoint /health
Revisamos desde el navegegador o desde la consola que el endpoint /health si funciona
<img width="985" height="295" alt="image" src="https://github.com/user-attachments/assets/40cc5fb5-2963-47f4-b044-dbe5fdad7950" />

<img width="1529" height="250" alt="image" src="https://github.com/user-attachments/assets/04f7f484-2a85-4aa8-b24a-9f673674efbf" />


## Endpoint get (/movies)
Al ejecutar el respectivo endpoint para recuperar las peliculas podemos evidenciar
<img width="985" height="1068" alt="image" src="https://github.com/user-attachments/assets/46f39406-8db0-4f5b-a4d2-900effd13954" />


## Dashboard
Revisando el dashboard de trafik podemos ver los diferentes routers, middlewares y servicios usados a lo largo del taller
### Routers
<img width="1448" height="522" alt="image" src="https://github.com/user-attachments/assets/b6dbdfeb-6295-4292-bfee-66ff6a39dcf3" />

### Middlewares

<img width="1448" height="627" alt="image" src="https://github.com/user-attachments/assets/96b77118-83d7-4021-9794-cd334ce461c1" />

### Servicios

<img width="1448" height="627" alt="image" src="https://github.com/user-attachments/assets/e6fcc179-2b57-497c-ac8b-752681aec563" />


# Diagrama

![WhatsApp Image 2025-09-18 at 22 55 28](https://github.com/user-attachments/assets/e800fdb8-d460-4fdf-a683-8735a902d263)

# Punto extra
Para controlar los errores 400 y 500 en un middleware podemos usar estos labels en el `compose`:
```

backend:
  labels:
      - "traefik.http.middlewares.error-middleware.errors.status=400-499,500-599"
      - "traefik.http.middlewares.error-middleware.errors.service=api-service"
      - "traefik.http.middlewares.error-middleware.errors.query=/error?status={status}"
```

Tambien tenemos que cambiar la linea general de los middlewares en backend por
```
      - "traefik.http.routers.api.middlewares=rate-limit, error-middleware"
```
Con esto podemos redireccionar los errores al endpoint `/error` 

Para probarlo podemos usar la forma facil, la cual es ejecutando POST mal a posta para que nos de el error

<img width="1809" height="366" alt="image" src="https://github.com/user-attachments/assets/d8d0fbd7-12f8-49b4-9d3b-956c84e019a1" />


# Reflexión técnica

- Qué aporta Traefik frente a mapear puertos directamente?
 R/ Cuando se mapea con puertos directos cada servcio tiene un puerto distinto, se puede complicar si son muchos. Con Traefik existe un solo punto de entrada, además de rutas limpias 

- ¿Qué middlewares usarían en producción y por qué?
R/ Usaríamos RateLimit ya que evita abusos sobre los servicios y sobrecarga de servidor. Ademas usariamos BasicAuth para proteger accesos internos.

- Riesgos de dejar el dashboard “abierto” y cómo mitigarlos.
R/ El riesgo es que cualquiera puede ver y atacar nuestra infraestructura. Se puede mitigar no exponiendolo en internet o con credenciales (auth)

