import natural from 'natural';
import stringSimilarity from 'string-similarity';

export const checkDuplicateRisk = (newDescription, existingDescriptions) => {
  // 1. First check exact matches
  if (existingDescriptions.includes(newDescription)) {
    return { isDuplicate: true, reason: 'Exact match found' };
  }

  // 2. Check similar strings
  const stringMatch = stringSimilarity.findBestMatch(newDescription, existingDescriptions);
  if (stringMatch.bestMatch.rating > 0.85) {
    return {
      isDuplicate: true,
      reason: `High string similarity (${(stringMatch.bestMatch.rating * 100).toFixed(0)}%)`
    };
  }

  // 3. Semantic similarity using TF-IDF
  const tokenizer = new natural.WordTokenizer();
  const tfidf = new natural.TfIdf();

  existingDescriptions.forEach(desc => {
    tfidf.addDocument(tokenizer.tokenize(desc.toLowerCase()));
  });

  const newTokens = tokenizer.tokenize(newDescription.toLowerCase());
  let maxScore = 0;
  let bestIndex = 0;

  tfidf.tfidfs(newTokens, (i, measure) => {
    if (measure > maxScore) {
      maxScore = measure;
      bestIndex = i;
    }
  });

  return {
    isDuplicate: maxScore > 2.5, // TF-IDF threshold
    reason: maxScore > 0 ? `Semantic similarity with risk #${bestIndex + 1}` : 'No similarity detected'
  };
};