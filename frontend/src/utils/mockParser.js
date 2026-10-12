export const TARGET_SKILLS = [
  'Python', 'SQL', 'Pandas', 'Git', 'REST APIs',
  'Docker', 'AWS', 'Unit Testing', 'Linux', 'Communication',
]

export const PARSER_STEPS = ['Reading PDF…', 'Extracting text…', 'Matching skills…', 'Scoring…']
export const MAX_FILE_MB = 5

function hashFileName(value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000
  }
  return hash
}

function extractSkillsFromJd(jdText) {
  const normalized = jdText.toLowerCase()

  return TARGET_SKILLS.filter((skill) => {
    const skillTerms = skill.toLowerCase().split(/\s+/)
    return skillTerms.some((term) => normalized.includes(term))
  })
}

export function mockAnalyze(fileName, jdText = '') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const required = extractSkillsFromJd(jdText)
      const skillsToMatch = required.length ? required : TARGET_SKILLS
      const hash = hashFileName(`${fileName}:${jdText}`)
      const targetCount = Math.min(skillsToMatch.length, Math.max(2, Math.round((skillsToMatch.length * ((hash % 70) + 25)) / 100)))
      const present = skillsToMatch.slice(0, targetCount)
      const missing = skillsToMatch.filter((skill) => !present.includes(skill))
      const score = skillsToMatch.length ? Math.round((present.length / skillsToMatch.length) * 100) : 0

      resolve({ score, present, missing })
    }, 1200)
  })
}

export function validateFile(file) {
  if (!file) return 'No file selected.'
  if (file.type !== 'application/pdf') return "That's not a PDF. Please upload a .pdf resume."
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `File is larger than ${MAX_FILE_MB} MB.`
  return null
}
