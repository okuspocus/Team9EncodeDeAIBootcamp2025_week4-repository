// pages/api/generate-story.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIAgent, OpenAI } from 'llamaindex';

interface Personaje {
  nombre: string;
  descripcion: string;
  personalidad: string;
}

// Dummy tool retriever que implemente los métodos requeridos.
const dummyToolRetriever = {
  retrieve: async () => [],
  getTools: async () => [],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  try {
    const { prompt, characters } = req.body;
    if (!prompt || !characters) {
      return res.status(400).json({ error: 'Faltan parámetros (prompt o personajes)' });
    }

    // Instancia el modelo de OpenAI. Asegúrate de tener definida la variable de entorno OPENAI_API_KEY.
    const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Inicializa el agente de LlamaIndex.TS incluyendo el llm
    const agent = new OpenAIAgent({
      verbose: true,
      toolRetriever: dummyToolRetriever,
      llm: llm,
    });

    // Prepara el prompt combinando la idea de la historia y la información de los personajes.
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

    return res.status(200).json({ story: resultString });
  } catch (error: any) {
    console.error('Error generando la historia:', error);
    return res.status(500).json({ error: 'Error generando la historia' });
  }
}
