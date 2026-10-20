
/* KREOVANTA — Shared app foundation
   Free-first setup. Brand Kit is saved locally.
   Real cloud login will be connected later.
*/

(function () {
  "use strict";

  const THEME_KEY = "kreovanta.theme.v1";
  const BRAND_KEY = "kreovanta.brandKit.v1";

  const DEFAULT_BRAND = {
    name: "KREOVANTA",
    primary: "#12362b",
    accent: "#b48a2c",
    background: "#f7f1e3",
    font: "Cormorant Garamond",
    logoUrl: ""
  };

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getBrandKit() {
    const saved = readStorage(BRAND_KEY, {});
    return { ...DEFAULT_BRAND, ...saved };
  }

  function saveBrandKit(brand) {
    const clean = { ...DEFAULT_BRAND, ...brand };

    try {
      localStorage.setItem(BRAND_KEY, JSON.stringify(clean));
      applyBrandKit(clean);
      return true;
    } catch (error) {
      console.error("KREOVANTA could not save Brand Kit:", error);
      return false;
    }
  }

  function applyBrandKit(brand = getBrandKit()) {
    const root = document.documentElement;

    root.style.setProperty("--brand-primary", brand.primary);
    root.style.setProperty("--brand-accent", brand.accent);
    root.style.setProperty("--brand-background", brand.background);
    root.style.setProperty("--brand-font", `"${brand.font}", serif`);

    document.querySelectorAll("[data-brand-name]").forEach((element) => {
      element.textContent = brand.name || DEFAULT_BRAND.name;
    });

    document.querySelectorAll("[data-brand-logo]").forEach((element) => {
      if (brand.logoUrl) {
        element.src = brand.logoUrl;
        element.alt = (brand.name || "Brand") + " logo";
        element.hidden = false;
      } else {
        element.removeAttribute("src");
        element.hidden = true;
      }
    });
  }

  function setTheme(theme) {
    const selected = theme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = selected;

    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(selected));
    } catch (error) {
      // Theme still works for this page if storage is unavailable.
    }

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.textContent =
        selected === "dark" ? "☀ Light mode" : "☾ Dark mode";
      button.setAttribute("aria-pressed", String(selected === "dark"));
    });
  }

  function initTheme() {
    const saved = readStorage(THEME_KEY, "light");
    setTheme(saved);
  }

  function initNavigation() {
    const target = document.querySelector("[data-kreovanta-nav]");
    if (!target) return;

    const links = [
      { href: "index.html", label: "Home" },
      { href: "brand-kit.html", label: "Brand Kit" },
      { href: "login.html", label: "Sign in" }
    ];

    const currentPage = document.body.dataset.page || "";

    const nav = document.createElement("nav");
    nav.className = "kv-nav";
    nav.setAttribute("aria-label", "Main navigation");

    const inner = document.createElement("div");
    inner.className = "kv-nav-inner";

    const brandLink = document.createElement("a");
    brandLink.className = "kv-nav-brand";
    brandLink.href = "index.html";
    brandLink.textContent = getBrandKit().name || "KREOVANTA";
    inner.appendChild(brandLink);

    const menu = document.createElement("div");
    menu.className = "kv-nav-links";

    links.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;

      const pageName = item.href.replace(".html", "");
      if (
        currentPage === pageName ||
        (currentPage === "home" && pageName === "index")
      ) {
        link.setAttribute("aria-current", "page");
      }

      menu.appendChild(link);
    });

    const themeButton = document.createElement("button");
    themeButton.type = "button";
    themeButton.className = "kv-btn kv-btn-secondary";
    themeButton.dataset.themeToggle = "";
    themeButton.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme;
      setTheme(current === "dark" ? "light" : "dark");
    });

    menu.appendChild(themeButton);
    inner.appendChild(menu);
    nav.appendChild(inner);
    target.replaceChildren(nav);

    setTheme(readStorage(THEME_KEY, "light"));
  }

  function initBrandKitForm() {
    const form = document.querySelector("#brand-kit-form");
    if (!form) return;

    const fields = {
      name: form.elements.namedItem("brandName"),
      primary: form.elements.namedItem("brandPrimary"),
      accent: form.elements.namedItem("brandAccent"),
      background: form.elements.namedItem("brandBackground"),
      font: form.elements.namedItem("brandFont"),
      logoUrl: form.elements.namedItem("brandLogoUrl")
    };

    const status = document.querySelector("#brand-kit-status");

    function showStatus(message, isError = false) {
      if (!status) return;
      status.textContent = message;
      status.setAttribute("role", isError ? "alert" : "status");
    }

    function updatePreview() {
      const brand = {};

      Object.keys(fields).forEach((key) => {
        if (fields[key]) brand[key] = fields[key].value.trim();
      });

      brand.primary = fields.primary.value;
      brand.accent = fields.accent.value;
      brand.background = fields.background.value;
      brand.font = fields.font.value;

      const preview = document.querySelector("#brand-preview");
      if (preview) {
        preview.style.setProperty("--preview-primary", brand.primary);
        preview.style.setProperty("--preview-accent", brand.accent);
        preview.style.setProperty("--preview-background", brand.background);
        preview.style.setProperty("--preview-font", `"${brand.font}", serif`);
      }

      const previewName = document.querySelector("#brand-preview-name");
      if (previewName) {
        previewName.textContent = brand.name || "Your brand name";
      }

      const previewLogo = document.querySelector("#brand-preview-logo");
      if (previewLogo) {
        const url = brand.logoUrl;

        if (url) {
          try {
            const parsed = new URL(url);
            if (parsed.protocol === "https:") {
              previewLogo.src = parsed.href;
              previewLogo.hidden = false;
            } else {
              previewLogo.hidden = true;
              previewLogo.removeAttribute("src");
            }
          } catch (error) {
            previewLogo.hidden = true;
            previewLogo.removeAttribute("src");
          }
        } else {
          previewLogo.hidden = true;
          previewLogo.removeAttribute("src");
        }
      }
    }

    function populateForm(brand) {
      Object.keys(fields).forEach((key) => {
        if (fields[key]) {
          fields[key].value = brand[key] || DEFAULT_BRAND[key];
        }
      });

      updatePreview();
    }

    populateForm(getBrandKit());

    form.addEventListener("input", updatePreview);
    form.addEventListener("change", updatePreview);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const logoUrl = fields.logoUrl.value.trim();

      if (logoUrl) {
        try {
          if (new URL(logoUrl).protocol !== "https:") {
            showStatus("Please use a secure HTTPS logo URL.", true);
            return;
          }
        } catch (error) {
          showStatus("Please enter a valid logo URL.", true);
          return;
        }
      }

      const brand = {};
      Object.keys(fields).forEach((key) => {
        brand[key] = fields[key].value.trim();
      });

      brand.primary = fields.primary.value;
      brand.accent = fields.accent.value;
      brand.background = fields.background.value;
      brand.font = fields.font.value;

      if (saveBrandKit(brand)) {
        showStatus("Brand Kit saved on this device.");
        const navBrand = document.querySelector(".kv-nav-brand");
        if (navBrand) navBrand.textContent = brand.name || "KREOVANTA";
      } else {
        showStatus(
          "Could not save. Your browser storage may be unavailable.",
          true
        );
      }

      updatePreview();
    });

    const resetButton = document.querySelector("#brand-kit-reset");

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        populateForm(DEFAULT_BRAND);

        if (saveBrandKit(DEFAULT_BRAND)) {
          showStatus("Default Brand Kit restored on this device.");
          const navBrand = document.querySelector(".kv-nav-brand");
          if (navBrand) navBrand.textContent = DEFAULT_BRAND.name;
        } else {
          showStatus("Could not save the default settings.", true);
        }
      });
    }
  }

  function initLoginForm() {
    const form = document.querySelector("#login-form");
    if (!form) return;

    const status = document.querySelector("#login-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (status) {
        status.textContent =
          "Login is not connected yet. No credentials were sent or saved. " +
          "Please wait until secure authentication is configured.";
        status.setAttribute("role", "status");
      }
    });
  }

  window.KREOVANTA = {
    getBrandKit,
    saveBrandKit,
    applyBrandKit,
    setTheme
  };

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    applyBrandKit();
    initNavigation();
    initBrandKitForm();
    initLoginForm();
  });
})();
