# Portfólio — Gabriel Hideki Yamamoto

Site pessoal publicado em **https://yamakasuki.github.io/**, em português e inglês
(versão em inglês: https://yamakasuki.github.io/?lang=en).

Desenvolvedor de software com foco em IA na Samsung Research Brasil · Engenharia da
Computação na PUC-Campinas.

## Estrutura

```text
index.html            conteúdo do site (página única)
assets/css/style.css  visual: tema escuro e layout responsivo
assets/js/main.js     troca PT/EN, blocos que aparecem ao rolar e menu ativo
assets/img/           foto, print do dashboard IoT, ícone e imagem de prévia (og.png)
scripts/check.py      verificação antes de publicar
```

Sem framework e sem etapa de build: o GitHub Pages serve os arquivos como estão.

## Como editar

Cada texto existe nos dois idiomas, lado a lado:

```html
<p lang="pt-BR">Texto em português</p>
<p lang="en">Text in English</p>
```

O CSS mostra só o idioma ativo. Atributos traduzíveis (`alt`, `aria-label`) usam
`data-en-<atributo>` com a versão em inglês.

## Antes de publicar

```sh
python scripts/check.py           # pares PT/EN, âncoras, imagens e arquivos locais
python scripts/check.py --links   # também testa os links externos
```

Para ver localmente: `python -m http.server` na pasta do repositório e abrir
http://localhost:8000.
