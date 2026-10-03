/**
 * UI Controller & Event Handling
 */

document.addEventListener('DOMContentLoaded', async () => {
  let wordlistData = null;

  // Load common passwords & wordlist data asynchronously
  try {
    const res = await fetch('data/common-passwords.json');
    if (res.ok) {
      wordlistData = await res.json();
    }
  } catch (err) {
    console.info("Running with embedded default wordlists.");
  }

  // --- Elements ---
  const passwordInput = document.getElementById('passwordInput');
  const toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');
  const strengthMeterFill = document.getElementById('strengthMeterFill');
  const strengthText = document.getElementById('strengthText');
  const scoreValue = document.getElementById('scoreValue');
  const whyText = document.getElementById('whyText');

  // Properties
  const propLength = document.getElementById('propLength');
  const propUpper = document.getElementById('propUpper');
  const propLower = document.getElementById('propLower');
  const propNumbers = document.getElementById('propNumbers');
  const propSymbols = document.getElementById('propSymbols');
  const propEntropy = document.getElementById('propEntropy');

  // Crack Times
  const crackOnlineThrottled = document.getElementById('crackOnlineThrottled');
  const crackOnlineUnthrottled = document.getElementById('crackOnlineUnthrottled');
  const crackOfflineSlow = document.getElementById('crackOfflineSlow');
  const crackOfflineFast = document.getElementById('crackOfflineFast');

  // Lists
  const warningsList = document.getElementById('warningsList');
  const recommendationsList = document.getElementById('recommendationsList');

  // Breach Check
  const btnCheckBreach = document.getElementById('btnCheckBreach');
  const breachResultBox = document.getElementById('breachResultBox');

  // Generator Elements
  const genLengthSlider = document.getElementById('genLengthSlider');
  const genLengthVal = document.getElementById('genLengthVal');
  const genUpper = document.getElementById('genUpper');
  const genLower = document.getElementById('genLower');
  const genNumbers = document.getElementById('genNumbers');
  const genSymbols = document.getElementById('genSymbols');
  const genNoAmbiguous = document.getElementById('genNoAmbiguous');
  const btnGeneratePass = document.getElementById('btnGeneratePass');
  const genOutput = document.getElementById('genOutput');
  const btnCopyGen = document.getElementById('btnCopyGen');
  const copyToast = document.getElementById('copyToast');

  // Passphrase Elements
  const phraseWordsSlider = document.getElementById('phraseWordsSlider');
  const phraseWordsVal = document.getElementById('phraseWordsVal');
  const phraseSeparator = document.getElementById('phraseSeparator');
  const phraseCapitalize = document.getElementById('phraseCapitalize');
  const phraseNumber = document.getElementById('phraseNumber');
  const phraseSymbol = document.getElementById('phraseSymbol');
  const btnGeneratePhrase = document.getElementById('btnGeneratePhrase');
  const phraseOutput = document.getElementById('phraseOutput');
  const btnCopyPhrase = document.getElementById('btnCopyPhrase');

  // --- Tab Navigation ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.style.display = 'block';
    });
  });

  // --- Password Visibility Toggle ---
  toggleVisibilityBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleVisibilityBtn.innerHTML = isPassword ? '👁️‍🗨️' : '👁️';
    toggleVisibilityBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });

  // --- Main Evaluation Function ---
  function evaluateCurrentPassword() {
    const pass = passwordInput.value;
    const report = window.PasswordAnalyzerEngine.analyzePassword(pass, wordlistData);

    // Update Strength Meter & Label
    const score = report.score;
    strengthMeterFill.style.width = `${Math.max(4, score)}%`;
    scoreValue.textContent = score;

    let colorClass = 'color-very-weak';
    if (report.strength === 'Weak') colorClass = 'color-weak';
    else if (report.strength === 'Fair') colorClass = 'color-fair';
    else if (report.strength === 'Strong') colorClass = 'color-strong';
    else if (report.strength === 'Very Strong') colorClass = 'color-very-strong';

    strengthMeterFill.className = `meter-bar-fill ${colorClass}`;
    strengthText.className = `meter-val ${colorClass}`;
    strengthText.textContent = pass ? report.strength : 'Awaiting Input';

    // Verbal "WHY"
    whyText.textContent = report.why;

    // Property Table
    propLength.textContent = `${report.length} character${report.length === 1 ? '' : 's'}`;
    propUpper.innerHTML = report.charsets.uppercase ? '<span class="tag-badge tag-success">✓ Yes</span>' : '<span class="tag-badge tag-danger">✗ No</span>';
    propLower.innerHTML = report.charsets.lowercase ? '<span class="tag-badge tag-success">✓ Yes</span>' : '<span class="tag-badge tag-danger">✗ No</span>';
    propNumbers.innerHTML = report.charsets.numbers ? '<span class="tag-badge tag-success">✓ Yes</span>' : '<span class="tag-badge tag-danger">✗ No</span>';
    propSymbols.innerHTML = report.charsets.symbols ? '<span class="tag-badge tag-success">✓ Yes</span>' : '<span class="tag-badge tag-danger">✗ No</span>';
    propEntropy.textContent = pass ? `${report.effectiveEntropy} bits` : '0 bits';

    // Crack Times
    crackOnlineThrottled.textContent = report.crackTimes.onlineThrottled;
    crackOnlineUnthrottled.textContent = report.crackTimes.onlineUnthrottled;
    crackOfflineSlow.textContent = report.crackTimes.offlineSlow;
    crackOfflineFast.textContent = report.crackTimes.offlineFast;

    // Warnings List
    warningsList.innerHTML = '';
    if (report.patterns.length > 0) {
      report.patterns.forEach(pat => {
        const li = document.createElement('li');
        li.className = 'alert-item';
        li.innerHTML = `<span>⚠️</span> <span>${pat.message}</span>`;
        warningsList.appendChild(li);
      });
    } else if (pass.length > 0) {
      const li = document.createElement('li');
      li.className = 'rec-item';
      li.innerHTML = `<span>✓</span> <span>No obvious dictionary, keyboard, or sequential vulnerabilities found.</span>`;
      warningsList.appendChild(li);
    } else {
      const li = document.createElement('li');
      li.className = 'alert-item';
      li.style.background = 'rgba(255,255,255,0.03)';
      li.style.borderColor = 'rgba(255,255,255,0.1)';
      li.style.color = '#94a3b8';
      li.innerHTML = `<span>ℹ️</span> <span>Enter a password above to scan for patterns.</span>`;
      warningsList.appendChild(li);
    }

    // Recommendations List
    recommendationsList.innerHTML = '';
    report.recommendations.forEach(rec => {
      const li = document.createElement('li');
      li.className = 'rec-item';
      li.innerHTML = `<span>💡</span> <span>${rec}</span>`;
      recommendationsList.appendChild(li);
    });

    // Reset breach check output on edit
    breachResultBox.style.display = 'none';
    breachResultBox.innerHTML = '';
  }

  passwordInput.addEventListener('input', evaluateCurrentPassword);

  // --- Privacy-Preserving Breach Check Event ---
  btnCheckBreach.addEventListener('click', async () => {
    const pass = passwordInput.value;
    if (!pass) {
      alert('Please enter a password first.');
      return;
    }

    btnCheckBreach.disabled = true;
    btnCheckBreach.innerHTML = '<span>⏳</span> Querying Anonymous Hash Prefix...';
    breachResultBox.style.display = 'block';
    breachResultBox.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8; font-family:var(--font-mono);">Hashing locally with SHA-1 and comparing prefix via k-Anonymity...</p>';

    const result = await window.PasswordBreachChecker.checkPasswordBreach(pass);
    btnCheckBreach.disabled = false;
    btnCheckBreach.innerHTML = '<span>🔍</span> Verify in Known Data Breaches';

    if (result.error) {
      breachResultBox.innerHTML = `
        <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:0.85rem; color:#fde68a; font-size:0.85rem;">
          <p><strong>⚠️ Check Incomplete:</strong> ${result.error}</p>
        </div>
      `;
    } else if (result.breached) {
      breachResultBox.innerHTML = `
        <div style="background:rgba(239,68,68,0.15); border:1px solid var(--accent-red); border-radius:8px; padding:1rem; color:#fca5a5; font-size:0.88rem;">
          <h4 style="color:#ef4444; font-weight:800; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.4rem;">
            <span>🚨</span> COMPROMISED IN KNOWN DATA BREACHES!
          </h4>
          <p>This exact password has appeared in <strong>${result.count.toLocaleString()}</strong> public data breaches.</p>
          <p style="margin-top:0.4rem; font-size:0.8rem; color:#cbd5e1;">Even if mathematically complex, attackers already have this password in their rainbow tables and credential stuffing databases. <strong>Do not use this password!</strong></p>
          <p style="margin-top:0.5rem; font-family:var(--font-mono); font-size:0.75rem; color:#94a3b8;">Hash Mask: ${result.fullHashMasked}</p>
        </div>
      `;
    } else {
      breachResultBox.innerHTML = `
        <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); border-radius:8px; padding:1rem; color:#a7f3d0; font-size:0.88rem;">
          <h4 style="color:#10b981; font-weight:800; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.4rem;">
            <span>🛡️</span> NO BREACHES FOUND
          </h4>
          <p>This password was not found in the billions of compromised credentials indexed by Have I Been Pwned.</p>
          <p style="margin-top:0.5rem; font-family:var(--font-mono); font-size:0.75rem; color:#94a3b8;">Hash Prefix: ${result.hashPrefix} (Verified via k-Anonymity)</p>
        </div>
      `;
    }
  });

  // --- Password Generator ---
  genLengthSlider.addEventListener('input', () => {
    genLengthVal.textContent = genLengthSlider.value;
  });

  function doGeneratePassword() {
    const pass = window.PasswordGenerator.generatePassword({
      length: parseInt(genLengthSlider.value, 10),
      uppercase: genUpper.checked,
      lowercase: genLower.checked,
      numbers: genNumbers.checked,
      symbols: genSymbols.checked,
      avoidAmbiguous: genNoAmbiguous.checked
    });
    genOutput.textContent = pass;
  }

  btnGeneratePass.addEventListener('click', doGeneratePassword);

  // --- Passphrase Generator ---
  phraseWordsSlider.addEventListener('input', () => {
    phraseWordsVal.textContent = phraseWordsSlider.value;
  });

  function doGeneratePassphrase() {
    const list = (wordlistData && wordlistData.commonWords) ? wordlistData.commonWords : [];
    const phrase = window.PasswordGenerator.generatePassphrase(list, {
      wordCount: parseInt(phraseWordsSlider.value, 10),
      separator: phraseSeparator.value,
      capitalize: phraseCapitalize.checked,
      includeNumber: phraseNumber.checked,
      includeSymbol: phraseSymbol.checked
    });
    phraseOutput.textContent = phrase;
  }

  btnGeneratePhrase.addEventListener('click', doGeneratePassphrase);

  // --- Copy Buttons with Warning Notice ---
  function copyText(text, btnEl) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btnEl.innerHTML;
      btnEl.innerHTML = '✓ Copied!';
      copyToast.style.display = 'block';
      setTimeout(() => {
        btnEl.innerHTML = orig;
        copyToast.style.display = 'none';
      }, 3500);
    });
  }

  btnCopyGen.addEventListener('click', () => copyText(genOutput.textContent, btnCopyGen));
  btnCopyPhrase.addEventListener('click', () => copyText(phraseOutput.textContent, btnCopyPhrase));

  // Quick Action: Send generated to Analyzer
  document.getElementById('btnTestGen').addEventListener('click', () => {
    passwordInput.value = genOutput.textContent;
    document.querySelector('.tab-btn[data-target="tabAnalyzer"]').click();
    evaluateCurrentPassword();
  });

  document.getElementById('btnTestPhrase').addEventListener('click', () => {
    passwordInput.value = phraseOutput.textContent;
    document.querySelector('.tab-btn[data-target="tabAnalyzer"]').click();
    evaluateCurrentPassword();
  });

  // Initial runs
  doGeneratePassword();
  doGeneratePassphrase();
  evaluateCurrentPassword();
});
