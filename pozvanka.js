(function () {
  // Adresy na jednom místě. Webová verze dnes běží na workers.dev, později bude app.analfabet.net
  // – mění se jen tahle konstanta.
  var PLAY_URL = "https://play.google.com/store/apps/details?id=com.ianalytics.analfabet";
  var WEB_URL = "https://analfabet-web.ian-urbanick.workers.dev";

  // Kód pozvánky: 8 znaků z abecedy generátoru (generate_referral_code v 20260929_referrals.sql),
  // tedy bez zaměnitelných 0/O a 1/I/L. Kód je vstup z URL: nikdy ne innerHTML.
  var CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;

  function codeFromUrl() {
    var raw;
    try {
      raw = new URLSearchParams(window.location.search).get("kod");
    } catch (e) {
      return null;
    }
    if (!raw) return null;
    var code = raw.trim().toUpperCase();
    return CODE_RE.test(code) ? code : null;
  }

  function playUrl(code) {
    // referrer = URL-zakódované "kod=<KÓD>"; Install Referrer API ho pak přečte v appce.
    return code ? PLAY_URL + "&referrer=" + encodeURIComponent("kod=" + code) : PLAY_URL;
  }

  function platform() {
    var ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) return "android";
    // iPadOS se hlásí jako Macintosh, pozná se podle dotykového displeje.
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
    return "other";
  }

  function selectText(el) {
    try {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}
  }

  function wireCopy(btn, code) {
    var original = btn.textContent;
    var done = btn.getAttribute("data-label-done") || original;
    var fail = btn.getAttribute("data-label-fail") || original;
    var timer = null;

    function flash(label) {
      btn.textContent = label;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        btn.textContent = original;
      }, 2500);
    }

    btn.addEventListener("click", function () {
      var card = btn.closest(".invite-code-card");
      var codeEl = card && card.querySelector("[data-code]");
      // Clipboard API chybí (starý prohlížeč) nebo selže (bez HTTPS, odmítnuté právo):
      // kód se jen vybere, aby se dal zkopírovat ručně.
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        if (codeEl) selectText(codeEl);
        flash(fail);
        return;
      }
      navigator.clipboard.writeText(code).then(
        function () {
          flash(done);
        },
        function () {
          if (codeEl) selectText(codeEl);
          flash(fail);
        }
      );
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var code = codeFromUrl();

    document.querySelectorAll("[data-play]").forEach(function (a) {
      a.setAttribute("href", playUrl(code));
    });
    document.querySelectorAll("[data-web]").forEach(function (a) {
      a.setAttribute("href", WEB_URL);
    });

    // Bez kódu nebo s neplatným formátem zůstane karta s kódem skrytá a nic se nehlásí.
    if (code) {
      document.querySelectorAll("[data-code]").forEach(function (el) {
        el.textContent = code;
      });
      document.querySelectorAll("[data-copy]").forEach(function (btn) {
        wireCopy(btn, code);
      });
      document.querySelectorAll("[data-code-card]").forEach(function (card) {
        card.removeAttribute("hidden");
      });
    }

    // Na Androidu vede do Play, na iPhonu na webovou verzi, jinak jsou obě stejné.
    var p = platform();
    if (p === "android" || p === "ios") {
      var selector = p === "android" ? "[data-play]" : "[data-web]";
      document.querySelectorAll(selector).forEach(function (a) {
        a.classList.add("primary");
      });
    }
  });
})();
