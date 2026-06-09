/* ============================================================
   Salary Slip Generator — logic (vanilla JS, no dependencies)
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "salarySlipData.v1";
  const $ = (sel) => document.querySelector(sel);

  /* ---------- State ---------- */
  const defaultState = {
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    payMonth: "",
    totalDays: "",
    lopDays: "",
    empName: "",
    empId: "",
    designation: "",
    department: "",
    doj: "",
    pan: "",
    bankName: "",
    bankAccount: "",
    uan: "",
    currency: "₹",
    notes: "This is a system generated payslip and does not require a signature.",
    logo: "",
    earnings: [
      { label: "Basic Salary", amount: "" },
      { label: "House Rent Allowance", amount: "" },
      { label: "Conveyance Allowance", amount: "" },
      { label: "Special Allowance", amount: "" },
    ],
    deductions: [
      { label: "Provident Fund (PF)", amount: "" },
      { label: "Professional Tax", amount: "" },
      { label: "TDS", amount: "" },
    ],
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === "object") {
        return Object.assign({}, defaultState, saved);
      }
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- Helpers ---------- */
  function num(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function fmt(n) {
    // Indian grouping with 2 decimals
    return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function monthLabel(value) {
    if (!value) return "—";
    const [y, m] = value.split("-");
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const mi = parseInt(m, 10) - 1;
    if (isNaN(mi) || mi < 0 || mi > 11) return "—";
    return months[mi] + " " + y;
  }

  function dateLabel(value) {
    if (!value) return "—";
    const d = new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  /* ---------- Number to words (Indian system) ---------- */
  function numberToWords(amount) {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    let words = inWords(rupees) + " Rupees";
    if (paise > 0) words += " and " + inWords(paise) + " Paise";
    return words + " Only";
  }

  function inWords(n) {
    if (n === 0) return "Zero";
    const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
      "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

    function twoDigits(x) {
      if (x < 20) return ones[x];
      return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    }
    function threeDigits(x) {
      const h = Math.floor(x / 100);
      const r = x % 100;
      let str = "";
      if (h) str += ones[h] + " Hundred";
      if (r) str += (str ? " " : "") + twoDigits(r);
      return str;
    }

    let result = "";
    const crore = Math.floor(n / 10000000); n %= 10000000;
    const lakh = Math.floor(n / 100000); n %= 100000;
    const thousand = Math.floor(n / 1000); n %= 1000;
    const rest = n;

    if (crore) result += inWords(crore) + " Crore ";
    if (lakh) result += twoDigits(lakh) + " Lakh ";
    if (thousand) result += twoDigits(thousand) + " Thousand ";
    if (rest) result += threeDigits(rest);
    return result.trim();
  }

  /* ---------- Render line item inputs ---------- */
  function renderLineInputs(type) {
    const container = $(type === "earnings" ? "#earningsList" : "#deductionsList");
    container.innerHTML = "";
    state[type].forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "line-item";
      row.innerHTML =
        '<input type="text" placeholder="Description" value="' + escapeHtml(item.label) + '" data-type="' + type + '" data-idx="' + idx + '" data-key="label" />' +
        '<input type="number" placeholder="0.00" step="0.01" min="0" value="' + escapeHtml(item.amount) + '" data-type="' + type + '" data-idx="' + idx + '" data-key="amount" />' +
        '<button type="button" class="btn-remove" title="Remove" data-remove="' + type + '" data-idx="' + idx + '">×</button>';
      container.appendChild(row);
    });
  }

  /* ---------- Render preview ---------- */
  function renderPreview() {
    const cur = state.currency || "₹";

    // Company
    $("#slipCompanyName").textContent = state.companyName || "Company Name";
    $("#slipCompanyAddress").textContent = state.companyAddress || "";
    $("#slipCompanyPhone").textContent = state.companyPhone || "";
    $("#slipPeriod").textContent = "For the month of " + monthLabel(state.payMonth);

    // Logo
    const slipLogo = $("#slipLogo");
    if (state.logo) { slipLogo.src = state.logo; slipLogo.hidden = false; }
    else { slipLogo.hidden = true; slipLogo.removeAttribute("src"); }

    // Employee meta
    const paidDays = Math.max(0, num(state.totalDays) - num(state.lopDays));
    const meta = [
      ["Employee Name", state.empName, "Employee ID", state.empId],
      ["Designation", state.designation, "Department", state.department],
      ["Date of Joining", state.doj ? dateLabel(state.doj) : "", "PAN", state.pan],
      ["Bank Name", state.bankName, "Account No.", state.bankAccount],
      ["UAN / PF No.", state.uan, "Pay Period", monthLabel(state.payMonth)],
      ["Total Working Days", state.totalDays, "Paid Days", state.totalDays ? String(paidDays) : ""],
    ];
    $("#empMeta").innerHTML = meta.map((r) =>
      '<tr><td class="k">' + escapeHtml(r[0]) + '</td><td class="v">' + (escapeHtml(r[1]) || "—") +
      '</td><td class="k">' + escapeHtml(r[2]) + '</td><td class="v">' + (escapeHtml(r[3]) || "—") + "</td></tr>"
    ).join("");

    // Earnings / deductions rows
    function rows(list) {
      const valid = list.filter((i) => (i.label && i.label.trim()) || num(i.amount) !== 0);
      if (!valid.length) return '<tr><td class="muted">—</td><td class="amt muted">—</td></tr>';
      return valid.map((i) =>
        "<tr><td>" + escapeHtml(i.label || "—") + '</td><td class="amt">' + cur + " " + fmt(num(i.amount)) + "</td></tr>"
      ).join("");
    }
    $("#slipEarnings").innerHTML = rows(state.earnings);
    $("#slipDeductions").innerHTML = rows(state.deductions);

    // Totals
    const gross = state.earnings.reduce((s, i) => s + num(i.amount), 0);
    const totalDed = state.deductions.reduce((s, i) => s + num(i.amount), 0);
    const net = gross - totalDed;

    $("#grossEarnings").textContent = cur + " " + fmt(gross);
    $("#totalDeductions").textContent = cur + " " + fmt(totalDed);
    $("#netPay").textContent = cur + " " + fmt(net);
    $("#netWords").textContent = "Amount in words: " + numberToWords(Math.max(0, net));

    // Notes
    $("#slipNotes").textContent = state.notes || "";
    $("#slipNotes").style.display = state.notes ? "block" : "none";
  }

  /* ---------- Sync inputs from state ---------- */
  function syncFormFromState() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const key = el.getAttribute("data-bind");
      if (key in state) el.value = state[key];
    });
    const logoPreview = $("#logoPreview");
    const logoPlaceholder = $("#logoPlaceholder");
    const removeLogoBtn = $("#removeLogoBtn");
    if (state.logo) {
      logoPreview.src = state.logo; logoPreview.hidden = false;
      logoPlaceholder.hidden = true; removeLogoBtn.hidden = false;
    } else {
      logoPreview.hidden = true; logoPreview.removeAttribute("src");
      logoPlaceholder.hidden = false; removeLogoBtn.hidden = true;
    }
    renderLineInputs("earnings");
    renderLineInputs("deductions");
  }

  function update() { saveState(); renderPreview(); }

  /* ---------- Events ---------- */
  // Simple bound fields
  document.querySelectorAll("[data-bind]").forEach((el) => {
    el.addEventListener("input", () => {
      state[el.getAttribute("data-bind")] = el.value;
      update();
    });
  });

  // Line item edits (event delegation)
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.matches("[data-type][data-idx][data-key]")) {
      const t = el.getAttribute("data-type");
      const i = parseInt(el.getAttribute("data-idx"), 10);
      const k = el.getAttribute("data-key");
      if (state[t] && state[t][i]) { state[t][i][k] = el.value; update(); }
    }
  });

  // Add / remove line items
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      const t = addBtn.getAttribute("data-add");
      state[t].push({ label: "", amount: "" });
      renderLineInputs(t); update(); return;
    }
    const rmBtn = e.target.closest("[data-remove]");
    if (rmBtn) {
      const t = rmBtn.getAttribute("data-remove");
      const i = parseInt(rmBtn.getAttribute("data-idx"), 10);
      state[t].splice(i, 1);
      renderLineInputs(t); update(); return;
    }
  });

  // Logo upload
  $("#logoInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert("Please choose a logo smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.logo = reader.result;
      syncFormFromState();
      update();
    };
    reader.readAsDataURL(file);
  });
  $("#removeLogoBtn").addEventListener("click", () => {
    state.logo = "";
    $("#logoInput").value = "";
    syncFormFromState();
    update();
  });

  // Download (print to PDF)
  $("#downloadBtn").addEventListener("click", () => window.print());

  // Reset
  $("#resetBtn").addEventListener("click", () => {
    if (!confirm("Clear all fields and start over?")) return;
    state = JSON.parse(JSON.stringify(defaultState));
    localStorage.removeItem(STORAGE_KEY);
    syncFormFromState();
    renderPreview();
  });

  // Load sample
  $("#loadSampleBtn").addEventListener("click", () => {
    state = {
      companyName: "Acme Technologies Pvt. Ltd.",
      companyAddress: "123 Business Park, Bengaluru, KA 560001",
      companyPhone: "+91 98765 43210 · hr@acme.com",
      payMonth: new Date().toISOString().slice(0, 7),
      totalDays: "30",
      lopDays: "1",
      empName: "Riya Sharma",
      empId: "EMP-0142",
      designation: "Software Engineer",
      department: "Engineering",
      doj: "2022-04-11",
      pan: "ABCDE1234F",
      bankName: "HDFC Bank",
      bankAccount: "XXXXXX1234",
      uan: "100200300400",
      currency: "₹",
      notes: "This is a system generated payslip and does not require a signature.",
      logo: state.logo || "",
      earnings: [
        { label: "Basic Salary", amount: "45000" },
        { label: "House Rent Allowance", amount: "18000" },
        { label: "Conveyance Allowance", amount: "1600" },
        { label: "Special Allowance", amount: "9400" },
      ],
      deductions: [
        { label: "Provident Fund (PF)", amount: "5400" },
        { label: "Professional Tax", amount: "200" },
        { label: "TDS", amount: "3500" },
      ],
    };
    syncFormFromState();
    update();
  });

  /* ---------- Init ---------- */
  syncFormFromState();
  renderPreview();
})();
