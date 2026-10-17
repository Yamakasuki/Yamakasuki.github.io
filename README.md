# Portfólio — Gabriel Hideki Yamamoto

Site pessoal publicado em **https://yamakasuki.github.io/**, em português e inglês
(versão em inglês: https://yamakasuki.github.io/?lang=en).

Desenvolvedor de software com foco em IA na Samsung Research Brasil · Engenharia da
Computação na PUC-Campinas.

## Estrutura

```text
index.html            conteúdo do site (página única)
assets/css/style.css  visual: tema escuro e layout responsivo
assets/js/main.js     troca PT/EN, menu, links para a prova, copiar e-mail e animações
assets/img/           foto, print do dashboard IoT, ícone e imagem de prévia (og.png)
scripts/check.py      verificação antes de publicar
```

Sem framework e sem etapa de build: o GitHub Pages serve os arquivos como estão.

## Como a página guia a leitura

- **Menu que acompanha a leitura:** no desktop, um destaque desliza até a seção
  atual; no celular, o topo mostra o nome da seção num botão que abre a lista
  de seções. Uma barra fina no topo mostra quanto já foi lido.
- **Toda afirmação leva à prova:** as áreas do grafo da abertura, os números e
  o índice de projetos são links para o trecho que os comprova. O cartão de
  destino acende ao chegar. Para mudar um destino, troque o `href` pelo `id` do
  cartão (`#frente-…`, `#projeto-…`, `#samsung`, `#ic`).
- **Diagramas vivos:** um pulso de luz percorre as etapas de cada diagrama, e a
  linha da trajetória se desenha conforme a rolagem.
- **Copiar e-mail:** os botões de copiar confirmam com um aviso, porque muitos
  computadores de empresa não abrem links `mailto:`.

Movimento só para quem não pediu menos movimento: deslocamentos e animações
contínuas ficam em blocos `@media (prefers-reduced-motion: no-preference)` no
CSS. Mudanças de cor valem para todos.

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
