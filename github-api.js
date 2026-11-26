/* GitHub-only publishing. Token stays in a closure in this tab, never in files/storage. */
'use strict';
window.WeddingGitHub = (() => {
  function connect({owner,repo,branch,token}) {
    if (!/^[\w.-]+$/.test(owner)||! /^[\w.-]+$/.test(repo)||!branch||!token) throw Error('Isi owner, repository, branch dan token yang valid.');
    const base='https://api.github.com/repos/'+encodeURIComponent(owner)+'/'+encodeURIComponent(repo);
    const ref=branch.split('/').map(encodeURIComponent).join('/');
    async function call(path,method='GET',body){
      const res=await fetch(base+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',redirect:'error',credentials:'omit'});
      if(!res.ok)throw Error('GitHub HTTP '+res.status+' — '+({401:'Token tidak valid atau kedaluwarsa.',403:'Izin ditolak, cek Contents write atau aturan branch.',404:'Repository, branch, atau file tidak ditemukan.',409:'Konflik repository.',422:'Branch/commit ditolak, cek aturan branch.'}[res.status]||'Permintaan gagal.'));
      return res.json();
    }
    async function head(){return (await call('/git/ref/heads/'+ref)).object.sha;}
    async function load(){const sha=await head();const f=await call('/contents/config.js?ref='+encodeURIComponent(sha));if(f.encoding!=='base64')throw Error('config.js terlalu besar atau format API tidak didukung.');const bytes=Uint8Array.from(atob(f.content.replace(/\s/g,'')),c=>c.charCodeAt(0));const source=new TextDecoder().decode(bytes);const match=source.match(/window\.WEDDING_DEFAULTS\s*=\s*([\s\S]*);\s*$/);if(!match)throw Error('Bukan config.js undangan V2.3. Upload paket V2.3 dahulu.');let config;try{config=JSON.parse(match[1]);}catch{throw Error('Format config.js lama. Upload paket V2.3 dahulu.');}if(!config.bride||!config.groom||!Array.isArray(config.events)||!Array.isArray(config.gallery)||!Array.isArray(config.story)||!Array.isArray(config.gifts)||!config.video||!config.rsvp)throw Error('Struktur konfigurasi tidak sesuai.');return {sha,config};}
    async function publish(config,expected,progress=()=>{}){
      if(await head()!==expected)throw Error('Branch berubah sejak koneksi. Putuskan koneksi dan hubungkan ulang untuk mengambil versi terbaru. Backup draft terlebih dahulu.');
      const old=await call('/git/commits/'+expected);
      const next=JSON.parse(JSON.stringify(config)), entries=[],seen=new Set();
      const media=[[next,'coverPhoto'],[next.bride,'photo'],[next.groom,'photo'],...next.gallery.map(g=>[g,'src']),[next.video,'poster'],[next,'music']];
      for(const [obj,key] of media){const match=typeof obj[key]==='string'&&obj[key].match(/^data:(image\/(?:jpeg|png|webp)|audio\/(?:mpeg|mp3));base64,([A-Za-z0-9+/=]+)$/);if(!match)continue;
        const bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','audio/mpeg':'mp3','audio/mp3':'mp3'}[match[1]];const path='assets/uploads/'+digest+'.'+ext;
        if(!seen.has(path)){progress('Menyiapkan media '+(seen.size+1)+' ...');const blob=await call('/git/blobs','POST',{content:match[2],encoding:'base64'});entries.push({path,mode:'100644',type:'blob',sha:blob.sha});seen.add(path);}obj[key]=path;
      }
      progress('Membuat commit konfigurasi dan media ...');entries.push({path:'config.js',mode:'100644',type:'blob',content:WeddingStore.source(next)});
      const tree=await call('/git/trees','POST',{base_tree:old.tree.sha,tree:entries});
      if(tree.sha===old.tree.sha)return {sha:expected,config:next,unchanged:true};
      const commit=await call('/git/commits','POST',{message:'Update undangan Restu & Ruslan via Wedding Studio',tree:tree.sha,parents:[expected]});
      if(await head()!==expected)throw Error('Branch berubah saat menyimpan. Commit tidak dipublikasikan. Hubungkan ulang setelah backup draft.');
      await call('/git/refs/heads/'+ref,'PATCH',{sha:commit.sha,force:false});
      return {sha:commit.sha,config:next,unchanged:false};
    }
    return {load,publish,label:owner+'/'+repo+' · '+branch};
  }
  return {connect};
})();
