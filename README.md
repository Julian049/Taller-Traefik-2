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