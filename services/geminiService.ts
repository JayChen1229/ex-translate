import { TranslationResponse } from "../types";

// Worker API endpoint - can be overridden via environment variable
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://extranslator-worker.samolab.workers.dev';

export const translateExMessage = async (
  message: string
): Promise<TranslationResponse> => {
  try {
    const response = await fetch(`${WORKER_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as TranslationResponse;
    return data;
  } catch (error) {
    console.error("Worker API Error:", error);
    throw error;
  }
};