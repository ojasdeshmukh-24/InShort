import { CategoryType, CustomFilter } from '../types';

/**
 * High-speed academic classifier for sorting batch emails in milliseconds.
 */
export function classifyInboxItem(
  subject: string,
  sender: string,
  snippet: string,
  customFilters?: CustomFilter[],
  labelOverrides?: Record<string, string>,
  emailId?: string
): { category: CategoryType; courseCode?: string } {
  const combined = `${subject} ${sender} ${snippet}`.toLowerCase();

  const courseMatch = subject.match(/\b([A-Z]{2,4}\s?[-_]?\s?\d{3,4}[A-Z]?)\b/i);
  const courseCode = courseMatch ? courseMatch[1].toUpperCase() : undefined;

  // 0. Check manual user label overrides first (User Preference Rule)
  if (emailId && labelOverrides && labelOverrides[emailId]) {
    return { category: labelOverrides[emailId], courseCode };
  }
  if (labelOverrides && labelOverrides[subject]) {
    return { category: labelOverrides[subject], courseCode };
  }

  // 0.5. Check user-defined custom filters
  if (customFilters && customFilters.length > 0) {
    for (const filter of customFilters) {
      if (
        filter.keywords &&
        filter.keywords.some((k) => k.trim() && combined.includes(k.trim().toLowerCase()))
      ) {
        return { category: filter.name, courseCode };
      }
    }
  }

  // 1. PhD and Viva-Voce Notices -> Route directly to General (as requested)
  if (
    combined.includes('viva') ||
    combined.includes('viva-voce') ||
    combined.includes('viva voce') ||
    combined.includes('oral defense') ||
    combined.includes('thesis defense') ||
    combined.includes('phd defense') ||
    combined.includes('ph.d. defense') ||
    combined.includes('synopsis presentation') ||
    combined.includes('synopsis submission') ||
    combined.includes('ph.d. viva') ||
    combined.includes('phd viva') ||
    combined.includes('doctoral defense') ||
    combined.includes('comprehensive exam presentation')
  ) {
    return { category: 'General', courseCode };
  }

  // 2. Class Rescheduling (High urgency)
  if (
    combined.includes('reschedule') ||
    combined.includes('rescheduled') ||
    combined.includes('postpone') ||
    combined.includes('postponed') ||
    combined.includes('cancelled') ||
    combined.includes('class canceled') ||
    combined.includes('venue change') ||
    combined.includes('room change') ||
    combined.includes('lecture timing') ||
    combined.includes('no class today') ||
    combined.includes('extra class')
  ) {
    return { category: 'Class Rescheduling', courseCode };
  }

  // 3. Competitions & Tournaments (Sports, Hackathons, Trials, Contests)
  if (
    combined.includes('competition') ||
    combined.includes('tournament') ||
    combined.includes('contest') ||
    combined.includes('hackathon') ||
    combined.includes('sociothon') ||
    combined.includes('devfolio') ||
    combined.includes('trials') ||
    combined.includes('open trials') ||
    combined.includes('inter-iit') ||
    combined.includes('inter iit') ||
    combined.includes('inter-hostel') ||
    combined.includes('inter hostel') ||
    combined.includes('inter-college') ||
    combined.includes('championship') ||
    combined.includes('trophy') ||
    combined.includes('athletics') ||
    combined.includes('sports') ||
    combined.includes('cricket') ||
    combined.includes('football') ||
    combined.includes('badminton') ||
    combined.includes('volleyball') ||
    combined.includes('table tennis') ||
    combined.includes('chess') ||
    combined.includes('squash') ||
    combined.includes('esports') ||
    combined.includes('case competition') ||
    combined.includes('case comp') ||
    combined.includes('quiz competition') ||
    combined.includes('challenge') ||
    combined.includes('cash prize') ||
    combined.includes('prize pool') ||
    combined.includes('mushaira') ||
    combined.includes('ideathon')
  ) {
    return { category: 'Competitions & Tournaments', courseCode };
  }

  // 4. Workshops & Talks (Including Intro Talks, Orientation Talks, Conclaves)
  if (
    combined.includes('intro talk') ||
    combined.includes('intro talks') ||
    combined.includes('opening talk') ||
    combined.includes('introductory talk') ||
    combined.includes('orientation talk') ||
    combined.includes('info session') ||
    combined.includes('tech talk') ||
    combined.includes('talk by') ||
    combined.includes('distinguished lecture') ||
    combined.includes('guest lecture') ||
    combined.includes('workshop') ||
    combined.includes('webinar') ||
    combined.includes('seminar') ||
    combined.includes('conclave') ||
    combined.includes('symposium') ||
    combined.includes('bootcamp') ||
    combined.includes('masterclass') ||
    combined.includes('hands-on') ||
    combined.includes('enactus') ||
    combined.includes('sdslabs') ||
    combined.includes('pragati') ||
    combined.includes('hr conclave')
  ) {
    return { category: 'Workshops', courseCode };
  }

  // 5. Academics (Coursework, Assignments, Exams)
  if (
    courseCode ||
    combined.includes('assignment') ||
    combined.includes('homework') ||
    combined.includes('syllabus') ||
    combined.includes('quiz') ||
    combined.includes('midterm') ||
    combined.includes('endterm') ||
    combined.includes('exam') ||
    combined.includes('grade') ||
    combined.includes('grading') ||
    combined.includes('lab manual') ||
    combined.includes('tutorial') ||
    combined.includes('office hours') ||
    combined.includes('canvas') ||
    combined.includes('moodle') ||
    combined.includes('classroom') ||
    combined.includes('prof.') ||
    combined.includes('professor') ||
    combined.includes('teaching day') ||
    combined.includes('lecture') ||
    combined.includes('faculty') ||
    combined.includes('ug-i') ||
    combined.includes('ug-ii') ||
    combined.includes('pg-i') ||
    combined.includes('project evaluation')
  ) {
    return { category: 'Academics', courseCode };
  }

  // 6. General (Campus News, Administration, Security, Drives, PhD/Viva Notices)
  return { category: 'General', courseCode };
}
