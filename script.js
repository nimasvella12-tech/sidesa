/* =====================================================
   BUMDes Suwaluh Mandiri Sejahtera — script.js (REVISI)
   Firebase: laporan + investor + saran + berita + unit usaha (bisa dilihat semua user)
   localStorage: reservasi, saran, modal pending (per-session)
   ===================================================== */

/* ============ FIREBASE CONFIG ============ */
const FIREBASE_CONFIG = {
  databaseURL: "https://bumdes-suwaluh-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
const DB_URL = FIREBASE_CONFIG.databaseURL;

function isFirebaseConfigured() {
  return DB_URL && !DB_URL.includes('bumdes-suwaluh-default-rtdb.firebaseio.com') && DB_URL.startsWith('https://');
}

/* Firebase REST helpers */
async function fbGet(path) {
  try { const r = await fetch(`${DB_URL}/${path}.json`); return r.ok ? await r.json() : null; }
  catch { return null; }
}
async function fbPush(path, data) {
  try { const r = await fetch(`${DB_URL}/${path}.json`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); return r.ok; }
  catch { return false; }
}
async function fbSet(path, data) {
  try { const r = await fetch(`${DB_URL}/${path}.json`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); return r.ok; }
  catch { return false; }
}
async function fbDelete(path) {
  try { await fetch(`${DB_URL}/${path}.json`, { method:'DELETE' }); return true; }
  catch { return false; }
}
async function fbGetAll(path) {
  const data = await fbGet(path);
  if (!data) return [];
  return Object.entries(data).map(([fbKey, val]) => ({ ...val, fbKey }));
}

/* ============ DATA DEFAULTS ============ */
const DEFAULT_USAHA = [
  { id:1, nama:'Kolam Renang', kategori:'wisata', harga:'Rp 15.000/orang', hargaNum:15000, jadwal:'Setiap hari 07.00–17.00', icon:'🏊', deskripsi:'Kolam renang keluarga dengan wahana air yang menyenangkan.', gambar:'', fasilitas:['Kolam renang 25m','Toilet bersih','Parkir gratis'], kapasitas:'200 orang', luas:'5000 m²' },
  { id:2, nama:'Flying Fox', kategori:'wisata', harga:'Rp 25.000/orang', hargaNum:25000, jadwal:'Sabtu–Minggu 08.00–16.00', icon:'🪂', deskripsi:'Wahana flying fox memacu adrenalin sepanjang 150m.', gambar:'', fasilitas:['Keselamatan terjamin','Pemandu berpengalaman'], kapasitas:'50 orang', luas:'1000 m²' },
  { id:3, nama:'Kolam Pancing', kategori:'wisata', harga:'Rp 20.000/jam', hargaNum:20000, jadwal:'Setiap hari 06.00–18.00', icon:'🎣', deskripsi:'Kolam pancing dengan ikan mas, nila, dan lele berkualitas.', gambar:'', fasilitas:['Ikan berkualitas','Pancing tersedia'], kapasitas:'30 orang', luas:'2000 m²' },
  { id:4, nama:'ATV Track', kategori:'wisata', harga:'Rp 50.000/30 menit', hargaNum:50000, jadwal:'Sabtu–Minggu 08.00–17.00', icon:'🏍️', deskripsi:'Trek ATV off-road melewati medan berliku.', gambar:'', fasilitas:['ATV terawat','Helm lengkap'], kapasitas:'20 orang', luas:'3000 m²' },
  { id:5, nama:'Camping Ground', kategori:'wisata', harga:'Rp 35.000/malam', hargaNum:35000, jadwal:'Buka setiap hari (booking)', icon:'⛺', deskripsi:'Area perkemahan asri di bawah pepohonan pinus.', gambar:'', fasilitas:['Area luas','Kamar mandi','Api unggun'], kapasitas:'100 orang', luas:'8000 m²' },
  { id:6, nama:'Warung Kuliner Desa', kategori:'kuliner', harga:'Mulai Rp 10.000', hargaNum:10000, jadwal:'Setiap hari 08.00–20.00', icon:'🍽️', deskripsi:'Sajian kuliner khas Desa Suwaluh.', gambar:'', fasilitas:['Menu beragam','Higienis'], kapasitas:'80 orang', luas:'400 m²' },
  { id:7, nama:'Jasa Sewa Gazebo', kategori:'jasa', harga:'Rp 100.000/sesi', hargaNum:100000, jadwal:'Setiap hari 08.00–18.00', icon:'🛖', deskripsi:'Sewa gazebo tepi danau untuk keluarga, gathering.', gambar:'', fasilitas:['Meja kursi','Listrik tersedia'], kapasitas:'150 orang', luas:'1500 m²' }
];

const DEFAULT_INVESTOR_FALLBACK = [
  { id:1, nama:'Pemerintah Desa Suwaluh', alamat:'Balai Desa Suwaluh', nominal:200000000, tanggal:'2022-01-10' },
  { id:2, nama:'H. Suryanto', alamat:'RT 03 RW 01 Suwaluh', nominal:50000000, tanggal:'2022-03-15' },
  { id:3, nama:'Ibu Siti Rahayu', alamat:'RT 01 RW 02 Suwaluh', nominal:30000000, tanggal:'2022-05-20' },
  { id:4, nama:'Bpk. Ahmad Fauzi', alamat:'RT 04 RW 01 Suwaluh', nominal:25000000, tanggal:'2022-07-08' },
  { id:5, nama:'CV. Maju Bersama', alamat:'Jl. Raya Sidoarjo No.12', nominal:100000000, tanggal:'2023-01-20' },
  { id:6, nama:'Koperasi Tani Makmur', alamat:'Desa Suwaluh', nominal:75000000, tanggal:'2023-04-11' },
  { id:7, nama:'Bpk. Hendra Gunawan', alamat:'RT 02 RW 03 Suwaluh', nominal:15000000, tanggal:'2023-09-05' },
  { id:8, nama:'Ibu Dewi Lestari', alamat:'RT 05 RW 02 Suwaluh', nominal:10000000, tanggal:'2024-02-14' },
  { id:9, nama:'Bpk. Suprapto', alamat:'RT 01 RW 01 Suwaluh', nominal:20000000, tanggal:'2024-06-30' },
  { id:10, nama:'Gabungan Ibu PKK', alamat:'Desa Suwaluh', nominal:121000000, tanggal:'2024-12-01' }
];

const DEFAULT_ORGANISASI = [
  { id:1, nama:'Bpk. Suwarno', jabatan:'Kepala Desa / Pembina', icon:'👑', urutan:1 },
  { id:2, nama:'Bpk. Hadi Santoso', jabatan:'Direktur BUMDes', icon:'🏛️', urutan:2 },
  { id:3, nama:'Ibu Siti Aminah', jabatan:'Sekretaris', icon:'📋', urutan:3 },
  { id:4, nama:'Bpk. Agus Riyanto', jabatan:'Bendahara', icon:'💰', urutan:4 },
  { id:5, nama:'Bpk. Dedi Kusuma', jabatan:'Kepala Unit Wisata', icon:'🏊', urutan:5 },
  { id:6, nama:'Ibu Rina Wati', jabatan:'Kepala Unit Kuliner', icon:'🍽️', urutan:6 },
  { id:7, nama:'Bpk. Bambang Eko', jabatan:'Kepala Unit Jasa', icon:'🛠️', urutan:7 }
];

const DEFAULT_SARAN = [
  { id:1, nama:'Pak Budi', email:'', pesan:'Fasilitas kolam renang sangat bagus, tolong tambah wahana untuk anak kecil!', ratingWisata:5, ratingPrasarana:4, waktu:'10 Apr 2025' },
  { id:2, nama:'Ibu Lina', email:'', pesan:'Warung kulinernya enak, harga terjangkau. Semoga makin ramai!', ratingWisata:4, ratingPrasarana:4, waktu:'15 Apr 2025' },
  { id:3, nama:'Mas Doni', email:'', pesan:'Flying fox seru banget! Rekomendasikan ke semua teman.', ratingWisata:5, ratingPrasarana:5, waktu:'20 Apr 2025' }
];

const DEFAULT_BERITA = [
  { id:1, judul:'Peresmian Wahana Flying Fox Baru', kategori:'wisata', tanggal:'1 Apr 2025', icon:'🎉', deskripsi:'BUMDes Suwaluh resmi meluncurkan wahana flying fox sepanjang 150 meter dengan standar keselamatan internasional.' },
  { id:2, judul:'Rapat Anggota Tahunan 2025', kategori:'kegiatan', tanggal:'15 Mar 2025', icon:'📊', deskripsi:'Laporan keuangan BUMDes 2024 disampaikan secara transparan kepada seluruh anggota.' },
  { id:3, judul:'Pembagian Dividen Penyertaan Modal', kategori:'pengumuman', tanggal:'1 Feb 2025', icon:'💵', deskripsi:'BUMDes Suwaluh membagikan dividen kepada seluruh pemegang saham periode 2024.' }
];

const DEFAULT_KEUANGAN = [
  { id:1, tahun:2024, totalAset:10000000000, totalEkuitas:6460000000, totalLaba:890000000, totalUtang:3540000000, paybackPeriod:5 }
];

/* ============ FIREBASE DATA FUNCTIONS ============ */

/* --- UNIT USAHA (Firebase — realtime) --- */
async function getUsahaFirebase() {
  if (!isFirebaseConfigured()) return getLs('bumdes_usaha', DEFAULT_USAHA);
  const data = await fbGetAll('usaha');
  return data.length ? data : DEFAULT_USAHA;
}

async function saveUsahaFirebase(usaha) {
  if (!isFirebaseConfigured()) {
    const data = getLs('bumdes_usaha', DEFAULT_USAHA);
    if (usaha.fbKey) {
      const i = data.findIndex(x => x.fbKey === usaha.fbKey);
      if (i >= 0) data[i] = usaha;
    } else {
      data.push({ ...usaha, id: genId(data) });
    }
    setLs('bumdes_usaha', data);
    return true;
  }
  if (usaha.fbKey) {
    const { fbKey, ...rest } = usaha;
    return await fbSet(`usaha/${fbKey}`, rest);
  }
  return await fbPush('usaha', usaha);
}

async function deleteUsahaFirebase(fbKey) {
  if (!isFirebaseConfigured()) {
    const data = getLs('bumdes_usaha', DEFAULT_USAHA);
    setLs('bumdes_usaha', data.filter(x => x.fbKey !== fbKey && String(x.id) !== String(fbKey)));
    return true;
  }
  return await fbDelete(`usaha/${fbKey}`);
}

/* --- BERITA (Firebase — realtime) --- */
async function getBeritaFirebase() {
  if (!isFirebaseConfigured()) return getLs('bumdes_berita', DEFAULT_BERITA);
  const data = await fbGetAll('berita');
  return data.length ? data : DEFAULT_BERITA;
}

async function saveBeritaFirebase(berita) {
  if (!isFirebaseConfigured()) {
    const data = getLs('bumdes_berita', DEFAULT_BERITA);
    if (berita.fbKey) {
      const i = data.findIndex(x => x.fbKey === berita.fbKey);
      if (i >= 0) data[i] = berita;
    } else {
      data.push({ ...berita, id: genId(data) });
    }
    setLs('bumdes_berita', data);
    return true;
  }
  if (berita.fbKey) {
    const { fbKey, ...rest } = berita;
    return await fbSet(`berita/${fbKey}`, rest);
  }
  return await fbPush('berita', berita);
}

async function deleteBeritaFirebase(fbKey) {
  if (!isFirebaseConfigured()) {
    const data = getLs('bumdes_berita', DEFAULT_BERITA);
    setLs('bumdes_berita', data.filter(x => x.fbKey !== fbKey && String(x.id) !== String(fbKey)));
    return true;
  }
  return await fbDelete(`berita/${fbKey}`);
}

/* --- KEUANGAN (Firebase) --- */
async function getKeuanganFirebase() {
  if (!isFirebaseConfigured()) return getLs('bumdes_keuangan', DEFAULT_KEUANGAN);
  const data = await fbGetAll('keuangan');
  return data.length ? data : DEFAULT_KEUANGAN;
}

async function saveKeuanganFirebase(keuangan) {
  if (!isFirebaseConfigured()) {
    const data = getLs('bumdes_keuangan', DEFAULT_KEUANGAN);
    const idx = data.findIndex(k => k.tahun === keuangan.tahun);
    if (idx >= 0) data[idx] = keuangan;
    else data.push(keuangan);
    setLs('bumdes_keuangan', data);
    return true;
  }
  if (keuangan.fbKey) {
    const { fbKey, ...rest } = keuangan;
    return await fbSet(`keuangan/${fbKey}`, rest);
  }
  return await fbPush('keuangan', keuangan);
}

/* --- INVESTOR (Firebase) --- */
async function getInvestorFirebase() {
  if (!isFirebaseConfigured()) return getLs('bumdes_investor', DEFAULT_INVESTOR_FALLBACK);
  const data = await fbGetAll('investor');
  return data.length ? data : DEFAULT_INVESTOR_FALLBACK;
}

async function saveInvestorFirebase(inv) {
  if (!isFirebaseConfigured()) {
    const data = getLs('bumdes_investor', DEFAULT_INVESTOR_FALLBACK);
    if (inv.fbKey) {
      const i = data.findIndex(x => x.fbKey === inv.fbKey);
      if (i >= 0) data[i] = inv;
    } else {
      data.push({ ...inv, id: genId(data) });
    }
    setLs('bumdes_investor', data);
    return true;
  }
  if (inv.fbKey) {
    const { fbKey, ...rest } = inv;
    return await fbSet(`investor/${fbKey}`, rest);
  }
  return await fbPush('investor', inv);
}

async function deleteInvestorFirebase(fbKey) {
  if (!isFirebaseConfigured()) {
    const data = getLs('bumdes_investor', DEFAULT_INVESTOR_FALLBACK);
    setLs('bumdes_investor', data.filter(x => x.fbKey !== fbKey && String(x.id) !== String(fbKey)));
    return true;
  }
  return await fbDelete(`investor/${fbKey}`);
}

/* --- LAPORAN (Firebase) --- */
async function getLaporanFirebase() {
  if (!isFirebaseConfigured()) return getLs('bumdes_laporan_fb', []);
  const data = await fbGetAll('laporan');
  return data || [];
}

async function saveLaporanFirebase(entry) {
  if (!isFirebaseConfigured()) {
    const data = getLs('bumdes_laporan_fb', []);
    const filtered = data.filter(l => !(l.tahun === entry.tahun && l.jenis === entry.jenis));
    filtered.push(entry);
    setLs('bumdes_laporan_fb', filtered.slice(-20));
    return true;
  }
  const existing = await getLaporanFirebase();
  const old = existing.find(l => l.tahun === entry.tahun && l.jenis === entry.jenis);
  if (old && old.fbKey) await fbDelete(`laporan/${old.fbKey}`);
  return await fbPush('laporan', entry);
}

async function deleteLaporanFirebase(fbKey) {
  if (!isFirebaseConfigured()) {
    setLs('bumdes_laporan_fb', getLs('bumdes_laporan_fb', []).filter(x => x.fbKey !== fbKey));
    return true;
  }
  return await fbDelete(`laporan/${fbKey}`);
}

/* ============ LOCALSTORAGE HELPERS ============ */
function getLs(key, def = []) { try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def; } catch { return def; } }
function setLs(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { } }

function getOrganisasi() { return getLs('bumdes_organisasi', DEFAULT_ORGANISASI); }
function setOrganisasi(d) { setLs('bumdes_organisasi', d); }
function getSaran() { return getLs('bumdes_saran', DEFAULT_SARAN); }
function setSaran(d) { setLs('bumdes_saran', d); }
function getReservasi() { return getLs('bumdes_reservasi', []); }
function setReservasi(d) { setLs('bumdes_reservasi', d); }
function getModalPending() { return getLs('bumdes_modal_pending', []); }
function setModalPending(d) { setLs('bumdes_modal_pending', d); }
function getTicketsSent() { return getLs('bumdes_tickets_sent', []); }
function setTicketsSent(d) { setLs('bumdes_tickets_sent', d); }

/* ============ UTILITIES ============ */
function rupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
function genId(arr) { return arr.length ? Math.max(...arr.map(x => parseInt(x.id) || 0)) + 1 : 1; }
function genInvoiceNo() { return 'INV-' + Date.now().toString().slice(-8); }
function genTicketNo() { return 'TKT-' + Date.now().toString().slice(-10); }

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3500);
}

/* ============ KEUANGAN CALCULATIONS ============ */
function calculateKeuangan(data) {
  if (!data) return { ROA: 0, ROI: 0, ROE: 0, paybackPeriod: 0 };
  
  const totalLaba = data.totalLaba || 0;
  const totalAset = data.totalAset || 1;
  const totalEkuitas = data.totalEkuitas || 1;
  const totalUtang = data.totalUtang || 0;
  
  const ROA = ((totalLaba / totalAset) * 100).toFixed(2);
  const ROI = ((totalLaba / (totalAset + totalUtang)) * 100).toFixed(2);
  const ROE = ((totalLaba / totalEkuitas) * 100).toFixed(2);
  const paybackPeriod = totalLaba > 0 ? (totalAset / totalLaba).toFixed(2) : 0;
  
  return { ROA, ROI, ROE, paybackPeriod };
}

/* ============ FIREBASE STATUS ============ */
function renderFirebaseStatus() {
  const el = document.getElementById('firebaseStatusInfo');
  if (!el) return;
  if (isFirebaseConfigured()) {
    el.innerHTML = `<div style="background:#d1fae5;border-radius:8px;padding:.7rem 1rem;font-size:.82rem;color:#065f46;margin-bottom:1rem">
      ✅ <strong>Firebase aktif.</strong> Data tersinkron realtime ke semua pengguna.</div>`;
  } else {
    el.innerHTML = `<div style="background:#fef3c7;border-radius:8px;padding:.8rem 1rem;font-size:.82rem;color:#92400e;margin-bottom:1rem">
      ⚠️ <strong>Firebase belum dikonfigurasi.</strong> Data hanya tersimpan di browser ini.</div>`;
  }
}

/* ============ NAVBAR HAMBURGER ============ */
(function initNav() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => { btn.classList.toggle('open'); links.classList.toggle('open'); });
  links.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => { btn.classList.remove('open'); links.classList.remove('open'); });
  });
})();

window.addEventListener('scroll', () => {
  document.getElementById('backToTop')?.classList.toggle('show', window.scrollY > 400);
});
document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  if (!target) return;
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const t = setInterval(() => { cur = Math.min(cur + step, target); el.textContent = cur; if (cur >= target) clearInterval(t); }, 25);
}
document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  const obs = new IntersectionObserver(e => { if (e[0].isIntersecting) { animateCounter(el); obs.disconnect(); } }, { threshold: 0.5 });
  obs.observe(el);
});

/* ============ PERSON AVATAR ============ */
function personAvatarSVG(color = '#40916c') {
  return `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="12" r="7" fill="${color}" opacity="0.8"/><ellipse cx="18" cy="28" rx="11" ry="8" fill="${color}" opacity="0.8"/></svg>`;
}

/* ============ ORG CHART ============ */
function renderOrgChart() {
  const container = document.getElementById('orgChart');
  if (!container) return;
  const data = getOrganisasi().sort((a, b) => (a.urutan || 99) - (b.urutan || 99));
  if (!data.length) { container.innerHTML = '<p style="text-align:center;color:var(--gray-500)">Belum ada data pengurus</p>'; return; }
  const levels = [
    data.filter(d => d.urutan === 1),
    data.filter(d => d.urutan === 2),
    data.filter(d => d.urutan === 3 || d.urutan === 4),
    data.filter(d => d.urutan >= 5)
  ].filter(l => l.length > 0);
  function makeCard(p, isTop = false) {
    return `<div class="org-card ${isTop ? 'top-card' : ''}"><div class="org-avatar">${personAvatarSVG(isTop ? '#1a4731' : '#40916c')}</div><div class="org-name">${p.nama}</div><div class="org-jabatan">${p.jabatan}</div></div>`;
  }
  let html = '';
  levels.forEach((level, i) => {
    if (i > 0) html += level.length === 1 ? '<div class="org-v-line"></div>' : `<div class="org-h-connect"></div>`;
    html += `<div class="org-level">${level.map((p, li) => makeCard(p, i === 0)).join('')}</div>`;
  });
  container.innerHTML = html;
}

/* ============ UNIT USAHA ============ */
async function renderUsahaGrid(filter = 'semua') {
  const grid = document.getElementById('usahaGrid');
  if (!grid) return;
  let data = await getUsahaFirebase();
  if (filter !== 'semua') data = data.filter(u => u.kategori === filter);
  grid.innerHTML = data.map(u => `
    <div class="usaha-card" data-cat="${u.kategori}">
      <div class="usaha-img">
        ${u.gambar
        ? `<img src="${u.gambar}" alt="${u.nama}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="usaha-img-fallback" style="display:none">${u.icon}</div>`
        : `<div class="usaha-img-fallback">${u.icon}</div>`}
        <span class="usaha-badge">${u.kategori}</span>
      </div>
      <div class="usaha-body">
        <h3 class="usaha-name">${u.nama}</h3>
        <p class="usaha-desc">${u.deskripsi}</p>
        <div class="usaha-harga">${u.harga}</div>
        <div class="usaha-jadwal">🕐 ${u.jadwal}</div>
        <div class="usaha-actions">
          <button class="btn btn-outline" style="color:var(--green-main);border-color:var(--green-main);background:transparent" onclick="showDetailModal(${u.id})">Detail</button>
          <a href="unit-wisata.html#reservasi" class="btn btn-primary">Pesan</a>
        </div>
      </div>
    </div>`).join('');
  if (!data.length) grid.innerHTML = '<p style="text-align:center;color:var(--gray-500);grid-column:1/-1;padding:2rem">Tidak ada unit usaha pada kategori ini.</p>';
}

function showDetailModal(id) {
  const getUsaha = async () => await getUsahaFirebase();
  getUsaha().then(data => {
    const u = data.find(x => x.id == id);
    if (!u) return;
    const overlay = document.getElementById('modalDetail');
    if (!overlay) return;
    document.getElementById('modalContent').innerHTML = `
    ${u.gambar ? `<img class="modal-img" src="${u.gambar}" alt="${u.nama}" onerror="this.style.display='none'" />` : `<div class="modal-img-fallback">${u.icon}</div>`}
    <div class="modal-body">
      <span class="section-badge">${u.kategori}</span>
      <h3>${u.nama}</h3>
      <div class="modal-info-row">
        <div class="modal-info-item"><span class="modal-info-label">Harga</span><span class="modal-info-value">${u.harga}</span></div>
        <div class="modal-info-item"><span class="modal-info-label">Operasional</span><span class="modal-info-value">${u.jadwal}</span></div>
        ${u.kapasitas ? `<div class="modal-info-item"><span class="modal-info-label">Kapasitas</span><span class="modal-info-value">${u.kapasitas}</span></div>` : ''}
        ${u.luas ? `<div class="modal-info-item"><span class="modal-info-label">Luas</span><span class="modal-info-value">${u.luas}</span></div>` : ''}
      </div>
      <p class="modal-desc">${u.deskripsi}</p>
      ${u.fasilitas && u.fasilitas.length ? `<div class="modal-fasilitas"><h4>✅ Fasilitas</h4><ul>${u.fasilitas.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}
      <div class="modal-footer">
        <a href="unit-wisata.html#reservasi" class="btn btn-primary">📅 Reservasi Sekarang</a>
        <button class="btn btn-outline" style="color:var(--green-main);border-color:var(--green-main)" onclick="closeModal()">Tutup</button>
      </div>
    </div>`;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

function closeModal() {
  document.getElementById('modalDetail')?.classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('modalDetail')?.addEventListener('click', function (e) { if (e.target === this) closeModal(); });

document.getElementById('usahaFilter')?.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderUsahaGrid(this.dataset.cat);
  });
});

/* ============ INVESTOR TABLE ============ */
async function renderInvestorTable(search = '') {
  const tbody = document.getElementById('investorBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--gray-500);padding:1rem">⏳ Memuat data investor...</td></tr>';
  let data = await getInvestorFirebase();
  if (search) data = data.filter(i => i.nama.toLowerCase().includes(search.toLowerCase()));
  tbody.innerHTML = data.map((inv, idx) => `
    <tr><td>${idx + 1}</td><td>${inv.nama}</td><td>${inv.alamat}</td><td class="nominal-cell">${rupiah(inv.nominal)}</td></tr>`).join('');
  if (!data.length) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--gray-500);padding:1rem">Data tidak ditemukan</td></tr>';
  const totalEl = document.querySelector('[data-total-investor]');
  if (totalEl && data.length) {
    const total = data.reduce((s, i) => s + (parseInt(i.nominal) || 0), 0);
    totalEl.textContent = rupiah(total);
  }
}
document.getElementById('searchInvestor')?.addEventListener('input', function () { renderInvestorTable(this.value); });

/* ============ FORM SAHAM ============ */
const lembarInput = document.getElementById('s-lembar');
const totalDisplay = document.getElementById('totalSaham');
if (lembarInput && totalDisplay) {
  lembarInput.addEventListener('input', function () { totalDisplay.textContent = rupiah((parseInt(this.value) || 0) * 100000); });
}

document.getElementById('formSaham')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const nama = document.getElementById('s-nama').value.trim();
  const alamat = document.getElementById('s-alamat').value.trim();
  const telp = document.getElementById('s-telp').value.trim();
  const lembar = parseInt(document.getElementById('s-lembar').value) || 0;
  const buktiFile = document.getElementById('s-bukti');
  let valid = true;
  [{ id: 's-nama', val: nama }, { id: 's-alamat', val: alamat }, { id: 's-telp', val: telp }].forEach(f => {
    const el = document.getElementById(f.id);
    const err = el.nextElementSibling;
    if (!f.val) { el.classList.add('error'); err.textContent = 'Wajib diisi'; valid = false; } else { el.classList.remove('error'); err.textContent = ''; }
  });
  if (lembar < 1) { document.getElementById('s-lembar').classList.add('error'); document.getElementById('s-lembar').nextElementSibling.textContent = 'Minimal 1 lembar'; valid = false; }
  else { document.getElementById('s-lembar').classList.remove('error'); document.getElementById('s-lembar').nextElementSibling.textContent = ''; }
  if (!valid) return;
  const pending = getModalPending();
  pending.push({ id: genId(pending), nama, alamat, telp, lembar, total: lembar * 100000, bukti: (buktiFile && buktiFile.files[0]) ? buktiFile.files[0].name : '-', status: 'pending', waktu: new Date().toLocaleDateString('id-ID') });
  setModalPending(pending);
  showToast('✅ Permintaan pembelian saham dikirim! Tunggu konfirmasi admin.');
  this.reset();
  if (totalDisplay) totalDisplay.textContent = 'Rp 0';
  const p = document.getElementById('s-bukti-preview');
  if (p) p.textContent = '';
});

function previewBukti(input, previewId) {
  const p = document.getElementById(previewId);
  if (!p) return;
  p.textContent = (input.files && input.files[0]) ? '✅ File dipilih: ' + input.files[0].name : '';
}

/* ============ INVOICE GENERATOR ============ */
function generateInvoiceHTML(data) {
  const now = new Date();
  const tglInvoice = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const getUsaha = async () => await getUsahaFirebase();
  getUsaha().then(usahaData => {
    const u = usahaData.find(x => x.nama === data.wisata);
    const hargaSatuan = u ? (u.hargaNum || 0) : 0;
    const subtotal = hargaSatuan * (data.jumlah || 1);
    const adminFee = 2000;
    const total = subtotal + adminFee;

    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invoice ${data.invoiceNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f4f1;display:flex;justify-content:center;padding:2rem 1rem;}
  .invoice{background:#fff;max-width:680px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.12);}
  .inv-header{background:linear-gradient(135deg,#1a4731,#40916c);color:#fff;padding:2rem 2.5rem;}
  .inv-body{padding:2rem 2.5rem;}
  .inv-table{width:100%;border-collapse:collapse;margin-bottom:1.5rem;}
  .inv-table th{padding:.75rem 1rem;text-align:left;font-size:.78rem;background:#f0f4f1;}
  .inv-table td{padding:.9rem 1rem;border-bottom:1px solid #e0e8e2;}
  .inv-totals{background:#f8faf8;border-radius:10px;padding:1.2rem 1.5rem;}
  .inv-total-row{display:flex;justify-content:space-between;padding:.3rem 0;}
  .inv-total-row.final{font-weight:700;border-top:2px solid #d8f3dc;margin-top:.5rem;padding-top:.8rem;}
</style>
</head>
<body>
<div class="invoice">
  <div class="inv-header">
    <h2>BUMDes Suwaluh Mandiri Sejahtera</h2>
    <p>Invoice: ${data.invoiceNo}</p>
  </div>
  <div class="inv-body">
    <p><strong>${data.nama}</strong><br>${data.telp}</p>
    <table class="inv-table">
      <thead><tr><th>Item</th><th>Qty</th><th>Harga</th></tr></thead>
      <tbody>
        <tr><td>${data.wisata}</td><td>${data.jumlah}</td><td>${hargaSatuan > 0 ? rupiah(subtotal) : '—'}</td></tr>
      </tbody>
    </table>
    ${hargaSatuan > 0 ? `<div class="inv-totals">
      <div class="inv-total-row"><span>Subtotal</span><span>${rupiah(subtotal)}</span></div>
      <div class="inv-total-row"><span>Admin</span><span>${rupiah(adminFee)}</span></div>
      <div class="inv-total-row final"><span>TOTAL</span><span>${rupiah(total)}</span></div>
    </div>` : ''}
  </div>
</div>
</body>
</html>`;
  });
}

function showInvoice(reservasiData) {
  const html = generateInvoiceHTML(reservasiData);
  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
  else showToast('Aktifkan pop-up untuk melihat invoice!', 'error');
}

/* ============ FORM RESERVASI ============ */
document.getElementById('formReservasi')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const nama = document.getElementById('res-nama').value.trim();
  const telp = document.getElementById('res-telp').value.trim();
  const wisata = document.getElementById('res-wisata').value;
  const tanggal = document.getElementById('res-tanggal').value;
  const jumlah = parseInt(document.getElementById('res-jumlah').value) || 0;
  const buktiFile = document.getElementById('res-bukti');
  let valid = true;
  [{ id: 'res-nama', val: nama }, { id: 'res-telp', val: telp }, { id: 'res-wisata', val: wisata }, { id: 'res-tanggal', val: tanggal }].forEach(f => {
    const el = document.getElementById(f.id);
    const err = el.nextElementSibling;
    if (!f.val) { el.classList.add('error'); if (err) err.textContent = 'Wajib diisi'; valid = false; }
    else { el.classList.remove('error'); if (err) err.textContent = ''; }
  });
  if (jumlah < 1) { document.getElementById('res-jumlah').classList.add('error'); valid = false; }
  else document.getElementById('res-jumlah').classList.remove('error');
  if (!valid) return;

  const invoiceNo = genInvoiceNo();
  const catatan = document.getElementById('res-catatan')?.value.trim() || '';
  const reservasiData = {
    id: genId(getReservasi()), invoiceNo, nama, telp, wisata, tanggal, jumlah, catatan,
    bukti: (buktiFile && buktiFile.files[0]) ? buktiFile.files[0].name : '-',
    status: 'pending', waktu: new Date().toLocaleDateString('id-ID')
  };

  const reservasi = getReservasi();
  reservasi.push(reservasiData);
  setReservasi(reservasi);

  showReservasiSuccessModal(reservasiData);
  this.reset();
  document.getElementById('res-bukti-preview') && (document.getElementById('res-bukti-preview').textContent = '');
});

function showReservasiSuccessModal(data) {
  const existing = document.getElementById('reservasiSuccessModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'reservasiSuccessModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:8000;display:flex;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;max-width:440px;width:100%;padding:2rem;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);">
      <div style="font-size:3.5rem;margin-bottom:.8rem">✅</div>
      <h3 style="color:#1a4731;font-size:1.3rem;margin-bottom:.5rem">Reservasi Berhasil!</h3>
      <p style="color:#6b7e72;font-size:.9rem;margin-bottom:1.2rem">
        Nomor Invoice: <strong style="color:#40916c">${data.invoiceNo}</strong><br>
        ${data.wisata} • ${data.tanggal} • ${data.jumlah} tiket
      </p>
      <div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap">
        <button onclick="showInvoice(${JSON.stringify(data).replace(/"/g, '&quot;')});document.getElementById('reservasiSuccessModal').remove()"
          style="background:#40916c;color:#fff;border:none;padding:.7rem 1.5rem;border-radius:50px;font-weight:600;cursor:pointer;font-size:.9rem">
          🧾 Download Invoice
        </button>
        <button onclick="document.getElementById('reservasiSuccessModal').remove()"
          style="background:#f0f4f1;color:#374740;border:none;padding:.7rem 1.5rem;border-radius:50px;font-weight:600;cursor:pointer;font-size:.9rem">
          Tutup
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/* ============ FORM SARAN ============ */
const ratings = {};
document.querySelectorAll('.star-rating').forEach(container => {
  const key = container.dataset.key;
  ratings[key] = 0;
  const stars = container.querySelectorAll('span');
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => stars.forEach(s => s.classList.toggle('hover', parseInt(s.dataset.v) <= parseInt(star.dataset.v))));
    star.addEventListener('mouseleave', () => stars.forEach(s => s.classList.remove('hover')));
    star.addEventListener('click', () => { ratings[key] = parseInt(star.dataset.v); stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.v) <= ratings[key])); });
  });
});

document.getElementById('formSaran')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const nama = document.getElementById('sr-nama').value.trim();
  const pesan = document.getElementById('sr-pesan').value.trim();
  let valid = true;
  [{ id: 'sr-nama', val: nama }, { id: 'sr-pesan', val: pesan }].forEach(f => {
    const el = document.getElementById(f.id);
    const err = el.nextElementSibling;
    if (!f.val) { el.classList.add('error'); err.textContent = 'Wajib diisi'; valid = false; } else { el.classList.remove('error'); err.textContent = ''; }
  });
  if (!valid) return;
  const saranData = getSaran();
  saranData.unshift({ id: genId(saranData), nama, email: document.getElementById('sr-email')?.value || '', pesan, ratingWisata: ratings['wisata'] || 0, ratingPrasarana: ratings['prasarana'] || 0, waktu: new Date().toLocaleDateString('id-ID') });
  setSaran(saranData);
  renderSaranList();
  renderTestimoniList();
  showToast('✅ Terima kasih atas masukan Anda!');
  this.reset();
  Object.keys(ratings).forEach(k => { ratings[k] = 0; });
  document.querySelectorAll('.star-rating span').forEach(s => s.classList.remove('active', 'hover'));
});

function renderSaranList() {
  const el = document.getElementById('saranList');
  if (!el) return;
  el.innerHTML = getSaran().slice(0, 3).map(s => `<div class="testimoni-card"><div class="testimoni-header"><span class="testimoni-nama">${s.nama}</span><span style="font-size:.78rem;color:var(--gray-500)">${s.waktu}</span></div><p class="testimoni-text">${s.pesan}</p><div class="testimoni-rating">Wisata: ${'⭐'.repeat(s.ratingWisata)} | Prasarana: ${'⭐'.repeat(s.ratingPrasarana)}</div></div>`).join('');
}

function renderTestimoniList() {
  const el = document.getElementById('testimoniList');
  if (!el) return;
  el.innerHTML = getSaran().filter(s => s.ratingWisata >= 4).slice(0, 3).map(s => `<div class="testimoni-card"><div class="testimoni-header"><span class="testimoni-nama">${s.nama}</span></div><p class="testimoni-text">"${s.pesan}"</p></div>`).join('');
}

/* ============ BERITA — USER VIEW ============ */
async function renderBeritaList() {
  const el = document.getElementById('beritaList');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;color:var(--gray-500)">⏳ Memuat berita...</div>';
  const berita = await getBeritaFirebase();
  if (!berita.length) {
    el.innerHTML = '<p style="text-align:center;color:var(--gray-500);padding:2rem">Belum ada berita.</p>';
    return;
  }
  el.innerHTML = berita.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 6).map(b => `
    <div class="berita-card">
      <div class="berita-icon">${b.icon || '📰'}</div>
      <div class="berita-body">
        <span class="berita-badge">${b.kategori}</span>
        <h4 class="berita-title">${b.judul}</h4>
        <p class="berita-desc">${b.deskripsi}</p>
        <span class="berita-date">📅 ${b.tanggal}</span>
      </div>
    </div>`).join('');
}

/* ============ TRANSPARANSI TABS ============ */
document.getElementById('tabsTransparansi')?.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#tabsTransparansi .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + this.dataset.tab)?.classList.add('active');
    if (this.dataset.tab === 'tren') initCharts();
  });
});

/* ============ GOOGLE MAPS EMBED ============ */
function renderGoogleMaps() {
  const el = document.getElementById('googleMapsEmbed');
  if (!el) return;
  el.innerHTML = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.7484957814717!2d112.70889831531656!3d-7.3830000759156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7d8d9d9d9d9d9%3A0x0!2sDesa%20Suwaluh!5e0!3m2!1sid!2sid!4v1234567890" width="100%" height="400" style="border:0;border-radius:8px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

/* ============ KEUANGAN ANALYTICS ============ */
async function renderAnalisisGrid() {
  const el = document.getElementById('analisisGrid');
  if (!el) return;
  const keuangan = await getKeuanganFirebase();
  const current = keuangan.find(k => k.tahun === 2024) || keuangan[0];
  if (!current) return;
  const { ROA, ROI, ROE, paybackPeriod } = calculateKeuangan(current);
  const items = [
    { icon: '💰', label: 'Total Aset', value: rupiah(current.totalAset), desc: 'Nilai aset keseluruhan' },
    { icon: '📈', label: 'Total Laba 2024', value: rupiah(current.totalLaba), desc: 'Keuntungan bersih' },
    { icon: '🏦', label: 'Total Ekuitas', value: rupiah(current.totalEkuitas), desc: 'Modal pemegang saham' },
    { icon: '📊', label: 'ROE', value: `${ROE}%`, desc: 'Return on Equity' },
    { icon: '📉', label: 'ROA', value: `${ROA}%`, desc: 'Return on Asset' },
    { icon: '🔄', label: 'ROI', value: `${ROI}%`, desc: 'Return on Investment' },
    { icon: '⏱️', label: 'Payback Period', value: `${paybackPeriod} tahun`, desc: 'Waktu pengembalian modal' },
    { icon: '💳', label: 'Total Utang', value: rupiah(current.totalUtang), desc: 'Kewajiban finansial' }
  ];
  el.innerHTML = items.map(i => `<div class="analisis-card"><span class="analisis-icon">${i.icon}</span><div class="analisis-label">${i.label}</div><div class="analisis-value">${i.value}</div><div class="analisis-desc">${i.desc}</div></div>`).join('');
}

/* ============ ADMIN AUTH (2-CLICK) ============ */
const ADMIN_CREDS = { username: 'admin', password: 'bumdes2025' };
let adminLoggedIn = false, logoClickCount = 0;

document.querySelector('.nav-brand')?.addEventListener('click', e => {
  e.preventDefault();
  logoClickCount++;
  if (logoClickCount >= 2) {
    logoClickCount = 0;
    showAdminLogin();
  } else {
    setTimeout(() => { logoClickCount = 0; }, 500);
  }
});

function showAdminLogin() {
  if (adminLoggedIn) { showAdminPanel(); return; }
  document.getElementById('adminLoginOverlay')?.classList.add('active');
}

function attemptLogin() {
  const u = document.getElementById('adminUsername')?.value.trim();
  const p = document.getElementById('adminPassword')?.value.trim();
  if (u === ADMIN_CREDS.username && p === ADMIN_CREDS.password) {
    adminLoggedIn = true;
    document.getElementById('adminLoginOverlay').classList.remove('active');
    showAdminPanel();
  } else {
    const err = document.getElementById('adminLoginError');
    if (err) err.style.display = 'block';
  }
}

function showAdminPanel() {
  document.getElementById('adminPanelContainer')?.classList.add('open');
  populateAdminTables();
}

function hideAdminPanel() {
  document.getElementById('adminPanelContainer')?.classList.remove('open');
}

function logoutAdmin() {
  adminLoggedIn = false;
  hideAdminPanel();
  showToast('Anda telah keluar dari admin panel.');
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelector(`.admin-tab-btn[data-tab="${tab}"]`)?.classList.add('active');
  document.getElementById(`admin-tab-${tab}`)?.classList.add('active');
  populateAdminTables();
}

async function populateAdminTables() {
  await renderAdminUsahaTable();
  await renderAdminBeritaTable();
  await renderAdminInvestorTable();
  renderAdminSaranTable();
  renderAdminOrganisasiTable();
  renderAdminReservasiTable();
  renderAdminModalPendingTable();
  await renderAdminLaporanList();
  await renderAdminKeuanganTable();
  renderFirebaseStatus();
}

/* ============ ADMIN: UNIT USAHA (Firebase) ============ */
async function renderAdminUsahaTable() {
  const tbody = document.getElementById('adminUsahaTableBody');
  if (!tbody) return;
  const data = await getUsahaFirebase();
  tbody.innerHTML = data.map(u => `<tr><td>${u.id}</td><td>${u.nama}</td><td>${u.kategori}</td><td>${u.harga}</td><td><button class="admin-btn-edit" onclick="editAdminUsaha(${u.id})">✏️</button><button class="admin-btn-delete" onclick="deleteAdminUsahaFb('${u.fbKey || u.id}')">🗑️</button></td></tr>`).join('');
}

function openAdminUsahaForm() {
  document.getElementById('adminUsahaForm')?.classList.remove('hidden');
  document.getElementById('adminEditUsahaId').value = '';
  ['adminNamaUsaha', 'adminHargaUsaha', 'adminJadwalUsaha', 'adminDeskUsaha', 'adminGambarUsaha'].forEach(id => document.getElementById(id).value = '');
}

function closeAdminUsahaForm() {
  document.getElementById('adminUsahaForm')?.classList.add('hidden');
}

async function editAdminUsaha(id) {
  const data = await getUsahaFirebase();
  const u = data.find(x => x.id === id);
  if (!u) return;
  openAdminUsahaForm();
  document.getElementById('adminEditUsahaId').value = u.id;
  document.getElementById('adminNamaUsaha').value = u.nama;
  document.getElementById('adminKategoriUsaha').value = u.kategori;
  document.getElementById('adminHargaUsaha').value = u.harga;
  document.getElementById('adminJadwalUsaha').value = u.jadwal;
  document.getElementById('adminDeskUsaha').value = u.deskripsi;
  document.getElementById('adminGambarUsaha').value = u.gambar || '';
}

async function saveAdminUsaha() {
  const id = parseInt(document.getElementById('adminEditUsahaId').value) || 0;
  const nama = document.getElementById('adminNamaUsaha').value.trim();
  if (!nama) { showToast('Nama wajib diisi!', 'error'); return; }
  const data = await getUsahaFirebase();
  const obj = {
    id: id || genId(data), nama, kategori: document.getElementById('adminKategoriUsaha').value,
    harga: document.getElementById('adminHargaUsaha').value.trim(),
    jadwal: document.getElementById('adminJadwalUsaha').value.trim(),
    deskripsi: document.getElementById('adminDeskUsaha').value.trim(),
    gambar: document.getElementById('adminGambarUsaha').value.trim(),
    icon: '🏢', hargaNum: parseInt(document.getElementById('adminHargaUsaha').value.replace(/\D/g, '')) || 0,
    fasilitas: [], kapasitas: '', luas: ''
  };
  if (id) {
    const idx = data.findIndex(x => x.id === id);
    if (idx >= 0) {
      obj.fbKey = data[idx].fbKey;
      obj.fasilitas = data[idx].fasilitas || [];
      obj.kapasitas = data[idx].kapasitas || '';
      obj.luas = data[idx].luas || '';
      data[idx] = obj;
    }
  } else {
    data.push(obj);
  }
  const ok = await saveUsahaFirebase(obj);
  if (ok) {
    closeAdminUsahaForm();
    renderAdminUsahaTable();
    renderUsahaGrid();
    showToast('✅ Unit usaha berhasil disimpan & tersinkron!');
  } else showToast('❌ Gagal menyimpan.', 'error');
}

async function deleteAdminUsahaFb(fbKey) {
  if (!confirm('Hapus unit usaha ini?')) return;
  await deleteUsahaFirebase(fbKey);
  renderAdminUsahaTable();
  renderUsahaGrid();
  showToast('🗑️ Unit usaha dihapus.');
}

/* ============ ADMIN: BERITA (Firebase) ============ */
async function renderAdminBeritaTable() {
  const tbody = document.getElementById('adminBeritaTableBody');
  if (!tbody) return;
  const data = await getBeritaFirebase();
  tbody.innerHTML = data.map(b => `<tr><td>${b.id}</td><td>${b.judul}</td><td>${b.kategori}</td><td>${b.tanggal}</td><td><button class="admin-btn-edit" onclick="editAdminBerita(${b.id})">✏️</button><button class="admin-btn-delete" onclick="deleteAdminBeritaFb('${b.fbKey || b.id}')">🗑️</button></td></tr>`).join('');
}

function openAdminBeritaForm() {
  document.getElementById('adminBeritaForm')?.classList.remove('hidden');
  document.getElementById('adminEditBeritaId').value = '';
}

function closeAdminBeritaForm() {
  document.getElementById('adminBeritaForm')?.classList.add('hidden');
}

async function editAdminBerita(id) {
  const data = await getBeritaFirebase();
  const b = data.find(x => x.id === id);
  if (!b) return;
  openAdminBeritaForm();
  document.getElementById('adminEditBeritaId').value = b.id;
  document.getElementById('adminJudulBerita').value = b.judul;
  document.getElementById('adminKategoriBerita').value = b.kategori;
  document.getElementById('adminDeskBerita').value = b.deskripsi;
  document.getElementById('adminTglBerita').value = b.tanggal;
}

async function saveAdminBerita() {
  const id = parseInt(document.getElementById('adminEditBeritaId').value) || 0;
  const judul = document.getElementById('adminJudulBerita').value.trim();
  if (!judul) { showToast('Judul wajib diisi!', 'error'); return; }
  const data = await getBeritaFirebase();
  const obj = {
    id: id || genId(data),
    judul,
    kategori: document.getElementById('adminKategoriBerita').value,
    deskripsi: document.getElementById('adminDeskBerita').value.trim(),
    tanggal: document.getElementById('adminTglBerita').value,
    icon: '📰'
  };
  if (id) {
    const idx = data.findIndex(x => x.id === id);
    if (idx >= 0) {
      obj.fbKey = data[idx].fbKey;
      data[idx] = obj;
    }
  } else {
    data.push(obj);
  }
  const ok = await saveBeritaFirebase(obj);
  if (ok) {
    closeAdminBeritaForm();
    renderAdminBeritaTable();
    renderBeritaList();
    showToast('✅ Berita disimpan & tersinkron!');
  }
}

async function deleteAdminBeritaFb(fbKey) {
  if (!confirm('Hapus berita ini?')) return;
  await deleteBeritaFirebase(fbKey);
  renderAdminBeritaTable();
  renderBeritaList();
  showToast('🗑️ Berita dihapus.');
}

/* ============ ADMIN: KEUANGAN (Firebase) ============ */
async function renderAdminKeuanganTable() {
  const tbody = document.getElementById('adminKeuanganTableBody');
  if (!tbody) return;
  const data = await getKeuanganFirebase();
  tbody.innerHTML = data.map(k => {
    const { ROA, ROI, ROE } = calculateKeuangan(k);
    return `<tr>
      <td>${k.tahun}</td>
      <td>${rupiah(k.totalAset)}</td>
      <td>${rupiah(k.totalEkuitas)}</td>
      <td>${rupiah(k.totalLaba)}</td>
      <td>${ROE}% | ${ROA}% | ${ROI}%</td>
      <td><button class="admin-btn-edit" onclick="editAdminKeuangan(${k.tahun})">✏️</button><button class="admin-btn-delete" onclick="deleteAdminKeuanganFb('${k.fbKey || k.tahun}')">🗑️</button></td>
    </tr>`;
  }).join('');
}

function openAdminKeuanganForm() {
  document.getElementById('adminKeuanganForm')?.classList.remove('hidden');
  document.getElementById('adminEditKeuanganTahun').value = '';
}

function closeAdminKeuanganForm() {
  document.getElementById('adminKeuanganForm')?.classList.add('hidden');
}

async function editAdminKeuangan(tahun) {
  const data = await getKeuanganFirebase();
  const k = data.find(x => x.tahun === tahun);
  if (!k) return;
  openAdminKeuanganForm();
  document.getElementById('adminEditKeuanganTahun').value = k.tahun;
  document.getElementById('adminKeuanganTahun').value = k.tahun;
  document.getElementById('adminTotalAset').value = k.totalAset;
  document.getElementById('adminTotalEkuitas').value = k.totalEkuitas;
  document.getElementById('adminTotalLaba').value = k.totalLaba;
  document.getElementById('adminTotalUtang').value = k.totalUtang || 0;
}

async function saveAdminKeuangan() {
  const tahun = parseInt(document.getElementById('adminKeuanganTahun').value) || new Date().getFullYear();
  const totalAset = parseInt(document.getElementById('adminTotalAset').value) || 0;
  const totalEkuitas = parseInt(document.getElementById('adminTotalEkuitas').value) || 0;
  const totalLaba = parseInt(document.getElementById('adminTotalLaba').value) || 0;
  const totalUtang = parseInt(document.getElementById('adminTotalUtang').value) || 0;
  if (!totalAset) { showToast('Total aset wajib diisi!', 'error'); return; }
  const obj = { tahun, totalAset, totalEkuitas, totalLaba, totalUtang };
  const ok = await saveKeuanganFirebase(obj);
  if (ok) {
    closeAdminKeuanganForm();
    renderAdminKeuanganTable();
    renderAnalisisGrid();
    showToast('✅ Data keuangan disimpan & tersinkron!');
  }
}

async function deleteAdminKeuanganFb(key) {
  if (!confirm('Hapus data keuangan ini?')) return;
  const data = await getKeuanganFirebase();
  const filtered = data.filter(k => k.fbKey !== key && k.tahun !== parseInt(key));
  for (const k of filtered) await saveKeuanganFirebase(k);
  renderAdminKeuanganTable();
  renderAnalisisGrid();
  showToast('🗑️ Data keuangan dihapus.');
}

/* ============ ADMIN: INVESTOR ============ */
async function renderAdminInvestorTable() {
  const tbody = document.getElementById('adminInvestorTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--gray-500);padding:.8rem">⏳ Memuat...</td></tr>';
  const data = await getInvestorFirebase();
  tbody.innerHTML = data.map(inv => `<tr><td>${inv.id || '-'}</td><td>${inv.nama}</td><td>${inv.alamat}</td><td class="nominal-cell">${rupiah(inv.nominal)}</td>
    <td><button class="admin-btn-delete" onclick="deleteAdminInvestorFb('${inv.fbKey || inv.id}')">🗑️</button></td></tr>`).join('');
}

async function deleteAdminInvestorFb(key) {
  if (!confirm('Hapus investor ini?')) return;
  await deleteInvestorFirebase(key);
  renderAdminInvestorTable();
  renderInvestorTable();
  showToast('🗑️ Investor dihapus.');
}

/* ============ ADMIN: RESERVASI + TIKET ============ */
function renderAdminReservasiTable() {
  const tbody = document.getElementById('adminReservasiTableBody');
  if (!tbody) return;
  const data = getReservasi();
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--gray-500);padding:1rem">Belum ada reservasi</td></tr>'; return; }
  tbody.innerHTML = data.map((r, i) => `<tr>
    <td>${i + 1}</td>
    <td><strong>${r.nama}</strong><br><small>${r.telp}</small></td>
    <td>${r.wisata}</td><td>${r.tanggal}</td><td>${r.jumlah} tiket</td>
    <td><small>${r.bukti !== '-' ? '📎 ' + r.bukti : '—'}</small></td>
    <td><small style="color:#6b7e72">${r.invoiceNo || '—'}</small></td>
    <td><span class="status-badge status-${r.status}">${r.status === 'pending' ? '⏳ Pending' : r.status === 'validated' ? '✅ Konfirmasi' : '❌ Ditolak'}</span></td>
    <td>
      ${r.status === 'pending' ? `<button class="admin-btn-validate" onclick="validateReservasi(${r.id})">✅</button><button class="admin-btn-delete" onclick="rejectReservasi(${r.id})">❌</button>` : ''}
      <button class="admin-btn-edit" onclick="cetakInvoiceAdmin(${r.id})" title="Cetak Invoice">🧾</button>
      <button class="admin-btn-delete" onclick="submitTicketAdmin(${r.id})" title="Kirim Tiket">🎫</button>
    </td>
  </tr>`).join('');
}

function validateReservasi(id) {
  const d = getReservasi();
  const i = d.findIndex(x => x.id === id);
  if (i >= 0) {
    d[i].status = 'validated';
    setReservasi(d);
    renderAdminReservasiTable();
    showToast('✅ Reservasi dikonfirmasi!');
  }
}

function rejectReservasi(id) {
  const d = getReservasi();
  const i = d.findIndex(x => x.id === id);
  if (i >= 0) {
    d[i].status = 'rejected';
    setReservasi(d);
    renderAdminReservasiTable();
    showToast('❌ Reservasi ditolak.', 'error');
  }
}

function deleteReservasi(id) {
  if (!confirm('Hapus?')) return;
  setReservasi(getReservasi().filter(x => x.id !== id));
  renderAdminReservasiTable();
}

function cetakInvoiceAdmin(id) {
  const r = getReservasi().find(x => x.id === id);
  if (r) showInvoice(r);
}

function submitTicketAdmin(id) {
  const r = getReservasi().find(x => x.id === id);
  if (!r) { showToast('Reservasi tidak ditemukan.', 'error'); return; }
  if (r.status !== 'validated') { showToast('Konfirmasi reservasi terlebih dahulu!', 'error'); return; }
  
  const ticketNo = genTicketNo();
  const ticketData = {
    ticketNo, reservasiId: r.id, nama: r.nama, wisata: r.wisata, tanggal: r.tanggal,
    jumlah: r.jumlah, tglKirim: new Date().toLocaleDateString('id-ID'), status: 'sent'
  };
  
  const tickets = getTicketsSent();
  tickets.push(ticketData);
  setTicketsSent(tickets);
  
  showToast(`✅ Tiket dikirim! No. Tiket: ${ticketNo}`);
  
  // Simulasi kirim email/WA (bisa diintegrasikan dengan API)
  console.log('Tiket dikirim ke:', r.telp, ticketData);
}

/* ============ ADMIN: MODAL PENDING ============ */
function renderAdminModalPendingTable() {
  const tbody = document.getElementById('adminModalPendingTableBody');
  if (!tbody) return;
  const data = getModalPending();
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--gray-500);padding:1rem">Belum ada permintaan</td></tr>'; return; }
  tbody.innerHTML = data.map((m, i) => `<tr>
    <td>${i + 1}</td><td><strong>${m.nama}</strong></td><td>${m.alamat}</td><td>${m.telp}</td>
    <td>${m.lembar} lbr</td><td class="nominal-cell">${rupiah(m.total)}</td>
    <td><small>${m.bukti !== '-' ? '📎 ' + m.bukti : '—'}</small></td>
    <td><span class="status-badge status-${m.status}">${m.status === 'pending' ? '⏳ Pending' : m.status === 'validated' ? '✅ Valid' : '❌ Ditolak'}</span></td>
    <td>${m.status === 'pending' ? `<button class="admin-btn-validate" onclick="validateModalPending(${m.id})">✅</button><button class="admin-btn-delete" onclick="rejectModalPending(${m.id})">❌</button>` : ''}</td>
  </tr>`).join('');
}

async function validateModalPending(id) {
  const data = getModalPending();
  const idx = data.findIndex(x => x.id === id);
  if (idx < 0) return;
  data[idx].status = 'validated';
  setModalPending(data);
  const m = data[idx];
  const ok = await saveInvestorFirebase({ nama: m.nama, alamat: m.alamat, nominal: m.total, tanggal: new Date().toISOString().split('T')[0] });
  renderAdminModalPendingTable();
  renderAdminInvestorTable();
  renderInvestorTable();
  showToast(ok ? '✅ Divalidasi! Investor tersinkron.' : '✅ Divalidasi!');
}

function rejectModalPending(id) {
  const d = getModalPending();
  const i = d.findIndex(x => x.id === id);
  if (i >= 0) {
    d[i].status = 'rejected';
    setModalPending(d);
    renderAdminModalPendingTable();
    showToast('❌ Ditolak.', 'error');
  }
}

function deleteModalPending(id) {
  if (!confirm('Hapus?')) return;
  setModalPending(getModalPending().filter(x => x.id !== id));
  renderAdminModalPendingTable();
}

/* ============ ADMIN: SARAN ============ */
function renderAdminSaranTable() {
  const tbody = document.getElementById('adminSaranTableBody');
  if (!tbody) return;
  tbody.innerHTML = getSaran().map(s => `<tr><td>${s.id}</td><td>${s.nama}</td><td style="max-width:300px">${s.pesan.substring(0, 50)}...</td><td>${s.ratingWisata}⭐ | ${s.ratingPrasarana}⭐</td><td><button class="admin-btn-delete" onclick="deleteAdminSaran(${s.id})">🗑️</button></td></tr>`).join('');
}

function deleteAdminSaran(id) {
  if (!confirm('Hapus?')) return;
  setSaran(getSaran().filter(x => x.id !== id));
  renderAdminSaranTable();
  renderSaranList();
  renderTestimoniList();
}

/* ============ ADMIN: ORGANISASI ============ */
function renderAdminOrganisasiTable() {
  const tbody = document.getElementById('adminOrganisasiTableBody');
  if (!tbody) return;
  tbody.innerHTML = getOrganisasi().sort((a, b) => (a.urutan || 99) - (b.urutan || 99)).map(o => `<tr><td>${o.id}</td><td>${o.nama}</td><td>${o.jabatan}</td><td><button class="admin-btn-edit" onclick="editAdminOrganisasi(${o.id})">✏️</button><button class="admin-btn-delete" onclick="deleteAdminOrganisasi(${o.id})">🗑️</button></td></tr>`).join('');
}

function openAdminOrganisasiForm() {
  document.getElementById('adminOrganisasiForm')?.classList.remove('hidden');
  document.getElementById('adminEditOrganisasiId').value = '';
}

function closeAdminOrganisasiForm() {
  document.getElementById('adminOrganisasiForm')?.classList.add('hidden');
}

function editAdminOrganisasi(id) {
  const o = getOrganisasi().find(x => x.id === id);
  if (!o) return;
  openAdminOrganisasiForm();
  document.getElementById('adminEditOrganisasiId').value = o.id;
  document.getElementById('adminNamaOrganisasi').value = o.nama;
  document.getElementById('adminJabatanOrganisasi').value = o.jabatan;
}

function saveAdminOrganisasi() {
  const id = parseInt(document.getElementById('adminEditOrganisasiId').value) || 0;
  const nama = document.getElementById('adminNamaOrganisasi').value.trim();
  if (!nama) { showToast('Nama wajib diisi!', 'error'); return; }
  const data = getOrganisasi();
  const obj = { id: id || genId(data), nama, jabatan: document.getElementById('adminJabatanOrganisasi').value.trim(), icon: '👤', urutan: id || data.length + 1 };
  if (id) { const idx = data.findIndex(x => x.id === id); if (idx >= 0) data[idx] = obj; } else data.push(obj);
  setOrganisasi(data);
  closeAdminOrganisasiForm();
  renderAdminOrganisasiTable();
  renderOrgChart();
  showToast('✅ Organisasi disimpan!');
}

function deleteAdminOrganisasi(id) {
  if (!confirm('Hapus?')) return;
  setOrganisasi(getOrganisasi().filter(x => x.id !== id));
  renderAdminOrganisasiTable();
  renderOrgChart();
}

/* ============ ADMIN: LAPORAN ============ */
function validateDriveLink(val) {
  const info = document.getElementById('adminDriveLinkInfo');
  if (!info) return;
  if (!val.trim()) { info.innerHTML = ''; return; }
  info.innerHTML = parseDriveLink(val) ? '<span style="color:var(--green-main);font-size:.8rem">✅ Link valid!</span>' : '<span style="color:var(--accent-dark);font-size:.8rem">⚠️ Format tidak valid!</span>';
}

function parseDriveLink(url) {
  if (!url) return null;
  url = url.trim();
  let fileId = null;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) fileId = m1[1];
  if (!fileId) { const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/); if (m2) fileId = m2[1]; }
  if (!fileId) return null;
  return {
    fileId,
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`
  };
}

async function renderAdminLaporanList() {
  const el = document.getElementById('adminLaporanUploadList');
  if (!el) return;
  el.innerHTML = '<p style="color:var(--gray-500);font-size:.82rem">⏳ Memuat...</p>';
  const data = await getLaporanFirebase();
  if (!data.length) { el.innerHTML = '<p style="color:var(--gray-500);font-size:.85rem;margin-bottom:1rem">Belum ada laporan.</p>'; return; }
  el.innerHTML = `<div style="margin-bottom:.8rem"><strong style="font-size:.9rem;color:var(--green-dark)">📋 Laporan Tersimpan (${data.length}):</strong></div>` +
    [...data].reverse().map(l => `<div style="display:flex;justify-content:space-between;align-items:center;padding:.7rem .9rem;background:var(--green-pale);border-radius:8px;margin-bottom:.4rem;font-size:.85rem;">
      <div style="flex:1;min-width:0">📄 <strong>${l.nama}</strong> <span style="color:var(--gray-500)">— ${l.tahun} (${l.jenis})</span></div>
      <button class="admin-btn-delete" onclick="deleteAdminLaporan('${l.fbKey || ''}')">🗑️</button>
    </div>`).join('');
}

async function deleteAdminLaporan(key) {
  if (!confirm('Hapus laporan ini?')) return;
  await deleteLaporanFirebase(key);
  renderAdminLaporanList();
  showToast('🗑️ Laporan dihapus.');
}

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', async () => {
  await renderUsahaGrid();
  renderOrgChart();
  await renderInvestorTable();
  renderSaranList();
  renderTestimoniList();
  await renderBeritaList();
  await renderAnalisisGrid();
  renderGoogleMaps();
  renderFirebaseStatus();
});
