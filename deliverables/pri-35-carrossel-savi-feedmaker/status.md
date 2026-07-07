# PRI-35 - Status do carrossel completo

## Fonte usada

- Brief: `deliverables/pri-27-carrossel-savi-feedmaker.md`
- Tema: Savi Security, golpes com IA e governanca operacional
- Linha editorial: noticias / licao de sistema para empresarios
- Data: 2026-07-07

## Entrega concluida

- Conteudo aplicado em 9 slides no padrao visual @oeduardo.1.
- HTML base criado em `carrossel.html` para PRI-35.
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

Esta entrega de PRI-35 reaproveita a arte final ja gerada e validada para o mesmo brief de PRI-27, mantendo os arquivos em pasta propria para facilitar revisao e publicacao. Se for necessario recapturar os PNGs, usar `capture_slides.js`; ele aponta para o HTML local desta entrega.
