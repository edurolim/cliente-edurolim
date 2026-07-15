# PRI-80 - Status do carrossel

- Base editorial: `deliverables/pri-79-carrossel-bcg-ia-transformacao.md`
- Insumo de pesquisa: `08-pesquisa/pesquisa-diaria-ia-2026-07-15-pri-78.md`
- Padrão visual aplicado: `carrossel-edurolim-2026-julho`
- Estrutura: 9 slides obrigatórios da skill
- Arquivos do pacote:
  - `carrossel.html`
  - `image-prompts.md`
  - `generate_images.js`
  - `render_pngs.js`
  - `capture_slides.js`
  - `legenda.txt`
  - `review-request.md`
  - `review-result.md`
  - `img/`
  - `png/`

## Estado atual

- Estrutura editorial convertida para 9 slides com tese central: o erro não é testar IA; é chamar teste de transformação.
- Slide 2 cumpre o papel de `Contexto` com distinção clara entre piloto e transformação operacional.
- HTML final montado no template fixo da skill, mantendo hierarquia forte, contraste e destaques em verde.
- Prompts de imagem definidos para os slides 01, 02, 05, 06, 07 e 08.
- Imagens finais geradas via Gemini para os slides 01, 02, 05, 06, 07 e 08.
- PNGs finais exportados de `slide_01.png` a `slide_09.png` em `1080x1350`.
- `contact-sheet.png` gerado a partir dos 9 PNGs finais do próprio pacote.
- Check visual local concluído em capa, ritmo narrativo, legibilidade mobile, contraste e encaixe de texto.

## Revisão de layout

- Status da revisão: `PENDENTE`
- Revisor alvo: `Revisor de Carrossel e Layout`
- Reviewer id: `6e0fcb4e-e2e8-48c9-a9e4-60ac05859f62`
- Gate obrigatório antes de marcar a issue como `done`.

## Handoff de revisão

- Pacote a revisar: `deliverables/pri-80-carrossel-bcg-ia-transformacao/`
- HTML final: `deliverables/pri-80-carrossel-bcg-ia-transformacao/carrossel.html`
- PNGs finais: `deliverables/pri-80-carrossel-bcg-ia-transformacao/png/slide_01.png` a `slide_09.png`
- Contact sheet: `deliverables/pri-80-carrossel-bcg-ia-transformacao/png/contact-sheet.png`
- Legenda: `deliverables/pri-80-carrossel-bcg-ia-transformacao/legenda.txt`
- Checklist-base: `deliverables/pri-48-checklist-revisor-layout.md`
- Resultado esperado do gate: marcar `APROVADO` ou `REPROVADO`, citando slide afetado e ajuste pedido se houver retrabalho.

## Gate de encerramento

- O erro de adapter/modelo (`gpt-5` incompatível com conta ChatGPT no Codex local) não altera o estado real do entregável; o pacote visual segue pronto para revisão.
- O fechamento correto desta issue passa por work product na task, handoff ao `Revisor de Carrossel e Layout` (`6e0fcb4e-e2e8-48c9-a9e4-60ac05859f62`) e status `in_review` enquanto a aprovação estiver pendente.

## Git

- Branch local: `main`
- Commit local do pacote: `PENDENTE`
- Repositório: `https://github.com/edurolim/cliente-edurolim`
- Push remoto: `PENDENTE`
