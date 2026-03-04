const CATEGORY_MAP = [
  { key: "Washing Machine", label: "เครื่องซักผ้า/อบผ้า" },
  { key: "Fridge", label: "ตู้เย็น" },
  { key: "Air Conditioner", label: "เครื่องปรับอากาศ" },
  { key: "Air Purifier", label: "เครื่องฟอกอากาศ" },
  { key: "TV", label: "ทีวีและจอภาพ" },
  { key: "Other", label: "สินค้าอื่น ๆ" },
];
const LINE_OA_URL = "https://line.me/R/ti/p/@952xrmrn";

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toNumberTHB(text) {
  const num = Number(String(text || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : null;
}

function normalizeCategory(item) {
  const source = `${item.category_url || ""} ${item.detail_url || ""}`.toLowerCase();
  if (source.includes("/air-purifiers/") || source.includes("/air-puricare/")) return "Air Purifier";
  if (source.includes("/refrigerators/") || source.includes("/freezer/")) return "Fridge";
  if (source.includes("/washers/") || source.includes("/dryers/") || source.includes("/washer")) return "Washing Machine";
  if (source.includes("/air-conditioners/") || source.includes("/air-conditioner")) return "Air Conditioner";
  if (source.includes("/tvs/") || source.includes("/tv/") || source.includes("/lifestyle-screens/") || source.includes("/monitors/")) return "TV";
  return "Other";
}

function categoryLabel(key) {
  const found = CATEGORY_MAP.find((c) => c.key === key);
  return found ? found.label : key;
}

function requestedCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("category");
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  const found = CATEGORY_MAP.find((c) => c.key.toLowerCase() === normalized);
  return found ? found.key : null;
}

function scrollToRequestedCategory() {
  const categoryKey = requestedCategoryFromUrl();
  if (!categoryKey) return;

  const target = document.querySelector(`.category-section[data-category-key="${categoryKey}"]`);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderStats(products) {
  const totalProducts = document.querySelector("#totalProducts");
  const totalCategories = document.querySelector("#totalCategories");
  const startPrice = document.querySelector("#startPrice");

  const categories = new Set(products.map((p) => p.category));
  const prices = products.map((p) => toNumberTHB(p.monthly_price_text)).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : null;

  if (totalProducts) totalProducts.textContent = products.length.toLocaleString("th-TH");
  if (totalCategories) totalCategories.textContent = categories.size.toLocaleString("th-TH");
  if (startPrice) startPrice.textContent = minPrice ? `฿${minPrice.toLocaleString("th-TH")}` : "-";
}

function productCardHtml(item) {
  const image = item.image_url || "https://via.placeholder.com/600x600?text=LG+Subscribe";
  const detailUrl = item.detail_url || "#lead";
  const price = item.monthly_price_text || "สอบถามราคา";
  return `
    <article class="product-card">
      <img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(item.product_name)}" loading="lazy" />
      <div class="product-content">
        <h3 class="product-name">${escapeHtml(item.product_name || "LG Subscribe Product")}</h3>
        <div class="product-meta">
          <span class="price">${escapeHtml(price)} / เดือน</span>
          <span class="model">${escapeHtml(item.model_code || "-")}</span>
        </div>
        <div class="product-actions">
          <a class="btn btn-primary full" href="#lead">รับข้อเสนอรุ่นนี้</a>
        </div>
        <div class="product-actions" style="margin-top:8px;">
          <a class="btn btn-outline full" href="${escapeHtml(detailUrl)}" target="_blank" rel="noopener noreferrer">สอบถามรายละเอียดสินค้า</a>
        </div>
      </div>
    </article>
  `;
}

function renderByCategory(products) {
  const root = document.querySelector("#categorySections");
  if (!root) return;

  const grouped = products.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const sections = CATEGORY_MAP
    .map((meta) => {
      const list = grouped[meta.key] || [];
      if (!list.length) return "";

      const cards = list.map((item) => productCardHtml(item)).join("");

      return `
        <section class="category-section" data-category-key="${escapeHtml(meta.key)}">
          <div class="category-header">
            <h2 class="category-title">${escapeHtml(meta.label)}</h2>
            <span class="category-count">${list.length.toLocaleString("th-TH")} รายการ</span>
          </div>
          <div class="products-grid">${cards}</div>
        </section>
      `;
    })
    .filter(Boolean)
    .join("");

  root.innerHTML = sections || "<p>ไม่พบรายการสินค้า</p>";
  scrollToRequestedCategory();
  applyLineOaCtaLinks();
}

function renderByPrice(products) {
  const root = document.querySelector("#categorySections");
  if (!root) return;

  const byPrice = products.reduce((acc, item) => {
    const num = toNumberTHB(item.monthly_price_text);
    const key = num != null ? num : -1;
    if (!acc[key]) acc[key] = { priceNum: key, priceText: item.monthly_price_text || "สอบถามราคา", list: [] };
    acc[key].list.push(item);
    return acc;
  }, {});

  const sortedKeys = Object.keys(byPrice)
    .map(Number)
    .filter((k) => k >= 0)
    .sort((a, b) => a - b);
  const noPriceList = byPrice[-1] ? byPrice[-1].list : [];
  const sections = [];

  sortedKeys.forEach((key) => {
    const { priceText, list } = byPrice[key];
    const cards = list.map((item) => productCardHtml(item)).join("");
    const priceLabel = key >= 0 ? `฿${key.toLocaleString("th-TH")}` : priceText;
    sections.push(`
      <section class="category-section" data-price="${key}">
        <div class="category-header">
          <h2 class="category-title">ราคา ${escapeHtml(priceLabel)}/เดือน</h2>
          <span class="category-count">${list.length.toLocaleString("th-TH")} รายการ</span>
        </div>
        <div class="products-grid">${cards}</div>
      </section>
    `);
  });

  if (noPriceList.length) {
    const cards = noPriceList.map((item) => productCardHtml(item)).join("");
    sections.push(`
      <section class="category-section" data-price="unknown">
        <div class="category-header">
          <h2 class="category-title">ราคาต้องสอบถาม</h2>
          <span class="category-count">${noPriceList.length.toLocaleString("th-TH")} รายการ</span>
        </div>
        <div class="products-grid">${cards}</div>
      </section>
    `);
  }

  root.innerHTML = sections.length ? sections.join("") : "<p>ไม่พบรายการสินค้า</p>";
  applyLineOaCtaLinks();
}

function applyLineOaCtaLinks() {
  const ctaSelector = [
    ".top-actions .btn",
    ".product-actions a",
    ".sticky-cta a",
    ".lead-contact-link",
  ].join(",");

  document.querySelectorAll(ctaSelector).forEach((el) => {
    el.setAttribute("href", LINE_OA_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
}

function initViewToggle(products) {
  const root = document.querySelector(".view-toggle");
  if (!root) return;

  root.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      root.querySelectorAll(".view-btn").forEach((b) => {
        b.classList.toggle("active", b.getAttribute("data-view") === view);
        b.setAttribute("aria-selected", b.getAttribute("data-view") === view ? "true" : "false");
      });
      if (view === "price") {
        renderByPrice(products);
      } else {
        renderByCategory(products);
      }
    });
  });
}

async function loadAllProducts() {
  try {
    const response = await fetch("./data/lg_subscribe_products.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    const list = Array.isArray(raw) ? raw : [];

    const dedupMap = new Map();
    list.forEach((item) => {
      const key = (item.detail_url || item.model_code || item.product_name || "").trim();
      if (!key) return;
      if (!dedupMap.has(key)) dedupMap.set(key, item);
    });

    const products = Array.from(dedupMap.values()).map((item) => ({
      ...item,
      category: normalizeCategory(item),
    }));

    renderStats(products);
    renderByCategory(products);
    initViewToggle(products);
  } catch (error) {
    console.error("Failed to load products:", error);
  }
}

loadAllProducts();
applyLineOaCtaLinks();
