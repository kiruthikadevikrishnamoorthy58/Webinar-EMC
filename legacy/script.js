// ---- 0 → Shipped Resume Parser: mock logic ----
// Everything here is simulated: no file is uploaded anywhere. When you're
// ready for the real thing, replace mockAnalyze() with a fetch() to a real
// parser API that returns { score, present, missing }.

const $ = (id) => document.getElementById(id);

const dropzone = $("dropzone");
const fileInput = $("file-input");
const dropzoneIdle = $("dropzone-idle");
const dropzoneAnalyzing = $("dropzone-analyzing");
const dropzoneFile = $("dropzone-file");
const analyzingLabel = $("analyzing-label");
const fileNameEl = $("file-name");
const resetBtn = $("reset-btn");
const errorMsg = $("error-msg");

const resultsSection = $("results");
const scoreNumber = $("score-number");
const scoreRing = $("score-ring");
const scoreHeadline = $("score-headline");
const scoreSummary = $("score-summary");
const presentList = $("present-skills");
const missingList = $("missing-skills");
const presentCount = $("present-count");
const missingCount = $("missing-count");

const RING_LENGTH = 2 * Math.PI * 52; // matches r=52 in the SVG
const MAX_FILE_MB = 5;

// The pretend job description the mock scores against.
const TARGET_SKILLS = [
  "Python", "SQL", "Pandas", "Git", "REST APIs",
  "Docker", "AWS", "Unit Testing", "Linux", "Communication",
];

const PARSER_STEPS = ["Reading PDF…", "Extracting text…", "Matching skills…", "Scoring…"];

// ---- Mock "parsing" ----
function mockAnalyze(file) {
  return new Promise((resolve) => {
    let step = 0;
    const tick = setInterval(() => {
      analyzingLabel.textContent = PARSER_STEPS[step];
      step += 1;
      if (step >= PARSER_STEPS.length) {
        clearInterval(tick);

        // Derive a stable pseudo-random score from the file name so the same
        // resume always gets the same result (feels more real than pure random).
        let hash = 0;
        for (let i = 0; i < file.name.length; i++) {
          hash = (hash * 31 + file.name.charCodeAt(i)) % 1000;
        }

        const score = 45 + (hash % 50); // 45–94
        const shuffled = [...TARGET_SKILLS].sort(() => (hash % 7) - 3);
        const present = shuffled.slice(0, Math.round(score / 12));
        const missing = TARGET_SKILLS.filter((s) => !present.includes(s));

        resolve({ score, present, missing });
      }
    }, 450);
  });
}

// ---- Rendering ----
function renderResult({ score, present, missing }) {
  // SVG dashoffset trick: full offset = empty ring, 0 = full ring
  scoreNumber.textContent = score;
  scoreRing.style.strokeDashoffset = RING_LENGTH * (1 - score / 100);
  scoreRing.style.stroke =
    score >= 70 ? "var(--yes)" : score >= 50 ? "var(--warn)" : "var(--no)";

  scoreHeadline.textContent =
    score >= 70 ? "Strong match" : score >= 50 ? "Good fit" : "Needs work";
  scoreSummary.textContent =
    score >= 70
      ? "Your resume covers most of the skills recruiters look for in this role."
      : score >= 50
      ? "Your resume is in the ballpark — a few key skills would push it higher."
      : "Several core skills are missing from your resume. Focus on the red list below.";

  presentList.replaceChildren(
    ...present.map((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      return li;
    })
  );
  missingList.replaceChildren(
    ...missing.map((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      return li;
    })
  );
  presentCount.textContent = `${present.length} found`;
  missingCount.textContent = `${missing.length} gaps`;

  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- UI state helpers ----
function showDropzoneState(state, file) {
  dropzoneIdle.classList.toggle("hidden", state !== "idle");
  dropzoneAnalyzing.classList.toggle("hidden", state !== "analyzing");
  dropzoneFile.classList.toggle("hidden", state !== "file");
  if (file) fileNameEl.textContent = file.name;
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function handleFile(file) {
  errorMsg.classList.add("hidden");

  if (!file) return;
  if (file.type !== "application/pdf") {
    showError("That's not a PDF. Please upload a .pdf resume.");
    return;
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    showError(`File is larger than ${MAX_FILE_MB} MB.`);
    return;
  }

  showDropzoneState("analyzing", file);
  resultsSection.classList.add("hidden");

  mockAnalyze(file).then(renderResult);
}

// ---- Events ----
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});
fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));

["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  })
);
dropzone.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));

resetBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // don't re-trigger the dropzone's own click handler
  fileInput.value = "";
  resultsSection.classList.add("hidden");
  showDropzoneState("idle");
  errorMsg.classList.add("hidden");
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
});
