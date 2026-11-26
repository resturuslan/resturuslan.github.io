'use strict';
/* =============================================================
   01 — PENGATURAN UNDANGAN: edit bagian ini sebelum dipublikasikan.
   Tanggal ISO wajib menyertakan zona waktu (+07:00 untuk WIB).
   Nilai kosong sengaja tidak menampilkan data pribadi/rekening palsu.
   ============================================================= */
(async function initWedding(){
const CONFIG = await WeddingStore.loadPublic();
const isPreview = new URLSearchParams(location.search).get('preview') === '1';
/* 02 — Utilitas DOM dan format tanggal. Tidak menyisipkan HTML dari input tamu. */
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const node = document.createElement(tag); if(cls) node.className=cls; if(text!==undefined) node.textContent=text; return node; };
const dateOf = value => { if(!value) return null; const d=new Date(value); return Number.isNaN(d.getTime())?null:d; };
const dateLabel = value => {const d=dateOf(value); return d ? new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:CONFIG.timeZone}).format(d) : 'Tanggal menyusul';};
const hourLabel = value => {const d=dateOf(value); return d ? new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:CONFIG.timeZone}).format(d) : '';};
const weddingStart = dateOf(CONFIG.weddingDate) || dateOf(CONFIG.events[0]?.start);
const validHttps = value => {try {return new URL(value).protocol==='https:';} catch {return false;}};
function setLink(id,url){if(validHttps(url)){const a=$(id);a.href=url;a.hidden=false;}}
function setPhoto(id,src,label){if(!src)return;const img=$(id); img.src=src; img.alt=label;}
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000);}
/* 03 — Nama tamu, cover dan audio. Play dipicu gesture pengguna agar sesuai kebijakan browser. */
const rawGuest = new URLSearchParams(location.search).get('to');
const guest = (rawGuest||'').trim().slice(0,80);
$('guest-name').textContent=guest||'Tamu Undangan';
if(guest) $('rsvp-name').value=guest;
const audio=$('background-music'), musicButton=$('music-toggle');
if(CONFIG.music){audio.src=CONFIG.music;audio.volume=CONFIG.musicVolume;}else{musicButton.hidden=true;}
function updateMusic(){const playing=!audio.paused;musicButton.setAttribute('aria-pressed',String(playing));musicButton.setAttribute('aria-label',playing?'Jeda musik':'Putar musik');musicButton.title=playing?'Jeda musik':'Putar musik';musicButton.textContent=playing?'Ⅱ':'♫';}
async function playMusic(notify=false){if(!CONFIG.music)return;try{await audio.play();}catch{if(notify)toast('Musik tidak dapat diputar. Periksa file atau coba lagi.');}finally{updateMusic();}}
audio.addEventListener('play',updateMusic);audio.addEventListener('pause',updateMusic);
musicButton.addEventListener('click',()=>audio.paused?playMusic(true):audio.pause());
$('open-invitation').addEventListener('click',()=>{
  if(document.body.classList.contains('opened'))return;
  if(!isPreview) playMusic(); // jangan menunggu animasi sebelum memanggil audio.play()
  document.body.classList.add('opened'); $('invitation').inert=false;
  const cover=$('cover'); cover.classList.add('leaving'); cover.inert=true; cover.setAttribute('aria-hidden','true');
  window.scrollTo(0,0); setTimeout(()=>{cover.hidden=true;},900);
  const home=$('home');home.setAttribute('tabindex','-1');home.focus({preventScroll:true});

});
/* 04 — Profil, tanggal, jadwal, kalender dan peta. */
document.querySelectorAll('[data-wedding-date]').forEach(n=>n.textContent=weddingStart?dateLabel(weddingStart):'Jadwal akan diumumkan');
setPhoto('hero-photo',CONFIG.coverPhoto,'Restu & Ruslan — foto atau ilustrasi sampul');
const coverImage=document.querySelector('.cover-art img');coverImage.src=CONFIG.coverPhoto;
for(const key of ['bride','groom']){const person=CONFIG[key];$(key+'-name').textContent=person.fullName;$(key+'-parents').textContent=person.parents;setPhoto(key+'-photo',person.photo,person.fullName+' — foto atau ilustrasi profil');setLink(key+'-instagram',person.instagram);}
const calendarDate = d => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function calendarURL(event){const start=dateOf(event.start),end=dateOf(event.end);if(!start||!end||end<=start)return '';const params=new URLSearchParams({action:'TEMPLATE',text:event.title+' Restu & Ruslan',dates:calendarDate(start)+'/'+calendarDate(end),location:[event.venue,event.address].filter(Boolean).join(', '),details:'Undangan pernikahan Restu & Ruslan',ctz:CONFIG.timeZone});return 'https://calendar.google.com/calendar/render?'+params;}
function makeLink(text,url,cls='btn outline'){const a=el('a',cls,text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
for(const event of CONFIG.events){const card=el('article','event-card reveal');card.append(el('h3','',event.title),el('p','',dateLabel(event.start)),el('p','',dateOf(event.start)?hourLabel(event.start)+(dateOf(event.end)?' – '+hourLabel(event.end):'')+' '+CONFIG.timeZoneLabel:'Waktu menyusul'),el('p','event-venue',event.venue||'Lokasi menyusul'),el('p','',event.address||''));const cal=calendarURL(event);if(cal)card.append(makeLink('＋ Simpan ke Google Calendar',cal));if(validHttps(event.mapsUrl))card.append(makeLink('⌖ Petunjuk lokasi',event.mapsUrl));$('event-cards').append(card);}
if(validHttps(CONFIG.mapEmbedUrl)){const u=new URL(CONFIG.mapEmbedUrl);if(['www.google.com','maps.google.com'].includes(u.hostname)){const frame=el('iframe');frame.src=u.href;frame.title='Peta lokasi pernikahan';frame.loading='lazy';frame.referrerPolicy='no-referrer-when-downgrade';frame.allowFullscreen=true;$('map-area').replaceChildren(frame);}}
setLink('maps-link',CONFIG.mapsUrl);
// Jika embed belum tersedia, cukup tampilkan tombol menuju lokasi yang diberikan.
if (!$('map-area').querySelector('iframe') && validHttps(CONFIG.mapsUrl)) $('map-area').hidden=true;
/* 05 — Countdown real-time; berhenti pada 00 setelah waktu acara tercapai. */
function updateCountdown(){if(!weddingStart)return false;const remaining=Math.max(0,Math.floor((weddingStart-Date.now())/1000));const vals=[Math.floor(remaining/86400),Math.floor(remaining%86400/3600),Math.floor(remaining%3600/60),remaining%60];['days','hours','minutes','seconds'].forEach((id,i)=>$(id).textContent=String(vals[i]).padStart(2,'0'));$('countdown-note').textContent=remaining>0?'Menghitung hari hingga pernikahan kami.':'Hari istimewa kami telah tiba.';return remaining>0;}
if(updateCountdown()){const timer=setInterval(()=>{if(!updateCountdown())clearInterval(timer);},1000);}
/* 06 — Timeline, galeri, lightbox dengan keyboard, dan video. */
$('story').hidden = CONFIG.story.length === 0;
for(const item of CONFIG.story){const article=el('article','timeline-item reveal');article.append(el('p','eyebrow',item.date),el('h3','',item.title),el('p','',item.text));$('story-list').append(article);}
const gallery=CONFIG.gallery, dialog=$('lightbox');let currentPhoto=0,lastFocus;
function showPhoto(index){if(!gallery.length)return;currentPhoto=(index+gallery.length)%gallery.length;const photo=gallery[currentPhoto];$('lightbox-image').src=photo.src;$('lightbox-image').alt=photo.alt;$('lightbox-caption').textContent=photo.alt+' · '+(currentPhoto+1)+' / '+gallery.length;}
gallery.forEach((photo,index)=>{const button=el('button','gallery-item reveal');button.type='button';button.setAttribute('aria-label','Perbesar '+photo.alt);const img=el('img');img.src=photo.src;img.alt=photo.alt;img.loading='lazy';const plus=el('span','','＋');plus.setAttribute('aria-hidden','true');button.append(img,plus);button.addEventListener('click',()=>{lastFocus=button;showPhoto(index);dialog.showModal();});$('gallery-grid').append(button);});
dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());dialog.querySelector('.lightbox-prev').addEventListener('click',()=>showPhoto(currentPhoto-1));dialog.querySelector('.lightbox-next').addEventListener('click',()=>showPhoto(currentPhoto+1));dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('close',()=>lastFocus?.focus());dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(currentPhoto-1);}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(currentPhoto+1);}});
if(CONFIG.video.src){const area=$('video-area');let media;if(CONFIG.video.type==='youtube'&&/^[\w-]{11}$/.test(CONFIG.video.src)){media=el('iframe');media.src='https://www.youtube-nocookie.com/embed/'+CONFIG.video.src;media.title='Video pernikahan';media.loading='lazy';media.allowFullscreen=true;media.referrerPolicy='strict-origin-when-cross-origin';}else if(CONFIG.video.type==='mp4'){media=el('video');media.src=CONFIG.video.src;media.controls=true;media.preload='metadata';media.playsInline=true;if(CONFIG.video.poster)media.poster=CONFIG.video.poster;}if(media){area.append(media);area.hidden=false;media.addEventListener('play',()=>audio.pause());}}
/* 07 — Hadiah digital dan clipboard; fallback untuk browser tanpa Clipboard API. */
async function copyText(text,success){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const input=el('textarea');input.value=text;input.style.cssText='position:fixed;left:-9999px';document.body.append(input);input.select();let ok;try{ok=document.execCommand('copy');}finally{input.remove();}if(!ok)throw Error('copy failed');}toast(success);}catch{toast('Tidak dapat menyalin otomatis. Silakan salin secara manual.');}}
for(const gift of CONFIG.gifts){const card=el('article','gift-card reveal');card.append(el('p','eyebrow','Digital gift'),el('h3','',gift.provider),el('p','gift-number',gift.number||'Belum tersedia'),el('p','',gift.holder?'a.n. '+gift.holder:'Nama pemilik rekening menyusul'));if(gift.number){const b=el('button','btn primary','Salin nomor');b.type='button';b.addEventListener('click',()=>copyText(gift.number,'Nomor rekening berhasil disalin!'));card.append(b);}$('gift-list').append(card);}
$('gift-address').closest('.gift-address').hidden = !CONFIG.giftAddress;
if(CONFIG.giftAddress){$('gift-address').textContent=CONFIG.giftAddress;$('copy-address').hidden=false;$('copy-address').addEventListener('click',()=>copyText(CONFIG.giftAddress,'Alamat berhasil disalin!'));}
/* 08 — RSVP WhatsApp: no backend and no shared public guestbook. */
const form=$('rsvp-form'),attendance=$('attendance'),count=$('guest-count'),status=$('form-status'),submit=$('submit-rsvp');
const whatsapp=String(CONFIG.rsvp.whatsapp||'');
const hasWhatsApp=/^[1-9]\d{7,14}$/.test(whatsapp);
$('rsvp').hidden=!hasWhatsApp&&!isPreview;
for(const link of document.querySelectorAll('a[href="#rsvp"]'))link.hidden=!hasWhatsApp&&!isPreview;
$('rsvp-mode').textContent=isPreview?'Preview admin: pengiriman dinonaktifkan.':'Konfirmasi akan dibuka di WhatsApp. Tekan Kirim di WhatsApp untuk menyampaikannya kepada penyelenggara.';
submit.disabled=isPreview||!hasWhatsApp;
function countOptions(){const old=count.value;count.replaceChildren();if(attendance.value==='Tidak Hadir'){count.append(new Option('0 orang','0'));count.value='0';}else{count.append(new Option('Pilih jumlah',''));for(let i=1;i<=CONFIG.rsvp.maxGuests;i++)count.append(new Option(i+' orang',String(i)));if([...count.options].some(o=>o.value===old))count.value=old;}}
attendance.addEventListener('change',countOptions);countOptions();
form.addEventListener('submit',e=>{e.preventDefault();if(isPreview||!hasWhatsApp||!form.reportValidity())return;const d=Object.fromEntries(new FormData(form));const name=String(d.name||'').trim();if(!name||d.website||!['Hadir','Tidak Hadir'].includes(d.attendance)||!/^\d+$/.test(d.count)||(d.attendance==='Hadir'?(Number(d.count)<1||Number(d.count)>CONFIG.rsvp.maxGuests):Number(d.count)!==0)){status.textContent='Periksa nama dan jumlah kehadiran.';return;}const message=['RSVP Pernikahan Restu & Ruslan','Nama: '+name,'Kehadiran: '+d.attendance,'Jumlah hadir: '+d.count,'Pesan & doa: '+String(d.message||'-').trim()].join('\n');const link=document.createElement('a');link.href='https://wa.me/'+whatsapp+'?text='+encodeURIComponent(message);link.target='_blank';link.rel='noopener noreferrer';document.body.append(link);link.click();link.remove();status.textContent='Silakan lanjutkan dan tekan Kirim di WhatsApp. Website tidak menyimpan atau mengonfirmasi pengiriman.';});
/* 09 — Scroll reveal (IntersectionObserver), parallax dekorasi dan kembali ke atas. */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&'IntersectionObserver'in window){document.documentElement.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(n=>observer.observe(n));}
let ticking=false;function updateScroll(){const y=window.scrollY;$('back-top').hidden=y<500;if(!reduced){document.querySelectorAll('main .dark').forEach(n=>{const rect=n.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight)n.style.setProperty('--parallax',Math.max(-18,Math.min(18,-rect.top*.035))+'px');});}ticking=false;}
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}},{passive:true});$('back-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?'instant':'smooth'}));updateScroll();

})().catch(error=>{console.error(error);document.getElementById("toast").textContent="Undangan gagal dimuat. Silakan muat ulang.";document.getElementById("toast").classList.add("show");});
