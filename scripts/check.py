"""Confere o index.html antes de publicar.

    python scripts/check.py           pares PT/EN, ids, ancoras, popovers, imagens e arquivos locais
    python scripts/check.py --links   tambem abre cada link externo

Regra dos idiomas: todo elemento com lang="pt-BR" precisa ter, logo em seguida,
um irmao da mesma tag com lang="en" (e vice-versa). O CSS esconde o par inativo.
"""
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
BLOQUEIAM_ROBOS = ("linkedin.com",)  # respondem 999 para scripts; o link funciona no navegador


class No:
    def __init__(self, tag, attrs, pai, linha):
        self.tag, self.attrs, self.pai, self.linha, self.filhos = tag, dict(attrs), pai, linha, []


class Arvore(HTMLParser):
    def __init__(self):
        super().__init__()
        self.raiz = self.atual = No("#raiz", [], None, 0)
        self.nos = []

    def handle_starttag(self, tag, attrs):
        no = No(tag, attrs, self.atual, self.getpos()[0])
        self.atual.filhos.append(no)
        self.nos.append(no)
        if tag not in VOID:
            self.atual = no

    def handle_endtag(self, tag):
        no = self.atual
        while no.pai and no.tag != tag:
            no = no.pai
        if no.pai:
            self.atual = no.pai


def checar_pares(nos, erros):
    pares = 0
    for no in nos:
        lang = no.attrs.get("lang")
        if no.tag == "html" or lang not in ("pt-BR", "en"):
            continue
        irmaos = no.pai.filhos
        i = irmaos.index(no)
        if lang == "pt-BR":
            par = irmaos[i + 1] if i + 1 < len(irmaos) else None
            esperado = "en"
            pares += 1
        else:
            par = irmaos[i - 1] if i > 0 else None
            esperado = "pt-BR"
        if par is None or par.tag != no.tag or par.attrs.get("lang") != esperado:
            erros.append(f"linha {no.linha}: <{no.tag} lang={lang}> sem o par <{no.tag} lang={esperado}> ao lado")
    return pares


def checar_estrutura(nos, erros):
    ids = {}
    for no in nos:
        if "id" in no.attrs:
            if no.attrs["id"] in ids:
                erros.append(f"linha {no.linha}: id repetido '{no.attrs['id']}'")
            ids[no.attrs["id"]] = no
    for no in nos:
        href = no.attrs.get("href") or ""
        if no.tag == "a" and href.startswith("#") and len(href) > 1 and href[1:] not in ids:
            erros.append(f"linha {no.linha}: ancora {href} nao existe")
        if "popovertarget" in no.attrs and no.attrs["popovertarget"] not in ids:
            erros.append(f"linha {no.linha}: popovertarget '{no.attrs['popovertarget']}' nao existe")
        if no.tag == "img" and "alt" not in no.attrs:
            erros.append(f"linha {no.linha}: <img> sem alt")
        if no.tag == "a" and no.attrs.get("target") == "_blank" and "noopener" not in (no.attrs.get("rel") or ""):
            erros.append(f"linha {no.linha}: link externo sem rel=noopener")
        local = no.attrs.get("src") or (href if no.tag in ("link", "a") else "")
        if local and not local.startswith(("http:", "https:", "mailto:", "#", "data:")):
            caminho = ROOT / local.split("?")[0].split("#")[0]
            if not caminho.exists():
                erros.append(f"linha {no.linha}: arquivo nao encontrado: {local}")


def checar_links(nos, erros):
    urls = sorted({no.attrs[a] for no in nos for a in ("href", "src")
                   if no.tag in ("a", "img") and no.attrs.get(a, "").startswith("http")})
    for url in urls:
        if any(d in url for d in BLOQUEIAM_ROBOS):
            print(f"  (pulado: {url} bloqueia robos)")
            continue
        pedido = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(pedido, timeout=20) as r:
                print(f"  {r.status} {url}")
        except Exception as e:
            erros.append(f"link quebrado: {url} ({e})")


def main():
    arvore = Arvore()
    arvore.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    erros = []
    pares = checar_pares(arvore.nos, erros)
    checar_estrutura(arvore.nos, erros)
    if "--links" in sys.argv:
        checar_links(arvore.nos, erros)
    for e in erros:
        print("ERRO", e)
    if erros:
        sys.exit(f"{len(erros)} problema(s).")
    print(f"OK: {len(arvore.nos)} elementos, {pares} pares PT/EN.")


if __name__ == "__main__":
    main()
