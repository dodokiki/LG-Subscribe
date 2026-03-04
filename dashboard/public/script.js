const CATEGORY_MAP = [
  { key: "Washing Machine", label: "เครื่องซักผ้า/อบผ้า", hint: "หลายรุ่นพร้อมติดตั้งและดูแลหลังการขาย" },
  { key: "Fridge", label: "ตู้เย็น", hint: "ครบตั้งแต่ 2 ประตูถึง Multi Door ราคาคุ้มค่า" },
  { key: "Air Conditioner", label: "เครื่องปรับอากาศ", hint: "อินเวอร์เตอร์ประหยัดไฟ เย็นไว ใช้งานสบาย" },
  { key: "TV", label: "ทีวีและจอภาพ", hint: "OLED, QNED และ Smart Monitor รุ่นยอดนิยม" },
  { key: "Air Purifier", label: "เครื่องฟอกอากาศ", hint: "ดูแลอากาศในบ้านอย่างต่อเนื่องตลอดปี" },
  { key: "Other", label: "สินค้าอื่น ๆ", hint: "รวมสินค้าเฉพาะทางสำหรับบ้านที่ต้องการความครบ" },
];

const CATEGORY_HINT_FALLBACK = "รวมรุ่นที่พร้อม Subscribe ในหมวดนี้";
const LINE_OA_URL = "https://line.me/R/ti/p/@952xrmrn";

function normalizeProductsPageHref() {
  return "products.html";
}

function createProductsCategoryHref(categoryKey) {
  const baseHref = normalizeProductsPageHref();
  return `${baseHref}?category=${encodeURIComponent(categoryKey)}`;
}

function applyProductsPageLinks() {
  const href = normalizeProductsPageHref();
  document.querySelectorAll(".js-products-link").forEach((el) => {
    el.setAttribute("href", href);
  });
}

function applyLineOaCtaLinks() {
  const ctaSelector = [
    ".hero-cta a",
    ".hero-card a",
    ".product-card a",
    ".catalog-link",
    ".pricing a",
    ".sticky-cta a",
    ".section-head-btn",
    ".nav .btn",
  ].join(",");

  document.querySelectorAll(ctaSelector).forEach((el) => {
    el.setAttribute("href", LINE_OA_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
}

function attachLineCardNavigation() {
  const cards = document.querySelectorAll("#catalogGrid .catalog-card");
  cards.forEach((card) => {
    if (!card.hasAttribute("role")) card.setAttribute("role", "link");
    if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "0");

    const toLine = () => {
      window.open(LINE_OA_URL, "_blank", "noopener,noreferrer");
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      toLine();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("a, button")) return;
      event.preventDefault();
      toLine();
    });
  });
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toNumberTHB(priceText) {
  const num = Number(String(priceText || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : null;
}

function normalizeCategory(item) {
  const source = `${item.category_url || ""} ${item.detail_url || ""}`.toLowerCase();

  if (source.includes("/air-purifiers/") || source.includes("/air-puricare/")) return "Air Purifier";
  if (source.includes("/refrigerators/") || source.includes("/freezer/")) return "Fridge";
  if (source.includes("/washers/") || source.includes("/dryers/") || source.includes("/washer")) return "Washing Machine";
  if (source.includes("/air-conditioners/") || source.includes("/air-conditioner")) return "Air Conditioner";
  if (
    source.includes("/tvs/") ||
    source.includes("/tv/") ||
    source.includes("/lifestyle-screens/") ||
    source.includes("/monitors/")
  ) {
    return "TV";
  }
  return "Other";
}

function getCategoryLabel(categoryKey) {
  const found = CATEGORY_MAP.find((c) => c.key === categoryKey);
  return found ? found.label : categoryKey;
}

function renderStats(products) {
  const totalProductsEl = document.querySelector("#totalProducts");
  const totalCategoriesEl = document.querySelector("#totalCategories");
  const startPriceEl = document.querySelector("#startPrice");

  const categories = new Set(products.map((item) => item.category));
  const prices = products.map((item) => toNumberTHB(item.monthly_price_text)).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : null;

  if (totalProductsEl) totalProductsEl.textContent = products.length.toLocaleString("th-TH");
  if (totalCategoriesEl) totalCategoriesEl.textContent = categories.size.toLocaleString("th-TH");
  if (startPriceEl) startPriceEl.textContent = minPrice ? `฿${minPrice.toLocaleString("th-TH")}` : "-";
}

function renderCategoryGrid(products) {
  const categoryGrid = document.querySelector("#categoryGrid");
  if (!categoryGrid) return;

  const grouped = products.reduce((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const rows = CATEGORY_MAP
    .map((meta) => {
      const list = grouped[meta.key] || [];
      if (!list.length) return "";
      const minPrice = Math.min(...list.map((item) => toNumberTHB(item.monthly_price_text) || Infinity));
      const startPrice = Number.isFinite(minPrice) ? `เริ่มเพียง ฿${minPrice.toLocaleString("th-TH")} / เดือน` : "สอบถามโปรล่าสุดกับเจ้าหน้าที่";
      const representative = list.find((item) => item.image_url) || list[0];
      const image = representative?.image_url || "https://via.placeholder.com/600x400?text=LG+Subscribe";
      const categoryHref = createProductsCategoryHref(meta.key);
      return `
        <article class="product-card" data-category-key="${escapeHtml(meta.key)}" data-products-href="${escapeHtml(categoryHref)}" role="link" tabindex="0" aria-label="ดูสินค้าหมวด ${escapeHtml(meta.label)}">
          <img
            class="product-card-image"
            src="${escapeHtml(image)}"
            alt="${escapeHtml(meta.label)}"
            loading="lazy"
          />
          <div class="chip-row">
            <span class="chip">${list.length.toLocaleString("th-TH")} รายการ</span>
          </div>
          <h3>${escapeHtml(meta.label)}</h3>
          <p>${escapeHtml(meta.hint || CATEGORY_HINT_FALLBACK)}</p>
          <p>${escapeHtml(startPrice)}</p>
          <a href="#contact">รับข้อเสนอหมวดนี้</a>
        </article>
      `;
    })
    .filter(Boolean)
    .join("");

  categoryGrid.innerHTML = rows;
  attachCategoryCardNavigation();
  applyLineOaCtaLinks();
}

function attachCategoryCardNavigation() {
  const cards = document.querySelectorAll("#categoryGrid .product-card[data-products-href]");
  cards.forEach((card) => {
    const toProductsPage = () => {
      const href = card.getAttribute("data-products-href");
      if (href) window.location.href = href;
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      toProductsPage();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("a, button")) return;
      event.preventDefault();
      toProductsPage();
    });
  });
}

function renderCatalog(products) {
  const catalogGrid = document.querySelector("#catalogGrid");
  if (!catalogGrid) return;

  const sorted = [...products].sort((a, b) => {
    const aPrice = toNumberTHB(a.monthly_price_text) || 999999;
    const bPrice = toNumberTHB(b.monthly_price_text) || 999999;
    return aPrice - bPrice;
  });

  const list = sorted.slice(0, 18);

  catalogGrid.innerHTML = list
    .map((item) => {
      const image = item.image_url || "https://via.placeholder.com/600x600?text=LG+Subscribe";
      const name = item.product_name || "LG Subscribe Product";
      const price = item.monthly_price_text || "สอบถามราคา";
      const categoryLabel = getCategoryLabel(item.category);
      const detail = item.detail_url || "#contact";

      return `
        <article class="catalog-card">
          <img class="catalog-image" src="${escapeHtml(image)}" alt="${escapeHtml(name)}" loading="lazy" />
          <div class="catalog-content">
            <h3>${escapeHtml(name)}</h3>
            <div class="catalog-meta">
              <span class="catalog-price">${escapeHtml(price)} / เดือน</span>
              <span class="catalog-category">${escapeHtml(categoryLabel)}</span>
            </div>
            <a class="catalog-link" href="${escapeHtml(detail)}" target="_blank" rel="noopener noreferrer">สอบถามรายละเอียดสินค้า</a>
          </div>
        </article>
      `;
    })
    .join("");
  applyLineOaCtaLinks();
  attachLineCardNavigation();
}

function formatTHB(value) {
  return `฿${Number(value).toLocaleString("th-TH")}`;
}

function getDiscountMeta(item) {
  const monthly = toNumberTHB(item.monthly_price_text);
  const original = toNumberTHB(item.original_price_text);
  if (!monthly || !original || original <= monthly) return null;
  const percent = Math.round(((original - monthly) / original) * 100);
  return { monthly, original, percent };
}

function renderPlans(products) {
  const plansTitle = document.querySelector("#plansTitle");
  const plansSubtitle = document.querySelector("#plansSubtitle");
  const plansGrid = document.querySelector("#plansGrid");
  if (!plansGrid) return;

  const priced = products
    .map((item) => ({ ...item, monthly: toNumberTHB(item.monthly_price_text) }))
    .filter((item) => item.monthly);

  if (!priced.length) return;

  const minPrice = Math.min(...priced.map((item) => item.monthly));
  const minPriceItem =
    [...priced].sort((a, b) => a.monthly - b.monthly)[0] || null;

  const discounted = products
    .map((item) => ({ item, discount: getDiscountMeta(item) }))
    .filter((row) => row.discount)
    .sort((a, b) => b.discount.percent - a.discount.percent);

  const bestDiscount = discounted[0] || null;

  const grouped = priced.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const topCategory = Object.entries(grouped)
    .map(([key, list]) => ({ key, list }))
    .sort((a, b) => b.list.length - a.list.length)[0] || null;

  const topCategoryMin =
    topCategory && topCategory.list.length
      ? Math.min(...topCategory.list.map((item) => item.monthly))
      : null;
  const topCategoryItem =
    topCategory && topCategory.list.length
      ? [...topCategory.list].sort((a, b) => a.monthly - b.monthly)[0]
      : null;

  if (plansTitle) plansTitle.textContent = "ข้อเสนอที่น่าสนใจจากราคาจริงในตอนนี้";
  if (plansSubtitle) {
    plansSubtitle.textContent = `อัปเดตจากสินค้าจริง ${products.length.toLocaleString("th-TH")} รุ่นใน ${new Set(
      products.map((item) => item.category)
    ).size.toLocaleString("th-TH")} หมวด`;
  }

  const bestDiscountCard = bestDiscount
    ? `
      <article class="price-card featured">
        <p class="best">แนะนำ</p>
        <img
          class="price-card-image"
          src="${escapeHtml(bestDiscount.item.image_url || "https://via.placeholder.com/800x600?text=LG+Subscribe")}"
          alt="${escapeHtml(bestDiscount.item.product_name || "ดีลลดแรงสุดตอนนี้")}"
          loading="lazy"
        />
        <p class="plan-name">ดีลลดแรงสุดตอนนี้</p>
        <p class="price">${formatTHB(bestDiscount.discount.monthly)}<span>/เดือน</span></p>
        <ul>
          <li>${escapeHtml(bestDiscount.item.product_name || bestDiscount.item.model_code || "รุ่นแนะนำ")}</li>
          <li>จาก ${formatTHB(bestDiscount.discount.original)} ลดประมาณ ${bestDiscount.discount.percent}%</li>
          <li>เหมาะกับลูกค้าที่อยากคุ้มค่าสูงสุดตั้งแต่เดือนแรก</li>
        </ul>
        <a class="btn btn-primary full" href="#contact">สอบถามดีลนี้ทันที</a>
      </article>
    `
    : `
      <article class="price-card featured">
        <p class="best">แนะนำ</p>
        <img
          class="price-card-image"
          src="${escapeHtml(minPriceItem?.image_url || "https://via.placeholder.com/800x600?text=LG+Subscribe")}"
          alt="${escapeHtml(minPriceItem?.product_name || "ดีลเด่นประจำช่วงนี้")}"
          loading="lazy"
        />
        <p class="plan-name">ดีลเด่นประจำช่วงนี้</p>
        <p class="price">${formatTHB(minPrice)}<span>/เดือน</span></p>
        <ul>
          <li>อัปเดตราคาจริงจากรายการ Subscribe ล่าสุด</li>
          <li>มีรุ่นให้เลือกหลายหมวดในหน้าเดียว</li>
          <li>สอบถามเงื่อนไขได้ทันทีกับทีมงาน</li>
        </ul>
        <a class="btn btn-primary full" href="#contact">รับข้อเสนอแนะนำ</a>
      </article>
    `;

  plansGrid.innerHTML = `
    <article class="price-card">
      <img
        class="price-card-image"
        src="${escapeHtml(minPriceItem?.image_url || "https://via.placeholder.com/800x600?text=LG+Subscribe")}"
        alt="${escapeHtml(minPriceItem?.product_name || "เริ่มต้นคุ้มที่สุด")}"
        loading="lazy"
      />
      <p class="plan-name">เริ่มต้นคุ้มที่สุด</p>
      <p class="price">${formatTHB(minPrice)}<span>/เดือน</span></p>
      <ul>
        <li>เริ่มได้ทันทีแบบไม่ต้องจ่ายก้อนใหญ่</li>
        <li>มีตัวเลือกหลายรุ่นตามงบที่ตั้งไว้</li>
        <li>ทีมงานช่วยคัดรุ่นให้เหมาะกับการใช้งานจริง</li>
      </ul>
      <a class="btn btn-outline full" href="#contact">ขอแพ็กแนะนำตามงบ</a>
    </article>

    ${bestDiscountCard}

    <article class="price-card">
      <img
        class="price-card-image"
        src="${escapeHtml(topCategoryItem?.image_url || "https://via.placeholder.com/800x600?text=LG+Subscribe")}"
        alt="${escapeHtml(topCategoryItem?.product_name || "หมวดที่มีตัวเลือกมากที่สุด")}"
        loading="lazy"
      />
      <p class="plan-name">หมวดที่มีตัวเลือกมากที่สุด</p>
      <p class="price">${topCategoryMin ? formatTHB(topCategoryMin) : "-"}<span>/เดือน</span></p>
      <ul>
        <li>${escapeHtml(getCategoryLabel(topCategory?.key || "Other"))} ${topCategory ? `${topCategory.list.length.toLocaleString("th-TH")} รุ่น` : ""}</li>
        <li>ช่วยให้เทียบสเปกและงบได้ง่ายขึ้น</li>
        <li>เหมาะกับคนที่อยากมีตัวเลือกก่อนตัดสินใจ</li>
      </ul>
      <a class="btn btn-outline full" href="#contact">ดูข้อเสนอหมวดนี้</a>
    </article>
  `;

  applyLineOaCtaLinks();
}

async function loadProductsAndRender() {
  try {
    const response = await fetch("./data/lg_subscribe_products.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    const input = Array.isArray(raw) ? raw : [];

    const dedup = new Map();
    input.forEach((item) => {
      const key = (item.detail_url || item.model_code || item.product_name || "").trim();
      if (!key) return;
      if (!dedup.has(key)) dedup.set(key, item);
    });

    const products = Array.from(dedup.values()).map((item) => ({
      ...item,
      category: normalizeCategory(item),
    }));

    renderStats(products);
    renderCategoryGrid(products);
    renderCatalog(products);
    renderPlans(products);
  } catch (error) {
    console.error("Failed to load product catalog:", error);
    // Keep fallback cards already written in HTML.
  }
}

const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  if (!question) return;
  question.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

loadProductsAndRender();
applyProductsPageLinks();
applyLineOaCtaLinks();
attachLineCardNavigation();
