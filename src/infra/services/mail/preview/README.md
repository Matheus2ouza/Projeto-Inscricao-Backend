# Email Preview

Ambiente local para visualizar os templates React de e-mail sem precisar enviá-los via SMTP.

## Executando

```bash
npm run email:preview
```

O comando inicia um servidor (porta padrão `3900`) e abre o navegador automaticamente. Qualquer alteração salva em `src/infra/services/mail/templates/` recarrega o preview.

É possível alterar porta/host exportando variáveis:

```bash
EMAIL_PREVIEW_PORT=4000 EMAIL_PREVIEW_HOST=0.0.0.0 npm run email:preview
```

## Estrutura

- `template-registry.ts`: lista os templates disponíveis, configura os mocks e aponta para o componente React correspondente.
- `server.tsx`: inicializa o servidor Express, renderiza os templates com `@react-email/render` e monta a interface do preview usando `@react-email/preview`.

## Adicionando templates

1. Crie o componente em `src/infra/services/mail/templates/<categoria>/<nome>/index.tsx`.
2. Registre o template no array `templateDefinitions` (arquivo `template-registry.ts`) informando título, descrição, loader e os dados mock necessários (`getProps`).
3. Reinicie o preview ou salve os arquivos para que o hot reload recarregue a interface.

Pronto! O template aparecerá automaticamente na lista agrupado por categoria.
