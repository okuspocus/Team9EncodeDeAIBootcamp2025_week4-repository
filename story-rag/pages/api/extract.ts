// pages/api/extract.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIAgent, BaseToolWithCall, BaseRetriever } from 'llamaindex';

interface Personaje {
  nombre: string;
  descripcion: string;
  personalidad: string;
}

// Creamos un dummyToolRetriever que satisface la interfaz BaseRetriever<BaseToolWithCall>
// Forzamos el tipado usando "as unknown as ObjectRetriever<BaseToolWithCall>"
const dummyToolRetriever = {
  _retriever: null,
  _objectNodeMapping: null,
  retriever: async () => [],
  retrievets: async () => [],
  getTools: async () => [],
} as unknown as BaseRetriever;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No se proporcionó el texto' });
    }

    // Inicializa el agente de LlamaIndex.TS con el dummyToolRetriever.
    const agent = new OpenAIAgent({
      verbose: true,
      retriever: dummyToolRetriever,
      // Se asume que la librería usará la variable de entorno OPENAI_API_KEY internamente.
    });

    // Construye el prompt para solicitar la extracción de personajes.
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

    // Llama al agente con el prompt.
    const result = await agent.chat({ message: prompt });
    const resultString = String(result).trim();

    // Se espera que el resultado sea un string JSON. Se intenta parsearlo.
    const characters: Personaje[] = JSON.parse(resultString);
    
    return res.status(200).json({ characters });
  } catch (error: any) {
    console.error('Error procesando el texto:', error);
    return res.status(500).json({ error: 'Error procesando el texto' });
  }
}

