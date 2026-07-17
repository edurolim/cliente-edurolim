# PRI-89 - Resultado da revisão de layout

## Decisão

REPROVADO

## Falhas

1. Slide 1 - `capa-title` foi quebrado em 4 linhas (`SEU CONTEÚDO / AGORA PRECISA / CONVENCER PESSOAS / E MÁQUINAS.`), contrariando a skill `carrossel-edurolim-2026-julho`, que exige headline condensada em 1-2 linhas. Impacto: a capa perde força, foge do padrão obrigatório e vira leitura mais pesada no primeiro frame. Correção esperada: condensar a headline da capa e reequilibrar tamanho/largura para fechar em até 2 linhas sem colisão com pretitle e botão.
2. Slides 2 a 7 - falta a numeração de rodapé a partir do slide 2. A skill exige numeração no formato `1/total`, `2/total` e assim por diante, além da progress bar. Impacto: o pacote não segue literalmente os elementos obrigatórios do layout validado. Correção esperada: adicionar a numeração inferior em todos os slides internos e no CTA final, mantendo a progress bar já existente.

## Verificações aprovadas

- Estrutura adaptável de 7 slides é válida para este volume de texto; o `slide-mini-cta` não é obrigatório abaixo de 8 slides.
- Sequência de classes usada no miolo bate com a ordem adaptável da skill: `slide-capa -> slide-split -> slide-tipo-c -> slide-tipo-a -> slide-tipo-d -> slide-split -> slide-cta`.
- PNGs finais existem e estão em `1080x1350`.
- Imagens estão nítidas e sem crop ruim evidente na exportação final.
- Legenda, `review-request.md` e `status.md` existem no pacote.

## Referências

- Skill: `/home/paperclip/.paperclip/instances/default/skills/6ffadd7d-082c-4829-9faf-d5bd1388def8/__runtime__/carrossel-edurolim-2026-julho--b7b3cccea2/SKILL.md`
- HTML revisado: `deliverables/pri-89-carrossel-publicis-conteudo-maquinas/carrossel.html`
- Export final: `deliverables/pri-89-carrossel-publicis-conteudo-maquinas/png/`
