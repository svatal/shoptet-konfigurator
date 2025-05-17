function appendNoteOnLastCheckoutStep() {
  setTimeout(() => {
    const naMiru = document.querySelectorAll('.cart-item a[href$="-na-miru/"]');
    if (naMiru.length && document.querySelector("#add-note")) {
      document.querySelector("#add-note").click();
      let note = "";
      let notFound = [];
      naMiru.forEach((a) => {
        const name = a.innerText;
        const sku =
          a.parentElement.parentElement.attributes["data-micro-sku"].value;

        if (note !== "") note += "\n----------------\n";
        note += name + ":\n";
        const storedProductText = localStorage.getItem(sku);
        if (!storedProductText) notFound.push(name);
        note += storedProductText ?? getTextConfig(+sku.split("/")[0]);
      });
      const remark = document.querySelector("textarea#remark");
      remark.setAttribute("rows", 10);
      remark.setAttribute("cols", 50);
      remark.style.maxWidth = "600px";
      remark.style.height = "300px";
      remark.value = note;
      if (notFound.length)
        alert(
          `Ke zboží ${notFound
            .map((name) => `"${name}"`)
            .join(
              ", "
            )} se nepovedlo najít Váš výběr. Prosím, doplňte jej v poznámce.`
        );
      document
        .querySelector("form#order-form")
        .addEventListener("submit", () => localStorage.clear());
    }
  }, 100);
}

const maxVariantNumber = 15;
function appendConfiguratorOnProductPage() {
  const form = document.querySelector("#product-detail-form");
  if (form !== null) {
    const id = +form.querySelector('input[name="productId"]').value;
    const text = getTextConfig(id);
    if (!text) return;
    const div = document.createElement("div");
    div.className = "variant-list";
    div.innerHTML = `<span class="variant-label">Váš výběr (viz popis níže)</span><textarea class="konfigurace" rows="8" cols="50">${text}</textarea>`;
    const variant = form.querySelector("select#parameter-id-36");
    if (variant) {
      selectVariant(variant, maxVariantNumber); // will be changed on submit, just to satisfy validation
      variant.parentElement.parentElement.style.display = "none";
    }
    if (getFreeVersionCode(id.toString()).c > maxVariantNumber) {
      form.querySelector(".add-to-cart").style.display = "none";
      alert(
        "Již máte v košíku příliš mnoho panenek tohoto typu. Pokud chcete nejakou vyměnit, nejdříve proveďte odebrání."
      );
    }

    form.insertBefore(div, form.querySelector(".p-price-wrapper"));
    form.addEventListener("submit", (e) => {
      const free = getFreeVersionCode(id.toString());
      if (free.c > maxVariantNumber) {
        e.preventDefault();
        return false;
      }
      localStorage.setItem(
        free.localStorageId,
        form.querySelector(".konfigurace").value
      );
      variant && selectVariant(variant, free.c);
    });
  }
}

function selectVariant(select, idx) {
  // select.querySelector(`option[text="${label}"]`)
  select.value = document.querySelector(`option[data-index="${idx}"]`).value;
}

/** @param prefix {string} */
function getFreeVersionCode(prefix) {
  prefix += "/";
  let c = 1;
  const usedCodes = new Set(dataLayer[0].shoptet.cart.map((item) => item.code));
  while (usedCodes.has(prefix + c)) c++;
  return { localStorageId: prefix + c, c };
}

function getTextConfig(id) {
  const c = config.get(id);
  if (!c) return null;
  return [...c, "Vaše poznámka"].map((line) => `${line}: `).join("\n");
}

const bVlasky = "barva vlásků";
const bVlasy = "barva vlasů";
const bSaticky = "barva šatiček";
const bTop = "barva topu";
const bSukenky = "barva sukénky";
const bSatickyHlavni = "barva šatiček - hlavní";
const bSatickyDoplnkova = "barva šatiček - doplňková";
const bKridla = "barva křídel - doplňková k bílé";
const bDiteVlasky = "barva vlásků dítěte";
const bDiteObleceni = "barva oblečení dítěte";
const bTricko = "barva trička";
const bKalhoty = "barva kalhot";
const ditePohlavi = "dítě (chlapeček/holčička)";
const diteVek = "věk dítěte";
const doplnek = "doplněk do rukou (nakupuje se zvlášť)";
const uces = "typ účesu";

const config = new Map([
  [273, [bVlasky, bSaticky]], // drobnenka
  [279, [bVlasky, bTop, bSukenky, doplnek]], // panenka zenskost
  [204, [uces, bVlasky, bSatickyHlavni, bSatickyDoplnkova, bKridla, doplnek]], // vila
  [180, [uces, bVlasky, bSatickyHlavni, bSatickyDoplnkova, doplnek]], // osobni panenka
  [186, [bVlasky, ditePohlavi, bDiteVlasky, bDiteObleceni]], // andel strazny
  [
    183,
    [
      uces,
      bVlasky,
      bSatickyHlavni,
      bSatickyDoplnkova,
      ditePohlavi,
      bDiteVlasky,
      bDiteObleceni,
    ],
  ], // maminka s detatkem
  [
    267,
    [
      bVlasy,
      bTricko,
      bKalhoty,
      bDiteVlasky,
      ditePohlavi,
      bDiteObleceni,
      diteVek,
    ],
  ], // tatinek s ditetem
]);

function modifyThankYouPage() {
  const recap = document.querySelector(".recapitulation-table-payment");
  if (!recap) return;
  recap.style.display = "none";
  recap.parentElement.innerHTML = `<div>Objednávku zatím neplaťte. Překontroluji ji a brzy se Vám ozvu s jejím potvrzením a s doplňujícími informacemi.</div>`;
}

function addEshopMenuItem() {
  const categories = document.querySelectorAll("li.appended-category");
  const first = categories.item(0);
  const parent = first.parentElement;
  const cloned = first.cloneNode(true);
  cloned.classList.remove("appended-category");
  cloned.classList.add("ext");
  cloned.querySelector("b").innerText = "E-shop";
  const arrow = document.createElement("span");
  arrow.classList.add("submenu-arrow");
  cloned.querySelector("a").append(arrow);

  const submenu = document.createElement("ul");
  submenu.classList.add("menu-level-2");
  categories.forEach((category) => {
    category.className = "";
    const div = document.createElement("div");
    const a = category.querySelector("a");
    a.innerHTML = `<span>${a.querySelector("b").innerHTML}</span>`;
    div.append(a);
    category.append(div);
    submenu.append(category);
  });

  cloned.append(submenu);
  parent.prepend(cloned);
}

function addVariantNameInfo() {
  const mainImageContainer = document.querySelector(".p-image");
  const mainImage = document.querySelector(".p-main-image img");
  const variantData = shoptet?.variantsSplit?.necessaryVariantData;
  const select = document.querySelector(
    'select[data-parameter-name="Varianta"]'
  );
  if (mainImageContainer && mainImage && variantData && select) {
    const variantNames = new Map(
      [...select].map((option) => [option.value, option.innerText])
    );
    const variantNameDisplay = document.createElement("div");
    variantNameDisplay.id = "variant-name-display";
    variantNameDisplay.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            padding: 0 5px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
        `;
    mainImageContainer.style.position = "relative";
    mainImageContainer.appendChild(variantNameDisplay);

    function updateVariantNameBase(image, nameDisplay) {
      const src = image.src;
      const variantKey = Object.keys(variantData).find(
        (key) => variantData[key].variantImage.big === src
      );
      if (variantKey) {
        const variant = variantKey.split("-")[1];
        const variantName = variantNames.get(variant);
        nameDisplay.textContent = `Varianta: ${variantName}`;
      } else {
        nameDisplay.textContent = "";
      }
    }
    function updateVariantName() {
      updateVariantNameBase(mainImage, variantNameDisplay);
    }
    mainImage.addEventListener("load", updateVariantName);
    updateVariantName();

    watchForElement("#cboxLoadedContent img", (imgNode) => {
      let cboxNameDisplay = document.querySelector(
        "#cbox-variant-name-display"
      );
      if (!cboxNameDisplay) {
        cboxNameDisplay = document.createElement("div");
        cboxNameDisplay.id = "cbox-variant-name-display";
        cboxNameDisplay.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 16px;
            z-index: 1000;
            pointer-events: none;`;
        document
          .querySelector("#cboxLoadedContent")
          .appendChild(cboxNameDisplay);
        function updateCBoxVariantName() {
          updateVariantNameBase(imgNode, cboxNameDisplay);
        }
        imgNode.addEventListener("load", updateCBoxVariantName);
        updateCBoxVariantName();
      }
    });
  }
}

function watchForElement(selector, callback) {
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check the added node itself
          if (node.matches(selector)) {
            callback(node);
          }
          // Check children of the added node
          const matchingChild = node.querySelector(selector);
          if (matchingChild) {
            callback(matchingChild);
          }
        }
      });
    });
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });
}

appendConfiguratorOnProductPage();
appendNoteOnLastCheckoutStep();
modifyThankYouPage();
addEshopMenuItem();
addVariantNameInfo();
