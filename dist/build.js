/**
 * build.js — Inyecta header y footer desde _partials/ en cada página HTML.
 * Uso: node build.js
 * Genera el sitio en dist/ listo para desplegar.
 */

const fs   = require('fs');
const path = require('path');

// Directorios y archivos a ignorar
const SKIP_DIRS = new Set(['node_modules', '_partials', 'dist', '.git', '.netlify']);

// Leer partials
const headerTpl = fs.readFileSync('_partials/header.html', 'utf8').trimEnd();
const footerTpl = fs.readFileSync('_partials/footer.html', 'utf8').trimEnd();

// ---- Utilidades ----

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function processHtml(srcFile, outFile) {
  const rel        = path.relative('.', srcFile).replace(/\\/g, '/');
  const depth      = rel.split('/').length - 1;
  const base       = depth > 0 ? '../'.repeat(depth) : '';
  const headerClass = path.basename(srcFile) === 'index.html' ? ' transparent' : '';

  let html = fs.readFileSync(srcFile, 'utf8');

  // -- Inyectar header --
  const hStart = html.indexOf('<header class="site-header');
  const hEnd   = html.indexOf('</header>') + '</header>'.length;
  if (hStart !== -1 && hEnd > hStart) {
    const injected = headerTpl
      .replace(/\{\{BASE\}\}/g, base)
      .replace(/\{\{HEADER_CLASS\}\}/g, headerClass);
    html = html.slice(0, hStart) + injected + html.slice(hEnd);
  }

  // -- Inyectar footer + float-btn --
  // El bloque va desde <footer class="site-footer" hasta el último </div>
  // antes de la etiqueta <script src=
  const fStart    = html.indexOf('<footer class="site-footer"');
  const scriptIdx = html.indexOf('<script src=');
  if (fStart !== -1 && scriptIdx !== -1) {
    const fEnd = html.lastIndexOf('</div>', scriptIdx) + '</div>'.length;
    const injected = footerTpl.replace(/\{\{BASE\}\}/g, base);
    html = html.slice(0, fStart) + injected + '\n\n' + html.slice(fEnd);
  }

  ensureDir(path.dirname(outFile));
  fs.writeFileSync(outFile, html, 'utf8');
}

function buildDir(srcDir, outDir) {
  ensureDir(outDir);
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const src = path.join(srcDir, entry.name);
    const out = path.join(outDir, entry.name);

    if (entry.isDirectory()) {
      buildDir(src, out);
    } else if (entry.name.endsWith('.html')) {
      processHtml(src, out);
    } else {
      // Copiar CSS, JS, imágenes y cualquier otro archivo tal cual
      fs.copyFileSync(src, out);
    }
  }
}

// ---- Ejecutar ----

console.log('Construyendo sitio...');

// Limpiar dist anterior
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

buildDir('.', 'dist');

// Contar HTML generados
let count = 0;
function countHtml(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) countHtml(path.join(dir, e.name));
    else if (e.name.endsWith('.html')) count++;
  }
}
countHtml('dist');

console.log(`✓ ${count} páginas generadas en dist/`);
