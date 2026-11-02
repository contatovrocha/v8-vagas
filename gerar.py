"""Gera index.html (lista) e uma pasta por vaga (ex.: closer/index.html) a partir de VAGAS em assets/vagas-data.js.
Uso: python3 gerar.py  — rode sempre que adicionar, renomear ou remover uma vaga."""
import html, os, re, shutil

js = open('assets/vagas-data.js', encoding='utf-8').read()
vagas = re.findall(r"slug: '([a-z0-9-]+)',\s*titulo: '([^']*)',[^\n]*\n[^\n]*\n\s*resumo: '([^']*)'", js)
body = open('_corpo.html', encoding='utf-8').read()
SITE = 'https://vagas.v8.ia.br'

def page(slug, title, desc):
    url = f'{SITE}/{slug + "/" if slug else ""}'
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/v8-logo.png">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#0a0a0c">
<link rel="icon" href="/assets/v8-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/vagas.css">
</head>
<body>
{body}<script>window.VAGA_SLUG = {('"' + slug + '"') if slug else 'null'}</script>
<script src="/assets/vagas-data.js"></script>
<script src="/assets/vagas.js"></script>
</body>
</html>
'''

slugs = {s for s, _, _ in vagas}
for d in os.listdir('.'):
    if os.path.isdir(d) and os.path.exists(os.path.join(d, 'index.html')) and d not in slugs and d != 'assets':
        shutil.rmtree(d)
open('index.html', 'w', encoding='utf-8').write(page(None, 'Vagas · V8 Aceleração', 'Trabalhe na V8 Aceleração. Veja as vagas abertas e candidate-se.'))
for slug, titulo, resumo in vagas:
    os.makedirs(slug, exist_ok=True)
    open(f'{slug}/index.html', 'w', encoding='utf-8').write(page(slug, f'{titulo} · Vagas V8', resumo))
print('Páginas geradas:', ['/'] + [f'/{s}/' for s in slugs])
