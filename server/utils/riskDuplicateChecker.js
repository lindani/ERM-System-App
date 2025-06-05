import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config'; // Loads environment variables from .env

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const genAI = new GoogleGenerativeAI("AIzaSyD_F2OF49vl6nIWF50s_51Z0CJFoQQYGxo");

const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });

/**
 * Generates an embedding for a given text using the Gemini embedding model.
 * @param {string} text The text to embed.
 * @returns {Promise<number[]|null>} A promise that resolves to the embedding vector, or null if an error occurs.
 */
export const getEmbedding = async (text) => {
  try {
    const { embedding } = await embeddingModel.embedContent(text);
    return embedding.values; // Access the array of numbers
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

/**
 * Calculates the cosine similarity between two vectors.
 * Cosine similarity measures the cosine of the angle between two non-zero vectors.
 * It is a measure of similarity between two vectors of an inner product space.
 * The value ranges from -1 to 1, where 1 means identical, 0 means orthogonal (no similarity),
 * and -1 means completely opposite.
 * @param {number[]} vec1 The first vector.
 * @param {number[]} vec2 The second vector.
 * @returns {number} The cosine similarity score.
 */
function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    return 0; // Invalid input
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitudeA += vec1[i] * vec1[i];
    magnitudeB += vec2[i] * vec2[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Checks for duplicate risks based on semantic similarity using Gemini embeddings.
 * @param {string} newDescription The new risk description to check.
 * @param {Array<Object>} existingRisks An array of objects, where each object has at least a 'description' string
 * and optionally a pre-calculated 'embedding' (recommended for performance).
 * Example: [{ id: 1, description: "Risk of data breach", embedding: [...] }]
 * @param {number} similarityThreshold The cosine similarity threshold (e.g., 0.8 for strong similarity).
 * @returns {Promise<Object>} A promise that resolves to an object indicating if it's a duplicate and the reason.
 */
export const checkDuplicateRisk = async (newDescription, existingRisks, similarityThreshold = 0.8) => {
  // 1. First check exact matches (still a good, fast first check)
  if (existingRisks.some(risk => risk.description === newDescription)) {
    return {
      isDuplicate: true,
      reason: 'Exact match found',
     };
  }

  const newDescriptionEmbedding = await getEmbedding(newDescription);

  if (!newDescriptionEmbedding) {
    return { isDuplicate: false, reason: 'Could not generate embedding for new description.' };
  }

  let maxSimilarity = 0;
  let bestMatchRisk = null; // This will hold the entire best matched risk object

  for (const existingRisk of existingRisks) {
    let existingEmbedding = existingRisk.embedding;

    // IMPORTANT: In a production system, you should pre-calculate and store embeddings
    // when you save the risk to the database. This 'if' block is for demonstration
    // if embeddings aren't already in your DB.
    if (!existingEmbedding) {
      existingEmbedding = await getEmbedding(existingRisk.description);
      if (!existingEmbedding) {
        console.warn(`Could not generate embedding for existing risk ID: ${existingRisk.id}`);
        continue; // Skip this risk if embedding fails
      }
      // Optionally, update the existingRisk object with the embedding for future calls
      // existingRisk.embedding = existingEmbedding;
    }

    const similarity = cosineSimilarity(newDescriptionEmbedding, existingEmbedding);

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatchRisk = existingRisk; // Capture the entire risk object here
    }
  }

  if (maxSimilarity >= similarityThreshold) {
    return {
      isDuplicate: true,
      reason: `High semantic similarity (${(maxSimilarity * 100).toFixed(0)}%) with risk ID: ${bestMatchRisk.id} ('${bestMatchRisk.description}')`,
      matchedRisk: { // Return a structured object for the matched risk
        id: bestMatchRisk.id,
        description: bestMatchRisk.description,
        similarityScore: maxSimilarity // Include the similarity score for context
      }
    };
  } else {
    return {
      isDuplicate: false,
      reason: maxSimilarity > 0 ? `No strong semantic similarity detected (highest: ${(maxSimilarity * 100).toFixed(0)}%)` : 'No similarity detected',
      matchedRisk: null // Explicitly null if no match, for clarity
    };
  }
};

// --- Example Usage ---
