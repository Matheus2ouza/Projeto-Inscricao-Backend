import { Preview } from '@react-email/preview';
import { render } from '@react-email/render';
import { spawn } from 'child_process';
import express from 'express';
import React, { type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  findTemplate,
  templateDefinitions,
  templatesByCategory,
  type TemplateDefinition,
} from './template-registry';

const DEFAULT_PORT = Number(process.env.EMAIL_PREVIEW_PORT ?? 3900);
const HOST = process.env.EMAIL_PREVIEW_HOST ?? '127.0.0.1';
const app = express();

app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  next();
});

app.get('/', (_req, res) => {
  const markup = renderPage(<IndexPage />);
  res.send(htmlDocument(markup, 'Email Preview'));
});

app.get('/templates/:category/:name', async (req, res) => {
  const { category, name } = req.params;
  const template = findTemplate(category, name);

  if (!template) {
    const markup = renderPage(
      <main className="container">
        <h1>Template não encontrado</h1>
        <p>Verifique o endereço e tente novamente.</p>
        <p>
          <a href="/">Voltar para a lista</a>
        </p>
      </main>,
    );
    res.status(404).send(htmlDocument(markup, 'Template não encontrado'));
    return;
  }

  try {
    const emailHtml = await renderEmailTemplate(template);
    const markup = renderPage(
      <TemplatePreviewPage template={template} emailHtml={emailHtml} />,
    );
    res.send(htmlDocument(markup, template.title));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao renderizar template';
    const markup = renderPage(
      <main className="container">
        <h1>Erro ao renderizar template</h1>
        <p>{message}</p>
        <p>
          <a href="/">Voltar para a lista</a>
        </p>
      </main>,
    );
    res.status(500).send(htmlDocument(markup, 'Erro ao renderizar template'));
  }
});

app.get('/api/templates', (_req, res) => {
  res.json(templateDefinitions);
});

const server = app.listen(DEFAULT_PORT, HOST, () => {
  const url = `http://${HOST}:${DEFAULT_PORT}`;
  // eslint-disable-next-line no-console
  console.log(`📬 Email preview disponível em ${url}`);
  openInBrowser(url);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

async function renderEmailTemplate(
  template: TemplateDefinition,
): Promise<string> {
  const module = await template.loader();
  const Component = module.default;
  if (typeof Component !== 'function') {
    throw new Error(
      `Template "${template.id}" não exporta um componente padrão.`,
    );
  }
  const props = template.getProps();
  return await render(React.createElement(Component, props));
}

function renderPage(node: ReactNode) {
  return renderToStaticMarkup(node);
}

const styles = `
  :root {
    color-scheme: light;
    --bg: #f5f7fb;
    --bg-surface: #ffffff;
    --border: #d9e2f3;
    --accent: #0284c7;
    --text: #1f2533;
    --text-muted: #475569;
    --shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
    --radius: 16px;
  }
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: var(--bg);
    color: var(--text);
  }
  a {
    color: var(--accent);
  }
  code {
    background-color: rgba(2, 132, 199, 0.08);
    padding: 0 6px;
    border-radius: 6px;
    font-size: 13px;
  }
  .container {
    width: min(960px, 94vw);
    margin: 0 auto;
    padding: 48px 0 72px;
  }
  header h1 {
    margin-bottom: 6px;
    font-size: 32px;
  }
  header p {
    margin-top: 0;
    color: var(--text-muted);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-top: 24px;
  }
  .card {
    background-color: var(--bg-surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .card h2, .card h3 {
    margin: 0;
    font-size: 18px;
  }
  .card p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.5;
  }
  .link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    text-decoration: none;
    margin-top: auto;
  }
  .link:hover {
    text-decoration: underline;
  }
  .preview-wrapper {
    display: grid;
    gap: 16px;
  }
  .frame {
    width: 100%;
    min-height: 80vh;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    background-color: #fff;
  }
  .tag {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 10px;
    border-radius: 999px;
    background-color: #e0f2fe;
    color: #0369a1;
  }
  footer {
    margin-top: 48px;
    color: var(--text-muted);
    font-size: 13px;
  }
  iframe {
    border: none;
  }
  @media (max-width: 768px) {
    header h1 {
      font-size: 26px;
    }
  }
`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const htmlDocument = (body: string, title: string) => `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>${styles}</style>
  </head>
  <body>${body}</body>
</html>`;

const IndexPage = () => (
  <main className="container">
    <header>
      <h1>Preview de E-mails</h1>
      <p>
        Visualize os templates React de e-mail renderizados com dados simulados.
        As alterações são recarregadas automaticamente.
      </p>
    </header>

    {Object.entries(templatesByCategory).map(([category, templates]) => (
      <section key={category} style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '12px', textTransform: 'capitalize' }}>
          {category}
        </h2>
        <div className="grid">
          {templates.map((template) => (
            <article key={template.id} className="card">
              <span className="tag">{category}</span>
              <h3>{template.title}</h3>
              {template.description ? <p>{template.description}</p> : null}
              {template.previewText ? (
                <Preview>{template.previewText}</Preview>
              ) : null}
              <a className="link" href={`/templates/${template.id}`}>
                Abrir preview
              </a>
            </article>
          ))}
        </div>
      </section>
    ))}

    <footer>
      <p>
        Para adicionar um novo template, inclua o componente em
        <code> src/infra/services/mail/templates/</code> e registre o mock
        correspondente em
        <code> preview/template-registry.ts</code>.
      </p>
    </footer>
  </main>
);

interface TemplatePreviewPageProps {
  template: TemplateDefinition;
  emailHtml: string;
}

const TemplatePreviewPage = ({
  template,
  emailHtml,
}: TemplatePreviewPageProps) => (
  <main className="container">
    <a href="/" className="link" style={{ marginBottom: '16px' }}>
      Voltar para lista
    </a>
    <header>
      <h1>{template.title}</h1>
      {template.description ? <p>{template.description}</p> : null}
    </header>

    <div className="preview-wrapper">
      <iframe
        title={template.title}
        className="frame"
        srcDoc={emailHtml}
        sandbox="allow-same-origin allow-top-navigation-by-user-activation"
      />
    </div>
  </main>
);

function openInBrowser(url: string) {
  if (process.env.CI === 'true') {
    return;
  }
  const platform = process.platform;
  let command: string;
  let args: string[] = [];

  if (platform === 'darwin') {
    command = 'open';
    args = [url];
  } else if (platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  const child = spawn(command, args, {
    stdio: 'ignore',
    detached: true,
  });
  child.unref();
}
