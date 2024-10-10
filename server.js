const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use(bodyParser.json());

  // Simulación de base de datos en memoria
  let personajes = [];

  // Obtener todos los personajes
  server.get('/api/personajes', (req, res) => {
    res.json(personajes);
  });

  // Agregar un personaje
  server.post('/api/personajes', (req, res) => {
    const nuevoPersonaje = req.body;
    personajes.push(nuevoPersonaje);
    res.json({ message: 'Personaje agregado', personaje: nuevoPersonaje });
  });

// Editar un personaje
server.put('/api/personajes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, habilidad, clase, dificultad } = req.body; // Extraer todos los campos del cuerpo de la solicitud
    personajes = personajes.map((p) =>
      p.id === Number(id)
        ? { ...p, nombre, habilidad, clase, dificultad } // Actualizar todos los campos
        : p
    );
    res.json({
      message: 'Personaje actualizado',
      personaje: { id: Number(id), nombre, habilidad, clase, dificultad }, // Enviar el personaje actualizado
    });
  });
  

  // Eliminar un personaje
  server.delete('/api/personajes/:id', (req, res) => {
    const { id } = req.params;
    personajes = personajes.filter((p) => p.id !== Number(id));
    res.json({ message: 'Personaje eliminado' });
  });

  // Manejar todas las otras rutas con Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});