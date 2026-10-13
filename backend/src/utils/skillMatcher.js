// Rule-based skill matcher — placeholder for the AI layer coming later.
// The API shape (score + presentSkills + missingSkills) is what the AI
// version will return too, so the frontend won't need to change.

import pdfParse from 'pdf-parse'

// Skills the matcher looks for. Extend this list as needed.
export const SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Ruby', 'PHP',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
  'HTML', 'CSS', 'Git', 'Docker', 'Kubernetes', 'Terraform',
  'AWS', 'Azure', 'Google Cloud', 'REST APIs', 'GraphQL',
  'Unit Testing', 'CI/CD', 'Linux', 'Machine Learning', 'Data Analysis', 'Agile',
]

// Some skills have alternate spellings on resumes.
const ALIASES = {
  'REST APIs': ['rest', 'restful'],
  'Node.js': ['node', 'nodejs'],
  'CI/CD': ['ci/cd', 'ci cd', 'continuous integration'],
  'Unit Testing': ['unit test', 'jest', 'mocha', 'pytest'],
  'MongoDB': ['mongo'],
  'C++': ['cpp'],
  'C#': ['c sharp'],
  'Google Cloud': ['gcp'],
  'Vue.js': ['vue'],
  'PostgreSQL': ['postgres'],
}

function containsPhrase(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(text)
}

function findSkills(text, skills) {
  return skills.filter((skill) => {
    const phrases = [skill.toLowerCase(), ...(ALIASES[skill] || [])]
    return phrases.some((phrase) => containsPhrase(text, phrase))
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
