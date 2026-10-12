// Rule-based skill matcher — placeholder for the AI layer coming later.
// The API shape (score + presentSkills + missingSkills) is what the AI
// version will return too, so the frontend won't need to change.

import pdfParse from 'pdf-parse'

// Skills the matcher looks for. Extend this list as needed.
export const SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'MongoDB',
  'React', 'Node.js', 'Express', 'HTML', 'CSS', 'Git',
  'Docker', 'AWS', 'REST APIs', 'Unit Testing', 'CI/CD', 'Linux',
]

// Some skills have alternate spellings on resumes.
const ALIASES = {
  'REST APIs': ['rest', 'restful'],
  'Node.js': ['node', 'nodejs'],
  'CI/CD': ['ci/cd', 'ci cd', 'continuous integration'],
  'Unit Testing': ['unit test', 'jest', 'mocha', 'pytest'],
  'MongoDB': ['mongo'],
}

function findSkills(text, skills) {
  const lower = ` ${text.toLowerCase()} `
  return skills.filter((skill) => {
    const phrases = [skill.toLowerCase(), ...(ALIASES[skill] || [])]
    return phrases.some((p) => lower.includes(p))
  })
}

export function matchSkills(resumeText, jdText) {
  const required = findSkills(jdText, SKILLS)
  const present = findSkills(resumeText, required)
  const missing = required.filter((s) => !present.includes(s))
  const score = required.length
    ? Math.round((present.length / required.length) * 100)
    : 0

  return {
    score,
    present,
    missing,
    presentSkills: present,
    missingSkills: missing,
    requiredSkills: required,
  }
}

export function extractPdfText(buffer) {
  return pdfParse(buffer).then((data) => data.text)
}
