# Docker Traefik

# Autores
**Diego Alejandro Gil Otálora** Cod:202222152<br>
**JUlian David Bocanegra Segura** Código: 202220214  
Universidad Pedagógica y Tecnológica de Colombia  
Ingeniería de Sistemas y Computación - Sistemas Distribuidos  
Tunja, 2025 


# Punto 1 - Topologia y redes

Para esto se modifico la red en el `docker-compose.yml` para que traefik, api (réplicas), neo4j vivan en una aplicacion de red unica

![alt text](image.png)

Ademas se comprueba que Neo4J ya no es accesible desde el host

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

### Comprobaciones

Comprobamos que para acceder al dashboard pide credenciales
![alt text](image-6.png)

Comprobamos que recibe 10 peticiones de golpe, desde 11 da el codigo 429 `Too Many Requests`

![alt text](image-7.png)


# Punto 4 - Balanceo (Replicas de la API)

