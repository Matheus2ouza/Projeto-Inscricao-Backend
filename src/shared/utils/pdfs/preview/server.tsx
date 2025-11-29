import { spawn } from 'child_process';
import express from 'express';
import path from 'node:path';
import { type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  categories,
  findPdfDefinition,
  pdfsByCategory,
  type PdfDefinition,
} from './pdf-registry';

const projectRoot = path.resolve(__dirname, '../../..');
process.chdir(projectRoot);

const DEFAULT_PORT = Number(process.env.PDF_PREVIEW_PORT ?? 3901);
const HOST = process.env.PDF_PREVIEW_HOST ?? '127.0.0.1';
const app = express();

app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  next();
});

app.get('/', (_req, res) => {
  const markup = renderPage(<IndexPage />);
  res.send(htmlDocument(markup, 'PDF Preview'));
});

app.get('/preview/:category/:name', (req, res) => {
  const { category, name } = req.params;
  const pdf = findPdfDefinition(category, name);

  if (!pdf) {
    const markup = renderPage(
      <main className="container">
        <h1>PDF não encontrado</h1>
        <p>Verifique o endereço e tente novamente.</p>
        <p>
          <a href="/">Voltar para a lista</a>
        </p>
      </main>,
    );
    res.status(404).send(htmlDocument(markup, 'PDF não encontrado'));
    return;
  }

  const markup = renderPage(<PdfPreviewPage definition={pdf} />);
  res.send(htmlDocument(markup, pdf.title));
});

app.get('/pdf/:category/:name', async (req, res) => {
  const { category, name } = req.params;
  const pdf = findPdfDefinition(category, name);

  if (!pdf) {
    res.status(404).send('PDF não encontrado');
    return;
  }

  try {
    const buffer = await pdf.generate();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${pdf.name}-preview.pdf"`,
    );
    res.send(buffer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao gerar PDF';
    // eslint-disable-next-line no-console
    console.error(
      `[PDF PREVIEW] Erro ao gerar "${pdf.title}":`,
      error instanceof Error ? error.stack : error,
    );
    res
      .status(500)
      .send(
        `<main style="font-family: sans-serif; padding: 32px;"><h1>Erro ao gerar PDF</h1><p>${message}</p><p>Confira o console para mais detalhes.</p></main>`,
      );
  }
});

const server = app.listen(DEFAULT_PORT, HOST, () => {
  const url = `http://${HOST}:${DEFAULT_PORT}`;
  // eslint-disable-next-line no-console
  console.log(`📄 PDF preview disponível em ${url}`);
  openInBrowser(url);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});

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
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: var(--bg);
    color: var(--text);
  }
  a { color: var(--accent); }
  .container {
    width: min(960px, 94vw);
    margin: 0 auto;
    padding: 48px 0 72px;
  }
  header h1 { margin-bottom: 6px; font-size: 32px; }
  header p { margin-top: 0; color: var(--text-muted); }
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
  .link:hover { text-decoration: underline; }
  .frame {
    width: 100%;
    min-height: 130vh;
    height: 90vh;
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
    color: var(--accent);
    background-color: rgba(2, 132, 199, 0.12);
    padding: 3px 10px;
    border-radius: 999px;
  }
`;

const IndexPage = () => (
  <main className="container">
    <header>
      <h1>PDF Preview</h1>
      <p>Escolha abaixo o PDF que deseja visualizar.</p>
    </header>

    {categories.map((category) => (
      <section key={category} style={{ marginTop: '32px' }}>
        <h2 style={{ textTransform: 'capitalize' }}>{category}</h2>
        <div className="grid">
          {pdfsByCategory[category]?.map((definition) => (
            <article className="card" key={definition.name}>
              <span className="tag">{category}</span>
              <h3>{definition.title}</h3>
              {definition.description ? <p>{definition.description}</p> : null}
              <a
                className="link"
                href={`/preview/${definition.category}/${definition.name}`}
              >
                Visualizar PDF
              </a>
            </article>
          ))}
        </div>
      </section>
    ))}
  </main>
);

const PdfPreviewPage = ({ definition }: { definition: PdfDefinition }) => (
  <main className="container">
    <header>
      <span className="tag">{definition.category}</span>
      <h1>{definition.title}</h1>
      {definition.description ? <p>{definition.description}</p> : null}
    </header>

    <iframe
      className="frame"
      title={`${definition.title} - preview`}
      src={`/pdf/${definition.category}/${definition.name}`}
    />
  </main>
);

function htmlDocument(markup: string, title: string) {
  return `<!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${markup}
      </body>
    </html>`;
}

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
