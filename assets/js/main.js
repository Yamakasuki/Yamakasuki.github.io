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

// Troca o idioma sem perder o ponto de leitura: os textos mudam de altura, então
// o trecho que estava logo abaixo do topo é recolocado no mesmo lugar.
function trocarIdioma(lang) {
  if (lang === root.dataset.lang) return;
  const y = document.querySelector(".topbar").getBoundingClientRect().bottom + 8;
  const ponto = document.elementFromPoint(innerWidth / 2, y);
  const trecho = ponto && !ponto.matches("html, body, main") ? ponto.closest("[lang]:not(html)") || ponto : null;
  const antes = trecho && trecho.getBoundingClientRect();
  root.style.overflowAnchor = "none";
  definirIdioma(lang, true);
  if (trecho && antes.height) {
    const fracao = (y - antes.top) / antes.height;
    const origem = trecho.getAttribute("lang");
    const par = origem === "pt-BR" ? trecho.nextElementSibling : origem === "en" ? trecho.previousElementSibling : trecho;
    const depois = par.getBoundingClientRect();
    scrollBy(0, depois.top + fracao * depois.height - y);
  }
  requestAnimationFrame(() => { root.style.overflowAnchor = ""; });
  moverIndicador(); // os nomes do menu mudam de largura
}

for (const b of document.querySelectorAll("[data-set-lang]")) {
  b.addEventListener("click", () => trocarIdioma(b.dataset.setLang));
}
definirIdioma(root.dataset.lang === "en" ? "en" : "pt", false);

// Blocos aparecem ao entrar na tela (desligado para quem prefere menos movimento).
let aparecer = null;
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  aparecer = new IntersectionObserver((entradas) => {
    let ordem = 0; // blocos que entram juntos (cartões lado a lado) aparecem em sequência
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.style.transitionDelay = Math.min(ordem++, 4) * 90 + "ms";
      el.addEventListener("transitionend", function fim(ev) {
        if (ev.target !== el) return;
        el.style.transitionDelay = "";
        el.removeEventListener("transitionend", fim);
      });
      el.classList.add("is-in");
      aparecer.unobserve(el);
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  for (const el of document.querySelectorAll("[data-reveal]")) aparecer.observe(el);
  if (location.hash.length > 1) revelarJa(document.getElementById(decodeURIComponent(location.hash.slice(1))));
  root.classList.add("reveal");
}

// Mostra na hora o bloco de destino de um link interno. Ainda escondido, ele está
// 18 px abaixo do lugar, e a rolagem até a âncora pararia fora do ponto.
function revelarJa(alvo) {
  if (!aparecer || !alvo) return;
  const blocos = [];
  for (let el = alvo.closest("[data-reveal]"); el; el = el.parentElement?.closest("[data-reveal]")) {
    if (!el.classList.contains("is-in")) blocos.push(el);
  }
  for (const el of blocos) { el.style.transition = "none"; el.classList.add("is-in"); aparecer.unobserve(el); }
  if (!blocos.length) return;
  void alvo.offsetWidth;
  for (const el of blocos) el.style.transition = "";
}

// Seção atual (a que cruza o meio da tela): marca o link no menu, desliza o
// indicador até ele e, no celular, mostra o nome da seção no botão do menu.
const nav = document.querySelector(".nav");
const indicador = nav.querySelector(".nav__ind");
const menu = document.getElementById("menu");
const botaoMenu = document.querySelector(".secao");
const rotulo = botaoMenu.querySelector(".secao__atual");
const linksSecao = [...document.querySelectorAll(".nav a, .menu__lista a")];
let secaoAtual = null;

function moverIndicador() {
  const a = nav.querySelector('a[aria-current="true"]');
  if (!a || !a.offsetWidth) { nav.classList.remove("tem-ind"); return; }
  const surgindo = !nav.classList.contains("tem-ind"); // aparece no lugar, sem deslizar
  if (surgindo) indicador.style.transition = "none";
  nav.style.setProperty("--ind-x", a.offsetLeft + "px");
  nav.style.setProperty("--ind-w", a.offsetWidth + "px");
  nav.classList.add("tem-ind");
  if (surgindo) { void indicador.offsetWidth; indicador.style.transition = ""; }
}

function marcarSecao(id) {
  const primeira = secaoAtual === null;
  secaoAtual = id;
  for (const a of linksSecao) {
    if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  }
  moverIndicador();
  const item = menu.querySelector(`.menu__lista a[href="#${id}"]`);
  rotulo.replaceChildren(...(item ? [...item.querySelectorAll("[lang]")].map((s) => s.cloneNode(true)) : ["Menu"]));
  if (primeira) return;
  rotulo.classList.remove("troca");
  void rotulo.offsetWidth; // reinicia a animação da troca de nome
  rotulo.classList.add("troca");
}

if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting && e.target.id !== secaoAtual) marcarSecao(e.target.id);
  }, { rootMargin: "-45% 0px -50% 0px" });
  for (const s of document.querySelectorAll("main > section[id]")) observador.observe(s);
}
if ("ResizeObserver" in window) new ResizeObserver(moverIndicador).observe(nav);

// Menu do celular: fecha ao escolher uma seção. Sem a API de popover, abre por classe.
const temPopover = "popover" in HTMLElement.prototype;
function fecharMenu() {
  if (temPopover) menu.hidePopover();
  else { menu.classList.remove("aberto"); botaoMenu.setAttribute("aria-expanded", "false"); }
}
menu.addEventListener("click", (e) => { if (e.target.closest("a")) fecharMenu(); });
if (!temPopover) {
  botaoMenu.setAttribute("aria-expanded", "false");
  botaoMenu.addEventListener("click", () => {
    botaoMenu.setAttribute("aria-expanded", String(menu.classList.toggle("aberto")));
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".menu, .secao")) fecharMenu(); });
}

// Barra de progresso: o CSS cuida dela onde há animação ligada à rolagem; aqui, o reserva.
if (!CSS.supports("animation-timeline: scroll()")) {
  const barra = document.querySelector(".progresso");
  let agendado = false;
  const medir = () => {
    agendado = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    barra.style.setProperty("--progresso", max > 0 ? Math.min(1, scrollY / max) : 0);
  };
  addEventListener("scroll", () => { if (!agendado) { agendado = true; requestAnimationFrame(medir); } }, { passive: true });
  medir();
}

// Ao seguir um link interno até um cartão (área do grafo, número, índice), o
// cartão acende por um instante quando a rolagem termina.
function destacar(alvo) {
  if (!alvo || alvo.matches("section, main")) return;
  alvo.classList.remove("chegou");
  void alvo.offsetWidth; // reinicia a animação se o mesmo cartão for escolhido de novo
  alvo.classList.add("chegou");
}
function destacarAoChegar(alvo) {
  let feito = false;
  const fim = () => { if (!feito) { feito = true; destacar(alvo); } };
  addEventListener("scrollend", fim, { once: true });
  setTimeout(fim, 1200); // sem scrollend, ou quando o cartão já estava na tela
}
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  const alvo = a && a.hash.length > 1 && document.getElementById(decodeURIComponent(a.hash.slice(1)));
  if (!alvo) return;
  revelarJa(alvo); // antes de o navegador calcular a rolagem
  destacarAoChegar(alvo);
});
addEventListener("animationend", (e) => { if (e.animationName === "chegada") e.target.classList.remove("chegou"); });
if (location.hash.length > 1) destacarAoChegar(document.getElementById(decodeURIComponent(location.hash.slice(1))));

// Grafo da abertura: ao apontar para uma área, a legenda diz para onde ela leva.
const dica = document.querySelector(".graph__dica");
const destino = dica.querySelector(".graph__destino");
function mostrarDestino(a) {
  const alvo = document.getElementById(a.hash.slice(1));
  const titulo = alvo && [...alvo.querySelectorAll("h3, h4")].find((h) => !h.lang || h.lang === root.lang);
  if (!titulo) return;
  destino.textContent = "→ " + titulo.textContent.trim();
  dica.classList.add("tem-destino");
}
const esconderDestino = () => dica.classList.remove("tem-destino");
for (const a of document.querySelectorAll(".node a")) {
  a.addEventListener("pointerenter", () => mostrarDestino(a));
  a.addEventListener("focus", () => mostrarDestino(a));
  a.addEventListener("pointerleave", esconderDestino);
  a.addEventListener("blur", esconderDestino);
}

// Diagramas "como funciona": o pulso que percorre as etapas só roda com o
// diagrama na tela e recomeça da primeira etapa cada vez que ele aparece.
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const vivo = new IntersectionObserver((entradas) => {
    for (const e of entradas) e.target.classList.toggle("vivo", e.isIntersecting);
  }, { threshold: 0.3 });
  for (const d of document.querySelectorAll(".flow, .pipeline")) vivo.observe(d);
}
