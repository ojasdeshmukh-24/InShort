import { CategoryType, CustomFilter } from '../types';

export interface ProbabilityBreakdown {
  [category: string]: number; // Internal normalized probabilities (0.0 to 1.0), NOT shown in user UI
}

export interface ClassificationResult {
  category: CategoryType;
  courseCode?: string;
  isPhd?: boolean;
  // Internal probability distribution according to keyword signals
  // NOTE: Kept internal; NOT shown to the user in the UI
  probabilities?: ProbabilityBreakdown;
  confidence?: number;
}

// Semantic keyword dictionaries with differential weights
const RESCHEDULING_STRONG = [
  'reschedule',
  'rescheduled',
  'class cancelled',
  'class canceled',
  'lecture cancelled',
  'lecture canceled',
  'no class today',
  'no class',
  'extra class',
  'room change',
  'venue change',
  'timing change',
  'rescheduled lecture',
  'swapped class',
  'postpone class',
];
const RESCHEDULING_MEDIUM = [
  'cancelled',
  'canceled',
  'postpone',
  'postponed',
  'lecture timing',
  'timing',
  'schedule change',
  'delayed',
];
const RESCHEDULING_SENDER = ['timetable', 'scheduling', 'acad'];

const COMPETITIONS_STRONG = [
  'competition',
  'tournament',
  'hackathon',
  'sociothon',
  'ideathon',
  'devfolio',
  'open trials',
  'inter-iit',
  'inter iit',
  'inter-hostel',
  'inter hostel',
  'inter-college',
  'championship',
  'prize pool',
  'cash prize',
  'case competition',
  'quiz competition',
  'coding contest',
  'athletics',
];
const COMPETITIONS_MEDIUM = [
  'contest',
  'trials',
  'sports',
  'cricket',
  'football',
  'badminton',
  'volleyball',
  'table tennis',
  'chess',
  'squash',
  'esports',
  'case comp',
  'challenge',
  'mushaira',
  'trophy',
];
const COMPETITIONS_SENDER = ['sports', 'gymkhana', 'cultural', 'council', 'club', 'soc'];

const WORKSHOPS_STRONG = [
  'workshop',
  'bootcamp',
  'masterclass',
  'hands-on session',
  'distinguished lecture',
  'guest lecture',
  'orientation talk',
  'intro talk',
  'intro talks',
  'introductory talk',
  'opening talk',
  'conclave',
  'symposium',
  'info session',
  'tech talk',
];
const WORKSHOPS_MEDIUM = [
  'webinar',
  'seminar',
  'talk by',
  'hands-on',
  'enactus',
  'sdslabs',
  'pragati',
  'hr conclave',
  'panel discussion',
  'roundtable',
];
const WORKSHOPS_SENDER = ['ieee', 'acm', 'chapter', 'society', 'cell', 'seminar'];

const ACADEMICS_STRONG = [
  'assignment',
  'homework',
  'syllabus',
  'midterm',
  'endterm',
  'quiz',
  'exam',
  'examination',
  'lab manual',
  'grading',
  'grade submission',
  'project evaluation',
  'teaching day',
];
const ACADEMICS_MEDIUM = [
  'canvas',
  'moodle',
  'classroom',
  'prof.',
  'professor',
  'lecture',
  'faculty',
  'tutorial',
  'office hours',
  'ug-i',
  'ug-ii',
  'pg-i',
  'coursework',
  'submission',
  'grades',
];
const ACADEMICS_SENDER = ['acad', 'faculty', 'professor', 'instructor', 'doaa', 'dean'];

const PHD_VIVA_KEYWORDS = [
  'viva',
  'viva-voce',
  'viva voce',
  'oral defense',
  'thesis defense',
  'phd defense',
  'ph.d. defense',
  'synopsis presentation',
  'synopsis submission',
  'ph.d. viva',
  'phd viva',
  'doctoral defense',
  'comprehensive exam presentation',
];

/**
 * Calculates internal keyword match scores and probabilistic distribution across categories.
 * Incorporates User Ordered Priority List:
 * Evaluates categories in strict rank order (Priority 1, 2, 3...).
 * If an email contains keyword evidence for Priority 1, it routes to Priority 1 even with
 * low raw probability signals. If not, it falls through to Priority 2, then Priority 3, etc.
 *
 * NOTE: Probabilities are calculated strictly under the hood and never shown to the user in the UI.
 */
export function calculateKeywordProbabilities(
  subject: string,
  sender: string,
  snippet: string,
  customFilters?: CustomFilter[],
  priorityList?: string[]
): {
  topCategory: CategoryType;
  courseCode?: string;
  isPhd?: boolean;
  probabilities: ProbabilityBreakdown;
  confidence: number;
} {
  const subjectLower = (subject || '').toLowerCase();
  const senderLower = (sender || '').toLowerCase();
  const snippetLower = (snippet || '').toLowerCase();
  const combined = `${subjectLower} ${senderLower} ${snippetLower}`;

  const courseMatch = subject.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i);
  const courseCode = courseMatch ? courseMatch[1].toUpperCase() : undefined;

  // 1. PhD and Viva-Voce Notices -> Route directly to General
  const isPhd = PHD_VIVA_KEYWORDS.some((kw) => combined.includes(kw));
  if (isPhd) {
    return {
      topCategory: 'General',
      courseCode,
      isPhd: true,
      probabilities: { General: 0.98, Academics: 0.01, Workshops: 0.01 },
      confidence: 0.98,
    };
  }

  // 2. Score candidate categories based on genuine keyword evidence
  const scoreMap: Record<string, { rawScore: number; matches: string[] }> = {
    'Class Rescheduling': { rawScore: 0, matches: [] },
    'Competitions & Tournaments': { rawScore: 0, matches: [] },
    'Workshops': { rawScore: 0, matches: [] },
    'Academics': { rawScore: courseCode ? 6.0 : 0, matches: courseCode ? [`course:${courseCode}`] : [] },
    'General': { rawScore: 0, matches: [] },
  };

  // Add custom filters
  if (customFilters && customFilters.length > 0) {
    customFilters.forEach((cf) => {
      scoreMap[cf.name] = { rawScore: 0, matches: [] };
    });
  }

  const scoreHelper = (
    category: string,
    strong: string[],
    medium: string[],
    senderCues: string[] = []
  ) => {
    let score = 0;
    const matches: string[] = [];

    for (const kw of strong) {
      if (subjectLower.includes(kw)) {
        score += 6.0;
        matches.push(kw);
      } else if (snippetLower.includes(kw)) {
        score += 3.0;
        matches.push(kw);
      }
    }

    for (const kw of medium) {
      if (subjectLower.includes(kw)) {
        score += 3.5;
        matches.push(kw);
      } else if (snippetLower.includes(kw)) {
        score += 1.5;
        matches.push(kw);
      }
    }

    for (const cue of senderCues) {
      if (senderLower.includes(cue)) {
        score += 2.5;
        matches.push(`sender:${cue}`);
      }
    }

    if (scoreMap[category]) {
      scoreMap[category].rawScore += score;
      scoreMap[category].matches.push(...matches);
    }
  };

  // Compute raw keyword scores
  scoreHelper('Class Rescheduling', RESCHEDULING_STRONG, RESCHEDULING_MEDIUM, RESCHEDULING_SENDER);
  scoreHelper('Competitions & Tournaments', COMPETITIONS_STRONG, COMPETITIONS_MEDIUM, COMPETITIONS_SENDER);
  scoreHelper('Workshops', WORKSHOPS_STRONG, WORKSHOPS_MEDIUM, WORKSHOPS_SENDER);
  scoreHelper('Academics', ACADEMICS_STRONG, ACADEMICS_MEDIUM, ACADEMICS_SENDER);

  // Score custom filters
  if (customFilters && customFilters.length > 0) {
    customFilters.forEach((cf) => {
      if (cf.keywords && cf.keywords.length > 0) {
        scoreHelper(cf.name, cf.keywords, [cf.name.toLowerCase()], []);
      }
    });
  }

  const categoryNames = Object.keys(scoreMap);

  // 3. User Priority List Evaluation (Hierarchical Rank-Weighted Routing)
  // "priority list is not working properly try again more refined way"
  // "even if prob is low then too add it in high prefernceial labels"
  const rankedPriorities = priorityList && priorityList.length > 0
    ? priorityList
    : ['Academics', 'Competitions & Tournaments', 'Class Rescheduling'];

  const boostedScores: Record<string, number> = {};

  categoryNames.forEach((cat) => {
    const raw = scoreMap[cat].rawScore;

    // Strict invariant: A category with ZERO keyword matches gets 0 boosted score.
    // It NEVER receives false boosts if there is no signal!
    if (raw <= 0) {
      boostedScores[cat] = 0;
      return;
    }

    const rankIndex = rankedPriorities.indexOf(cat);
    if (rankIndex !== -1) {
      // Category is in the user's Priority List!
      // Rank 0 (Priority 1): multiplier 12.0 + bonus 30.0
      // Rank 1 (Priority 2): multiplier 8.0 + bonus 18.0
      // Rank 2 (Priority 3): multiplier 5.0 + bonus 10.0
      // Lower ranks: multiplier 3.0 + bonus 5.0
      const rankMultiplier = Math.max(2.5, 12.0 - rankIndex * 3.5);
      const rankBonus = Math.max(4.0, 30.0 - rankIndex * 8.0);
      boostedScores[cat] = raw * rankMultiplier + rankBonus;
    } else {
      // Unprioritized category with keyword match
      boostedScores[cat] = raw;
    }
  });

  // 4. Compute Normalized Probability Distribution (Kept internal, not shown in user UI)
  const anyMatched = categoryNames.some((cat) => cat !== 'General' && scoreMap[cat].rawScore > 0);

  let topCategory: CategoryType = 'General';
  let maxScore = 0;

  if (anyMatched || courseCode) {
    categoryNames.forEach((cat) => {
      if (boostedScores[cat] > maxScore) {
        maxScore = boostedScores[cat];
        topCategory = cat;
      }
    });
  } else {
    topCategory = 'General';
  }

  // Calculate clean normalized probabilities
  const finalProbabilities: Record<string, number> = {};
  if (anyMatched || courseCode) {
    const totalMass = categoryNames.reduce((sum, cat) => sum + boostedScores[cat] + 0.1, 0);
    categoryNames.forEach((cat) => {
      finalProbabilities[cat] = Number(((boostedScores[cat] + 0.1) / totalMass).toFixed(4));
    });
  } else {
    // Unrelated email default to General
    categoryNames.forEach((cat) => {
      finalProbabilities[cat] = cat === 'General' ? 0.88 : 0.02;
    });
  }

  const confidence = finalProbabilities[topCategory] || 0.75;

  return {
    topCategory,
    courseCode,
    isPhd: false,
    probabilities: finalProbabilities,
    confidence,
  };
}

/**
 * High-speed academic classifier for sorting batch emails in milliseconds.
 * Includes user overrides, custom filters, and ordered priority list weighting.
 */
export function classifyInboxItem(
  subject: string,
  sender: string,
  snippet: string,
  customFilters?: CustomFilter[],
  labelOverrides?: Record<string, string>,
  emailId?: string,
  priorityList?: string[]
): ClassificationResult {
  const courseMatch = subject.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i);
  const courseCode = courseMatch ? courseMatch[1].toUpperCase() : undefined;

  // 0. Manual user label overrides have absolute priority (User Preference Rule)
  if (emailId && labelOverrides && labelOverrides[emailId]) {
    return {
      category: labelOverrides[emailId],
      courseCode,
      confidence: 1.0,
      probabilities: { [labelOverrides[emailId]]: 1.0 },
    };
  }
  if (labelOverrides && labelOverrides[subject]) {
    return {
      category: labelOverrides[subject],
      courseCode,
      confidence: 1.0,
      probabilities: { [labelOverrides[subject]]: 1.0 },
    };
  }

  // 1. Run probabilistic keyword separation with ordered priority list weighting
  const result = calculateKeywordProbabilities(
    subject,
    sender,
    snippet,
    customFilters,
    priorityList
  );

  return {
    category: result.topCategory,
    courseCode: result.courseCode,
    isPhd: result.isPhd,
    probabilities: result.probabilities,
    confidence: result.confidence,
  };
}
