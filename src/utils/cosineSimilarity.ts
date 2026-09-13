function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce(
    (acc, val, i) => acc + val * (vecB[i] ?? 0),
    0,
  );
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0; // avoid divide-by-zero
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
export { cosineSimilarity };
