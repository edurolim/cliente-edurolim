# PRI-32 - Status do carrossel completo

## Fonte usada

- Brief: `deliverables/pri-27-carrossel-savi-feedmaker.md`
- Tema: Savi Security, golpes com IA e governanca operacional
- Linha editorial: noticias / licao de sistema para empresarios
- Data: 2026-07-07

## Entrega concluida

- Conteudo aplicado em 9 slides no padrao visual @oeduardo.1.
- HTML base criado em `carrossel.html`.
- Prompts fotorealistas por slide criados em `image-prompts.md`.
- Legenda sugerida criada em `legenda.txt`.
- Imagens base disponiveis em `img/slide_01.jpg` a `img/slide_09.jpg`.
- PNGs finais exportados em `png/slide_01.png` a `png/slide_09.png`.

## Validacao

- Conferi que os 9 PNGs finais estao em 1080x1350.
- Inspecionei visualmente a capa, um slide interno e o CTA final.
- O HTML referencia imagens locais, sem placeholders externos.
- A capa nao tem numeracao; os slides seguintes seguem de `1/8` a `8/8`.

## Observacao operacional

Ao retestar neste heartbeat, o script `capture_slides.js` nao pode ser reexecutado porque o pacote `playwright` nao esta instalado no ambiente Node local. Isso nao bloqueia a entrega atual, porque os PNGs finais ja estao presentes e foram validados por dimensao e inspecao visual.
