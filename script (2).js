(function(){'use strict';
var L=['en','es','pt','ru','de','fr','it','pl','ro','uk','nl','tr'],
N={en:'English',es:'Español',pt:'Português',ru:'Русский',de:'Deutsch',fr:'Français',it:'Italiano',pl:'Polski',ro:'Română',uk:'Українська',nl:'Nederlands',tr:'Türkçe'},
K=['latest','trending','more','search','min','world','tech','business','science','health','sports','culture'],
T={ /* order = K. TODO: have a native speaker proofread */
en:['Latest','Trending','Load more','Search','min read','World','Tech','Business','Science','Health','Sports','Culture'],
es:['Últimas','Tendencias','Cargar más','Buscar','min de lectura','Mundo','Tecnología','Economía','Ciencia','Salud','Deportes','Cultura'],
pt:['Últimas','Em alta','Carregar mais','Pesquisar','min de leitura','Mundo','Tecnologia','Negócios','Ciência','Saúde','Esportes','Cultura'],
ru:['Свежее','В тренде','Показать ещё','Поиск','мин чтения','Мир','Технологии','Бизнес','Наука','Здоровье','Спорт','Культура'],
de:['Neueste','Im Trend','Mehr laden','Suchen','Min. Lesezeit','Welt','Technik','Wirtschaft','Wissenschaft','Gesundheit','Sport','Kultur'],
fr:['À la une','Tendances','Charger plus','Rechercher','min de lecture','Monde','Tech','Économie','Science','Santé','Sport','Culture'],
it:['Ultime','In tendenza','Carica altro','Cerca','min di lettura','Mondo','Tecnologia','Economia','Scienza','Salute','Sport','Cultura'],
pl:['Najnowsze','Na topie','Więcej','Szukaj','min czytania','Świat','Technologie','Biznes','Nauka','Zdrowie','Sport','Kultura'],
ro:['Recente','În tendințe','Mai multe','Caută','min de citit','Lume','Tehnologie','Economie','Știință','Sănătate','Sport','Cultură'],
uk:['Свіже','У тренді','Показати ще','Пошук','хв читання','Світ','Технології','Бізнес','Наука','Здоров’я','Спорт','Культура'],
nl:['Nieuwste','Trending','Meer laden','Zoeken','min leestijd','Wereld','Tech','Zakelijk','Wetenschap','Gezondheid','Sport','Cultuur'],
tr:['Son','Gündemde','Daha fazla','Ara','dk okuma','Dünya','Teknoloji','Ekonomi','Bilim','Sağlık','Spor','Kültür']},
cats=K.slice(5),d=document,
$=function(s){return d.querySelector(s)},
lang;
try{lang=localStorage.getItem('lang')||(navigator.language||'en').slice(0,2)}catch(e){lang='en'}
if(L.indexOf(lang)<0)lang='en';
function t(k){var i=K.indexOf(k);return i<0?k:T[lang][i]}
function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rel(x){var m=(x-Date.now())/6e4,f=new Intl.RelativeTimeFormat(lang,{numeric:'auto'});
 if(m>-60)return f.format(Math.round(m),'minute');
 if(m>-1440)return f.format(Math.round(m/60),'hour');
 if(m>-43200)return f.format(Math.round(m/1440),'day');
 return x.toLocaleDateString(lang,{dateStyle:'medium'})}
/* header */
d.documentElement.lang=lang;
$('#cats').innerHTML=cats.map(function(c){return'<a href="/search/label/cat-'+c+'">'+t(c)+'</a>'}).join('');
var sel=$('#lang');
sel.innerHTML=L.map(function(l){return'<option value="'+l+'"'+(l===lang?' selected':'')+'>'+N[l]+'</option>'}).join('');
sel.onchange=function(){try{localStorage.setItem('lang',sel.value)}catch(e){}location.reload()};
$('input[name=q]').placeholder=t('search');
$('#mode').onclick=function(){var h=d.documentElement,dark=h.dataset.theme?h.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
 h.dataset.theme=dark?'light':'dark';try{localStorage.setItem('theme',h.dataset.theme)}catch(e){}};
/* feed: Blogger JSON. Posts need labels lang-xx and cat-xxx (e.g. lang-es, cat-tech) */
function parse(e){var c=(e.content&&e.content.$t)||'',m=c.match(/<img[^>]+src=["']([^"']+)/),
 img=e.media$thumbnail?e.media$thumbnail.url:(m&&m[1]),
 a=e.link.filter(function(x){return x.rel==='alternate'})[0]||{},
 cat=(e.category||[]).map(function(x){return x.term}).filter(function(x){return/^cat-/.test(x)})[0]||'';
 return{title:e.title.$t,url:a.href,img:img&&img.replace(/\/s\d+(-c)?\//,'/w900-h560-c/'),date:new Date(e.published.$t),cat:cat.slice(4),
 min:Math.max(1,Math.round(c.replace(/<[^>]+>/g,' ').split(/\s+/).length/200))}}
function feed(l,from,n){return fetch('/feeds/posts/default/'+(l?'-/lang-'+l:'')+'?alt=json&max-results='+n+'&start-index='+from)
 .then(function(r){return r.json()}).then(function(j){return(j.feed.entry||[]).map(parse)}).catch(function(){return[]})}
function card(p){return'<a class="card" href="'+p.url+'">'+(p.img?'<img loading="lazy" alt="" src="'+p.img+'">':'<span class="ph"></span>')+
 '<div><small>'+(p.cat?t(p.cat):'')+'</small><h3>'+esc(p.title)+'</h3><span class="meta">'+rel(p.date)+' &middot; '+p.min+' '+t('min')+'</span></div></a>'}
/* home */
var h=$('#home');
if(h){
 h.innerHTML='<div class="stories">'+cats.map(function(c){return'<a href="/search/label/cat-'+c+'"><i>'+t(c).charAt(0)+'</i>'+t(c)+'</a>'}).join('')+'</div>'+
 '<section class="bento sk"></section><h2>'+t('trending')+'</h2><ol class="trend"></ol><h2>'+t('latest')+'</h2><div class="grid"></div><button class="btn" id="more" type="button">'+t('more')+'</button>';
 var lg=lang,next=22,g=h.querySelector('.grid'),b=$('#more');
 feed(lg,1,21).then(function(a){if(a.length)return a;lg='';return feed('',1,21)}).then(function(a){
  var bento=h.querySelector('.bento');bento.classList.remove('sk');
  if(!a.length){h.querySelectorAll('h2,.trend,.btn,.bento').forEach(function(n){n.remove()});return}
  d.body.classList.add('home-ready');
  bento.innerHTML=a.slice(0,5).map(card).join('');
  h.querySelector('.trend').innerHTML=a.slice(5,10).map(function(p){return'<li><a href="'+p.url+'">'+esc(p.title)+'</a></li>'}).join('');
  g.innerHTML=a.slice(10).map(card).join('');
  if(a.length<21)b.hidden=true});
 b.onclick=function(){feed(lg,next,12).then(function(a){g.insertAdjacentHTML('beforeend',a.map(card).join(''));next+=12;if(a.length<12)b.hidden=true})}}
/* article */
var pb=$('#progress');
addEventListener('scroll',function(){var e=d.documentElement,m=e.scrollHeight-e.clientHeight;pb.style.width=(m>0?e.scrollTop/m*100:0)+'%'},{passive:true});
d.querySelectorAll('.post-body img').forEach(function(i){i.loading='lazy'});
})();
