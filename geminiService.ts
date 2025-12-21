
import { GoogleGenAI } from "@google/genai";

export const askAssistant = async (prompt: string): Promise<string> => {
  // Always use the API key directly from the environment variable as per SDK guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `Você é o Assistente FNPE (Federação Norte de Pesca Esportiva). 
      Sua função é ajudar com:
      1. Criar descrições para eventos de pesca.
      2. Escrever textos de divulgação para redes sociais.
      3. Tirar dúvidas sobre regras de ranking (Caiaque, Embarcado, Arremesso).
      4. Auxiliar administradores na gestão da federação.
      Sempre responda de forma profissional, amigável e esportiva.`,
    },
  });

  return response.text || "Desculpe, não consegui processar sua solicitação.";
};
