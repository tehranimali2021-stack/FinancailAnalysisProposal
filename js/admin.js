/* admin.js — احراز هویت ساده + ویرایش و ذخیره محتوا در localStorage */

/* هشدار امنیتی: این ورود صرفاً برای نسخه دمو است و امنیت واقعی ندارد.
   در نسخه تولیدی باید احراز هویت سمت سرور (مثلاً Firebase Auth یا Django)
   جایگزین شود، چون اعتبارسنجی سمت کلاینت قابل دور زدن است. */
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";   // فقط دمو — حتماً تغییر دهید

let workingData = loadData();

function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("panel").classList.remove("hidden");
    renderPanel();
  } else {
    document.getElementById("loginErr").textContent = "نام کاربری یا رمز عبور اشتباه است.";
  }
}

function renderPanel() {
  // اقتصاد
  document.getElementById("inflation").value = workingData.economy.inflationRate;
  document.getElementById("applyInf").checked = workingData.economy.applyInflation;

  // مبالغ سرمایه‌گذاری
  let invHtml = "";
  ["normal", "special"].forEach(key => {
    const m = workingData.investmentModels[key];
    invHtml += `<h3 class="font-bold mt-3 mb-1">${m.label}</h3>`;
    m.rows.forEach((r, i) => {
      invHtml += `<label class="block mb-2 text-sm">${r.output}:
        <input type="number" data-model="${key}" data-idx="${i}"
          class="invField border p-2 rounded w-full" value="${r.baseInvestment}">
      </label>`;
    });
  });
  document.getElementById("investEditor").innerHTML = invHtml;

  // فازها
  document.getElementById("phaseEditor").innerHTML = workingData.phases.map((ph, i) => `
    <div class="border p-3 rounded mb-3">
      <label class="block text-sm">عنوان فاز:
        <input class="phaseTitle border p-2 rounded w-full" data-idx="${i}" value="${ph.title}">
      </label>
      <label class="block text-sm mt-2">توضیح ساده:
        <textarea class="phaseGoal border p-2 rounded w-full" data-idx="${i}">${ph.simpleGoal}</textarea>
      </label>
      <label class="block text-sm mt-2">مدت اجرا:
        <input class="phaseDur border p-2 rounded w-full" data-idx="${i}" value="${ph.duration}">
      </label>
    </div>`).join("");

  // تبصره‌ها
  document.getElementById("clauseEditor").innerHTML = workingData.clauses.map((c, i) => `
    <div class="border p-3 rounded mb-3">
      <label class="flex items-center gap-2 mb-2">
        <input type="checkbox" class="clauseActive" data-idx="${i}" ${c.active ? "checked" : ""}> فعال
      </label>
      <input class="clauseTitle border p-2 rounded w-full mb-2" data-idx="${i}" value="${c.title}">
      <textarea class="clauseText border p-2 rounded w-full" data-idx="${i}">${c.text}</textarea>
    </div>`).join("");
}

function saveAll() {
  // اقتصاد
  workingData.economy.inflationRate = parseFloat(document.getElementById("inflation").value) || 0;
  workingData.economy.applyInflation = document.getElementById("applyInf").checked;

  // مبالغ
  document.querySelectorAll(".invField").forEach(el => {
    const key = el.dataset.model, idx = +el.dataset.idx;
    workingData.investmentModels[key].rows[idx].baseInvestment = +el.value;
  });

  // فازها
  document.querySelectorAll(".phaseTitle").forEach(el => workingData.phases[+el.dataset.idx].title = el.value);
  document.querySelectorAll(".phaseGoal").forEach(el => workingData.phases[+el.dataset.idx].simpleGoal = el.value);
  document.querySelectorAll(".phaseDur").forEach(el => workingData.phases[+el.dataset.idx].duration = el.value);

  // تبصره‌ها
  document.querySelectorAll(".clauseActive").forEach(el => workingData.clauses[+el.dataset.idx].active = el.checked);
  document.querySelectorAll(".clauseTitle").forEach(el => workingData.clauses[+el.dataset.idx].title = el.value);
  document.querySelectorAll(".clauseText").forEach(el => workingData.clauses[+el.dataset.idx].text = el.value);

  saveData(workingData);
  document.getElementById("saveMsg").textContent = "✔ تغییرات ذخیره شد. صفحه اصلی به‌روزرسانی شد.";
}

function resetAll() {
  localStorage.removeItem("proposalData");
  workingData = loadData();
  renderPanel();
  document.getElementById("saveMsg").textContent = "بازگشت به حالت پیش‌فرض انجام شد.";
}
