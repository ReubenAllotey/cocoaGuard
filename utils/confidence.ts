export function normalizeConfidence(confidence: number) {
  if (!Number.isFinite(confidence) || confidence < 0) {
    return 0;
  }

  return confidence <= 1 ? confidence * 100 : confidence;
}

export function formatConfidence(confidence: number, fractionDigits = 1) {
  return `${normalizeConfidence(confidence).toFixed(fractionDigits)}%`;
}
