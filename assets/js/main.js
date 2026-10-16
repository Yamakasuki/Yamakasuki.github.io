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
