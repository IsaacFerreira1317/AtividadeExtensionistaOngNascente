const DEFAULT_CATEGORIES = [
  { id: 'arroz', nome: 'Arroz', unidade: 'kg', qtd: 40, minimo: 15 },
  { id: 'feijao', nome: 'Feijão', unidade: 'kg', qtd: 35, minimo: 15 },
  { id: 'oleo', nome: 'Óleo de cozinha', unidade: 'l', qtd: 18, minimo: 10 },
  { id: 'acucar', nome: 'Açúcar', unidade: 'kg', qtd: 20, minimo: 8 },
  { id: 'macarrao', nome: 'Macarrão', unidade: 'pct', qtd: 30, minimo: 12 },
  { id: 'leite', nome: 'Leite em pó', unidade: 'lata', qtd: 8, minimo: 10 },
  { id: 'higiene', nome: 'Itens de higiene', unidade: 'un', qtd: 25, minimo: 10 },
  { id: 'limpeza', nome: 'Produtos de limpeza', unidade: 'un', qtd: 14, minimo: 8 },
];

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

let categorias = load('nascente_categorias', DEFAULT_CATEGORIES);
let familias = load('nascente_familias', []);
let historico = load('nascente_historico', []);

function persist() {
  save('nascente_categorias', categorias);
  save('nascente_familias', familias);
  save('nascente_historico', historico);
}

// ---- Tabs ----
document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['estoque','familias','movimentar','historico'].forEach(t => {
      document.getElementById('tab-' + t).style.display = (t === btn.dataset.tab) ? 'block' : 'none';
    });
  });
});

// ---- Estoque ----
function renderEstoque() {
  const el = document.getElementById('tab-estoque');
  const rows = categorias.map(c => {
    const low = c.qtd <= c.minimo;
    return `<div class="cat-item ${low ? 'low' : ''}">
      <div class="cat-name">${c.nome} <span class="unit">(${c.unidade})</span>${low ? '<span class="tag">estoque baixo</span>' : ''}</div>
      <div class="qty">${c.qtd}</div>
    </div>`;
  }).join('');
  const lowCount = categorias.filter(c => c.qtd <= c.minimo).length;
  el.innerHTML = `
    <div class="card">
      <h2 style="font-size:16px;margin-bottom:4px;">Itens no estoque</h2>
      <p style="color:var(--ink-soft);font-size:12.5px;margin:0 0 6px;">
        ${lowCount > 0 ? lowCount + ' ite' + (lowCount > 1 ? 'ns' : 'm') + ' abaixo do mínimo' : 'Nenhum item abaixo do mínimo'}
      </p>
      ${rows}
    </div>`;
}

// ---- Famílias ----
function renderFamilias() {
  const el = document.getElementById('tab-familias');
  const list = familias.length
    ? familias.map((f, i) => `
      <div class="family-item row">
        <div>
          <div><b>${f.nome}</b></div>
          <div class="members">${f.membros} pessoa${f.membros > 1 ? 's' : ''} · ${f.contato || 'sem contato'}</div>
        </div>
        <button class="del" data-idx="${i}" title="Remover">✕</button>
      </div>`).join('')
    : `<div class="empty">Nenhuma família cadastrada ainda.</div>`;
  el.innerHTML = `
    <div class="card">
      <h2 style="font-size:16px;">Cadastrar família</h2>
      <label for="f-nome">Nome do responsável</label>
      <input id="f-nome" type="text" placeholder="Ex: Maria da Silva">
      <label for="f-membros">Número de pessoas na família</label>
      <input id="f-membros" type="number" min="1" value="1">
      <label for="f-contato">Contato (opcional)</label>
      <input id="f-contato" type="text" placeholder="Telefone ou referência">
      <button class="btn" id="btn-add-familia">Cadastrar família</button>
    </div>
    <div class="card">
      <div class="section-title">Famílias atendidas (${familias.length})</div>
      ${list}
    </div>`;

  document.getElementById('btn-add-familia').addEventListener('click', () => {
    const nome = document.getElementById('f-nome').value.trim();
    const membros = parseInt(document.getElementById('f-membros').value, 10) || 1;
    const contato = document.getElementById('f-contato').value.trim();
    if (!nome) { document.getElementById('f-nome').focus(); return; }
    familias.push({ nome, membros, contato });
    persist();
    renderFamilias();
  });
  el.querySelectorAll('.del').forEach(b => b.addEventListener('click', () => {
    familias.splice(parseInt(b.dataset.idx, 10), 1);
    persist();
    renderFamilias();
  }));
}

// ---- Movimentar ----
let tipoMov = 'entrada';
function renderMovimentar() {
  const el = document.getElementById('tab-movimentar');
  const opts = categorias.map(c => `<option value="${c.id}">${c.nome} (${c.qtd} ${c.unidade})</option>`).join('');
  el.innerHTML = `
    <div class="card">
      <h2 style="font-size:16px;">Registrar movimentação</h2>
      <div class="move-toggle">
        <button id="btn-entrada" class="sel entrada">Entrada (doação)</button>
        <button id="btn-saida">Saída (distribuição)</button>
      </div>
      <label for="m-cat">Item</label>
      <select id="m-cat">${opts}</select>
      <label for="m-qtd">Quantidade</label>
      <input id="m-qtd" type="number" min="1" value="1">
      <label for="m-obs">Observação (opcional)</label>
      <input id="m-obs" type="text" placeholder="Ex: doação do mercado X / entrega para família Y">
      <button class="btn gold" id="btn-confirmar">Confirmar movimentação</button>
    </div>`;

  const bE = document.getElementById('btn-entrada'), bS = document.getElementById('btn-saida');
  function setTipo(t) {
    tipoMov = t;
    bE.classList.toggle('sel', t === 'entrada');
    bS.classList.toggle('sel', t === 'saida');
    if (t === 'saida') bS.classList.add('saida'); else bS.classList.remove('saida');
  }
  bE.addEventListener('click', () => setTipo('entrada'));
  bS.addEventListener('click', () => setTipo('saida'));

  document.getElementById('btn-confirmar').addEventListener('click', () => {
    const catId = document.getElementById('m-cat').value;
    const qtd = parseInt(document.getElementById('m-qtd').value, 10) || 0;
    const obs = document.getElementById('m-obs').value.trim();
    const cat = categorias.find(c => c.id === catId);
    if (!cat || qtd <= 0) return;
    if (tipoMov === 'saida' && qtd > cat.qtd) {
      alert('Quantidade maior que o estoque disponível de ' + cat.nome + '.');
      return;
    }
    cat.qtd += (tipoMov === 'entrada' ? qtd : -qtd);
    historico.unshift({
      data: new Date().toLocaleString('pt-BR'),
      tipo: tipoMov, item: cat.nome, qtd, unidade: cat.unidade, obs
    });
    persist();
    renderMovimentar();
    renderEstoque();
    renderHistorico();
  });
}

// ---- Histórico ----
function renderHistorico() {
  const el = document.getElementById('tab-historico');
  const list = historico.length
    ? historico.map(h => `
      <div class="log-item">
        <b>${h.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</b> — ${h.qtd} ${h.unidade} de ${h.item}
        <div class="meta">${h.data}${h.obs ? ' · ' + h.obs : ''}</div>
      </div>`).join('')
    : `<div class="empty">Nenhuma movimentação registrada ainda.</div>`;
  el.innerHTML = `<div class="card"><h2 style="font-size:16px;margin-bottom:6px;">Histórico de movimentações</h2>${list}</div>`;
}

renderEstoque();
renderFamilias();
renderMovimentar();
renderHistorico();
