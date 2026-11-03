// Página de vagas: listagem, detalhe e candidatura. Os dados das vagas ficam em vagas-data.js.
const SUPABASE_URL = 'https://hmnhcinkmfwtutkbxejb.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmhjaW5rbWZ3dHV0a2J4ZWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3ODM3ODcsImV4cCI6MjEwODM1OTc4N30.WRIigm-qiUAjfwYf7GjwTfJzjH_t8dWCWgFftRE07oo'
const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
const EXP = [['nenhuma', 'Nenhuma experiência'], ['0-6m', '0 a 6 meses'], ['ate-1a', 'Até 1 ano'], ['1-2a', '1 a 2 anos'], ['2-4a', '2 a 4 anos'], ['4a+', 'Acima de 4 anos']]

const $ = (s, el = document) => el.querySelector(s)
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const app = $('#app')
$('#yr').textContent = new Date().getFullYear()

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200) }

$('#share').onclick = async () => {
  const data = { title: document.title, url: location.href }
  try { if (navigator.share) return await navigator.share(data) } catch { return }
  try { await navigator.clipboard.writeText(location.href); toast('Link copiado') } catch { toast(location.href) }
}

const BRIEF = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>'

function listView() {
  document.title = 'Vagas · V8 Aceleração'
  $('#back').style.visibility = 'hidden'
  const areas = [...new Set(VAGAS.map((v) => v.area))]
  app.innerHTML = `
    <section class="banner"><img src="/assets/time-v8.webp" alt="Time V8: equipe de terno laranja no alto de uma rocha, segurando a bandeira Bora Vender" width="1672" height="941" fetchpriority="high"></section>
    <section class="hero intro"><div class="wrap">
      <div class="intro-tx">
        <span class="chip o">${VAGAS.length} vagas abertas</span>
        <h1>Acelere sua carreira com a <em>V8</em>.</h1>
        <p class="lead">Somos uma empresa especialista em gerar demanda qualificada para Lançamentos/Mentorias e eventos presenciais para vendas High Ticket que acelera empresários e experts. Se você tem fome de resultado e quer crescer junto, seu lugar é aqui.</p>
      </div>
      <a class="cta-list" href="#vagas">Ver vagas abertas <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12l7 7 7-7"/></svg></a>
    </div></section>
    <section class="main" id="vagas"><div class="wrap one">
      <div class="lhead"><h2>Vagas abertas <span id="cnt">(${VAGAS.length})</span></h2>
        <label class="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="q" type="search" placeholder="Buscar cargo ou área..."></label></div>
      <div class="filters"><button class="flt on" data-a="">Todas as áreas</button>${areas.map((a) => `<button class="flt" data-a="${esc(a)}">${esc(a)}</button>`).join('')}</div>
      <div class="list" id="list">${VAGAS.map((v) => `
        <a class="vrow" href="/${v.slug}/" data-a="${esc(v.area)}" data-q="${esc((v.titulo + ' ' + v.area).toLowerCase())}">
          <span class="ico">${BRIEF}</span>
          <div class="vb"><div class="vt"><h3>${esc(v.titulo)}</h3><span class="tag">${esc(v.contrato)}</span><span class="tag">${esc(v.modelo)}</span></div>
            <div class="vm">${esc(v.area)} <i>·</i> <b>${esc(v.salario)}</b></div>
            <p>${esc(v.resumo)}</p></div>
          <svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>`).join('')}
        <p class="empty" id="empty">Nenhuma vaga encontrada.</p>
      </div>
      <div class="talent"><h3>Não encontrou sua vaga?</h3><p>Novas vagas abrem conforme o time cresce. Acompanhe a V8 em <a href="https://aceleracao.v8.ia.br/">aceleracao.v8.ia.br</a>.</p></div>
    </div></section>`
  let area = ''
  const apply = () => {
    const q = $('#q').value.trim().toLowerCase()
    let n = 0
    document.querySelectorAll('#list .vrow').forEach((c) => {
      const ok = (!area || c.dataset.a === area) && (!q || c.dataset.q.includes(q))
      c.style.display = ok ? '' : 'none'
      n += ok
    })
    $('#cnt').textContent = `(${n})`
    $('#empty').style.display = n ? 'none' : 'block'
  }
  $('#q').addEventListener('input', apply)
  document.querySelectorAll('.flt').forEach((b) => b.onclick = () => {
    area = b.dataset.a
    document.querySelectorAll('.flt').forEach((x) => x.classList.toggle('on', x === b))
    apply()
  })
}

function sobreHtml(v) {
  const ul = (xs) => `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
  return `
    <h3>Sobre a empresa</h3><p>${esc(EMPRESA)}</p>
    <p><b style="color:var(--tx)">Site:</b> <a href="https://aceleracao.v8.ia.br/">aceleracao.v8.ia.br</a></p>
    <h3>Missão</h3><p>${esc(v.missao)}</p>
    <h3>Descrição geral</h3><p>${esc(v.descricao)}</p>
    <h3>Principais responsabilidades</h3>
    <div class="w"><p><b>O QUÊ:</b> ${esc(v.oque)}</p><p><b>COMO:</b> ${esc(v.como)}</p><p><b>POR QUÊ:</b> ${esc(v.porque)}</p><p><b>QUANDO:</b> ${esc(v.quando)}</p></div>
    <h3>Competências técnicas</h3>${ul(v.tecnicas)}
    <h3>Competências comportamentais</h3>${ul(v.comportamentais)}
    <h3>Remuneração</h3><p>${esc(v.remuneracao)}</p>
    <h3>Outras informações</h3><p><b style="color:var(--tx)">Local:</b> ${esc(LOCAL)}<br><b style="color:var(--tx)">Modelo:</b> ${esc(v.modelo)}<br><b style="color:var(--tx)">Contrato:</b> ${esc(v.contrato)}</p>`
}

function vagaView(v) {
  document.title = `${v.titulo} · Vagas V8`
  app.innerHTML = `
    <section class="hero"><div class="wrap">
      <div class="crumb"><a href="/">Vagas</a> / ${esc(v.area)} / ${esc(v.titulo)}</div>
      <div class="chips">${[v.contrato, v.modelo, v.area].map((c) => `<span class="chip">${esc(c)}</span>`).join('')}<span class="chip o">${esc(v.salario)}</span></div>
      <h1>${esc(v.titulo)}</h1>
    </div></section>
    <section class="main"><div class="wrap">
      <article class="desc"><div class="eyebrow">Sobre a vaga</div>${sobreHtml(v)}
        <a class="more" href="/">Ver todas as vagas →</a></article>
      <aside class="apply" id="candidatura">
        <div class="apply-h"><small>CANDIDATURA</small><h2>${esc(v.titulo)}</h2><p>${esc(v.contrato)} · ${esc(v.area)}</p></div>
        <form id="form" novalidate>
          <div class="sec">Dados pessoais</div>
          <label class="f">Nome completo <i>*</i><input type="text" name="nome" autocomplete="name" placeholder="Seu nome completo" maxlength="120"></label>
          <label class="f">E-mail <i>*</i><input type="email" name="email" autocomplete="email" placeholder="seu@email.com" maxlength="160"></label>
          <div class="row">
            <label class="f">CPF <i>*</i><input type="text" name="cpf" inputmode="numeric" placeholder="000.000.000-00" maxlength="14"></label>
            <label class="f">Data de nascimento<input type="date" name="nascimento" min="1940-01-01"></label>
          </div>
          <label class="f">Celular (WhatsApp) <i>*</i><input type="tel" name="celular" autocomplete="tel" inputmode="numeric" placeholder="(11) 99999-9999" maxlength="15"></label>
          <div class="row c">
            <label class="f">Cidade <i>*</i><input type="text" name="cidade" autocomplete="address-level2" placeholder="São Paulo" maxlength="80"></label>
            <label class="f">Estado <i>*</i><select name="estado"><option value="">UF</option>${UFS.map((u) => `<option>${u}</option>`).join('')}</select></label>
          </div>
          <label class="f">LinkedIn<input type="url" name="linkedin" placeholder="linkedin.com/in/seu-perfil" maxlength="200"></label>
          <div class="sec">Experiência</div>
          <label class="f">Quantos anos de experiência você tem na área? <i>*</i>
            <div class="opts">${EXP.map(([k, l]) => `<label class="opt"><input type="radio" name="experiencia" value="${k}">${l}</label>`).join('')}</div></label>
          <label class="f">Currículo <i>*</i>
            <label class="drop" id="drop"><input type="file" name="curriculo" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
              <b id="dropName">Arraste ou clique para selecionar</b><span>PDF, DOC ou DOCX · máx. 5 MB</span></label></label>
          <label class="f">Skills
            <div class="opts">${v.skills.map((s) => `<label class="opt"><input type="checkbox" name="skills" value="${esc(s)}">${esc(s)}</label>`).join('')}</div></label>
          <label class="lgpd"><input type="checkbox" name="lgpd"><span>Declaro que li e aceito o <a id="lgpdOpen">Aviso de Tratamento de Dados</a> e consinto com o uso dos meus dados pessoais para avaliação desta candidatura, nos termos da LGPD (Lei 13.709/2018). Sei que posso solicitar a exclusão dos meus dados a qualquer momento.</span></label>
          <p class="err" id="err" role="alert"></p>
          <button class="go" type="submit" id="go">Enviar candidatura</button>
        </form>
        <div class="done" id="done"><div class="ic"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg></div>
          <h3>Candidatura enviada!</h3><p>Recebemos seus dados. Se o seu perfil avançar, o time da V8 entra em contato pelo WhatsApp ou e-mail informados. #BoraAcelerarrr</p></div>
      </aside>
    </div></section>`
  bindForm(v)
}

const digits = (s) => s.replace(/\D/g, '')
function cpfOk(c) {
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  for (const n of [9, 10]) {
    let s = 0
    for (let i = 0; i < n; i++) s += +c[i] * (n + 1 - i)
    if (((s * 10) % 11) % 10 !== +c[n]) return false
  }
  return true
}

function bindForm(v) {
  const f = $('#form'), err = $('#err'), drop = $('#drop'), file = f.curriculo
  f.cpf.addEventListener('input', () => { const d = digits(f.cpf.value).slice(0, 11); f.cpf.value = d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2') })
  f.celular.addEventListener('input', () => { const d = digits(f.celular.value).slice(0, 11); f.celular.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3') : d.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (m, a, b, c) => `(${a}) ${b}${c ? '-' + c : ''}`) })
  f.nascimento.max = new Date().toISOString().slice(0, 10)
  const showFile = () => { const x = file.files[0]; $('#dropName').textContent = x ? x.name : 'Arraste ou clique para selecionar'; drop.classList.toggle('has', !!x) }
  file.addEventListener('change', showFile)
  ;['dragenter', 'dragover'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add('on') }))
  ;['dragleave', 'drop'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove('on') }))
  drop.addEventListener('drop', (ev) => { if (ev.dataTransfer.files.length) { file.files = ev.dataTransfer.files; showFile() } })
  $('#lgpdOpen').onclick = (e) => { e.preventDefault(); $('#lgpdModal').classList.add('on') }

  f.addEventListener('submit', async (e) => {
    e.preventDefault()
    err.textContent = ''
    const nome = f.nome.value.trim(), email = f.email.value.trim().toLowerCase(), cpf = digits(f.cpf.value), cel = digits(f.celular.value)
    const cidade = f.cidade.value.trim(), estado = f.estado.value, exp = (f.querySelector('[name=experiencia]:checked') || {}).value
    const cv = file.files[0], ext = cv ? (cv.name.split('.').pop() || '').toLowerCase() : ''
    const problem =
      nome.split(/\s+/).length < 2 || nome.length < 3 ? 'Informe seu nome completo.' :
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? 'Informe um e-mail válido.' :
      !cpfOk(cpf) ? 'Informe um CPF válido.' :
      cel.length < 10 ? 'Informe um celular com DDD.' :
      cidade.length < 2 ? 'Informe sua cidade.' :
      !estado ? 'Selecione o estado.' :
      !exp ? 'Informe sua experiência em vendas.' :
      !cv ? 'Anexe seu currículo.' :
      !['pdf', 'doc', 'docx'].includes(ext) ? 'O currículo deve ser PDF, DOC ou DOCX.' :
      cv.size > 5 * 1024 * 1024 ? 'O currículo deve ter no máximo 5 MB.' :
      !f.lgpd.checked ? 'Para enviar, aceite o Aviso de Tratamento de Dados.' : ''
    if (problem) { err.textContent = problem; return }

    const btn = $('#go')
    btn.disabled = true; btn.textContent = 'Enviando…'
    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    const mime = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }[ext]
    const path = `candidaturas/${crypto.randomUUID()}.${ext}`
    try {
      const up = await fetch(`${SUPABASE_URL}/storage/v1/object/curriculos/${path}`, { method: 'POST', headers: { ...headers, 'Content-Type': mime, 'x-upsert': 'false' }, body: cv })
      if (!up.ok) throw new Error('upload')
      const li = f.linkedin.value.trim()
      const row = {
        vaga: v.slug, nome, email, cpf, celular: cel, cidade, estado, experiencia: exp,
        nascimento: f.nascimento.value || null, linkedin: li || null,
        skills: [...f.querySelectorAll('[name=skills]:checked')].map((x) => x.value),
        curriculo_path: path, consentimento_lgpd: true,
      }
      const ins = await fetch(`${SUPABASE_URL}/rest/v1/candidaturas`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(row) })
      if (!ins.ok) throw new Error('insert')
      f.style.display = 'none'
      $('#done').style.display = 'block'
      $('#candidatura').scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch {
      err.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente novamente.'
      btn.disabled = false; btn.textContent = 'Enviar candidatura'
    }
  })
}

$('#lgpdClose').onclick = () => $('#lgpdModal').classList.remove('on')
$('#lgpdModal').onclick = (e) => { if (e.target.id === 'lgpdModal') e.target.classList.remove('on') }

const vaga = VAGAS.find((x) => x.slug === window.VAGA_SLUG)
vaga ? vagaView(vaga) : listView()
