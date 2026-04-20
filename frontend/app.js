/**
 * WasteSmart Karnataka — Frontend Application
 * Connects to FastAPI backend for AI waste classification
 */

const API_BASE = "http://localhost:8000";

// ─── State ───
let currentLang = "en";
let selectedFile = null;
let totalPoints = 0;
let districts = [];

// ─── i18n Strings ───
const I18N = {
  en: {
    hero_badge: "Karnataka · 31 Districts",
    hero_title: 'Snap. Classify.<br/><span class="gradient-text">Save the Planet.</span>',
    hero_subtitle: "AI-powered waste classification with disposal guidance in Kannada, English & Hindi",
    hero_cta: "Scan Your Waste",
    stat_categories: "Waste Types",
    stat_districts: "Districts",
    stat_languages: "Languages",
    upload_title: '<span class="section-icon">🔍</span> Identify Your Waste',
    district_label: "Select your district",
    district_placeholder: "Choose a district...",
    upload_text: "Tap to take a photo or upload image",
    upload_hint: "Supports JPG, PNG, WebP · Max 10MB",
    analyze_btn: "Analyze with AI",
    loading_text: "Analyzing waste...",
    loading_sub: "Our AI is classifying your waste item",
    demo_mode: "Demo Mode — Add GEMINI_API_KEY for real AI analysis",
    recyclability: "Recyclability",
    compostable: "Compostable",
    reuse_potential: "Reuse",
    decomposition: "Decompose",
    sustainability_title: "🌍 Sustainability Score",
    sell_title: "Sell & Earn",
    description_title: "📝 Description",
    district_info_title: "📍 Your District Info",
    collection_schedule: "Collection Schedule",
    dropoff_center: "Drop-off Center",
    eco_tips_title: "🌿 Eco Tips",
    points_earned: "points earned!",
    scan_again: "Scan Another Item",
    footer_sub: "AI-powered waste management for a cleaner Karnataka",
    footer_made: "Made with 💚 for Karnataka",
    yes: "Yes",
    no: "No",
    sustainability_excellent: "Excellent! Highly sustainable item",
    sustainability_good: "Good sustainability potential",
    sustainability_moderate: "Moderate — consider alternatives",
    sustainability_low: "Low sustainability — dispose carefully",
  },
  kn: {
    hero_badge: "ಕರ್ನಾಟಕ · 31 ಜಿಲ್ಲೆಗಳು",
    hero_title: 'ಫೋಟೋ ತೆಗೆಯಿರಿ. ವಿಂಗಡಿಸಿ.<br/><span class="gradient-text">ಭೂಮಿ ಉಳಿಸಿ.</span>',
    hero_subtitle: "ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಹಿಂದಿಯಲ್ಲಿ ವಿಲೇವಾರಿ ಮಾರ್ಗದರ್ಶಿಯೊಂದಿಗೆ AI-ಚಾಲಿತ ತ್ಯಾಜ್ಯ ವರ್ಗೀಕರಣ",
    hero_cta: "ನಿಮ್ಮ ತ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    stat_categories: "ತ್ಯಾಜ್ಯ ವಿಧಗಳು",
    stat_districts: "ಜಿಲ್ಲೆಗಳು",
    stat_languages: "ಭಾಷೆಗಳು",
    upload_title: '<span class="section-icon">🔍</span> ನಿಮ್ಮ ತ್ಯಾಜ್ಯ ಗುರುತಿಸಿ',
    district_label: "ನಿಮ್ಮ ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ",
    district_placeholder: "ಜಿಲ್ಲೆ ಆರಿಸಿ...",
    upload_text: "ಫೋಟೋ ತೆಗೆಯಲು ಅಥವಾ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    upload_hint: "JPG, PNG, WebP · ಗರಿಷ್ಠ 10MB",
    analyze_btn: "AI ಯೊಂದಿಗೆ ವಿಶ್ಲೇಷಿಸಿ",
    loading_text: "ತ್ಯಾಜ್ಯ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    loading_sub: "ನಮ್ಮ AI ನಿಮ್ಮ ತ್ಯಾಜ್ಯ ವರ್ಗೀಕರಿಸುತ್ತಿದೆ",
    demo_mode: "ಡೆಮೊ ಮೋಡ್ — ನಿಜವಾದ AI ವಿಶ್ಲೇಷಣೆಗಾಗಿ GEMINI_API_KEY ಸೇರಿಸಿ",
    recyclability: "ಮರುಬಳಕೆ",
    compostable: "ಕಾಂಪೋಸ್ಟ್",
    reuse_potential: "ಮರುಬಳಕೆ",
    decomposition: "ಕೊಳೆಯುವಿಕೆ",
    sustainability_title: "🌍 ಸುಸ್ಥಿರತೆ ಅಂಕ",
    sell_title: "ಮಾರಾಟ ಮಾಡಿ ಹಣ ಗಳಿಸಿ",
    description_title: "📝 ವಿವರಣೆ",
    district_info_title: "📍 ನಿಮ್ಮ ಜಿಲ್ಲೆ ಮಾಹಿತಿ",
    collection_schedule: "ಸಂಗ್ರಹ ವೇಳಾಪಟ್ಟಿ",
    dropoff_center: "ಡ್ರಾಪ್-ಆಫ್ ಕೇಂದ್ರ",
    eco_tips_title: "🌿 ಪರಿಸರ ಸಲಹೆಗಳು",
    points_earned: "ಅಂಕಗಳು ಗಳಿಸಿದ್ದೀರಿ!",
    scan_again: "ಇನ್ನೊಂದು ವಸ್ತು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    footer_sub: "ಸ್ವಚ್ಛ ಕರ್ನಾಟಕಕ್ಕಾಗಿ AI-ಚಾಲಿತ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ",
    footer_made: "ಕರ್ನಾಟಕಕ್ಕಾಗಿ 💚 ನಿಂದ ತಯಾರಿಸಲಾಗಿದೆ",
    yes: "ಹೌದು",
    no: "ಇಲ್ಲ",
    sustainability_excellent: "ಅತ್ಯುತ್ತಮ! ಹೆಚ್ಚು ಸುಸ್ಥಿರ ವಸ್ತು",
    sustainability_good: "ಉತ್ತಮ ಸುಸ್ಥಿರತೆ ಸಾಮರ್ಥ್ಯ",
    sustainability_moderate: "ಮಧ್ಯಮ — ಪರ್ಯಾಯಗಳನ್ನು ಪರಿಗಣಿಸಿ",
    sustainability_low: "ಕಡಿಮೆ ಸುಸ್ಥಿರತೆ — ಎಚ್ಚರಿಕೆಯಿಂದ ವಿಲೇವಾರಿ ಮಾಡಿ",
  },
  hi: {
    hero_badge: "कर्नाटक · 31 जिले",
    hero_title: 'फ़ोटो लें. वर्गीकृत करें.<br/><span class="gradient-text">पृथ्वी बचाएं.</span>',
    hero_subtitle: "कन्नड़, अंग्रेजी और हिंदी में निपटान मार्गदर्शन के साथ AI-संचालित कचरा वर्गीकरण",
    hero_cta: "अपना कचरा स्कैन करें",
    stat_categories: "कचरा प्रकार",
    stat_districts: "जिले",
    stat_languages: "भाषाएं",
    upload_title: '<span class="section-icon">🔍</span> अपना कचरा पहचानें',
    district_label: "अपना जिला चुनें",
    district_placeholder: "जिला चुनें...",
    upload_text: "फ़ोटो लेने या छवि अपलोड करने के लिए टैप करें",
    upload_hint: "JPG, PNG, WebP · अधिकतम 10MB",
    analyze_btn: "AI से विश्लेषण करें",
    loading_text: "कचरा विश्लेषण हो रहा है...",
    loading_sub: "हमारा AI आपके कचरे को वर्गीकृत कर रहा है",
    demo_mode: "डेमो मोड — वास्तविक AI विश्लेषण के लिए GEMINI_API_KEY जोड़ें",
    recyclability: "पुनर्चक्रण",
    compostable: "खाद योग्य",
    reuse_potential: "पुन: उपयोग",
    decomposition: "विघटन",
    sustainability_title: "🌍 स्थिरता स्कोर",
    sell_title: "बेचें और कमाएं",
    description_title: "📝 विवरण",
    district_info_title: "📍 आपके जिले की जानकारी",
    collection_schedule: "संग्रह अनुसूची",
    dropoff_center: "ड्रॉप-ऑफ केंद्र",
    eco_tips_title: "🌿 पर्यावरण सुझाव",
    points_earned: "अंक अर्जित!",
    scan_again: "दूसरी वस्तु स्कैन करें",
    footer_sub: "स्वच्छ कर्नाटक के लिए AI-संचालित कचरा प्रबंधन",
    footer_made: "कर्नाटक के लिए 💚 से बनाया",
    yes: "हाँ",
    no: "नहीं",
    sustainability_excellent: "उत्कृष्ट! अत्यधिक टिकाऊ वस्तु",
    sustainability_good: "अच्छी स्थिरता क्षमता",
    sustainability_moderate: "मध्यम — विकल्पों पर विचार करें",
    sustainability_low: "कम स्थिरता — सावधानी से निपटान करें",
  },
};

// ─── DOM References ───
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
  langBtns: $$(".lang-btn"),
  pointsBadge: $("#pointsBadge"),
  totalPoints: $("#totalPoints"),
  districtSelect: $("#districtSelect"),
  uploadZone: $("#uploadZone"),
  uploadPlaceholder: $("#uploadPlaceholder"),
  uploadPreview: $("#uploadPreview"),
  previewImg: $("#previewImg"),
  removeImageBtn: $("#removeImageBtn"),
  fileInput: $("#fileInput"),
  analyzeBtn: $("#analyzeBtn"),
  loadingOverlay: $("#loadingOverlay"),
  resultsSection: $("#resultsSection"),
  uploadSection: $("#uploadSection"),
  demoBadge: $("#demoBadge"),
  resultIcon: $("#resultIcon"),
  resultType: $("#resultType"),
  resultSubtype: $("#resultSubtype"),
  confidenceBar: $("#confidenceBar"),
  confidenceLabel: $("#confidenceLabel"),
  binCard: $("#binCard"),
  binIcon: $("#binIcon"),
  binLabel: $("#binLabel"),
  disposalMethod: $("#disposalMethod"),
  recyclabilityScore: $("#recyclabilityScore"),
  compostableLabel: $("#compostableLabel"),
  reuseScore: $("#reuseScore"),
  decompositionTime: $("#decompositionTime"),
  sustainabilityRing: $("#sustainabilityRing"),
  sustainabilityValue: $("#sustainabilityValue"),
  sustainabilityLabel: $("#sustainabilityLabel"),
  sellCard: $("#sellCard"),
  sellSuggestion: $("#sellSuggestion"),
  descriptionText: $("#descriptionText"),
  districtInfoCard: $("#districtInfoCard"),
  districtSchedule: $("#districtSchedule"),
  districtDropoff: $("#districtDropoff"),
  ecoTipsList: $("#ecoTipsList"),
  pointsEarned: $("#pointsEarned"),
};

// ─── Init ───
document.addEventListener("DOMContentLoaded", () => {
  loadDistricts();
  setupUpload();
  setupLanguageSwitcher();
});

// ─── Load Districts ───
async function loadDistricts() {
  try {
    const res = await fetch(`${API_BASE}/api/districts`);
    districts = await res.json();
  } catch {
    // Fallback: use embedded data
    districts = [];
  }

  const select = DOM.districtSelect;
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("district_placeholder");
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  if (districts.length === 0) {
    // Hardcoded fallback names
    const fallbacks = [
      { id: "bengaluru-urban", name: { en: "Bengaluru Urban", kn: "ಬೆಂಗಳೂರು ನಗರ", hi: "बेंगलुरु शहरी" } },
      { id: "mysuru", name: { en: "Mysuru", kn: "ಮೈಸೂರು", hi: "मैसूर" } },
    ];
    districts = fallbacks;
  }

  districts.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name[currentLang] || d.name.en;
    select.appendChild(opt);
  });

  // Default to Bengaluru Urban
  select.value = "bengaluru-urban";
}

// ─── Upload Handling ───
function setupUpload() {
  const zone = DOM.uploadZone;

  zone.addEventListener("click", () => DOM.fileInput.click());
  zone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      DOM.fileInput.click();
    }
  });

  // File input change
  DOM.fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag & drop
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Remove image
  DOM.removeImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearImage();
  });

  // Analyze button
  DOM.analyzeBtn.addEventListener("click", analyzeWaste);
}

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    alert("Image too large. Max 10MB.");
    return;
  }

  selectedFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    DOM.previewImg.src = e.target.result;
    DOM.uploadPlaceholder.classList.add("hidden");
    DOM.uploadPreview.classList.remove("hidden");
    DOM.analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  selectedFile = null;
  DOM.fileInput.value = "";
  DOM.previewImg.src = "";
  DOM.uploadPlaceholder.classList.remove("hidden");
  DOM.uploadPreview.classList.add("hidden");
  DOM.analyzeBtn.disabled = true;
}

// ─── Analyze Waste ───
async function analyzeWaste() {
  if (!selectedFile) return;

  const district = DOM.districtSelect.value || "bengaluru-urban";

  DOM.loadingOverlay.classList.remove("hidden");

  const formData = new FormData();
  formData.append("image", selectedFile);
  formData.append("district", district);
  formData.append("language", currentLang);

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Analysis failed");
    }

    const result = await res.json();
    displayResults(result);
  } catch (error) {
    console.error("Analysis error:", error);
    alert("Could not analyze waste. Make sure the backend is running.\n\n" + error.message);
  } finally {
    DOM.loadingOverlay.classList.add("hidden");
  }
}

// ─── Display Results ───
function displayResults(data) {
  // Hide upload, show results
  DOM.uploadSection.classList.add("hidden");
  DOM.resultsSection.classList.remove("hidden");

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Demo badge
  if (data.demo_mode) {
    DOM.demoBadge.classList.remove("hidden");
  } else {
    DOM.demoBadge.classList.add("hidden");
  }

  // Result header
  DOM.resultIcon.textContent = data.icon || "🗑️";
  DOM.resultType.textContent = data.waste_type;
  DOM.resultSubtype.textContent = data.waste_subtype;

  const confidence = Math.round((data.confidence || 0) * 100);
  setTimeout(() => {
    DOM.confidenceBar.style.width = confidence + "%";
  }, 200);
  DOM.confidenceLabel.textContent = confidence + "% confidence";

  // Bin card
  const binType = data.bin || "dry";
  DOM.binCard.setAttribute("data-bin", binType);

  const binEmoji = { wet: "🟢", dry: "🔵", hazardous: "🔴" };
  DOM.binIcon.textContent = binEmoji[binType] || "🗑️";

  const binLabelText = data.bin_label
    ? data.bin_label[currentLang] || data.bin_label.en
    : binType.charAt(0).toUpperCase() + binType.slice(1) + " Waste";
  DOM.binLabel.textContent = binLabelText;

  const disposalText = data.disposal_method
    ? data.disposal_method[currentLang] || data.disposal_method.en
    : "";
  DOM.disposalMethod.textContent = disposalText;

  // Stats
  DOM.recyclabilityScore.textContent = (data.recyclability || 0) + "/5";
  DOM.compostableLabel.textContent = data.compostable
    ? t("yes")
    : t("no");
  DOM.reuseScore.textContent = (data.reuse_potential || 0) + "/5";
  DOM.decompositionTime.textContent = data.decomposition_time || "—";

  // Sustainability ring
  const score = data.sustainability_score || 0;
  const circumference = 326.73;
  const offset = circumference - (score / 100) * circumference;

  setTimeout(() => {
    DOM.sustainabilityRing.style.strokeDashoffset = offset;

    if (score >= 75) {
      DOM.sustainabilityRing.style.stroke = "#22d67a";
    } else if (score >= 50) {
      DOM.sustainabilityRing.style.stroke = "#f59e0b";
    } else {
      DOM.sustainabilityRing.style.stroke = "#ef4444";
    }
  }, 300);

  DOM.sustainabilityValue.textContent = score;
  DOM.sustainabilityValue.style.color =
    score >= 75 ? "#22d67a" : score >= 50 ? "#f59e0b" : "#ef4444";

  if (score >= 75) DOM.sustainabilityLabel.textContent = t("sustainability_excellent");
  else if (score >= 50) DOM.sustainabilityLabel.textContent = t("sustainability_good");
  else if (score >= 25) DOM.sustainabilityLabel.textContent = t("sustainability_moderate");
  else DOM.sustainabilityLabel.textContent = t("sustainability_low");

  // Sell card
  if (data.can_sell) {
    DOM.sellCard.classList.remove("hidden");
    const sellText = data.sell_suggestion
      ? typeof data.sell_suggestion === "string"
        ? data.sell_suggestion
        : data.sell_suggestion[currentLang] || data.sell_suggestion.en
      : "";
    DOM.sellSuggestion.textContent = sellText;
  } else {
    DOM.sellCard.classList.add("hidden");
  }

  // Description
  const descText = data.description
    ? data.description[currentLang] || data.description.en
    : "";
  DOM.descriptionText.textContent = descText;

  // District info
  if (data.district_info) {
    DOM.districtInfoCard.classList.remove("hidden");
    const di = data.district_info;
    DOM.districtSchedule.textContent =
      di.schedule ? (di.schedule[currentLang] || di.schedule.en) : "";
    DOM.districtDropoff.textContent =
      di.dropoff ? (di.dropoff[currentLang] || di.dropoff.en) : "";
  } else {
    DOM.districtInfoCard.classList.add("hidden");
  }

  // Eco tips
  DOM.ecoTipsList.innerHTML = "";
  const tips = data.eco_tips
    ? data.eco_tips[currentLang] || data.eco_tips.en || []
    : [];
  tips.forEach((tip) => {
    const li = document.createElement("li");
    li.textContent = tip;
    DOM.ecoTipsList.appendChild(li);
  });

  // Points
  const pts = data.points_earned || 10;
  DOM.pointsEarned.textContent = pts;
  totalPoints += pts;
  DOM.totalPoints.textContent = totalPoints;
  DOM.pointsBadge.classList.remove("hidden");
}

// ─── Language Switcher ───
function setupLanguageSwitcher() {
  DOM.langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;

      DOM.langBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      updateUILanguage();
    });
  });
}

function updateUILanguage() {
  // Update all data-i18n elements
  $$("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (text) el.innerHTML = text;
  });

  // Update district dropdown options
  const select = DOM.districtSelect;
  const currentVal = select.value;
  districts.forEach((d) => {
    const opt = select.querySelector(`option[value="${d.id}"]`);
    if (opt) {
      opt.textContent = d.name[currentLang] || d.name.en;
    }
  });
  select.value = currentVal;
}

function t(key) {
  return I18N[currentLang]?.[key] || I18N.en[key] || "";
}

// ─── Navigation Helpers ───
function scrollToUpload() {
  const target = document.getElementById("uploadSection");
  target.scrollIntoView({ behavior: "smooth" });
}

function resetApp() {
  clearImage();
  DOM.resultsSection.classList.add("hidden");
  DOM.uploadSection.classList.remove("hidden");
  DOM.confidenceBar.style.width = "0%";
  DOM.sustainabilityRing.style.strokeDashoffset = 326.73;
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Small delay, then scroll to upload
  setTimeout(() => {
    scrollToUpload();
  }, 400);
}
