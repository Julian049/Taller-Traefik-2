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

# Punto 2 - Rutas Estructuradas