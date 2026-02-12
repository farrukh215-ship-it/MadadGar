/**
 * Spam & Abuse Detection
 * Lightweight rule-based detection (keyword blocklist, patterns)
 */

const BLOCKLIST_KEYWORDS = [
  'scam', 'fake', 'fraud', 'free money', 'casino', 'gambling',
  'lottery', 'winner', 'congratulations', 'claim now', 'click here',
  'nigerian', 'prince', 'inheritance', 'urgent', 'act now',
  'bitcoin', 'crypto investment', 'guaranteed returns',
  'viagra', 'pills', 'pharmacy', 'xxx', 'adult', 'porn',
  'hate', 'terror', 'violence', 'kill', 'bomb',
];

const ABUSE_PATTERNS = [
  /\b(https?:\/\/[^\s]+)\b/gi, // Multiple URLs
  /\b(\d{10,})\b/g, // Long number strings
  /(.)\1{10,}/g, // Repeated characters
];

const REPORT_THRESHOLD_SHADOW = 3;
const REPORT_THRESHOLD_REVIEW = 5;

export interface SpamCheckResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
}

export function checkSpamContent(text: string | null | undefined): SpamCheckResult {
  const reasons: string[] = [];
  let score = 0;

  if (!text || typeof text !== 'string') {
    return { isSpam: false, score: 0, reasons: [] };
  }

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  for (const kw of BLOCKLIST_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 20;
      reasons.push(`Blocklisted keyword: ${kw}`);
    }
  }

  const urlMatches = text.match(/\bhttps?:\/\/[^\s]+\b/gi);
  if (urlMatches && urlMatches.length >= 3) {
    score += 15;
    reasons.push('Too many URLs');
  }

  if (words.length > 200) {
    score += 5;
    reasons.push('Very long text');
  }

  for (const pattern of ABUSE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches && matches.length >= 2) {
      score += 10;
      reasons.push('Suspicious pattern');
      break;
    }
  }

  return {
    isSpam: score >= 20,
    score,
    reasons,
  };
}

export function getReportThresholds() {
  return {
    shadowHide: REPORT_THRESHOLD_SHADOW,
    manualReview: REPORT_THRESHOLD_REVIEW,
  };
}
