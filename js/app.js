// e-REGDESA — SPA (GAS-PRO-API + GAS-Instant-UX): render lokal 0ms, cache localStorage, sinkron latar belakang, optimistic UI
const JENIS={Nasional:['UU','PP','Perpres','Permen','Peraturan Lembaga'],Provinsi:['Perda Provinsi','Pergub'],Kabupaten:['Perda Kabupaten','Perbup'],Desa:['Perdes','Perkades','SK Kades','Keputusan Bersama Kades','Surat Edaran Kades','Lainnya']};
const J=Object.values(JENIS).flat(),TING=Object.keys(JENIS),STATUS=['Berlaku','Tidak Berlaku','Dicabut'];
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sc={Berlaku:'ok','Tidak Berlaku':'wn',Dicabut:'er'},tc={Nasional:'nas',Provinsi:'dae',Kabupaten:'dae',Desa:'des'};
const badge=(t,c)=>`<span class="bd ${c||''}">${esc(t)}</span>`,url=u=>String(u).startsWith('https://')?esc(u):'#';
const fmt=d=>{if(!d)return'-';const x=new Date(String(d).slice(0,10)+'T00:00');return isNaN(x)?esc(d):x.toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})};
const opt=(l,s)=>l.map(o=>`<option ${String(o)===String(s)?'selected':''}>${esc(o)}</option>`).join('');
const S={docs:JSON.parse(localStorage.eg_docs||'[]'),tok:sessionStorage.eg_tok||'',user:JSON.parse(sessionStorage.eg_user||'null'),q:{t:'',jenis:'',tahun:'',status:''},pg:1,pend:0,loaded:false,adm:false};
function toast(m,t=''){const n=$('#notif');n.textContent=m;n.className='notif '+t+' show';clearTimeout(toast.h);toast.h=setTimeout(()=>n.className='notif',3200)}
function store(d){S.docs=d;try{localStorage.eg_docs=JSON.stringify(d)}catch(e){}}

// ---- API ----
async function sync(){try{const j=await(await fetch(GAS_URL)).json();if(j.success&&!S.pend){store(j.data)}S.loaded=true;render()}catch(e){S.loaded=true;toast('Mode offline: memakai data tersimpan','warn')}}
async function api(action,data){const j=await(await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,token:S.tok,data})})).json();if(!j.success){if(j.message==='AUTH')logout(true);throw new Error(j.message)}return j}

// ---- Auth (Google Identity Services) ----
function initAuth(){if(!window.google?.accounts)return setTimeout(initAuth,300);google.accounts.id.initialize({client_id:CLIENT_ID,callback:onCred});hdr()}
async function onCred(r){try{const p=JSON.parse(decodeURIComponent(escape(atob(r.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))));S.tok=r.credential;S.user={name:p.name||p.email,email:p.email};await api('me');sessionStorage.eg_tok=S.tok;sessionStorage.eg_user=JSON.stringify(S.user);location.hash='#/dash';render();toast('Selamat bertugas, '+S.user.name)}catch(e){S.tok='';S.user=null;toast('Akun tidak terdaftar sebagai petugas','er');render()}}
function logout(exp){S.tok='';S.user=null;sessionStorage.clear();if(exp)toast('Sesi berakhir, silakan masuk lagi','warn');location.hash='#/pub';render()}
function hdr(){$('#auth').innerHTML=S.user?`<small>${esc(S.user.name)}</small> <button class="b2" onclick="logout()">Keluar</button>`:'<div id="gbtn"></div>';if(!S.user&&window.google?.accounts)google.accounts.id.renderButton($('#gbtn'),{theme:'filled_black',text:'signin_with'})}

// ---- Router SPA ----
const R={pub:()=>stats()+list(false),dash,reg:()=>'<h1>Register Produk Hukum & Regulasi Desa</h1>'+list(true),add:()=>form(),edit:id=>form(S.docs.find(d=>d.id===id)),incomplete:inc,export:exp,doc:detail};
function render(){const[r,a]=location.hash.slice(2).split('/');let k=r||(S.user?'dash':'pub');if(!R[k]||(!S.user&&!['pub','doc'].includes(k)))k='pub';
  document.body.classList.toggle('pubmode',!S.user);S.adm=!!S.user&&k!=='pub';
  $('#app').innerHTML=(!S.docs.length&&!S.loaded?'<p>Memuat data…</p>':R[k](a));side(k);hdr()}
function side(k){const n=S.docs.filter(d=>!d.fileUrl).length;$('#side').innerHTML=S.user?`<b style="color:#fff;display:block;padding:0 12px 16px;font-size:18px">e-REGDESA</b>`+[['dash','Dashboard'],['reg','Register Dokumen'],['add','Tambah Dokumen'],['incomplete','Dokumen Belum Lengkap',n],['export','Ekspor Laporan'],['pub','Portal Publik']].map(([h,t,c])=>`<a href="#/${h}" class="${h===k?'on':''}">${t}${c?`<i>${c}</i>`:''}</a>`).join(''):''}

// ---- Views ----
const by=k=>S.docs.reduce((a,d)=>(a[d[k]]=(a[d[k]]||0)+1,a),{});
const card=(l,n)=>`<div class="stat"><small>${l}</small><b>${n}</b></div>`;
function stats(){const j=by('jenis'),sup=S.docs.filter(d=>d.tingkat!=='Desa').length;return `<div class="hero"><h1>JDIH Desa ${DESA.nama}</h1><p>Transparansi regulasi dan akses produk hukum terbuka bagi seluruh warga desa.</p></div><div class="grid">${card('Total Dokumen',S.docs.length)}${card('Peraturan Desa',j.Perdes||0)}${card('Perkades',j.Perkades||0)}${card('SK Kades',j['SK Kades']||0)}${card('Regulasi Supradesa',sup)}</div>`}
function dash(){const yr=by('tahun'),ys=Object.keys(yr).sort(),mx=Math.max(1,...Object.values(yr)),st=by('status'),n=S.docs.length||1;
  return `<h1>Selamat bertugas, ${esc(S.user.name)}</h1>${S.docs.some(d=>!d.fileUrl)?`<div class="card" style="background:#FFF3CD"><b>${S.docs.filter(d=>!d.fileUrl).length} dokumen belum memiliki berkas PDF.</b> <a href="#/incomplete">Tindak lanjuti →</a></div>`:''}${stats()}
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))"><div class="card"><b>Tren penerbitan per tahun</b><div class="bars">${ys.map(y=>`<div>${yr[y]}<span style="height:${yr[y]/mx*110}px"></span>${y}</div>`).join('')}</div></div>
  <div class="card"><b>Status keberlakuan</b>${STATUS.map(s=>`<p>${badge(s,sc[s])} ${st[s]||0} dokumen (${Math.round((st[s]||0)/n*100)}%)</p>`).join('')}</div></div><h3>5 Regulasi Terbaru</h3>${tbl(filt().slice(0,5))}`}
function parseQ(t){let y='',j='';t=t.toLowerCase().replace(/\b(19|20)\d{2}\b/,m=>(y=m,''));for(const x of[...J].sort((a,b)=>b.length-a.length))if(t.includes(x.toLowerCase())){j=x;t=t.replace(x.toLowerCase(),'');break}return{y,j,t:t.trim()}}
function filt(){const p=parseQ(S.q.t),j=S.q.jenis||p.j,y=S.q.tahun||p.y;return S.docs.filter(d=>(!j||d.jenis===j)&&(!y||String(d.tahun)===y)&&(!S.q.status||d.status===S.q.status)&&(!p.t||[d.judul,d.tentang,d.nomor,d.keterangan,d.jenis].join(' ').toLowerCase().includes(p.t))).sort((a,b)=>String(b.tglPenetapan).localeCompare(String(a.tglPenetapan)))}
const years=()=>[...new Set(S.docs.map(d=>String(d.tahun)))].sort().reverse();
function list(adm){return `<div class="card"><div class="bar"><input placeholder='Cari judul, nomor… (contoh: "Perdes 2026")' value="${esc(S.q.t)}" oninput="setQ('t',this.value)"><select onchange="setQ('jenis',this.value)"><option value="">Semua Jenis</option>${opt(J,S.q.jenis)}</select><select onchange="setQ('tahun',this.value)"><option value="">Semua Tahun</option>${opt(years(),S.q.tahun)}</select><select onchange="setQ('status',this.value)"><option value="">Semua Status</option>${opt(STATUS,S.q.status)}</select><button class="b2" onclick="S.q={t:'',jenis:'',tahun:'',status:''};render()">Reset</button>${adm?'<button class="b1" onclick="location.hash=\'#/add\'">+ Tambah</button>':''}</div><div id="res">${res()}</div></div>`}
function setQ(k,v){S.q[k]=v;S.pg=1;$('#res').innerHTML=res()}
function pg(n){S.pg+=n;$('#res').innerHTML=res()}
function res(){const r=filt(),n=r.length,pgs=Math.max(1,Math.ceil(n/10));S.pg=Math.min(S.pg,pgs);const c=r.slice((S.pg-1)*10,S.pg*10);return tbl(c)+`<div class="pgn"><small>Menampilkan ${c.length} dari ${n} dokumen</small><span>${S.pg>1?'<button class="b2" onclick="pg(-1)">‹</button>':''} ${S.pg}/${pgs} ${S.pg<pgs?'<button class="b2" onclick="pg(1)">›</button>':''}</span></div>`}
function tbl(rows){return `<div class="tw"><table><thead><tr><th>Nomor & Tahun</th><th>Judul</th><th>Klasifikasi</th><th>Ditetapkan</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows.map(d=>`<tr><td class="mono"><b>${esc(d.jenis)} No. ${esc(d.nomor)}</b><br>Th ${esc(d.tahun)}</td><td><b>${esc(d.judul)}</b><br><small>${esc(d.tentang)}</small></td><td>${badge(d.tingkat,tc[d.tingkat])}<br><small>${esc(d.jenis)}</small></td><td class="mono">${fmt(d.tglPenetapan)}</td><td>${badge(d.status,sc[d.status])}</td><td>${d.fileUrl?`<a href="${url(d.fileUrl)}" target="_blank" rel="noopener">PDF</a>`:'<small class="er">Belum PDF</small>'} · <a href="#/doc/${esc(d.id)}">Detail</a>${S.adm?` · <a href="#/edit/${esc(d.id)}">Edit</a> · <a href="#" class="er" onclick="del('${esc(d.id)}');return false">Hapus</a>`:''}</td></tr>`).join('')||'<tr><td colspan="6">Tidak ada dokumen.</td></tr>'}</tbody></table></div>`}
function detail(id){const d=S.docs.find(x=>x.id===id);if(!d)return'<p>Dokumen tidak ditemukan.</p>';const r=(a,b)=>`<tr><th>${a}</th><td>${esc(b)||'-'}</td></tr>`;
  return `<a href="#/${S.user?'reg':'pub'}">← Kembali</a><h1>${esc(d.judul)}</h1><p>${badge(d.status,sc[d.status])} ${badge(d.tingkat,tc[d.tingkat])}</p><div class="card"><table class="kv">${r('ID Registrasi',d.id)}${r('Jenis / Nomor / Tahun',`${d.jenis} No. ${d.nomor} Th ${d.tahun}`)}${r('Tgl Penetapan',fmt(d.tglPenetapan))}${r('Tgl Pengundangan',fmt(d.tglPengundangan))}${r('Penerbit',d.penerbit)}${r('Tentang',d.tentang)}${r('Dasar Hukum',d.dasarHukum)}${r('Perubahan/Pengganti',d.perubahan)}${r('Keterangan',d.keterangan)}${S.user?r('Lokasi Arsip',d.lokasiArsip)+r('Diinput oleh',d.diinputOleh):''}</table>${d.fileUrl?`<p><a href="${url(d.fileUrl)}" target="_blank" rel="noopener">Buka / Unduh PDF</a></p>`:''}</div>`}
function inc(){const r=S.docs.filter(d=>!d.fileUrl);return `<h1>Dokumen Belum Lengkap</h1><p>${r.length} dokumen belum memiliki berkas PDF.</p><div class="card tw"><table><thead><tr><th>Nomor</th><th>Judul</th><th>Lokasi Arsip Fisik</th><th>Aksi</th></tr></thead>${r.map(d=>`<tr><td>${esc(d.jenis)} No. ${esc(d.nomor)}/${esc(d.tahun)}</td><td>${esc(d.judul)}</td><td>${esc(d.lokasiArsip||'-')}</td><td><a href="#/edit/${esc(d.id)}">Unggah PDF</a></td></tr>`).join('')}</table></div>`}

// ---- Form tambah/edit (optimistic + autosave draft) ----
function form(d){const e=!!d,x=d||JSON.parse(localStorage.eg_draft||'{}'),v=k=>esc(x[k]??''),tg=x.tingkat||'Desa';
  return `<h1>${e?'Edit':'Tambah'} Dokumen</h1><form class="card" onsubmit="save(event,'${e?esc(d.id):''}')" oninput="draft(this,${e})"><div class="fg">
<label>Tingkat Regulasi*<select name="tingkat" onchange="this.form.jenis.innerHTML=opt(JENIS[this.value])">${opt(TING,tg)}</select></label><label>Jenis Produk Hukum*<select name="jenis">${opt(JENIS[tg],x.jenis)}</select></label>
<label>Nomor*<input name="nomor" required value="${v('nomor')}"></label><label>Tahun*<input name="tahun" type="number" required value="${v('tahun')||new Date().getFullYear()}"></label>
<label>Tanggal Penetapan<input name="tglPenetapan" type="date" value="${esc(String(x.tglPenetapan||'').slice(0,10))}"></label><label>Tanggal Pengundangan<input name="tglPengundangan" type="date" value="${esc(String(x.tglPengundangan||'').slice(0,10))}"></label>
<label class="w">Judul Lengkap*<input name="judul" required value="${v('judul')}"></label><label class="w">Tentang<textarea name="tentang">${v('tentang')}</textarea></label>
<label>Instansi / Penerbit<input name="penerbit" value="${v('penerbit')||'Pemerintah Desa '+DESA.nama}"></label><label>Status Keberlakuan*<select name="status">${opt(STATUS,x.status)}</select></label>
<label class="w">Dasar Hukum (Mengingat)<textarea name="dasarHukum">${v('dasarHukum')}</textarea></label><label>Perubahan / Pengganti<select name="perubahan">${opt(['Tidak','Ya'],x.perubahan)}</select></label><label>Lokasi Arsip Fisik<input name="lokasiArsip" value="${v('lokasiArsip')}"></label>
<label class="w">Keterangan<textarea name="keterangan">${v('keterangan')}</textarea></label><label class="w">Berkas PDF (1 berkas, maks 10 MB)<input type="file" name="file" accept="application/pdf">${x.fileUrl?'<small>Berkas sudah ada; pilih file baru untuk mengganti.</small>':''}</label></div>
<button class="b1">${e?'Simpan Perubahan':'Simpan & Publikasikan ke Register'}</button> <a href="#/reg">Batal</a></form>`}
function draft(f,e){if(!e)localStorage.eg_draft=JSON.stringify(Object.fromEntries([...new FormData(f)].filter(([k])=>k!=='file')))}
async function save(ev,id){ev.preventDefault();const f=ev.target,d=Object.fromEntries([...new FormData(f)].filter(([k])=>k!=='file')),fl=f.file.files[0];d.tahun=+d.tahun;
  if(fl&&(fl.type!=='application/pdf'||fl.size>10485760))return toast('Berkas harus PDF ≤ 10 MB','er');
  if(fl)d.file={name:fl.name,b64:await new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result.split(',')[1]);x.readAsDataURL(fl)})};
  const snap=S.docs,old=S.docs.find(x=>x.id===id),tmp=id||'tmp'+Date.now(),loc={...old,...d,id:tmp,fileUrl:old?.fileUrl||''};delete loc.file;
  store(id?S.docs.map(x=>x.id===id?loc:x):[loc,...S.docs]);localStorage.removeItem('eg_draft');location.hash='#/reg';toast('Tersimpan — menyinkronkan…');
  S.pend++;try{if(id)d.id=id;const j=await api('save',d);store(S.docs.map(x=>x.id===tmp?{...x,id:j.id,fileUrl:j.fileUrl}:x));toast('Tersinkron ke Google Sheets')}catch(e){store(snap);toast('Gagal menyimpan: '+e.message,'er')}finally{S.pend--;render()}}
async function del(id){if(!confirm('Hapus dokumen ini? Tindakan tidak dapat dibatalkan.'))return;const snap=S.docs;store(S.docs.filter(x=>x.id!==id));render();toast('Dokumen dihapus');
  S.pend++;try{await api('del',{id})}catch(e){store(snap);toast('Gagal menghapus: '+e.message,'er')}finally{S.pend--;render()}}

// ---- Ekspor ----
function exp(){return `<h1>Ekspor & Cetak Laporan</h1><div class="card"><div class="fg"><label>Jenis<select id="ej"><option value="">Semua</option>${opt(J)}</select></label><label>Tahun<select id="ey"><option value="">Semua</option>${opt(years())}</select></label><label><input type="checkbox" id="eb" style="width:auto"> Berlaku saja</label></div><button class="b1" onclick="doExp('csv')">Unduh Excel (.csv)</button> <button class="b2" onclick="doExp('pdf')">Cetak / Simpan PDF</button></div><div id="print"></div>`}
function doExp(t){const j=$('#ej').value,y=$('#ey').value,b=$('#eb').checked,r=S.docs.filter(d=>(!j||d.jenis===j)&&(!y||String(d.tahun)===y)&&(!b||d.status==='Berlaku'));
  if(t==='csv'){const C=['jenis','tingkat','nomor','tahun','tglPenetapan','judul','penerbit','status','fileUrl','lokasiArsip'],q=v=>{v=String(v??'').slice(0,10000);if(/^[=+\-@]/.test(v))v="'"+v;return`"${v.replace(/"/g,'""')}"`};
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+[C.join(','),...r.map(d=>C.map(c=>q(d[c])).join(','))].join('\n')],{type:'text/csv'}));a.download='register-produk-hukum-desa.csv';a.click();return}
  $('#print').innerHTML=`<div style="text-align:center"><img src="${DESA.logo}" style="height:56px;display:block;margin:0 auto 6px"><b>PEMERINTAH DESA ${DESA.nama.toUpperCase()}</b><br>${DESA.kecamatan.toUpperCase()}, ${DESA.kabupaten.toUpperCase()}, ${DESA.provinsi.toUpperCase()}<br><small>${DESA.alamat}</small><hr><h3>BUKU REGISTER PRODUK HUKUM DESA</h3></div>${tbl(r).replace(/<a [^>]*>.*?<\/a>( · )?/g,'')}<p>Dicetak ${new Date().toLocaleDateString('id-ID')} — Total ${r.length} dokumen</p><p style="text-align:right">Kepala Desa ${DESA.nama}<br><br><br><b>${DESA.kepalaDesa}</b></p>`;window.print()}

// ---- Boot ----
addEventListener('hashchange',render);render();sync();initAuth();setInterval(()=>{if(!S.pend&&!document.hidden)sync()},120000);
