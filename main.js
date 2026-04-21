// main.js
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // =========================
  // Mobile menu
  // =========================
  const burger = $(".burger");
  const mobile = $(".mobile");

  function closeMobileMenu() {
    if (!burger || !mobile) return;
    burger.setAttribute("aria-expanded", "false");
    mobile.hidden = true;
  }

  function toggleMobileMenu() {
    if (!burger || !mobile) return;
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!isOpen));
    mobile.hidden = isOpen;
  }

  if (burger && mobile) {
    burger.addEventListener("click", toggleMobileMenu);

    mobile.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      closeMobileMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileMenu();
    });
  }

  // =========================
  // Smooth scroll for anchors
  // =========================
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const id = a.getAttribute("href");
    if (!id || id === "#") return;

    const target = $(id);
    if (!target) return;

    e.preventDefault();
    closeMobileMenu();

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", id);
  });

  // =========================
  // Reveal on scroll
  // =========================
  const revealEls = $$(".reveal");

  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.12 }
      );

      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  // =========================
  // Pricing accordions
  // =========================
  $$('[data-accordion]').forEach((acc) => {
    const buttons = $$('[data-acc]', acc);

    const closeAll = () => {
      buttons.forEach((btn) => {
        btn.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");

        const panel = btn.nextElementSibling;
        if (panel && panel.matches('[data-panel]')) {
          panel.style.maxHeight = "0px";
        }
      });
    };

    const openBtn = (btn) => {
      btn.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");

      const panel = btn.nextElementSibling;
      if (panel && panel.matches('[data-panel]')) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    };

    const goToRequest = () => {
      const target = document.querySelector("#request");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#request");
    };

    buttons.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
      const panel = btn.nextElementSibling;
      if (panel && panel.matches('[data-panel]')) {
        panel.style.maxHeight = "0px";
      }

      btn.addEventListener("click", () => {
        const wasOpen = btn.classList.contains("is-open");
        closeAll();
        if (!wasOpen) openBtn(btn);

        setTimeout(goToRequest, 150);
      });
    });
  });

  // =========================
  // Request form: real email sending via FormSubmit
  // =========================
  const form = $("#leadForm");
  const formHint = $("#formHint");

  if (form) {
    const nameInput = $('input[name="name"]', form);
    const phoneInput = $('input[name="phone"]', form);
    const ageInput = $('input[name="age"]', form);
    const examSelect = $('select[name="exam"]', form);
    const submitBtn = $('button[type="submit"]', form);

    const setError = (el, msg) => {
      if (!el) return;
      el.dataset.error = msg;
      el.classList.add("is-error");
    };

    const clearError = (el) => {
      if (!el) return;
      el.dataset.error = "";
      el.classList.remove("is-error");
    };

    const setHint = (msg, isError = false) => {
      if (!formHint) return;
      formHint.textContent = msg;
      formHint.style.color = isError ? "#8E1414" : "#2f6b3b";
    };

    const normalizePhone = (val) => val.replace(/[^\d+]/g, "");

    phoneInput?.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/[^\d+()\-\s]/g, "");
      clearError(phoneInput);
    });

    [nameInput, ageInput, examSelect].forEach((el) => {
      el?.addEventListener("input", () => clearError(el));
      el?.addEventListener("change", () => clearError(el));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setHint("");

      let ok = true;

      if (nameInput) {
        const v = nameInput.value.trim();
        if (v.length < 2) {
          setError(nameInput, "Введите имя (минимум 2 символа)");
          ok = false;
        } else {
          clearError(nameInput);
        }
      }

      if (phoneInput) {
        const v = normalizePhone(phoneInput.value.trim());
        const digits = v.replace(/\D/g, "");
        if (digits.length < 10) {
          setError(phoneInput, "Введите корректный номер телефона");
          ok = false;
        } else {
          clearError(phoneInput);
        }
      }

      if (ageInput) {
        const v = ageInput.value.trim();
        const n = Number(v.replace(/[^\d]/g, ""));
        if (!n || n < 9 || n > 25) {
          setError(ageInput, "Укажите возраст (9–25)");
          ok = false;
        } else {
          clearError(ageInput);
        }
      }

      if (examSelect) {
        const v = (examSelect.value || "").trim();
        if (!v) {
          setError(examSelect, "Выберите вариант");
          ok = false;
        } else {
          clearError(examSelect);
        }
      }

      if (!ok) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "отправка...";
      }

      try {
        const formData = new FormData();

        formData.append("Имя", nameInput.value.trim());
        formData.append("Телефон", phoneInput.value.trim());
        formData.append("Возраст ученика", ageInput.value.trim());
        formData.append("Направление подготовки", examSelect.options[examSelect.selectedIndex].text);

        formData.append("_subject", "Новая заявка с сайта репетитора");
        formData.append("_captcha", "false");
        formData.append("_template", "table");

        const response = await fetch("https://formsubmit.co/ajax/egor.iva.work@gmail.com", {
          method: "POST",
          headers: {
            Accept: "application/json"
          },
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          setHint("Заявка успешно отправлена");
          form.reset();
        } else {
          setHint("Не удалось отправить заявку. Попробуйте ещё раз.", true);
        }
      } catch (error) {
        setHint("Ошибка отправки. Проверьте интернет и попробуйте снова.", true);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "отправить";
        }
      }
    });
  }

  // =========================
  // UX: highlight active nav section
  // =========================
  const sections = ["#lessons", "#cases", "#reviews", "#pricing", "#about", "#contacts"]
    .map((id) => $(id))
    .filter(Boolean);

  const navLinks = $$('.nav__link[href^="#"], .mobile__link[href^="#"]');

  if (sections.length && "IntersectionObserver" in window) {
    const setActive = (id) => {
      navLinks.forEach((a) => {
        const href = a.getAttribute("href");
        a.classList.toggle("is-active", href === id);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActive("#" + visible.target.id);
        }
      },
      { threshold: [0.2, 0.35, 0.5, 0.65] }
    );

    sections.forEach((s) => io.observe(s));
  }
})();

// =========================
// Reviews slider
// =========================
(() => {
  const root = document.querySelector(".reviews");
  if (!root) return;

  const viewport = root.querySelector(".reviews__viewport");
  const cards = Array.from(root.querySelectorAll(".review-card"));
  const prev = root.querySelector(".reviews__btn--prev");
  const next = root.querySelector(".reviews__btn--next");

  if (!viewport || cards.length === 0) return;

  const getStep = () => {
    const first = cards[0];
    const style = window.getComputedStyle(root.querySelector(".reviews__track"));
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const scrollToIndex = (idx) => {
    idx = Math.max(0, Math.min(cards.length - 1, idx));
    const step = getStep();
    viewport.scrollTo({ left: step * idx, behavior: "smooth" });
  };

  const getIndex = () => {
    const step = getStep();
    return Math.round(viewport.scrollLeft / step);
  };

  const updateButtons = () => {
    const i = getIndex();
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= cards.length - 1;
  };

  prev?.addEventListener("click", () => scrollToIndex(getIndex() - 1));
  next?.addEventListener("click", () => scrollToIndex(getIndex() + 1));

  viewport.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateButtons);
  });

  let snapTimer = null;
  viewport.addEventListener("scroll", () => {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => scrollToIndex(getIndex()), 120);
  });

  updateButtons();
})();

// =========================
// Scroll to top button
// =========================
(() => {
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (!scrollTopBtn) return;

  const toggle = () => {
    if (window.scrollY > 400) scrollTopBtn.classList.add("is-visible");
    else scrollTopBtn.classList.remove("is-visible");
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();