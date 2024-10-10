import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Home() {
  const [personajes, setPersonajes] = useState([]);
  const [nombre, setNombre] = useState(''); 
  const [habilidad, setHabilidad] = useState(''); 
  const [clase, setClase] = useState(''); 
  const [dificultad, setDificultad] = useState(''); 
  const [idEditar, setIdEditar] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    axios.get('/api/personajes')
      .then(response => {
        setPersonajes(response.data);
      })
      .catch(() => {
        router.push('/login'); // Redirect to login if not authenticated
      });
  }, []);
  
  // Cargar personajes desde localStorage al iniciar la página
  useEffect(() => {
    const personajesGuardados = JSON.parse(localStorage.getItem('personajes')) || [];
    setPersonajes(personajesGuardados);
  }, []);

  // Guardar personajes en localStorage
  const guardarEnLocalStorage = (personajes) => {
    localStorage.setItem('personajes', JSON.stringify(personajes));
  };

  // Manejar la adición de personajes
  const handleAgregarPersonaje = (e) => {
    e.preventDefault();
    const nuevoPersonaje = {
      id: Date.now(),
      nombre,
      habilidad,
      clase,
      dificultad,
    };
    const nuevosPersonajes = [...personajes, nuevoPersonaje];
    setPersonajes(nuevosPersonajes);
    guardarEnLocalStorage(nuevosPersonajes); // Guardar en localStorage
    limpiarFormulario();
  };

  // Manejar la edición de personajes
  const handleEditarPersonaje = (e) => {
    e.preventDefault();
    const personajesActualizados = personajes.map((p) =>
      p.id === idEditar ? { ...p, nombre, habilidad, clase, dificultad } : p
    );
    setPersonajes(personajesActualizados);
    guardarEnLocalStorage(personajesActualizados); // Guardar en localStorage
    limpiarFormulario();
  };

  // Manejar la eliminación de personajes
  const handleEliminarPersonaje = (id) => {
    const personajesRestantes = personajes.filter((p) => p.id !== id);
    setPersonajes(personajesRestantes);
    guardarEnLocalStorage(personajesRestantes); // Guardar en localStorage
  };

  // Manejar la selección de un personaje para editar
  const seleccionarParaEditar = (personaje) => {
    setIdEditar(personaje.id);
    setNombre(personaje.nombre || '');
    setHabilidad(personaje.habilidad || '');
    setClase(personaje.clase || '');
    setDificultad(personaje.dificultad || '');
  };

  // Limpiar el formulario
  const limpiarFormulario = () => {
    setNombre('');
    setHabilidad('');
    setClase('');
    setDificultad('');
    setIdEditar(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      localStorage.removeItem('personajes'); // Clear local storage if needed
      router.push('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div>
      <h1>Personajes del Videojuego</h1>
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
      <ul>
        {personajes.map((personaje) => (
          <li key={personaje.id}>
            {personaje.nombre} - {personaje.habilidad || '-'} - {personaje.clase || '-'} - Dificultad: {personaje.dificultad || '-'}
            <button onClick={() => seleccionarParaEditar(personaje)}>Editar</button>{' '}
            <button onClick={() => handleEliminarPersonaje(personaje.id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      <form onSubmit={idEditar ? handleEditarPersonaje : handleAgregarPersonaje}>
        <input
          type="text"
          placeholder="Character Name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ability"
          value={habilidad}
          onChange={(e) => setHabilidad(e.target.value)}
        />
        <input
          type="text"
          placeholder="Class"
          value={clase}
          onChange={(e) => setClase(e.target.value)}
        />
        <input
          type="text"
          placeholder="Difficulty"
          value={dificultad}
          onChange={(e) => setDificultad(e.target.value)}
        />
        <button type="submit">
          {idEditar ? 'Actualizar' : 'Agregar'}
        </button>
      </form>
    </div>
  );
}
