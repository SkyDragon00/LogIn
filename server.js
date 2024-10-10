const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use(bodyParser.json());

  // Session middleware
  server.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

 // Simulated database
const users = [
    { id: 1, username: 'Domecita', password: bcrypt.hashSync('123', 10) }
  ];
  let personajes = [];  

  // Login endpoint
  server.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = { id: user.id, username: user.username };
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });

  // Middleware to check authentication
  const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };

  // Login endpoint
server.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', username, password); // Log the received credentials
    
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = { id: user.id, username: user.username };
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
  

  // Protect CRUD routes
  server.get('/api/personajes', isAuthenticated, (req, res) => {
    res.json(personajes);
  });

  server.post('/api/personajes', isAuthenticated, (req, res) => {
    const nuevoPersonaje = req.body;
    personajes.push(nuevoPersonaje);
    res.json({ message: 'Personaje agregado', personaje: nuevoPersonaje });
  });

  server.put('/api/personajes/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { nombre, habilidad, clase, dificultad } = req.body;
    personajes = personajes.map(p => p.id === Number(id) ? { ...p, nombre, habilidad, clase, dificultad } : p);
    res.json({ message: 'Personaje actualizado', personaje: { id: Number(id), nombre, habilidad, clase, dificultad } });
  });

  server.delete('/api/personajes/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    personajes = personajes.filter(p => p.id !== Number(id));
    res.json({ message: 'Personaje eliminado' });
  });

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
