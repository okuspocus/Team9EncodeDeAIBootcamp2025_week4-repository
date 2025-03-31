// pages/index.tsx

import React, { useState, FormEvent } from 'react';

interface Personaje {
  nombre: string;
  descripcion: string;
  personalidad: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [characters, setCharacters] = useState<Personaje[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para la historia
  const [storyPrompt, setStoryPrompt] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [storyLoading, setStoryLoading] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleExtract = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Por favor, sube un archivo .txt primero.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
          if (!response.ok) {
            throw new Error("Error al procesar el texto");
          }
          const data = await response.json();
          setCharacters(data.characters);
        } catch (err: any) {
          console.error(err);
          setError(err.message);
        }
        setLoading(false);
      }
    };

    reader.onerror = (error) => {
      console.error("Error al leer el archivo:", error);
      setError("Error al leer el archivo.");
    };

    reader.readAsText(selectedFile);
  };

  // Función para generar la historia
  const handleGenerateStory = async (e: FormEvent) => {
    e.preventDefault();
    if (!storyPrompt) {
      alert("Por favor, escribe una idea o prompt para la historia.");
      return;
    }
    if (characters.length === 0) {
      alert("Primero debes extraer los personajes desde el archivo.");
      return;
    }

    setStoryLoading(true);
    setStoryError(null);
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: storyPrompt, characters })
      });
      if (!response.ok) {
        throw new Error("Error al generar la historia");
      }
      const data = await response.json();
      setStory(data.story);
    } catch (err: any) {
      console.error(err);
      setStoryError(err.message);
    }
    setStoryLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Extracción de Personajes con AI</h1>
      <p>Sube un libro o contenido similar que contenga personajes y ambientaciones.</p>
      <form onSubmit={handleExtract}>
        <input type="file" accept=".txt" onChange={handleFileChange} />
        <button type="submit" style={{ marginLeft: '1rem' }}>Extraer personajes</button>
      </form>
      {loading && <p>Cargando extracción...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {characters.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Resultados de la extracción:</h2>
          
          {/* Tabla de personajes */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Nombre</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Descripción</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Personalidad</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((personaje, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{personaje.nombre}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{personaje.descripcion}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{personaje.personalidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Área opcional de salida JSON */}
          <div style={{ marginTop: '1rem' }}>
            <h3>Salida JSON:</h3>
            <textarea
              readOnly
              rows={10}
              style={{ width: '100%' }}
              value={JSON.stringify(characters, null, 2)}
            />
          </div>
        </div>
      )}

      {characters.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Crear Historia</h2>
          <p>
            Escribe una idea o prompt para la historia. El sistema utilizará la información de los personajes extraídos para generar una narrativa.
          </p>
          <form onSubmit={handleGenerateStory}>
            <textarea
              placeholder="Escribe la idea para la historia..."
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
              style={{ width: '100%', height: '100px', padding: '8px' }}
            />
            <button type="submit" style={{ marginTop: '1rem' }}>
              Generar historia
            </button>
          </form>
          {storyLoading && <p>Cargando historia...</p>}
          {storyError && <p style={{ color: 'red' }}>Error: {storyError}</p>}
          {story && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Historia Generada:</h3>
              <p>{story}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
