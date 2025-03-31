// pages/api/extract.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIAgent } from 'llamaindex';

interface Personaje {
  nombre: string;
  descripcion: string;
  personalidad: string;
}

// Dummy tool retriever con el método retrieve
const dummyToolRetriever = {
  retrieve: async () => [],
  getTools: async () => [],
};

function extractJSON(text: string): string {
  // Intenta extraer contenido entre triple backticks y "json"
  const markdownMatch = text.match(/```json([\s\S]*?)```/);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }
  // Si no se encuentra, intenta extraer desde el primer '[' hasta el último ']'
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  // Si no se puede extraer, retorna el texto original (esto puede lanzar error en JSON.parse)
  return text;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No se proporcionó el texto' });
    }

    const agent = new OpenAIAgent({
      verbose: true,
      toolRetriever: dummyToolRetriever,
      // Se asume que OPENAI_API_KEY está configurada en las variables de entorno.
    });

    const prompt = `
      Extrae todos los personajes del siguiente texto.
      Cada personaje debe tener:
        - nombre
        - descripción
        - personalidad
      Retorna la respuesta en formato JSON (un arreglo de objetos).

      Texto:
      ${text}
    `;

    const result = await agent.chat({ message: prompt });
    const resultString = String(result).trim();
    console.log("Respuesta cruda del agente:", resultString);

    // Extraer el fragmento JSON de la respuesta
    const jsonString = extractJSON(resultString);
    console.log("Fragmento JSON extraído:", jsonString);

    const characters: Personaje[] = JSON.parse(jsonString);
    
    return res.status(200).json({ characters });
  } catch (error: any) {
    console.error('Error procesando el texto:', error);
    return res.status(500).json({ error: 'Error procesando el texto' });
  }
}
