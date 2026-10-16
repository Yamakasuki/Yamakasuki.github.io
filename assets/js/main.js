// Troca de idioma. Os textos existem em pares (lang="pt-BR" / lang="en") e o CSS
// esconde o par inativo. Atributos traduzíveis usam data-en-<atributo>.
const root = document.documentElement;
const titulo = document.querySelector("title");
const tituloPt = titulo.textContent;

const atributos = [];
for (const el of document.querySelectorAll("*")) {
  for (const { name, value } of el.attributes) {
    if (name.startsWith("data-en-")) {
      const attr = name.slice("data-en-".length);
      atributos.push([el, attr, el.getAttribute(attr), value]);
    }
  }
}

function definirIdioma(lang, salvar) {
  root.dataset.lang = lang;
  root.lang = lang === "en" ? "en" : "pt-BR";
  document.title = lang === "en" ? titulo.dataset.en : tituloPt;
  for (const [el, attr, pt, en] of atributos) el.setAttribute(attr, lang === "en" ? en : pt);
  for (const b of document.querySelectorAll("[data-set-lang]")) {
    b.setAttribute("aria-pressed", String(b.dataset.setLang === lang));
  }
  if (salvar) {
    try { localStorage.setItem("lang", lang); } catch (e) { /* navegação privada */ }
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url);
  }
}

for (const b of document.querySelectorAll("[data-set-lang]")) {
  b.addEventListener("click", () => definirIdioma(b.dataset.setLang, true));
}
definirIdioma(root.dataset.lang === "en" ? "en" : "pt", false);

// Blocos aparecem ao entrar na tela (desligado para quem prefere menos movimento).
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const aparecer = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        aparecer.unobserve(e.target);
      }
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  for (const el of document.querySelectorAll("[data-reveal]")) aparecer.observe(el);
  root.classList.add("reveal");
}

// Destaca no menu a seção que está no meio da tela.
const links = [...document.querySelectorAll(".nav a")];
if ("IntersectionObserver" in window) {
  const menu = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      for (const a of links) {
        if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  for (const a of links) {
    const alvo = document.querySelector(a.getAttribute("href"));
    if (alvo) menu.observe(alvo);
  }
}
