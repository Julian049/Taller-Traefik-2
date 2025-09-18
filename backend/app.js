require("dotenv").config();
const express = require("express");
const neo4j = require("neo4j-driver");

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Conexión a Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Endpoint GET /movies
app.get("/movies", async (req, res) => {
  const session = driver.session();
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 50;
    const skip = (page - 1) * limit;

    const query = `
      MATCH (m:Pelicula)
      RETURN m.title AS title, m.id AS id
      SKIP $skip
      LIMIT $limit
    `;

    const result = await session.run(query, {
      skip: neo4j.int(skip),
      limit: neo4j.int(limit),
    });

    const movies = result.records.map(record => ({
      id: record.get("id"),
      title: record.get("title"),
    }));

    res.json({
      page,
      perPage: limit,
      movies,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

app.post("/movies/test", async (req, res) => {
  const session = driver.session();

  // 🔥 Película de prueba (hardcoded)
  const movie = {
    id: 99999,
    title: "Película de Prueba1",
    overview: "Esta es una película de prueba agregada directamente desde el endpoint.",
    release_date: "2025-01-01",
    popularity: 42.42,
    vote_average: 7.7,
    vote_count: 1234
  };

  try {
    // Verificar si ya existe
    const checkQuery = `
      MATCH (p:Pelicula {id: $id})
      RETURN p
    `;

    const checkResult = await session.run(checkQuery, { id: neo4j.int(movie.id) });

    if (checkResult.records.length > 0) {
      return res.status(409).json({ error: "La película ya existe en la base de datos." });
    }

    // Crear la película
    const createQuery = `
      CREATE (p:Pelicula {
        id: $id,
        title: $title,
        overview: $overview,
        release_date: $release_date,
        popularity: $popularity,
        vote_average: $vote_average,
        vote_count: $vote_count
      })
      RETURN p
    `;

    const result = await session.run(createQuery, {
      id: neo4j.int(movie.id),
      title: movie.title,
      overview: movie.overview,
      release_date: movie.release_date,
      popularity: parseFloat(movie.popularity),
      vote_average: parseFloat(movie.vote_average),
      vote_count: neo4j.int(movie.vote_count),
    });

    const node = result.records[0].get("p").properties;

    res.status(201).json({
      message: "Película de prueba añadida correctamente.",
      movie: {
        id: node.id.low,
        title: node.title,
        overview: node.overview,
        release_date: node.release_date,
        popularity: node.popularity,
        vote_average: node.vote_average,
        vote_count: node.vote_count.low,
      },
    });
  } catch (error) {
    console.error("Error creando película:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

