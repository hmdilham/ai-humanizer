// AI Detector & Humanizer v2.1 - Professional Edition
// Author: @hmdilham
// Date: 2025-01-01
// Description: Multi-tone paraphrasing + Multi-format export (TXT, DOCX, MD)

// ============================================================================
// ELEMENT REFERENCES
// ============================================================================
const originalEl = document.getElementById('original');
const humanizedEl = document.getElementById('humanized');
const detectBtn = document.getElementById('detect-btn');
const humanizeBtn = document.getElementById('humanize-btn');
const detectionResultEl = document.getElementById('detection-result');
const humanizedDetectionEl = document.getElementById('humanized-detection');
const googleKeyEl = document.getElementById('google-key');
const modelSelect = document.getElementById('model-select');
const toneSelect = document.getElementById('tone-select');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const downloadTxtBtn = document.getElementById('download-txt');
const downloadDocxBtn = document.getElementById('download-docx');
const downloadMdBtn = document.getElementById('download-md');
const swapBtn = document.getElementById('swap-btn');
const clearBtn = document.getElementById('clear-btn');
const redetectBtn = document.getElementById('redetect-btn');
const clearKey = document.getElementById('clear-key');
const wordCountEl = document.getElementById('word-count');
const humanizedWordCountEl = document.getElementById('humanized-word-count');
const aboutLink = document.getElementById('about-link');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');

// ============================================================================
// EVENT LISTENERS
// ============================================================================
detectBtn.addEventListener('click', () => {
  const text = originalEl.value.trim();
  if (!text) { 
    detectionResultEl.innerHTML = '<p style="color:#f59e0b">⚠️ Masukkan teks di panel kiri terlebih dahulu.</p>'; 
    return; 
  }
  const report = detectAIAdvanced(text);
  detectionResultEl.innerHTML = renderDetectionAdvanced(report);
});

humanizeBtn.addEventListener('click', async () => {
  const text = originalEl.value.trim();
  if (!text) { 
    alert('⚠️ Masukkan teks di panel kiri terlebih dahulu.'); 
    return; 
  }
  
  const googleKey = googleKeyEl.value.trim();
  const tone = toneSelect.value;
  const toneEmoji = {
    'academic': '🎓',
    'business': '💼',
    'formal': '📄',
    'casual': '😊'
  }[tone];
  
  if (!googleKey) {
    const useLocal = confirm(`⚠️ API Key Google AI Studio belum diisi.\n\nGunakan parafrasa lokal mode ${toneEmoji} ${tone.toUpperCase()}?\n\nUntuk hasil terbaik, masukkan API Key.\n\nKlik OK untuk lanjut, atau Cancel untuk batal.`);
    if (!useLocal) return;
  }
  
  humanizedEl.value = `⏳ Memproses parafrasa ${toneEmoji} ${tone.toUpperCase()}...\n\nMohon tunggu sebentar...`;
  const model = modelSelect.value;

  try {
    if (googleKey) {
      const res = await callGeminiParaphraseAdvanced(googleKey, model, text, tone);
      humanizedEl.value = res;
    } else {
      humanizedEl.value = advancedParaphrase(text, tone);
    }
    updateWordCount();
    alert(`✅ Parafrasa ${toneEmoji} ${tone.toUpperCase()} selesai!\n\nKlik "🔄 Re-detect" untuk melihat skor AI.`);
  } catch (err) {
    console.error('Error:', err);
    const errorMsg = err.message || String(err);
    const useLocal = confirm('❌ Terjadi kesalahan:\n\n' + errorMsg + '\n\nGunakan parafrasa lokal?');
    if (useLocal) {
      humanizedEl.value = advancedParaphrase(text, tone);
      updateWordCount();
    } else {
      humanizedEl.value = '';
    }
  }
});

redetectBtn.addEventListener('click', () => {
  const text = humanizedEl.value.trim();
  if (!text) {
    humanizedDetectionEl.innerHTML = '<p style="color:#f59e0b">⚠️ Belum ada teks humanized untuk dideteksi.</p>';
    return;
  }
  const report = detectAIAdvanced(text);
  humanizedDetectionEl.innerHTML = renderDetectionAdvanced(report, true);
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(humanizedEl.value);
    alert('✅ Teks berhasil disalin ke clipboard.');
  } catch (e) {
    alert('❌ Tidak dapat menyalin: ' + e);
  }
});

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================
downloadTxtBtn.addEventListener('click', (e) => {
  e.preventDefault();
  exportAsPlainText();
});

downloadDocxBtn.addEventListener('click', (e) => {
  e.preventDefault();
  exportAsDocx();
});

downloadMdBtn.addEventListener('click', (e) => {
  e.preventDefault();
  exportAsMarkdown();
});

function exportAsPlainText() {
  const content = humanizedEl.value;
  if (!content.trim()) {
    alert('⚠️ Tidak ada teks untuk diexport.');
    return;
  }
  
  const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = getTimestamp();
  const tone = toneSelect.value;
  
  a.href = url;
  a.download = `humanized_${tone}_${timestamp}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  
  alert('✅ File Plain Text berhasil didownload!');
}

async function exportAsDocx() {
  const content = humanizedEl.value;
  if (!content.trim()) {
    alert('⚠️ Tidak ada teks untuk diexport.');
    return;
  }
  
  try {
    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } = docx;
    
    const timestamp = getTimestamp();
    const tone = toneSelect.value;
    const toneNames = {
      'academic': 'Academic',
      'business': 'Business Professional',
      'formal': 'Formal',
      'casual': 'Casual'
    };
    
    // Split content into paragraphs
    const paragraphs = content.split('\n').filter(p => p.trim());
    
    // Create document children
    const children = [
      new Paragraph({
        text: `AI Humanizer - ${toneNames[tone]} Mode`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Generated: ${new Date().toLocaleString('id-ID')}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
      new Paragraph({
        text: `By: @hmdilham | Mode: ${toneNames[tone]}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),
    ];
    
    // Add content paragraphs
    paragraphs.forEach(para => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: para,
              size: 24, // 12pt
            })
          ],
          spacing: { after: 200 }
        })
      );
    });
    
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });
    
    // Generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `humanized_${tone}_${timestamp}.docx`);
    
    alert('✅ File Word Document berhasil didownload!');
  } catch (err) {
    console.error('Error creating DOCX:', err);
    alert('❌ Error membuat Word Document: ' + err.message);
  }
}

function exportAsMarkdown() {
  const content = humanizedEl.value;
  if (!content.trim()) {
    alert('⚠️ Tidak ada teks untuk diexport.');
    return;
  }
  
  const timestamp = getTimestamp();
  const tone = toneSelect.value;
  const toneNames = {
    'academic': 'Academic',
    'business': 'Business Professional',
    'formal': 'Formal',
    'casual': 'Casual'
  };
  
  // Create markdown content
  let markdown = `# AI Humanizer - ${toneNames[tone]} Mode\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString('id-ID')}\n\n`;
  markdown += `**Author:** @hmdilham\n\n`;
  markdown += `**Mode:** ${toneNames[tone]}\n\n`;
  markdown += `---\n\n`;
  
  // Add content (split by paragraphs)
  const paragraphs = content.split('\n').filter(p => p.trim());
  paragraphs.forEach(para => {
    markdown += `${para}\n\n`;
  });
  
  markdown += `---\n\n`;
  markdown += `*Humanized using AI Detector & Humanizer v2.1 Professional Edition*\n`;
  
  const blob = new Blob([markdown], {type: 'text/markdown;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = `humanized_${tone}_${timestamp}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  
  alert('✅ File Markdown berhasil didownload!');
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().slice(0,19).replace(/:/g,'-').replace('T', '_');
}

// ============================================================================
// OTHER EVENT LISTENERS
// ============================================================================
swapBtn.addEventListener('click', () => {
  const a = originalEl.value;
  const b = humanizedEl.value;
  originalEl.value = b;
  humanizedEl.value = a;
  updateWordCount();
});

clearBtn.addEventListener('click', () => {
  if (originalEl.value.trim() || humanizedEl.value.trim()) {
    const confirmed = confirm('🗑️ Hapus semua teks?');
    if (!confirmed) return;
  }
  originalEl.value = '';
  humanizedEl.value = '';
  detectionResultEl.innerHTML = '';
  humanizedDetectionEl.innerHTML = '';
  updateWordCount();
});

clearKey.addEventListener('click', () => {
  googleKeyEl.value = '';
  alert('🗑️ API key dihapus.');
});

originalEl.addEventListener('input', updateWordCount);
humanizedEl.addEventListener('input', updateWordCount);

aboutLink.addEventListener('click', (e) => {
  e.preventDefault();
  modal.classList.remove('hidden');
  modal.classList.add('show');
});

closeModal.addEventListener('click', () => {
  modal.classList.remove('show');
  modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
    modal.classList.add('hidden');
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function updateWordCount() {
  const origWords = (originalEl.value.match(/\b\w+\b/g) || []).length;
  const humanWords = (humanizedEl.value.match(/\b\w+\b/g) || []).length;
  wordCountEl.textContent = `${origWords} words`;
  humanizedWordCountEl.textContent = `${humanWords} words`;
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0)
    .map(s => s.trim());
}

function clamp(v, min, max) { 
  return Math.max(min, Math.min(max, v)); 
}

function round(v, d = 2) { 
  return Math.round(v * Math.pow(10, d)) / Math.pow(10, d); 
}

// ============================================================================
// LANGUAGE DETECTION
// ============================================================================
function detectLanguage(text) {
  const sample = text.slice(0, 500).toLowerCase();
  
  const indonesianWords = ['yang', 'dan', 'ini', 'untuk', 'dengan', 'pada', 'adalah', 'dari', 'dalam', 'tidak', 'akan', 'atau', 'dapat', 'di', 'ke', 'oleh', 'sebagai', 'tersebut', 'juga'];
  const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'for', 'with', 'that', 'this', 'it', 'on', 'are', 'was', 'be', 'have', 'has'];
  
  let indonesianScore = 0;
  let englishScore = 0;
  
  indonesianWords.forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'g');
    const matches = sample.match(regex);
    if (matches) indonesianScore += matches.length;
  });
  
  englishWords.forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'g');
    const matches = sample.match(regex);
    if (matches) englishScore += matches.length;
  });
  
  return indonesianScore > englishScore ? 'id' : 'en';
}

// ============================================================================
// AI DETECTION
// ============================================================================
function detectAIAdvanced(text) {
  const sentences = splitSentences(text);
  const words = text.match(/\b\w+\b/g) || [];
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  
  if (sentences.length === 0 || words.length === 0) {
    return {
      score: 0,
      label: 'Insufficient text',
      confidence: 'Low',
      colorClass: 'score-low',
      details: {}
    };
  }

  const perplexity = calculatePerplexitySimulation(text, words);
  const burstiness = calculateBurstiness(sentences);
  const lexicalDiversity = uniqueWords.size / words.length;
  const syntaxComplexity = calculateSyntaxComplexity(sentences);
  const transitionScore = calculateTransitionOveruse(text);
  const punctuationRegularity = calculatePunctuationRegularity(sentences);
  const semanticCoherence = calculateSemanticCoherence(sentences);
  const ngramPredictability = calculateNgramPredictability(words);

  let score = 0;
  score += clamp((5 - perplexity) * 10, 0, 25);
  score += clamp((1 - burstiness) * 30, 0, 30);
  if (lexicalDiversity < 0.4 || lexicalDiversity > 0.8) {
    score += 10;
  }
  score += clamp(Math.abs(syntaxComplexity - 2.5) * 5, 0, 10);
  score += clamp(transitionScore * 10, 0, 10);
  score += clamp(punctuationRegularity * 10, 0, 10);
  score += clamp((semanticCoherence - 0.3) * 20, 0, 10);
  score += clamp(ngramPredictability * 15, 0, 15);
  score = clamp(Math.round(score), 0, 100);
  
  let label, confidence, colorClass;
  if (score >= 75) {
    label = 'Almost Certainly AI-Generated';
    confidence = 'Very High';
    colorClass = 'score-high';
  } else if (score >= 60) {
    label = 'Highly Likely AI-Generated';
    confidence = 'High';
    colorClass = 'score-high';
  } else if (score >= 45) {
    label = 'Likely AI-Generated';
    confidence = 'Moderate';
    colorClass = 'score-medium';
  } else if (score >= 30) {
    label = 'Possibly AI-Generated';
    confidence = 'Low';
    colorClass = 'score-low';
  } else {
    label = 'Likely Human-Written';
    confidence = 'High';
    colorClass = 'score-very-low';
  }

  return {
    score,
    label,
    confidence,
    colorClass,
    details: {
      perplexity: round(perplexity, 3),
      burstiness: round(burstiness, 3),
      lexicalDiversity: round(lexicalDiversity, 3),
      syntaxComplexity: round(syntaxComplexity, 2),
      transitionScore: round(transitionScore, 3),
      punctuationRegularity: round(punctuationRegularity, 3),
      semanticCoherence: round(semanticCoherence, 3),
      ngramPredictability: round(ngramPredictability, 3),
      sentenceCount: sentences.length,
      wordCount: words.length,
      avgSentenceLength: round(words.length / sentences.length, 1)
    }
  };
}

function calculatePerplexitySimulation(text, words) {
  const bigrams = {};
  const trigrams = {};
  let bigramCount = 0;
  let trigramCount = 0;
  
  for (let i = 0; i < words.length - 1; i++) {
    const bi = words[i].toLowerCase() + ' ' + words[i + 1].toLowerCase();
    bigrams[bi] = (bigrams[bi] || 0) + 1;
    bigramCount++;
  }
  
  for (let i = 0; i < words.length - 2; i++) {
    const tri = words[i].toLowerCase() + ' ' + words[i + 1].toLowerCase() + ' ' + words[i + 2].toLowerCase();
    trigrams[tri] = (trigrams[tri] || 0) + 1;
    trigramCount++;
  }
  
  let biEntropy = 0;
  for (const key in bigrams) {
    const prob = bigrams[key] / bigramCount;
    biEntropy -= prob * Math.log2(prob);
  }
  
  let triEntropy = 0;
  for (const key in trigrams) {
    const prob = trigrams[key] / trigramCount;
    triEntropy -= prob * Math.log2(prob);
  }
  
  return ((biEntropy + triEntropy) / 2);
}

function calculateBurstiness(sentences) {
  const lengths = sentences.map(s => (s.match(/\b\w+\b/g) || []).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  return clamp(stdDev / 15, 0, 1);
}

function calculateSyntaxComplexity(sentences) {
  let totalComplexity = 0;
  sentences.forEach(s => {
    const commas = (s.match(/,/g) || []).length;
    const conjunctions = (s.match(/\b(and|but|or|because|although|while|if|when|dan|atau|tetapi|karena|meskipun)\b/gi) || []).length;
    totalComplexity += commas + conjunctions;
  });
  return totalComplexity / sentences.length;
}

function calculateTransitionOveruse(text) {
  const transitions = [
    'however', 'moreover', 'furthermore', 'additionally', 'consequently',
    'therefore', 'thus', 'hence', 'nevertheless', 'nonetheless',
    'in conclusion', 'to summarize', 'in summary', 'on the other hand',
    'namun', 'selain itu', 'oleh karena itu', 'dengan demikian', 'kesimpulannya'
  ];
  const textLower = text.toLowerCase();
  let count = 0;
  transitions.forEach(t => {
    const regex = new RegExp('\\b' + t + '\\b', 'g');
    const matches = textLower.match(regex);
    if (matches) count += matches.length;
  });
  const words = (text.match(/\b\w+\b/g) || []).length;
  return count / Math.max(words, 1) * 100;
}

function calculatePunctuationRegularity(sentences) {
  const punctCounts = sentences.map(s => (s.match(/[,;:.!?]/g) || []).length);
  if (punctCounts.length === 0) return 0;
  const mean = punctCounts.reduce((a, b) => a + b, 0) / punctCounts.length;
  const variance = punctCounts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / punctCounts.length;
  const stdDev = Math.sqrt(variance);
  return clamp(1 - (stdDev / 3), 0, 1);
}

function calculateSemanticCoherence(sentences) {
  if (sentences.length < 2) return 0;
  let totalOverlap = 0;
  for (let i = 0; i < sentences.length - 1; i++) {
    const words1 = new Set(sentences[i].toLowerCase().match(/\b\w+\b/g) || []);
    const words2 = new Set(sentences[i + 1].toLowerCase().match(/\b\w+\b/g) || []);
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    if (union.size > 0) {
      totalOverlap += intersection.size / union.size;
    }
  }
  return totalOverlap / (sentences.length - 1);
}

function calculateNgramPredictability(words) {
  const commonAIPhrases = [
    'it is important to note', 'in today\'s world', 'plays a crucial role',
    'it is worth noting', 'in recent years', 'has become increasingly',
    'in this essay', 'in this article', 'delve into', 'shed light on',
    'penting untuk dicatat', 'di dunia saat ini', 'memainkan peran penting',
    'perlu dicatat', 'dalam beberapa tahun terakhir', 'semakin meningkat'
  ];
  const text = words.join(' ').toLowerCase();
  let count = 0;
  commonAIPhrases.forEach(phrase => {
    if (text.includes(phrase)) count++;
  });
  return count / 10;
}

// ============================================================================
// RENDER DETECTION
// ============================================================================
function renderDetectionAdvanced(report, isRedetect = false) {
  const progressColor = 
    report.score >= 75 ? '#ef4444' :
    report.score >= 60 ? '#f59e0b' :
    report.score >= 45 ? '#f59e0b' :
    report.score >= 30 ? '#3b82f6' : '#10b981';

  return `
    <div style="text-align:center;">
      <div class="${report.colorClass} score-display">${report.score}%</div>
      <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px;">${report.label}</div>
      <div style="color:var(--text-muted);font-size:0.875rem;margin-bottom:12px;">
        Confidence: <strong>${report.confidence}</strong>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${report.score}%;background:${progressColor}"></div>
      </div>
    </div>

    <div style="margin-top:20px;">
      <strong style="font-size:0.95rem;">📊 Detailed Metrics:</strong>
      <div class="metric-grid" style="margin-top:12px;">
        <div class="metric-item">
          <div class="metric-label">🎯 Perplexity</div>
          <div class="metric-value">${report.details.perplexity}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Lower = more AI</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">💥 Burstiness</div>
          <div class="metric-value">${report.details.burstiness}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Lower = more AI</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">📚 Lexical Diversity</div>
          <div class="metric-value">${report.details.lexicalDiversity}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">TTR ratio</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">🔗 Syntax Complexity</div>
          <div class="metric-value">${report.details.syntaxComplexity}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Avg clauses</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">➡️ Transition Overuse</div>
          <div class="metric-value">${report.details.transitionScore}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Per 100 words</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">📍 Punctuation Regular.</div>
          <div class="metric-value">${report.details.punctuationRegularity}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Higher = more AI</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">🔄 Semantic Coherence</div>
          <div class="metric-value">${report.details.semanticCoherence}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Too high = AI</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">🔮 N-gram Predict.</div>
          <div class="metric-value">${report.details.ngramPredictability}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">AI phrase count</div>
        </div>
      </div>
    </div>

    <div style="margin-top:16px;padding:12px;background:var(--card-hover);border-radius:6px;font-size:0.8rem;">
      <strong>📝 Text Stats:</strong><br>
      Sentences: ${report.details.sentenceCount} | 
      Words: ${report.details.wordCount} | 
      Avg Length: ${report.details.avgSentenceLength} words/sentence
    </div>

    ${!isRedetect && report.score > 50 ? `
    <div style="margin-top:12px;padding:12px;background:rgba(239,68,68,0.1);border:1px solid #ef4444;border-radius:6px;font-size:0.8rem;">
      ⚠️ <strong>AI Detected!</strong> Klik <strong>"✨ Humanize"</strong> dengan tone yang sesuai.
    </div>
    ` : ''}

    ${isRedetect && report.score < 40 ? `
    <div style="margin-top:12px;padding:12px;background:rgba(16,185,129,0.1);border:1px solid #10b981;border-radius:6px;font-size:0.8rem;">
      ✅ <strong>Success!</strong> Teks berhasil di-humanize. Score rendah = lolos detector.
    </div>
    ` : ''}
  `;
}

// ============================================================================
// PARAPHRASING FUNCTIONS
// ============================================================================
function advancedParaphrase(text, tone = 'casual') {
  console.log(`🎯 Starting ${tone} paraphrase...`);
  
  const sentences = splitSentences(text);
  const paraphrased = [];
  const lang = detectLanguage(text);
  
  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i].trim();
    
    if (tone === 'academic' || tone === 'formal') {
      sentence = applyAcademicTone(sentence, lang);
    } else if (tone === 'business') {
      sentence = applyBusinessTone(sentence, lang);
    } else {
      sentence = applyCasualTone(sentence, lang, i);
    }
    
    sentence = replaceWithContextualSynonyms(sentence, lang, tone);
    
    if (!/[.!?]$/.test(sentence)) {
      sentence += '.';
    }
    
    paraphrased.push(sentence);
  }
  
  let result = paraphrased.join(' ');
  
  if (tone === 'casual') {
    result = addParagraphBreaks(result);
  } else {
    result = addStructuredParagraphs(result);
  }
  
  console.log(`✅ ${tone} paraphrase complete!`);
  return result;
}

function applyAcademicTone(sentence, lang) {
  if (lang === 'id') {
    sentence = sentence.replace(/\b(saya|kami) (\w+)/gi, (match, subj, verb) => {
      if (Math.random() < 0.3) {
        return verb + ' dilakukan';
      }
      return match;
    });
    
    if (Math.random() < 0.2) {
      const connectors = ['Berdasarkan hal tersebut,', 'Dengan demikian,', 'Selanjutnya,', 'Terkait dengan hal ini,'];
      sentence = connectors[Math.floor(Math.random() * connectors.length)] + ' ' + sentence.toLowerCase();
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }
  } else {
    if (Math.random() < 0.2) {
      const connectors = ['Furthermore,', 'Additionally,', 'Moreover,', 'Consequently,'];
      sentence = connectors[Math.floor(Math.random() * connectors.length)] + ' ' + sentence.toLowerCase();
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }
  }
  
  return sentence;
}

function applyBusinessTone(sentence, lang) {
  if (lang === 'id') {
    if (Math.random() < 0.15) {
      const markers = ['Perlu diperhatikan bahwa', 'Dengan ini kami sampaikan bahwa', 'Kami informasikan bahwa'];
      sentence = markers[Math.floor(Math.random() * markers.length)] + ' ' + sentence.toLowerCase();
    }
    
    sentence = sentence.replace(/\bmungkin\b/gi, 'akan');
    sentence = sentence.replace(/\bkira-kira\b/gi, 'diperkirakan');
  } else {
    if (Math.random() < 0.15) {
      const markers = ['Please note that', 'We would like to inform you that', 'It is important to highlight that'];
      sentence = markers[Math.floor(Math.random() * markers.length)] + ' ' + sentence.toLowerCase();
    }
    
    sentence = sentence.replace(/\bmaybe\b/gi, 'will');
    sentence = sentence.replace(/\bprobably\b/gi, 'is expected to');
  }
  
  return sentence;
}

function applyCasualTone(sentence, lang, index) {
  const fillers = lang === 'id'
    ? ['sebenarnya', 'jujur aja', 'ya', 'sih', 'kok', 'kan']
    : ['basically', 'actually', 'you know', 'I mean', 'like', 'well'];
  
  if (Math.random() < 0.25) {
    const words = sentence.split(' ');
    if (words.length > 5) {
      const pos = Math.floor(words.length / 2);
      words.splice(pos, 0, fillers[Math.floor(Math.random() * fillers.length)]);
      sentence = words.join(' ');
    }
  }
  
  return sentence;
}

function replaceWithContextualSynonyms(sentence, lang, tone) {
  let synonymMap;
  
  if (lang === 'id') {
    if (tone === 'academic') {
      synonymMap = {
        'penting': ['krusial', 'esensial', 'fundamental', 'signifikan'],
        'banyak': ['sejumlah besar', 'beragam', 'berbagai macam'],
        'menunjukkan': ['mengindikasikan', 'memperlihatkan', 'mendemonstrasikan'],
        'karena': ['dikarenakan', 'disebabkan oleh', 'mengingat'],
        'tapi': ['namun demikian', 'akan tetapi', 'meskipun begitu'],
        'bagus': ['baik', 'positif', 'menguntungkan'],
      };
    } else if (tone === 'business') {
      synonymMap = {
        'penting': ['krusial', 'vital', 'strategis'],
        'baik': ['optimal', 'efektif', 'menguntungkan'],
        'banyak': ['signifikan', 'substantial', 'considerable'],
        'butuh': ['memerlukan', 'mengharuskan', 'membutuhkan'],
        'dapat': ['mampu', 'sanggup', 'berkemampuan untuk'],
      };
    } else {
      synonymMap = {
        'penting': ['penting banget', 'krusial', 'vital'],
        'sangat': ['amat', 'banget', 'benar-benar'],
        'baik': ['bagus', 'oke', 'mantap'],
        'banyak': ['banyak banget', 'segudang', 'berlimpah'],
      };
    }
  } else {
    if (tone === 'academic') {
      synonymMap = {
        'important': ['significant', 'crucial', 'essential', 'fundamental'],
        'show': ['demonstrate', 'indicate', 'illustrate', 'exhibit'],
        'many': ['numerous', 'various', 'multiple', 'several'],
        'because': ['due to', 'owing to', 'as a result of'],
        'but': ['however', 'nevertheless', 'nonetheless'],
      };
    } else if (tone === 'business') {
      synonymMap = {
        'important': ['critical', 'key', 'strategic', 'essential'],
        'good': ['optimal', 'effective', 'beneficial', 'advantageous'],
        'need': ['require', 'necessitate', 'demand'],
        'help': ['assist', 'facilitate', 'support', 'enable'],
      };
    } else {
      synonymMap = {
        'important': ['crucial', 'key', 'big', 'major'],
        'very': ['really', 'super', 'pretty', 'quite'],
        'good': ['great', 'solid', 'nice', 'decent'],
        'many': ['lots of', 'tons of', 'plenty of'],
      };
    }
  }
  
  Object.keys(synonymMap).forEach(word => {
    const regex = new RegExp('\\b' + word + '\\b', 'gi');
    sentence = sentence.replace(regex, (match) => {
      if (Math.random() < 0.4) {
        const synonyms = synonymMap[word.toLowerCase()];
        const replacement = synonyms[Math.floor(Math.random() * synonyms.length)];
        return preserveCase(match, replacement);
      }
      return match;
    });
  });
  
  return sentence;
}

function addStructuredParagraphs(text) {
  const sentences = splitSentences(text);
  const paragraphs = [];
  let current = [];
  
  sentences.forEach((s, i) => {
    current.push(s);
    if (current.length >= 3 && current.length <= 4) {
      paragraphs.push(current.join(' '));
      current = [];
    } else if (i === sentences.length - 1 && current.length > 0) {
      paragraphs.push(current.join(' '));
    }
  });
  
  return paragraphs.join('\n\n');
}

function addParagraphBreaks(text) {
  const sentences = splitSentences(text);
  const paragraphs = [];
  let current = [];
  
  sentences.forEach((s, i) => {
    current.push(s);
    const shouldBreak = Math.random() < 0.3 && current.length >= 2 && current.length <= 5;
    if (shouldBreak || i === sentences.length - 1) {
      paragraphs.push(current.join(' '));
      current = [];
    }
  });
  
  return paragraphs.join('\n\n');
}

function preserveCase(original, replacement) {
  if (!original || !replacement) return replacement;
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// ============================================================================
// GEMINI API - PLAIN TEXT OUTPUT ONLY (NO MARKDOWN)
// ============================================================================
async function callGeminiParaphraseAdvanced(apiKey, model, text, tone) {
  console.log('🚀 Calling Gemini API...');
  console.log('📝 Model:', model);
  console.log('🎭 Tone:', tone);
  
  const detectedLang = detectLanguage(text);
  const langName = detectedLang === 'id' ? 'Indonesian' : 'English';
  console.log('🌐 Language:', langName);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Generate tone-specific prompts WITH STRICT PLAIN TEXT INSTRUCTION
  const prompts = {
    academic: detectedLang === 'id' ? 
`Anda adalah asisten akademik profesional yang ahli dalam menulis paper, essay, dan dokumen ilmiah. Tugas Anda adalah memarafrasa teks berikut dengan gaya AKADEMIS yang sangat formal, sopan, dan sesuai standar penulisan ilmiah.

⚠️ PENTING: Output HARUS berupa PLAIN TEXT murni tanpa formatting markdown apapun. JANGAN gunakan:
- Bold (**text** atau __text__)
- Italic (*text* atau _text_)
- Heading (# ## ###)
- Bullet points (- * +)
- Code blocks (\`\`\`)
- Links [text](url)
- HANYA tuliskan teks biasa dengan paragraf yang dipisahkan baris kosong

PANDUAN AKADEMIS:
1. **Bahasa Formal & Objektif**: Gunakan bahasa baku, hindari bahasa gaul/informal
2. **Struktur Logis**: Susun argumen secara sistematis dan koheren
3. **Transisi Akademis**: Gunakan kata penghubung formal seperti "Berdasarkan hal tersebut", "Dengan demikian", "Selanjutnya", "Terkait dengan hal ini"
4. **Pasif Voice**: Gunakan konstruksi pasif untuk objektivitas (misal: "dapat diamati bahwa..." alih-alih "saya amati...")
5. **Terminologi Akademis**: Gunakan istilah teknis yang tepat
6. **Sitasi Implisit**: Hindari klaim absolut, gunakan "menunjukkan bahwa", "mengindikasikan", "cenderung"
7. **Kesopanan**: Sangat sopan dan hormat, cocok untuk mahasiswa berbicara dengan dosen
8. **Anti-AI Detection**: Variasikan panjang kalimat tetap dalam range akademis (12-25 kata), gunakan struktur yang natural

HINDARI:
- Bahasa informal, slang, atau conversational
- Kalimat terlalu pendek atau fragmentasi
- First person singular yang berlebihan ("saya")
- Generalisasi tanpa bukti
- FORMATTING MARKDOWN APAPUN

TEKS ASLI:
${text}

OUTPUT YANG DIHARAPKAN:
Parafrasa dalam Bahasa Indonesia dengan gaya AKADEMIS FORMAL, sopan, objektif, dan terstruktur. Output HARUS dalam Bahasa Indonesia. OUTPUT HARUS PLAIN TEXT MURNI TANPA MARKDOWN.`
    :
`You are a professional academic writing assistant expert in papers, essays, and scholarly documents. Your task is to paraphrase the following text in a highly ACADEMIC, formal, polite style that meets scholarly writing standards.

⚠️ IMPORTANT: Output MUST be PLAIN TEXT only without any markdown formatting. DO NOT use:
- Bold (**text** or __text__)
- Italic (*text* or _text_)
- Headings (# ## ###)
- Bullet points (- * +)
- Code blocks (\`\`\`)
- Links [text](url)
- ONLY write plain text with paragraphs separated by blank lines

ACADEMIC GUIDELINES:
1. **Formal & Objective Language**: Use standard academic English, avoid colloquialisms
2. **Logical Structure**: Organize arguments systematically and coherently
3. **Academic Transitions**: Use formal connectors like "Furthermore", "Consequently", "In this regard", "Based on these findings"
4. **Passive Voice**: Use passive constructions for objectivity (e.g., "it can be observed that..." rather than "I observe...")
5. **Academic Terminology**: Use precise technical terms
6. **Hedging**: Avoid absolute claims, use "suggests that", "indicates", "tends to"
7. **Formality**: Very polite and respectful, suitable for student-to-professor communication
8. **Anti-AI Detection**: Vary sentence length within academic range (12-25 words), use natural structures

AVOID:
- Informal language, slang, or conversational tone
- Overly short sentences or fragments
- Excessive first-person singular ("I")
- Unsupported generalizations
- ANY MARKDOWN FORMATTING

ORIGINAL TEXT:
${text}

EXPECTED OUTPUT:
Paraphrase in FORMAL ACADEMIC English, polite, objective, and well-structured. Output MUST be in English. OUTPUT MUST BE PLAIN TEXT WITHOUT MARKDOWN.`,

    business: detectedLang === 'id' ?
`Anda adalah konsultan bisnis profesional yang ahli dalam komunikasi korporat. Tugas Anda adalah memarafrasa teks berikut dengan gaya BISNIS PROFESIONAL yang clear, persuasif, dan action-oriented.

⚠️ PENTING: Output HARUS berupa PLAIN TEXT murni tanpa formatting markdown. JANGAN gunakan bold, italic, heading, bullet points, atau formatting apapun. HANYA teks biasa.

PANDUAN BISNIS PROFESIONAL:
1. **Clarity & Conciseness**: Pesan jelas, langsung ke poin, tidak bertele-tele
2. **Professional Tone**: Formal namun approachable, membangun trust
3. **Action-Oriented**: Fokus pada hasil, solusi, dan langkah konkret
4. **Persuasive Language**: Convincing tapi tidak aggressive
5. **Business Vocabulary**: Gunakan istilah bisnis yang tepat (ROI, deliverables, stakeholders, etc.)
6. **Respectful & Courteous**: Sangat sopan untuk komunikasi klien/partner
7. **Structure**: Gunakan bullet points mental, highlight key points
8. **Value Proposition**: Tekankan manfaat dan nilai

HINDARI:
- Bahasa terlalu casual atau slang
- Jargon yang tidak perlu
- Kalimat ambigu atau tidak jelas
- Tone yang terlalu stiff atau kaku
- MARKDOWN FORMATTING

TEKS ASLI:
${text}

OUTPUT YANG DIHARAPKAN:
Parafrasa dalam Bahasa Indonesia dengan gaya BISNIS PROFESIONAL yang clear, persuasif, dan respectful. Output HARUS dalam Bahasa Indonesia. OUTPUT PLAIN TEXT TANPA MARKDOWN.`
    :
`You are a professional business consultant expert in corporate communication. Your task is to paraphrase the following text in a PROFESSIONAL BUSINESS style that is clear, persuasive, and action-oriented.

⚠️ IMPORTANT: Output MUST be PLAIN TEXT only without markdown formatting. DO NOT use bold, italic, headings, bullet points, or any formatting. ONLY plain text.

BUSINESS PROFESSIONAL GUIDELINES:
1. **Clarity & Conciseness**: Clear message, straight to the point, no fluff
2. **Professional Tone**: Formal yet approachable, builds trust
3. **Action-Oriented**: Focus on results, solutions, and concrete steps
4. **Persuasive Language**: Convincing but not aggressive
5. **Business Vocabulary**: Use appropriate business terms (ROI, deliverables, stakeholders, etc.)
6. **Respectful & Courteous**: Very polite for client/partner communication
7. **Structure**: Use mental bullet points, highlight key points
8. **Value Proposition**: Emphasize benefits and value

AVOID:
- Overly casual language or slang
- Unnecessary jargon
- Ambiguous or unclear sentences
- Overly stiff or rigid tone
- MARKDOWN FORMATTING

ORIGINAL TEXT:
${text}

EXPECTED OUTPUT:
Paraphrase in PROFESSIONAL BUSINESS English that is clear, persuasive, and respectful. Output MUST be in English. OUTPUT PLAIN TEXT WITHOUT MARKDOWN.`,

    formal: detectedLang === 'id' ?
`Anda adalah ahli dalam penulisan dokumen resmi dan formal. Tugas Anda adalah memarafrasa teks berikut dengan gaya FORMAL UMUM yang sangat sopan, terstruktur, dan mengikuti konvensi bahasa baku.

⚠️ PENTING: Output HARUS PLAIN TEXT tanpa markdown formatting apapun. Hanya teks biasa.

PANDUAN FORMAL:
1. **Bahasa Baku**: 100% mengikuti EYD dan tata bahasa formal
2. **Struktur Teratur**: Kalimat terorganisir dengan baik
3. **Kesopanan Tinggi**: Sangat hormat dan sopan
4. **Objektif**: Hindari opini personal yang subjektif
5. **Konvensi Formal**: Ikuti format surat/dokumen resmi
6. **No Contractions**: Jangan gunakan singkatan informal
7. **Complete Sentences**: Kalimat lengkap dengan subjek-predikat

HINDARI:
- Bahasa sehari-hari atau gaul
- Kontraksi atau singkatan
- Kalimat tidak lengkap
- MARKDOWN

TEKS ASLI:
${text}

OUTPUT YANG DIHARAPKAN:
Parafrasa dalam Bahasa Indonesia FORMAL, sangat sopan, terstruktur. Output HARUS dalam Bahasa Indonesia. PLAIN TEXT ONLY.`
    :
`You are an expert in writing official and formal documents. Your task is to paraphrase the following text in a GENERAL FORMAL style that is very polite, structured, and follows standard conventions.

⚠️ IMPORTANT: Output MUST be PLAIN TEXT without any markdown formatting. Plain text only.

FORMAL GUIDELINES:
1. **Standard Language**: Follow proper grammar and formal conventions
2. **Structured Organization**: Well-organized sentences
3. **High Politeness**: Very respectful and courteous
4. **Objective**: Avoid subjective personal opinions
5. **Formal Conventions**: Follow formal letter/document format
6. **No Contractions**: Don't use informal abbreviations
7. **Complete Sentences**: Full sentences with subject-predicate

AVOID:
- Colloquial or casual language
- Contractions or abbreviations
- Incomplete sentences
- MARKDOWN

ORIGINAL TEXT:
${text}

EXPECTED OUTPUT:
Paraphrase in FORMAL English, very polite and structured. Output MUST be in English. PLAIN TEXT ONLY.`,

    casual: detectedLang === 'id' ?
`Kamu adalah ahli dalam menulis ulang teks agar terdengar sangat natural dan seperti ditulis manusia asli. Tujuanmu adalah memarafrasa teks berikut agar dapat lolos dari AI detector seperti GPTZero.

⚠️ PENTING: Output HARUS PLAIN TEXT tanpa markdown. Hanya teks biasa!

PERSYARATAN ANTI-DETECTION:
1. **High Burstiness**: Variasikan panjang kalimat DRASTIS
2. **Natural Flow**: Pilihan kata tidak terduga
3. **Bahasa Santai**: Gunakan bahasa informal, conversational
4. **Suara Personal**: Tulis seperti orang asli menjelaskan ke teman
5. **Hindari Pola Formal**: Jangan pakai transisi formal
6. **PENTING**: Output HARUS Bahasa Indonesia
7. **NO MARKDOWN**: Plain text only

TEKS:
${text}

OUTPUT (natural, bursty, human-like, BAHASA INDONESIA, PLAIN TEXT):`
    :
`You are an expert at rewriting text to sound natural and human-written. Your goal is to paraphrase to bypass AI detectors like GPTZero.

⚠️ IMPORTANT: Output MUST be PLAIN TEXT without markdown. Plain text only!

ANTI-DETECTION REQUIREMENTS:
1. **High Burstiness**: Vary sentence length DRAMATICALLY
2. **Natural Flow**: Unexpected word choices
3. **Colloquial**: Use informal, conversational tone
4. **Personal Voice**: Write like a real person explaining to a friend
5. **Avoid Formal Patterns**: No formal transitions
6. **IMPORTANT**: Output MUST be in English
7. **NO MARKDOWN**: Plain text only

TEXT:
${text}

OUTPUT (natural, bursty, human-like, ENGLISH, PLAIN TEXT):`
  };

  const prompt = prompts[tone];

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: tone === 'casual' ? 0.95 : 0.85,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE"
      }
    ]
  };

  console.log('📤 Sending request...');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error:', errorText);
    
    let errorObj;
    try {
      errorObj = JSON.parse(errorText);
    } catch (e) {
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const errorMsg = errorObj.error?.message || errorText;
    const errorCode = errorObj.error?.code || response.status;
    
    if (errorCode === 404) {
      throw new Error(`Model "${model}" tidak ditemukan. Coba: gemini-2.5-flash`);
    } else if (errorCode === 403) {
      throw new Error(`API key tidak valid. Check: https://aistudio.google.com/apikey`);
    } else if (errorCode === 429) {
      throw new Error(`Quota limit. Tunggu atau upgrade quota.`);
    } else {
      throw new Error(`Error (${errorCode}): ${errorMsg}`);
    }
  }

  const data = await response.json();
  console.log('✅ Response received');

  if (data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      let generatedText = candidate.content.parts[0].text.trim();
      
      // Clean up any markdown formatting that might slip through
      generatedText = generatedText
        .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold
        .replace(/\*(.+?)\*/g, '$1')      // Remove italic
        .replace(/__(.+?)__/g, '$1')      // Remove bold alt
        .replace(/_(.+?)_/g, '$1')        // Remove italic alt
        .replace(/^#+\s+/gm, '')          // Remove headings
        .replace(/^\s*[-*+]\s+/gm, '')    // Remove bullet points
        .replace(/```[\s\S]*?```/g, '')   // Remove code blocks
        .replace(/`(.+?)`/g, '$1')        // Remove inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links
      
      console.log('✅ Success! Plain text output');
      return generatedText;
    }
  }

  if (data.promptFeedback && data.promptFeedback.blockReason) {
    throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
  }

  throw new Error('Unexpected API response.');
}

// Initialize
updateWordCount();
console.log('✅ AI Detector & Humanizer v2.1 Professional Edition loaded!');
console.log('🎭 Modes: Academic, Business, Formal, Casual');
console.log('📄 Output: Plain Text Only (No Markdown)');
console.log('👤 Author: @hmdilham');