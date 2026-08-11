/* main.js — رندر صفحه فرود از روی data.js + فیلتر + PDF */

const DATA = loadData();

function riskBadge(level) {
  let cls = "badge-risk-mid";
  if (level.includes("پایین")) cls = "badge-risk-low";
  else if (level.includes("بالا")) cls = "badge-risk-high";
  return `<span class="px-2 py-1 rounded text-sm ${cls}">${level}</span>`;
}

/* --- هیرو --- */
document.getElementById("confidential").textContent = DATA.meta.confidential;
document.getElementById("heroTitle").textContent = DATA.hero.headline;
document.getElementById("heroValue").textContent = DATA.hero.valueProposition;
document.getElementById("heroPoints").innerHTML =
  DATA.hero.subPoints.map(p => `<li>✔ ${p}</li>`).join("");

/* --- اطلاعات پروپوزال --- */
document.getElementById("metaSection").innerHTML = `
  <h2 class="text-xl font-bold mb-3" style="color:var(--navy)">${DATA.meta.title}</h2>
  <div class="grid grid-cols-2 gap-3 text-sm">
    <div>کسب‌وکار: <b>${DATA.meta.businessName}</b></div>
    <div>مدیر: <b>${DATA.meta.ownerName}</b></div>
    <div>ارائه‌دهنده: <b>${DATA.meta.provider}</b></div>
    <div>تاریخ: <b>${DATA.meta.date}</b></div>
    <div>اعتبار پیشنهاد: <b>${DATA.meta.validity}</b></div>
  </div>`;

/* --- فازها (با ریسک اجرایی بر اساس اقتصاد جهانی) --- */
document.getElementById("phasesContainer").innerHTML = DATA.phases.map(ph => `
  <section class="section-card">
    <div class="flex justify-between items-start">
      <h3 class="text-lg font-bold" style="color:var(--navy)">${ph.title}</h3>
      ${riskBadge(ph.economicRisk.level)}
    </div>
    <p class="mt-2 text-slate-600">${ph.simpleGoal}</p>
    <p class="mt-3 font-bold">اقدامات:</p>
    <ul class="list-disc pr-6">${ph.actions.map(a=>`<li>${a}</li>`).join("")}</ul>
    <p class="mt-3 font-bold">خروجی‌ها:</p>
    <ul class="list-disc pr-6">${ph.outputs.map(o=>`<li>${o}</li>`).join("")}</ul>
    <div class="mt-3 bg-slate-50 p-3 rounded-lg text-sm">
      <b>مدت:</b> ${ph.duration} &nbsp;|&nbsp;
      <b>امتیاز ریسک اقتصادی:</b> ${ph.economicRisk.score}/۱۰
      <br><b>تحلیل ریسک:</b> ${ph.economicRisk.reason}
    </div>
  </section>`).join("");

/* --- سطوح دقت --- */
document.getElementById("levelsSection").innerHTML = `
  <h2 class="text-xl font-bold mb-3" style="color:var(--navy)">سطوح دقت خدمت</h2>
  <ul class="space-y-2">${DATA.serviceLevels.map(l=>
    `<li><b>${l.level}</b> — مناسب ${l.for} — تمرکز: ${l.focus}</li>`).join("")}</ul>`;

/* --- مدل همکاری --- */
document.getElementById("collabSection").innerHTML = `
  <h2 class="text-xl font-bold mb-3" style="color:var(--navy)">مدل همکاری</h2>
  <p><b>نوع:</b> ${DATA.collaboration.type}</p>
  <p><b>حضوری:</b> ${DATA.collaboration.onsite}</p>
  <p><b>دورکاری:</b> ${DATA.collaboration.remote}</p>
  <p class="text-sm text-slate-600 mt-2">${DATA.collaboration.note}</p>`;

/* --- جداول سرمایه‌گذاری --- */
function buildTable(modelKey) {
  const m = DATA.investmentModels[modelKey];
  const rows = m.rows.map(r => {
    const inv = adjustInvestment(r.baseInvestment, DATA.economy);
    return `<tr>
      <td data-label="خروجی">${r.output}</td>
      <td data-label="زمان">${r.time}</td>
      <td data-label="سرمایه‌گذاری">${formatMoney(inv, DATA.economy.currencyLabel)}</td>
      <td data-label="مزیت رقابتی">${r.advantage}</td>
      <td data-label="ریسک">${riskBadge(r.risk)}</td>
    </tr>`;
  }).join("");
  return `<div class="section-card model-block" data-model="${modelKey}">
    <h3 class="text-lg font-bold mb-3" style="color:var(--navy)">${m.label} — ${m.range}</h3>
    <table>
      <thead><tr>
        <th>خروجی</th><th>زمان</th><th>سرمایه‌گذاری</th><th>مزیت رقابتی</th><th>ریسک</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
}

document.getElementById("tablesContainer").innerHTML =
  buildTable("normal") + buildTable("special");

function filterTable(type) {
  document.querySelectorAll(".model-block").forEach(b => {
    b.style.display = (type === "all" || b.dataset.model === type) ? "block" : "none";
  });
}

/* --- SWOT --- */
const s = DATA.swot;
document.getElementById("swotSection").innerHTML = `
  <div class="swot-grid">
    <div class="swot-box swot-s"><b>نقاط قوت</b><ul class="list-disc pr-5">${s.strengths.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="swot-box swot-w"><b>نقاط ضعف</b><ul class="list-disc pr-5">${s.weaknesses.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="swot-box swot-o"><b>فرصت‌ها</b><ul class="list-disc pr-5">${s.opportunities.map(x=>`<li>${x}</li>`).join("")}</ul></div>
    <div class="swot-box swot-t"><b>تهدیدها</b><ul class="list-disc pr-5">${s.threats.map(x=>`<li>${x}</li>`).join("")}</ul></div>
  </div>`;

/* --- تبصره‌ها (فقط فعال‌ها نمایش داده می‌شوند) --- */
document.getElementById("clausesContainer").innerHTML =
  DATA.clauses.filter(c=>c.active).map(c=>`
    <section class="section-card">
      <b style="color:var(--navy)">${c.title}</b>
      <p class="text-slate-600 mt-1">${c.text}</p>
    </section>`).join("");

/* --- خروجی PDF --- */
function downloadPDF() {
  const el = document.getElementById("proposal");
  const opt = {
    margin: 10,
    filename: 'پروپوزال-خدمات-مالی.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css'] }
  };
  html2pdf().set(opt).from(el).save();
}
