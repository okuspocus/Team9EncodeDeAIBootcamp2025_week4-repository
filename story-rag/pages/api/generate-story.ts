// pages/api/generate-story.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIAgent, BaseToolWithCall, BaseRetriever } from 'llamaindex';

interface Personaje {
  nombre: string;
  descripcion: string;
  personalidad: string;
}

// Creamos un dummyToolRetriever para satisfacer el tipado
const dummyToolRetriever = {
  _retriever: null,
  _objectNodeMapping: null,
  retriever: async () => [],
  retrievets: async () => [],
  getTools: async () => [],
} as unknown as ObjectRetriever<BaseToolWithCall>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  try {
    const { prompt, characters } = req.body;
    if (!prompt || !characters) {
      return res.status(400).json({ error: 'Faltan parámetros (prompt o personajes)' });
    }

    // Inicializa el agente de LlamaIndex.TS
    const agent = new OpenAIAgent({
      verbose: true,
      toolRetriever: dummyToolRetriever,
      // Se asume que la variable OPENAI_API_KEY está configurada
    });

    // Construye un prompt que combine la idea de la historia con la información de los personajes.
    // Se formatea el array de personajes a un string para integrarlo al prompt.
    const charactersStr = JSON.stringify(characters, null, 2);

    const fullPrompt = `
      Usando la siguiente información de personajes, genera una historia completa que incluya al menos a algunos de ellos.
      
      Información de personajes:
      ${charactersStr}
      
      Idea de la historia:
      ${prompt}
    `;

    const result = await agent.chat({ message: fullPrompt });
    const resultString = String(result).trim();

    // Se retorna el resultado, que se espera sea el texto de la historia.
    return res.status(200).json({ story: resultString });
  } catch (error: any) {
    console.error('Error generando la historia:', error);
    return res.status(500).json({ error: 'Error generando la historia' });
  }
}
