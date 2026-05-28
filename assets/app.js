const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const state = { deck: null, done: JSON.parse(localStorage.getItem('done-items') || '{}') };

function audioPath(id){ return `audio/${id}.mp3`; }
function saveDone(){ localStorage.setItem('done-items', JSON.stringify(state.done)); }

function render(){
  const q = $('#search').value.trim().toLowerCase();
  const f = $('#filter').value;
  const cards = $('#cards');
  cards.innerHTML = '';
  const tpl = $('#card-template');
  const items = state.deck.items.filter(it => {
    const hay = JSON.stringify(it).toLowerCase();
    return (f === 'all' || it.level === f) && (!q || hay.includes(q));
  });
  for(const item of items){
    const node = tpl.content.cloneNode(true);
    const card = $('.card', node);
    if(state.done[item.id]) card.classList.add('done-card');
    $('.badge', node).textContent = item.level;
    $('.pattern', node).textContent = item.pattern;
    $('.meaning', node).textContent = item.meaning;
    $('.audio', node).src = audioPath(item.id);
    const done = $('.done', node);
    done.textContent = state.done[item.id] ? '已背 ✓' : '标记已背';
    done.classList.toggle('active', !!state.done[item.id]);
    done.addEventListener('click', () => { state.done[item.id] = !state.done[item.id]; saveDone(); render(); });
    const box = $('.sentences', node);
    item.sentences.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'sentence';
      div.innerHTML = `<span class="num">${i+1}</span><p class="ghost">${s}</p><button type="button">显示 / 隐藏</button>`;
      $('button', div).addEventListener('click', () => $('p', div).classList.toggle('reveal'));
      box.appendChild(div);
    });
    const ul = $('.transform', node);
    item.transform.forEach(s => { const li=document.createElement('li'); li.textContent=s; ul.appendChild(li); });
    $('.prompt', node).textContent = '主动输出：' + item.prompt;
    const tags = $('.tags', node);
    item.tags.forEach(t => { const span=document.createElement('span'); span.className='tag'; span.textContent=t; tags.appendChild(span); });
    cards.appendChild(node);
  }
}

async function init(){
  const res = await fetch('data/deck.json', {cache:'no-store'});
  state.deck = await res.json();
  $('#date').textContent = state.deck.date;
  $('#subtitle').textContent = `${state.deck.title} · ${state.deck.mode}`;
  $('#search').addEventListener('input', render);
  $('#filter').addEventListener('change', render);
  render();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
}
init().catch(err => { document.body.innerHTML = `<pre style="padding:20px;color:white">Failed to load deck: ${err}</pre>`; });
