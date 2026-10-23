/* =====================================================================
   SWARABITAN – shared script
   CONFIG: set FORM_ENDPOINT to a form backend (Formspree / FormSubmit /
   your own API). While it is empty, the form shows the thank-you message
   but does not send data anywhere.
   ===================================================================== */
var FORM_ENDPOINT = "";
var PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.swara";

(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------------- Language ---------------- */
  var KEY = "swarabitan-lang";
  var TITLES = {
    en: document.documentElement.getAttribute("data-title-en") || document.title,
    bn: document.documentElement.getAttribute("data-title-bn") || document.title
  };

  function getLang() {
    // Every new visit starts in English; the choice is kept for the browser tab session only.
    try { return sessionStorage.getItem(KEY) === "bn" ? "bn" : "en"; } catch (e) { return "en"; }
  }

  window.setLanguage = function (lang) {
    lang = lang === "bn" ? "bn" : "en";
    try { sessionStorage.setItem(KEY, lang); } catch (e) {}
    var root = document.documentElement;
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    document.title = TITLES[lang];
    document.querySelectorAll("[data-placeholder-en]").forEach(function (el) {
      el.placeholder = el.getAttribute(lang === "bn" ? "data-placeholder-bn" : "data-placeholder-en");
    });
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-set-lang") === lang);
    });
    if (window.renderQuote) window.renderQuote(false);
  };

  document.querySelectorAll(".lang-btn").forEach(function (b) {
    b.addEventListener("click", function () { window.setLanguage(b.getAttribute("data-set-lang")); });
  });

  /* ---------------- Mobile menu ---------------- */
  var menuBtn = document.getElementById("menuBtn");
  var nav = document.getElementById("headerNav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () { nav.classList.toggle("open"); });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------------- Active nav link (home page only) ---------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove("active"); });
          map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.parentElement;
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (i) { i.classList.remove("open"); i.querySelector(".faq-q").setAttribute("aria-expanded", "false"); });
      if (!open) { item.classList.add("open"); q.setAttribute("aria-expanded", "true"); }
    });
  });

  /* ---------------- Hero audio: starts ONLY after "Explore Music" is clicked ---------------- */
  var audio = document.getElementById("heroAudio");
  var mini = document.getElementById("miniPlayer");
  var miniBtn = document.getElementById("miniPlay");
  function setMini(playing) { if (miniBtn) miniBtn.textContent = playing ? "❚❚" : "▶"; }
  if (audio) {
    audio.addEventListener("play", function () { setMini(true); });
    audio.addEventListener("pause", function () { setMini(false); });
    audio.addEventListener("ended", function () { setMini(false); });
  }
  window.startAudioExperience = function (ev) {
    if (ev) ev.preventDefault();
    var story = document.getElementById("storyVideo");
    if (story && !story.paused) story.pause();
    if (audio) {
      audio.currentTime = 0;
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
      if (mini) mini.classList.add("show");
    }
    var target = document.getElementById("music");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  if (miniBtn && audio) miniBtn.addEventListener("click", function () { audio.paused ? audio.play() : audio.pause(); });
  var miniClose = document.getElementById("miniClose");
  if (miniClose && audio) miniClose.addEventListener("click", function () { audio.pause(); mini.classList.remove("show"); });

  /* ---------------- Our Story video: plays in place, never opens YouTube ---------------- */
  window.playStoryVideo = function () {
    var v = document.getElementById("storyVideo");
    if (!v) return;
    if (audio && !audio.paused) audio.pause();
    var box = document.getElementById("storyVideoBox");
    if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  };
  var sv = document.getElementById("storyVideo");
  if (sv) sv.addEventListener("play", function () { if (audio && !audio.paused) audio.pause(); });

  /* ---------------- Daily thought ---------------- */
  var QUOTES = [
    { en: "Music gives feeling a voice beyond words.", bn: "সঙ্গীত অনুভূতিকে এমন এক কণ্ঠ দেয়, যা শব্দেরও অতীত।" },
    { en: "A song carries the heart of a people across generations.", bn: "একটি গান এক জাতির হৃদয়কে প্রজন্ম থেকে প্রজন্মে বয়ে নিয়ে চলে।" },
    { en: "To listen with attention is the first step of every practice.", bn: "মন দিয়ে শোনাই সব সাধনার প্রথম ধাপ।" },
    { en: "Where words end, a melody quietly begins.", bn: "যেখানে কথা থেমে যায়, সেখানেই সুর নীরবে শুরু হয়।" },
    { en: "Every raga is an invitation to stillness.", bn: "প্রতিটি রাগ নীরবতার প্রতি এক আমন্ত্রণ।" }
  ];
  var qi = 0;
  window.renderQuote = function (animate) {
    var box = document.getElementById("quoteInner");
    if (!box) return;
    var lang = document.documentElement.getAttribute("data-lang") === "bn" ? "bn" : "en";
    var apply = function () {
      document.getElementById("quoteText").textContent = QUOTES[qi][lang];
      box.classList.remove("fade");
    };
    if (animate) { box.classList.add("fade"); setTimeout(apply, 250); } else { apply(); }
  };
  window.nextQuote = function () { qi = (qi + 1) % QUOTES.length; window.renderQuote(true); };

  /* ---------------- Share with Swarabitan (form page) ---------------- */
  var page = document.getElementById("sharePage");
  var form = document.getElementById("communityForm");
  var returnTarget = "#bom";
  var CONFIG = {
    story:      { pick: "life",       back: "#bom" },
    moment:     { pick: "moment",     back: "#moments" },
    experience: { pick: "experience", back: "#voices" }
  };
  function scrollToHash(h) {
    var el = document.querySelector(h);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.openSharePage = function (type) {
    if (!page) return;
    var c = CONFIG[type] || CONFIG.story;
    returnTarget = c.back;
    form.reset();
    var ok = document.getElementById("formSuccess");
    ok.classList.remove("show");
    form.querySelector("[type=submit]").disabled = false;
    var box = form.querySelector('input[name="share_type"][value="' + c.pick + '"]');
    if (box) box.checked = true;
    page.classList.add("open");
    page.scrollTop = 0;
    document.body.classList.add("lock");
  };
  window.closeSharePage = function (goBack) {
    if (!page) return;
    page.classList.remove("open");
    document.body.classList.remove("lock");
    if (goBack !== false) setTimeout(function () { scrollToHash(returnTarget); }, 120);
  };
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (page && page.classList.contains("open")) window.closeSharePage();
      var m = document.getElementById("videoModal");
      if (m && m.classList.contains("open") && window.closeVideo) window.closeVideo();
    }
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("[type=submit]");
      btn.disabled = true;
      var done = function () {
        document.getElementById("formSuccess").classList.add("show");
        setTimeout(function () { window.closeSharePage(true); }, 2600);
      };
      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
          .then(done).catch(done);
      } else {
        done();
      }
    });

    /* voice message: record or upload */
    var recBtn = document.getElementById("recBtn");
    var recStatus = document.getElementById("recStatus");
    var voiceInput = document.getElementById("voice");
    var rec = null, chunks = [];
    if (recBtn) {
      if (!(navigator.mediaDevices && window.MediaRecorder)) { recBtn.style.display = "none"; }
      recBtn.addEventListener("click", function () {
        if (rec && rec.state === "recording") { rec.stop(); return; }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
          chunks = [];
          rec = new MediaRecorder(stream);
          rec.ondataavailable = function (ev) { if (ev.data.size) chunks.push(ev.data); };
          rec.onstop = function () {
            stream.getTracks().forEach(function (t) { t.stop(); });
            try {
              var file = new File(chunks, "voice-message.webm", { type: rec.mimeType || "audio/webm" });
              var dt = new DataTransfer(); dt.items.add(file); voiceInput.files = dt.files;
            } catch (err) {}
            recBtn.querySelector(".rec-idle").style.display = "";
            recBtn.querySelector(".rec-live").style.display = "none";
            recStatus.style.display = "none";
          };
          rec.start();
          recBtn.querySelector(".rec-idle").style.display = "none";
          recBtn.querySelector(".rec-live").style.display = "";
          recStatus.style.display = "";
        }).catch(function () {});
      });
    }
  }

  /* ---------------- Init ---------------- */
  window.setLanguage(getLang());
})();
