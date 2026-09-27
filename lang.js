(function () {
  function apply(lang) {
    document.querySelectorAll(".lang-block").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-lang") === lang);
    });
    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    document.documentElement.setAttribute("lang", lang);
    try { localStorage.setItem("analfabet-lang", lang); } catch (e) {}
  }

  function initial() {
    // ?lang=cs|en - appka posílá jazyk, ve kterém ji uživatel používá (LegalLinks.kt)
    try {
      var param = new URLSearchParams(window.location.search).get("lang");
      if (param === "cs" || param === "en") return param;
    } catch (e) {}
    try {
      var saved = localStorage.getItem("analfabet-lang");
      if (saved === "cs" || saved === "en") return saved;
    } catch (e) {}
    return navigator.language && navigator.language.toLowerCase().indexOf("cs") === 0 ? "cs" : "en";
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.getAttribute("data-lang"));
      });
    });
    apply(initial());
  });
})();
