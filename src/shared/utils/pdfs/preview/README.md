```
# PDF Preview

Ambiente local para visualizar rapidamente os PDFs gerados pelas utilities. A ideia é parecida com o preview de e-mails, mas exibindo o PDF final em um iframe do navegador.

## Executando

```bash
npm run pdf:preview
```

O servidor sobe (porta padrão `3901`) e abre o navegador automaticamente. Alterações salvas nos geradores usados pelo preview recarregam a página ao atualizar o browser.

Você pode customizar host/porta:

```bash
PDF_PREVIEW_PORT=4100 PDF_PREVIEW_HOST=0.0.0.0 npm run pdf:preview
```

## Estrutura

- `pdf-registry.ts`: registra os PDFs disponíveis no preview e define dados mock para gerar cada um.
- `server.tsx`: servidor Express que lista os PDFs e incorpora o arquivo gerado em um `<iframe>`.
- `README.md`: este arquivo.

## Adicionando novos PDFs

1. Importe o gerador correspondente em `pdf-registry.ts` e crie a função `generate` com os dados mock desejados.
2. Adicione uma entrada em `pdfDefinitions` informando categoria, nome e descrição.
3. Rode `npm run pdf:preview` (ou recarregue o navegador, se já estiver rodando) para ver o novo item na lista.

Quando estiver satisfeito com o layout, o mesmo código será utilizado pelo fluxo real da aplicação.
