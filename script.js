/* =====================================================
   BUMDes Suwaluh Mandiri Sejahtera — script.js
   Firebase Realtime DB untuk laporan keuangan
   localStorage untuk data lokal lainnya
   ===================================================== */

/* ============ FIREBASE CONFIG ============
   Gunakan project Firebase Anda sendiri.
   Cara setup: https://console.firebase.google.com
   1. Buat project baru
   2. Buat Realtime Database
   3. Set rules: { "rules": { ".read": true, ".write": true } }
   4. Ganti nilai di bawah dengan config project Anda
   =========================================== */
const FIREBASE_CONFIG = {
  // GANTI dengan config Firebase Anda:
  databaseURL: "https://bumdes-suwaluh-default-rtdb.asia-southeast1.firebasedatabase.app/"
  // Jika belum punya Firebase, ikuti panduan di bagian bawah halaman admin
};

// Firebase REST API helper (tanpa SDK, cukup fetch)
const DB_URL = FIREBASE_CONFIG.databaseURL;

async function fbGet(path) {
  try {
    const res = await fetch(`${DB_URL}/${path}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fbSet(path, data) {
  try {
    const res = await fetch(`${DB_URL}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch { return false; }
}

async function fbPush(path, data) {
  try {
    const res = await fetch(`${DB_URL}/${path}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch { return false; }
}

async function fbDelete(path) {
  try {
    await fetch(`${DB_URL}/${path}.json`, { method: 'DELETE' });
    return true;
  } catch { return false; }
}

/* ============ DATA DEFAULTS ============ */
const DEFAULT_USAHA = [
  { id:1, nama:'Kolam Renang', kategori:'wisata', harga:'Rp 15.000/orang', jadwal:'Setiap hari 07.00–17.00', icon:'🏊', deskripsi:'Kolam renang keluarga dengan wahana air yang menyenangkan, cocok untuk anak-anak hingga dewasa.', gambar:'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80', fasilitas:['Loker','Kamar Ganti','Kantin','Parkir','Wahana Seluncur'], kapasitas:'200 orang/hari', luas:'±500 m²' },
  { id:2, nama:'Flying Fox', kategori:'wisata', harga:'Rp 25.000/orang', jadwal:'Sabtu–Minggu 08.00–16.00', icon:'🪂', deskripsi:'Wahana flying fox memacu adrenalin sepanjang 150 meter melintasi danau dan pepohonan hijau.', gambar:'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80', fasilitas:['Helm & Harness','Instruktur','Asuransi','Foto Action'], kapasitas:'50 orang/hari', luas:'150 m lintasan' },
  { id:3, nama:'Kolam Pancing', kategori:'wisata', harga:'Rp 20.000/jam', jadwal:'Setiap hari 06.00–18.00', icon:'🎣', deskripsi:'Kolam pancing dengan ikan mas, nila, dan lele berkualitas. Area nyaman dengan gazebo dan pepohonan rindang.', gambar:'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&q=80', fasilitas:['Gazebo','Sewa Pancing','Kantin','Parkir'], kapasitas:'80 pemancing', luas:'±800 m²' },
  { id:4, nama:'ATV Track', kategori:'wisata', harga:'Rp 50.000/30 menit', jadwal:'Sabtu–Minggu 08.00–17.00', icon:'🏍️', deskripsi:'Trek ATV off-road melewati medan berliku, tanah berbukit, dan sungai kecil. Pengalaman seru!', gambar:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', fasilitas:['Helm & Pelindung','Instruktur','Trek 1 km','Parkir'], kapasitas:'30 orang/sesi', luas:'1 km track' },
  { id:5, nama:'Camping Ground', kategori:'wisata', harga:'Rp 35.000/malam', jadwal:'Buka setiap hari (booking)', icon:'⛺', deskripsi:'Area perkemahan yang asri di bawah pepohonan pinus. Tersedia fasilitas api unggun dan pemandu wisata alam.', gambar:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80', fasilitas:['Area Tenda','Toilet Umum','Api Unggun','Pemandu Alam','Air Bersih'], kapasitas:'100 orang', luas:'±2 Ha' },
  { id:6, nama:'Warung Kuliner Desa', kategori:'kuliner', harga:'Mulai Rp 10.000', jadwal:'Setiap hari 08.00–20.00', icon:'🍽️', deskripsi:'Sajian kuliner khas Desa Suwaluh — nasi rawon, soto ayam, pecel lele, dan berbagai minuman segar alami.', gambar:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', fasilitas:['Tempat Duduk','WiFi','Parkir','Toilet'], kapasitas:'60 kursi', luas:'±120 m²' },
  { id:7, nama:'Jasa Sewa Gazebo', kategori:'jasa', harga:'Rp 100.000/sesi', jadwal:'Setiap hari 08.00–18.00', icon:'🛖', deskripsi:'Sewa gazebo tepi danau untuk keluarga, gathering, atau arisan. Tersedia berbagai ukuran gazebo yang nyaman.', gambar:'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80', fasilitas:['Meja & Kursi','Stop Kontak','WiFi','View Danau'], kapasitas:'10–20 orang', luas:'Gazebo 6×6 m' }
];

const DEFAULT_INVESTOR = [
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
  { id:1, judul:'Peresmian Wahana Flying Fox Baru', kategori:'wisata', tanggal:'1 Apr 2025', icon:'🎉', deskripsi:'BUMDes Suwaluh resmi meluncurkan wahana flying fox sepanjang 150 meter yang menjadi daya tarik wisata baru.' },
  { id:2, judul:'Rapat Anggota Tahunan 2025', kategori:'kegiatan', tanggal:'15 Mar 2025', icon:'📊', deskripsi:'Laporan keuangan BUMDes 2024 disampaikan secara transparan kepada seluruh anggota dan warga desa.' },
  { id:3, judul:'Pembagian Dividen Penyertaan Modal', kategori:'pengumuman', tanggal:'1 Feb 2025', icon:'💵', deskripsi:'BUMDes Suwaluh membagikan dividen kepada seluruh pemegang saham penyertaan modal periode 2024.' }
];

/* ============ LOCALSTORAGE HELPERS (data lokal) ============ */
function getData(key, def) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : def; } catch { return def; }
}
function setData(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function getUsaha()        { return getData('bumdes_usaha', DEFAULT_USAHA); }
function setUsaha(d)       { setData('bumdes_usaha', d); }
function getInvestor()     { return getData('bumdes_investor', DEFAULT_INVESTOR); }
function setInvestor(d)    { setData('bumdes_investor', d); }
function getOrganisasi()   { return getData('bumdes_organisasi', DEFAULT_ORGANISASI); }
function setOrganisasi(d)  { setData('bumdes_organisasi', d); }
function getSaran()        { return getData('bumdes_saran', DEFAULT_SARAN); }
function setSaran(d)       { setData('bumdes_saran', d); }
function getBerita()       { return getData('bumdes_berita', DEFAULT_BERITA); }
function setBerita(d)      { setData('bumdes_berita', d); }
function getReservasi()    { return getData('bumdes_reservasi', []); }
function setReservasi(d)   { setData('bumdes_reservasi', d); }
function getModalPending() { return getData('bumdes_modal_pending', []); }
function setModalPending(d){ setData('bumdes_modal_pending', d); }

/* ============ FIREBASE LAPORAN — dibaca SEMUA pengguna ============ */
// Cache lokal agar tidak fetch ulang terus
let _laporanCache = null;

async function getLaporanFirebase() {
  if (!DB_URL || DB_URL.includes('YOUR_PROJECT')) return getLaporanFallback();
  const data = await fbGet('laporan');
  if (!data) return [];
  // Firebase mengembalikan object {key: value}, konversi ke array
  return Object.entries(data).map(([fbKey, val]) => ({ ...val, fbKey }));
}

function getLaporanFallback() {
  // Jika Firebase belum dikonfigurasi, pakai localStorage sementara
  return getData('bumdes_laporan_fallback', []);
}

async function saveLaporanFirebase(entry) {
  if (!DB_URL || DB_URL.includes('YOUR_PROJECT')) {
    // Fallback ke localStorage jika Firebase belum dikonfigurasi
    const data = getLaporanFallback();
    const filtered = data.filter(l => !(l.tahun === entry.tahun && l.jenis === entry.jenis));
    const byTahun = [...filtered.filter(l => l.tahun === entry.tahun), entry].slice(-5);
    const others = filtered.filter(l => l.tahun !== entry.tahun);
    setData('bumdes_laporan_fallback', [...others, ...byTahun]);
    return true;
  }
  // Hapus entri lama dengan tahun & jenis sama
  const existing = await getLaporanFirebase();
  const old = existing.find(l => l.tahun === entry.tahun && l.jenis === entry.jenis);
  if (old && old.fbKey) await fbDelete(`laporan/${old.fbKey}`);
  // Simpan ke Firebase
  return await fbPush('laporan', entry);
}

async function deleteLaporanFirebase(fbKey) {
  if (!DB_URL || DB_URL.includes('YOUR_PROJECT')) {
    const data = getLaporanFallback();
    setData('bumdes_laporan_fallback', data.filter(l => l.fbKey !== fbKey && l.id !== fbKey));
    return true;
  }
  return await fbDelete(`laporan/${fbKey}`);
}

/* ============ FIREBASE STATUS CHECK ============ */
function isFirebaseConfigured() {
  return DB_URL && !DB_URL.includes('YOUR_PROJECT') && DB_URL.startsWith('https://');
}

/* ============ UTILITIES ============ */
function rupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type === 'error' ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

function genId(arr) { return arr.length ? Math.max(...arr.map(x => x.id || 0)) + 1 : 1; }

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

/* ============ SCROLL EFFECTS ============ */
window.addEventListener('scroll', () => {
  document.getElementById('backToTop')?.classList.toggle('show', window.scrollY > 400);
});
document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============ FADE-UP OBSERVER ============ */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* ============ COUNTER ANIMATION ============ */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  if (!target) return;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 25);
}
document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCounter(el); obs.disconnect(); }
  }, { threshold: 0.5 });
  obs.observe(el);
});

/* ============ PERSON AVATAR SVG ============ */
function personAvatarSVG(color = '#40916c') {
  return `<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="12" r="7" fill="${color}" opacity="0.8"/>
    <ellipse cx="18" cy="28" rx="11" ry="8" fill="${color}" opacity="0.6"/>
  </svg>`;
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

  function makeCard(person, isTop = false) {
    return `<div class="org-card ${isTop ? 'top-card' : ''}">
      <div class="org-avatar">${personAvatarSVG(isTop ? '#1a4731' : '#40916c')}</div>
      <div class="org-name">${person.nama}</div>
      <div class="org-jabatan">${person.jabatan}</div>
    </div>`;
  }

  let html = '';
  levels.forEach((level, i) => {
    if (i > 0) {
      html += level.length === 1
        ? '<div class="org-v-line"></div>'
        : `<div class="org-h-connect" style="--count:${level.length}"></div>`;
    }
    html += `<div class="org-level">${level.map((p, li) => makeCard(p, i === 0)).join('')}</div>`;
  });
  container.innerHTML = html;
}

/* ============ UNIT USAHA ============ */
function renderUsahaGrid(filter = 'semua') {
  const grid = document.getElementById('usahaGrid');
  if (!grid) return;
  let data = getUsaha();
  if (filter !== 'semua') data = data.filter(u => u.kategori === filter);
  grid.innerHTML = data.map(u => `
    <div class="usaha-card" data-cat="${u.kategori}">
      <div class="usaha-img">
        ${u.gambar
          ? `<img src="${u.gambar}" alt="${u.nama}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="usaha-img-fallback" style="display:none;font-size:4rem;width:100%;height:100%;align-items:center;justify-content:center">${u.icon}</div>`
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

/* ============ DETAIL MODAL ============ */
function showDetailModal(id) {
  const u = getUsaha().find(x => x.id == id);
  if (!u) return;
  const overlay = document.getElementById('modalDetail');
  if (!overlay) return;
  const fsilContent = u.fasilitas && u.fasilitas.length
    ? `<div class="modal-fasilitas"><h4>✅ Fasilitas Tersedia</h4><ul>${u.fasilitas.map(f => `<li>${f}</li>`).join('')}</ul></div>` : '';
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
      ${fsilContent}
      <div class="modal-footer">
        <a href="unit-wisata.html#reservasi" class="btn btn-primary">📅 Reservasi Sekarang</a>
        <button class="btn btn-outline" style="color:var(--green-main);border-color:var(--green-main)" onclick="closeModal()">Tutup</button>
      </div>
    </div>`;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalDetail')?.classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('modalDetail')?.addEventListener('click', function(e) { if (e.target === this) closeModal(); });

/* ============ FILTER BUTTONS ============ */
document.getElementById('usahaFilter')?.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderUsahaGrid(this.dataset.cat);
  });
});

/* ============ INVESTOR TABLE ============ */
function renderInvestorTable(search = '') {
  const tbody = document.getElementById('investorBody');
  if (!tbody) return;
  let data = getInvestor();
  if (search) data = data.filter(i => i.nama.toLowerCase().includes(search.toLowerCase()));
  tbody.innerHTML = data.map((inv, idx) => `
    <tr><td>${idx+1}</td><td>${inv.nama}</td><td>${inv.alamat}</td><td class="nominal-cell">${rupiah(inv.nominal)}</td></tr>`).join('');
  if (!data.length) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--gray-500);padding:1rem">Data tidak ditemukan</td></tr>';
}
document.getElementById('searchInvestor')?.addEventListener('input', function() { renderInvestorTable(this.value); });

/* ============ FORM SAHAM ============ */
const lembarInput = document.getElementById('s-lembar');
const totalDisplay = document.getElementById('totalSaham');
if (lembarInput && totalDisplay) {
  lembarInput.addEventListener('input', function() {
    totalDisplay.textContent = rupiah((parseInt(this.value) || 0) * 100000);
  });
}

document.getElementById('formSaham')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const nama = document.getElementById('s-nama').value.trim();
  const alamat = document.getElementById('s-alamat').value.trim();
  const telp = document.getElementById('s-telp').value.trim();
  const lembar = parseInt(document.getElementById('s-lembar').value) || 0;
  const buktiFile = document.getElementById('s-bukti');
  let valid = true;
  [{ id:'s-nama', val:nama }, { id:'s-alamat', val:alamat }, { id:'s-telp', val:telp }].forEach(f => {
    const el = document.getElementById(f.id); const err = el.nextElementSibling;
    if (!f.val) { el.classList.add('error'); err.textContent = 'Wajib diisi'; valid = false; }
    else { el.classList.remove('error'); err.textContent = ''; }
  });
  if (lembar < 1) { document.getElementById('s-lembar').classList.add('error'); document.getElementById('s-lembar').nextElementSibling.textContent = 'Minimal 1 lembar'; valid = false; }
  else { document.getElementById('s-lembar').classList.remove('error'); document.getElementById('s-lembar').nextElementSibling.textContent = ''; }
  if (!valid) return;
  const pending = getModalPending();
  const buktiName = buktiFile && buktiFile.files[0] ? buktiFile.files[0].name : '-';
  pending.push({ id:genId(pending), nama, alamat, telp, lembar, total:lembar*100000, bukti:buktiName, status:'pending', waktu:new Date().toLocaleDateString('id-ID') });
  setModalPending(pending);
  showToast('✅ Permintaan pembelian saham dikirim! Tunggu konfirmasi admin.');
  this.reset();
  if (totalDisplay) totalDisplay.textContent = 'Rp 0';
  document.getElementById('s-bukti-preview') && (document.getElementById('s-bukti-preview').textContent = '');
});

/* ============ UPLOAD PREVIEW ============ */
function previewBukti(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  preview.textContent = (input.files && input.files[0]) ? '✅ File dipilih: ' + input.files[0].name : '';
}

/* ============ FORM RESERVASI ============ */
document.getElementById('formReservasi')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const nama = document.getElementById('res-nama').value.trim();
  const telp = document.getElementById('res-telp').value.trim();
  const wisata = document.getElementById('res-wisata').value;
  const tanggal = document.getElementById('res-tanggal').value;
  const jumlah = parseInt(document.getElementById('res-jumlah').value) || 0;
  const buktiFile = document.getElementById('res-bukti');
  let valid = true;
  [{ id:'res-nama', val:nama }, { id:'res-telp', val:telp }, { id:'res-wisata', val:wisata }, { id:'res-tanggal', val:tanggal }].forEach(f => {
    const el = document.getElementById(f.id); const err = el.nextElementSibling;
    if (!f.val) { el.classList.add('error'); if (err) err.textContent = 'Wajib diisi'; valid = false; }
    else { el.classList.remove('error'); if (err) err.textContent = ''; }
  });
  if (jumlah < 1) { document.getElementById('res-jumlah').classList.add('error'); valid = false; }
  else document.getElementById('res-jumlah').classList.remove('error');
  if (!valid) return;
  const reservasi = getReservasi();
  reservasi.push({ id:genId(reservasi), nama, telp, wisata, tanggal, jumlah, catatan:document.getElementById('res-catatan')?.value.trim()||'', bukti:(buktiFile&&buktiFile.files[0])?buktiFile.files[0].name:'-', status:'pending', waktu:new Date().toLocaleDateString('id-ID') });
  setReservasi(reservasi);
  showToast('✅ Reservasi berhasil dikirim! Admin akan konfirmasi via WhatsApp.');
  this.reset();
  document.getElementById('res-bukti-preview') && (document.getElementById('res-bukti-preview').textContent = '');
});

/* ============ FORM SARAN ============ */
const ratings = {};
document.querySelectorAll('.star-rating').forEach(container => {
  const key = container.dataset.key; ratings[key] = 0;
  const stars = container.querySelectorAll('span');
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => stars.forEach(s => s.classList.toggle('hover', parseInt(s.dataset.v) <= parseInt(star.dataset.v))));
    star.addEventListener('mouseleave', () => stars.forEach(s => s.classList.remove('hover')));
    star.addEventListener('click', () => { ratings[key] = parseInt(star.dataset.v); stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.v) <= ratings[key])); });
  });
});

document.getElementById('formSaran')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const nama = document.getElementById('sr-nama').value.trim();
  const pesan = document.getElementById('sr-pesan').value.trim();
  let valid = true;
  [{ id:'sr-nama', val:nama }, { id:'sr-pesan', val:pesan }].forEach(f => {
    const el = document.getElementById(f.id); const err = el.nextElementSibling;
    if (!f.val) { el.classList.add('error'); err.textContent = 'Wajib diisi'; valid = false; }
    else { el.classList.remove('error'); err.textContent = ''; }
  });
  if (!valid) return;
  const saranData = getSaran();
  saranData.unshift({ id:genId(saranData), nama, email:document.getElementById('sr-email')?.value||'', pesan, ratingWisata:ratings['wisata']||0, ratingPrasarana:ratings['prasarana']||0, waktu:new Date().toLocaleDateString('id-ID') });
  setSaran(saranData);
  renderSaranList(); renderTestimoniList();
  showToast('✅ Terima kasih atas masukan Anda!');
  this.reset();
  Object.keys(ratings).forEach(k => { ratings[k] = 0; });
  document.querySelectorAll('.star-rating span').forEach(s => s.classList.remove('active','hover'));
});

function renderSaranList() {
  const el = document.getElementById('saranList'); if (!el) return;
  const data = getSaran().slice(0, 3);
  el.innerHTML = data.map(s => `<div class="testimoni-card"><div class="testimoni-header"><span class="testimoni-nama">${s.nama}</span><span style="font-size:.78rem;color:var(--gray-500)">${s.waktu}</span></div><p class="testimoni-pesan">${s.pesan}</p></div>`).join('') || '<p style="color:var(--gray-500);font-size:.9rem">Belum ada masukan.</p>';
}

function renderTestimoniList() {
  const el = document.getElementById('testimoniList'); if (!el) return;
  const data = getSaran().filter(s => s.ratingWisata >= 4).slice(0, 3);
  el.innerHTML = data.map(s => `<div class="testimoni-card"><div class="testimoni-header"><span class="testimoni-nama">${s.nama}</span><span class="testimoni-stars">${'★'.repeat(s.ratingWisata)}${'☆'.repeat(5-s.ratingWisata)}</span></div><p class="testimoni-pesan">${s.pesan}</p></div>`).join('') || '<p style="color:var(--gray-500);font-size:.9rem">Belum ada testimoni.</p>';
}

/* ============ TRANSPARANSI TABS ============ */
document.getElementById('tabsTransparansi')?.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('#tabsTransparansi .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + this.dataset.tab)?.classList.add('active');
    if (this.dataset.tab === 'tren') initCharts();
  });
});

/* ============ PARSE GOOGLE DRIVE LINK ============ */
function parseDriveLink(url) {
  if (!url) return null;
  url = url.trim();
  let fileId = null;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) fileId = m1[1];
  if (!fileId) { const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/); if (m2) fileId = m2[1]; }
  if (!fileId) { const m3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/); if (m3) fileId = m3[1]; }
  if (!fileId) return null;
  return {
    fileId,
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`
  };
}

/* ============ LAPORAN KEUANGAN — baca dari Firebase ============ */
async function renderLaporanList() {
  const el = document.getElementById('laporanList');
  if (!el) return;
  const filterEl = document.getElementById('filterTahun');
  const tahun = filterEl ? filterEl.value : '2025';

  // Tampilkan loading
  el.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--gray-500)">⏳ Memuat laporan...</div>`;

  // Ambil dari Firebase (bisa dibaca semua pengguna)
  let allLaporan = await getLaporanFirebase();
  const list = allLaporan.filter(l => l.tahun === tahun).slice(0, 5);

  if (!list.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;color:var(--gray-500)">
        <div style="font-size:3rem;margin-bottom:1rem">📂</div>
        <p style="font-size:1rem;font-weight:600;margin-bottom:.4rem">Belum ada laporan untuk tahun ${tahun}</p>
        <p style="font-size:.85rem">Admin dapat menambahkan laporan melalui Admin Panel → 📁 Upload Laporan</p>
        ${!isFirebaseConfigured() ? `<div style="margin-top:1.5rem;padding:1rem;background:#fef3c7;border-radius:8px;font-size:.82rem;text-align:left;max-width:480px;margin-left:auto;margin-right:auto">
          ⚠️ <strong>Firebase belum dikonfigurasi.</strong> Laporan hanya tampil di browser admin.<br>
          Masuk ke Admin Panel → tab 📁 Upload Laporan → ikuti panduan setup Firebase.
        </div>` : ''}
      </div>`;
    return;
  }

  el.innerHTML = list.map(l => {
    const drive = parseDriveLink(l.driveLink);
    const hasLink = drive !== null;
    return `
    <div class="laporan-item">
      <div style="display:flex;align-items:center;flex:1;min-width:0">
        <span class="laporan-icon">📄</span>
        <div class="laporan-info">
          <h4>${l.nama}</h4>
          <p>${l.jenis} • ${l.tahun} •
            ${hasLink
              ? '<span style="color:var(--green-main);font-weight:600">✅ Tersedia</span>'
              : '<span style="color:var(--accent-dark)">⚠️ Link tidak valid</span>'}
          </p>
          ${l.uploadDate ? `<p style="font-size:.75rem;color:var(--gray-500)">Ditambahkan: ${l.uploadDate}</p>` : ''}
        </div>
      </div>
      <div class="laporan-actions">
        ${hasLink ? `
          <a class="btn btn-primary" href="${drive.downloadUrl}" target="_blank" rel="noopener">⬇ Unduh PDF</a>
          <button class="btn btn-outline" style="color:var(--green-main);border-color:var(--green-main)"
            onclick="previewLaporan('${drive.embedUrl}','${l.nama} ${l.tahun}')">👁 Preview</button>
        ` : `<button class="btn btn-outline" style="color:var(--gray-500);border-color:var(--gray-200);cursor:not-allowed" disabled>Link tidak valid</button>`}
      </div>
    </div>`;
  }).join('');
}

function previewLaporan(embedUrl, nama) {
  const existing = document.getElementById('laporanPreviewModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'laporanPreviewModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div style="background:white;border-radius:12px;width:100%;max-width:860px;height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4)">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:.8rem 1.2rem;background:var(--green-dark);color:white;border-radius:12px 12px 0 0">
        <span style="font-weight:600;font-size:.95rem">📄 ${nama}</span>
        <button onclick="document.getElementById('laporanPreviewModal').remove()" style="background:rgba(255,255,255,.2);border:none;color:white;width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer">✕</button>
      </div>
      <div style="flex:1;position:relative;background:#f5f5f5">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#999;font-size:.9rem">⏳ Memuat dokumen...</div>
        <iframe src="${embedUrl}" style="position:absolute;inset:0;width:100%;height:100%;border:none;z-index:1" onload="this.previousElementSibling.style.display='none'"></iframe>
      </div>
      <div style="padding:.6rem 1rem;background:var(--gray-50);border-top:1px solid var(--gray-200);font-size:.78rem;color:var(--gray-500);text-align:center">
        Dokumen dibuka melalui Google Drive Viewer • Pastikan koneksi internet aktif
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

document.getElementById('filterTahun')?.addEventListener('change', renderLaporanList);

/* ============ ANALISIS KEUANGAN ============ */
function renderAnalisisGrid() {
  const el = document.getElementById('analisisGrid'); if (!el) return;
  const items = [
    { icon:'💰', label:'Total Pendapatan 2024', value:'Rp 890Jt', desc:'Naik 18% dari tahun lalu' },
    { icon:'📈', label:'Laba Bersih 2024', value:'Rp 127Jt', desc:'Margin 14.3%' },
    { icon:'🏦', label:'Total Aset', value:'Rp 10M', desc:'Per Desember 2024' },
    { icon:'💳', label:'Penyertaan Modal', value:'Rp 646Jt', desc:'Dari 10 investor aktif' },
    { icon:'📊', label:'Return on Equity', value:'19.7%', desc:'Lebih baik dari rata-rata BUMD' },
    { icon:'🔄', label:'Likuiditas', value:'2.4x', desc:'Current ratio sehat' },
    { icon:'👷', label:'Tenaga Kerja', value:'30 orang', desc:'Warga desa terserap' },
    { icon:'📉', label:'Biaya Operasional', value:'Rp 763Jt', desc:'Efisiensi naik 5% YoY' }
  ];
  el.innerHTML = items.map(item => `
    <div class="analisis-card">
      <span class="analisis-icon">${item.icon}</span>
      <div class="analisis-label">${item.label}</div>
      <div class="analisis-value">${item.value}</div>
      <div class="analisis-desc">${item.desc}</div>
    </div>`).join('');
}

/* ============ CHARTS ============ */
let chartsInited = false;
function initCharts() {
  if (chartsInited) return; chartsInited = true;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  script.onload = buildCharts;
  document.head.appendChild(script);
}
function buildCharts() {
  const years = ['2021','2022','2023','2024','2025*'];
  const mkChart = (id, data, color, label) => {
    const ctx = document.getElementById(id); if (!ctx) return;
    new Chart(ctx, { type:'line', data:{ labels:years, datasets:[{ label, data, borderColor:color, backgroundColor:color+'22', borderWidth:2.5, fill:true, tension:0.4, pointBackgroundColor:color, pointRadius:5 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{grid:{color:'#e0e8e2'}},x:{grid:{display:false}}} } });
  };
  mkChart('grafikPendapatan', [320,480,620,890,1050], '#40916c', 'Pendapatan');
  mkChart('grafikLaba', [28,55,89,127,155], '#2d6a4f', 'Laba Bersih');
  mkChart('grafikKas', [45,72,110,160,210], '#74c69d', 'Arus Kas');
  mkChart('grafikProfit', [8.8,11.5,14.4,14.3,14.8], '#f4a261', 'Profitabilitas %');
}

/* ============ ADMIN AUTH ============ */
const ADMIN_CREDS = { username: 'admin', password: 'bumdes2025' };
let adminLoggedIn = false;
let logoClickCount = 0;

document.querySelector('.secret-trigger')?.addEventListener('click', () => {
  logoClickCount++;
  if (logoClickCount >= 3) { logoClickCount = 0; showAdminLogin(); }
});
document.querySelector('.nav-brand')?.addEventListener('click', (e) => {
  e.preventDefault();
  logoClickCount++;
  if (logoClickCount >= 5) { logoClickCount = 0; showAdminLogin(); }
  else setTimeout(() => { logoClickCount = 0; }, 2000);
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
function hideAdminPanel() { document.getElementById('adminPanelContainer')?.classList.remove('open'); }
function logoutAdmin() { adminLoggedIn = false; hideAdminPanel(); showToast('Anda telah keluar dari admin panel.'); }
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelector(`.admin-tab-btn[data-tab="${tab}"]`)?.classList.add('active');
  document.getElementById(`admin-tab-${tab}`)?.classList.add('active');
  populateAdminTables();
}

function populateAdminTables() {
  renderAdminUsahaTable();
  renderAdminInvestorTable();
  renderAdminBeritaTable();
  renderAdminSaranTable();
  renderAdminOrganisasiTable();
  renderAdminReservasiTable();
  renderAdminModalPendingTable();
  renderAdminLaporanList();
  renderFirebaseStatus();
}

/* ============ FIREBASE STATUS di ADMIN ============ */
function renderFirebaseStatus() {
  const el = document.getElementById('firebaseStatusInfo');
  if (!el) return;
  if (isFirebaseConfigured()) {
    el.innerHTML = `<div style="background:#d1fae5;border-radius:8px;padding:.7rem 1rem;font-size:.82rem;color:#065f46;margin-bottom:1rem">
      ✅ <strong>Firebase aktif.</strong> Laporan yang disimpan bisa dilihat semua pengguna secara realtime.
    </div>`;
  } else {
    el.innerHTML = `<div style="background:#fef3c7;border-radius:8px;padding:.8rem 1rem;font-size:.82rem;color:#92400e;margin-bottom:1rem">
      ⚠️ <strong>Firebase belum dikonfigurasi.</strong> Laporan hanya tersimpan di browser ini saja.<br><br>
      <strong>Cara setup Firebase (gratis, 5 menit):</strong><br>
      1. Buka <a href="https://console.firebase.google.com" target="_blank" style="color:#1d4ed8">console.firebase.google.com</a><br>
      2. Klik <strong>Add project</strong> → beri nama "bumdes-suwaluh" → Create project<br>
      3. Pilih menu <strong>Realtime Database</strong> → Create Database → pilih lokasi → Start in test mode<br>
      4. Copy URL database (format: <code>https://bumdes-suwaluh-xxxx.firebaseio.com</code>)<br>
      5. Buka file <strong>script.js</strong> → cari <code>databaseURL</code> → ganti nilainya dengan URL Anda<br>
      6. Simpan & reload halaman
    </div>`;
  }
}

/* ============ ADMIN: UNIT USAHA ============ */
function renderAdminUsahaTable() {
  const tbody = document.getElementById('adminUsahaTableBody'); if (!tbody) return;
  tbody.innerHTML = getUsaha().map(u => `
    <tr><td>${u.id}</td><td>${u.nama}</td><td>${u.kategori}</td><td>${u.harga}</td>
    <td><button class="admin-btn-edit" onclick="editAdminUsaha(${u.id})">✏️ Edit</button>
    <button class="admin-btn-delete" onclick="deleteAdminUsaha(${u.id})">🗑️ Hapus</button></td></tr>`).join('');
}
function openAdminUsahaForm()  { document.getElementById('adminUsahaForm')?.classList.remove('hidden'); document.getElementById('adminEditUsahaId').value = ''; ['adminNamaUsaha','adminHargaUsaha','adminJadwalUsaha','adminIconUsaha','adminDeskripsiUsaha','adminGambarUsaha'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; }); }
function closeAdminUsahaForm() { document.getElementById('adminUsahaForm')?.classList.add('hidden'); }
function editAdminUsaha(id) {
  const u = getUsaha().find(x => x.id===id); if (!u) return;
  openAdminUsahaForm();
  document.getElementById('adminEditUsahaId').value=u.id; document.getElementById('adminNamaUsaha').value=u.nama; document.getElementById('adminKategoriUsaha').value=u.kategori; document.getElementById('adminHargaUsaha').value=u.harga; document.getElementById('adminJadwalUsaha').value=u.jadwal; document.getElementById('adminIconUsaha').value=u.icon; document.getElementById('adminDeskripsiUsaha').value=u.deskripsi;
  const g=document.getElementById('adminGambarUsaha'); if(g) g.value=u.gambar||'';
}
function saveAdminUsaha() {
  const id=parseInt(document.getElementById('adminEditUsahaId').value)||0; const nama=document.getElementById('adminNamaUsaha').value.trim(); if(!nama){showToast('Nama wajib diisi!','error');return;}
  const data=getUsaha();
  const obj={id:id||genId(data),nama,kategori:document.getElementById('adminKategoriUsaha').value,harga:document.getElementById('adminHargaUsaha').value.trim(),jadwal:document.getElementById('adminJadwalUsaha').value.trim(),icon:document.getElementById('adminIconUsaha').value.trim()||'🏢',deskripsi:document.getElementById('adminDeskripsiUsaha').value.trim(),gambar:document.getElementById('adminGambarUsaha')?.value.trim()||'',fasilitas:[],kapasitas:'',luas:''};
  if(id){const idx=data.findIndex(x=>x.id===id); if(idx>=0){obj.fasilitas=data[idx].fasilitas||[];obj.kapasitas=data[idx].kapasitas||'';obj.luas=data[idx].luas||'';data[idx]=obj;}}else data.push(obj);
  setUsaha(data); closeAdminUsahaForm(); renderAdminUsahaTable(); renderUsahaGrid(); showToast('✅ Unit usaha berhasil disimpan!');
}
function deleteAdminUsaha(id) {
  if(!confirm('Hapus unit usaha ini?'))return; setUsaha(getUsaha().filter(x=>x.id!==id)); renderAdminUsahaTable(); renderUsahaGrid(); showToast('🗑️ Unit usaha dihapus.');
}

/* ============ ADMIN: INVESTOR ============ */
function renderAdminInvestorTable() {
  const tbody=document.getElementById('adminInvestorTableBody'); if(!tbody)return;
  tbody.innerHTML=getInvestor().map(inv=>`<tr><td>${inv.id}</td><td>${inv.nama}</td><td>${inv.alamat}</td><td class="nominal-cell">${rupiah(inv.nominal)}</td><td><button class="admin-btn-edit" onclick="editAdminInvestor(${inv.id})">✏️</button><button class="admin-btn-delete" onclick="deleteAdminInvestor(${inv.id})">🗑️</button></td></tr>`).join('');
}
function openAdminInvestorForm()  { document.getElementById('adminInvestorForm')?.classList.remove('hidden'); document.getElementById('adminEditInvestorId').value=''; }
function closeAdminInvestorForm() { document.getElementById('adminInvestorForm')?.classList.add('hidden'); }
function editAdminInvestor(id) {
  const inv=getInvestor().find(x=>x.id===id); if(!inv)return; openAdminInvestorForm();
  document.getElementById('adminEditInvestorId').value=inv.id; document.getElementById('adminNamaInvestor').value=inv.nama; document.getElementById('adminAlamatInvestor').value=inv.alamat; document.getElementById('adminNominalInvestor').value=inv.nominal; document.getElementById('adminTanggalInvestor').value=inv.tanggal;
}
function saveAdminInvestor() {
  const id=parseInt(document.getElementById('adminEditInvestorId').value)||0; const nama=document.getElementById('adminNamaInvestor').value.trim(); if(!nama){showToast('Nama wajib diisi!','error');return;}
  const data=getInvestor(); const obj={id:id||genId(data),nama,alamat:document.getElementById('adminAlamatInvestor').value.trim(),nominal:parseInt(document.getElementById('adminNominalInvestor').value)||0,tanggal:document.getElementById('adminTanggalInvestor').value};
  if(id){const idx=data.findIndex(x=>x.id===id);if(idx>=0)data[idx]=obj;}else data.push(obj);
  setInvestor(data); closeAdminInvestorForm(); renderAdminInvestorTable(); renderInvestorTable(); showToast('✅ Data investor disimpan!');
}
function deleteAdminInvestor(id) {
  if(!confirm('Hapus investor ini?'))return; setInvestor(getInvestor().filter(x=>x.id!==id)); renderAdminInvestorTable(); renderInvestorTable(); showToast('🗑️ Investor dihapus.');
}

/* ============ ADMIN: RESERVASI ============ */
function renderAdminReservasiTable() {
  const tbody=document.getElementById('adminReservasiTableBody'); if(!tbody)return;
  const data=getReservasi();
  if(!data.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--gray-500);padding:1rem">Belum ada reservasi masuk</td></tr>';return;}
  tbody.innerHTML=data.map((r,i)=>`<tr><td>${i+1}</td><td><strong>${r.nama}</strong><br><small>${r.telp}</small></td><td>${r.wisata}</td><td>${r.tanggal}</td><td>${r.jumlah} tiket</td><td><small>${r.bukti!=='-'?'📎 '+r.bukti:'Tidak ada'}</small></td><td><span class="status-badge status-${r.status}">${r.status==='pending'?'⏳ Pending':r.status==='validated'?'✅ Terkonfirmasi':'❌ Ditolak'}</span></td><td>${r.status==='pending'?`<button class="admin-btn-validate" onclick="validateReservasi(${r.id})">✅ Konfirmasi</button><button class="admin-btn-delete" onclick="rejectReservasi(${r.id})">❌ Tolak</button>`:''}<button class="admin-btn-delete" onclick="deleteReservasi(${r.id})" style="margin-top:.3rem">🗑️</button></td></tr>`).join('');
}
function validateReservasi(id){const data=getReservasi();const idx=data.findIndex(x=>x.id===id);if(idx>=0){data[idx].status='validated';setReservasi(data);renderAdminReservasiTable();showToast('✅ Reservasi dikonfirmasi!');}}
function rejectReservasi(id){const data=getReservasi();const idx=data.findIndex(x=>x.id===id);if(idx>=0){data[idx].status='rejected';setReservasi(data);renderAdminReservasiTable();showToast('❌ Reservasi ditolak.','error');}}
function deleteReservasi(id){if(!confirm('Hapus data reservasi?'))return;setReservasi(getReservasi().filter(x=>x.id!==id));renderAdminReservasiTable();showToast('🗑️ Dihapus.');}

/* ============ ADMIN: MODAL PENDING ============ */
function renderAdminModalPendingTable() {
  const tbody=document.getElementById('adminModalPendingTableBody'); if(!tbody)return;
  const data=getModalPending();
  if(!data.length){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--gray-500);padding:1rem">Belum ada permintaan pembelian saham</td></tr>';return;}
  tbody.innerHTML=data.map((m,i)=>`<tr><td>${i+1}</td><td><strong>${m.nama}</strong></td><td>${m.alamat}</td><td>${m.telp}</td><td>${m.lembar} lembar</td><td class="nominal-cell">${rupiah(m.total)}</td><td><small>${m.bukti!=='-'?'📎 '+m.bukti:'Tidak ada'}</small></td><td><span class="status-badge status-${m.status}">${m.status==='pending'?'⏳ Pending':m.status==='validated'?'✅ Tervalidasi':'❌ Ditolak'}</span></td><td>${m.status==='pending'?`<button class="admin-btn-validate" onclick="validateModalPending(${m.id})">✅ Validasi</button><button class="admin-btn-delete" onclick="rejectModalPending(${m.id})">❌ Tolak</button>`:''}<button class="admin-btn-delete" onclick="deleteModalPending(${m.id})" style="margin-top:.3rem">🗑️</button></td></tr>`).join('');
}
function validateModalPending(id) {
  const data=getModalPending(); const idx=data.findIndex(x=>x.id===id); if(idx<0)return;
  data[idx].status='validated'; setModalPending(data);
  const m=data[idx]; const investors=getInvestor();
  investors.push({id:genId(investors),nama:m.nama,alamat:m.alamat,nominal:m.total,tanggal:new Date().toISOString().split('T')[0]});
  setInvestor(investors); renderAdminModalPendingTable(); renderAdminInvestorTable(); renderInvestorTable();
  showToast('✅ Pembelian saham divalidasi! Data investor diperbarui.');
}
function rejectModalPending(id){const data=getModalPending();const idx=data.findIndex(x=>x.id===id);if(idx>=0){data[idx].status='rejected';setModalPending(data);renderAdminModalPendingTable();showToast('❌ Pembelian saham ditolak.','error');}}
function deleteModalPending(id){if(!confirm('Hapus data ini?'))return;setModalPending(getModalPending().filter(x=>x.id!==id));renderAdminModalPendingTable();showToast('🗑️ Data dihapus.');}

/* ============ ADMIN: BERITA ============ */
function renderAdminBeritaTable() {
  const tbody=document.getElementById('adminBeritaTableBody'); if(!tbody)return;
  tbody.innerHTML=getBerita().map(b=>`<tr><td>${b.id}</td><td>${b.judul}</td><td>${b.kategori}</td><td>${b.tanggal}</td><td><button class="admin-btn-edit" onclick="editAdminBerita(${b.id})">✏️</button><button class="admin-btn-delete" onclick="deleteAdminBerita(${b.id})">🗑️</button></td></tr>`).join('');
}
function openAdminBeritaForm()  { document.getElementById('adminBeritaForm')?.classList.remove('hidden'); document.getElementById('adminEditBeritaId').value=''; }
function closeAdminBeritaForm() { document.getElementById('adminBeritaForm')?.classList.add('hidden'); }
function editAdminBerita(id) {
  const b=getBerita().find(x=>x.id===id); if(!b)return; openAdminBeritaForm();
  document.getElementById('adminEditBeritaId').value=b.id; document.getElementById('adminJudulBerita').value=b.judul; document.getElementById('adminKategoriBerita').value=b.kategori; document.getElementById('adminTanggalBerita').value=b.tanggal; document.getElementById('adminIconBerita').value=b.icon; document.getElementById('adminDeskripsiBerita').value=b.deskripsi;
}
function saveAdminBerita() {
  const id=parseInt(document.getElementById('adminEditBeritaId').value)||0; const judul=document.getElementById('adminJudulBerita').value.trim(); if(!judul){showToast('Judul wajib diisi!','error');return;}
  const data=getBerita(); const obj={id:id||genId(data),judul,kategori:document.getElementById('adminKategoriBerita').value,tanggal:document.getElementById('adminTanggalBerita').value.trim(),icon:document.getElementById('adminIconBerita').value.trim()||'📰',deskripsi:document.getElementById('adminDeskripsiBerita').value.trim()};
  if(id){const idx=data.findIndex(x=>x.id===id);if(idx>=0)data[idx]=obj;}else data.unshift(obj);
  setBerita(data); closeAdminBeritaForm(); renderAdminBeritaTable(); showToast('✅ Berita disimpan!');
}
function deleteAdminBerita(id){if(!confirm('Hapus berita ini?'))return;setBerita(getBerita().filter(x=>x.id!==id));renderAdminBeritaTable();showToast('🗑️ Berita dihapus.');}

/* ============ ADMIN: SARAN ============ */
function renderAdminSaranTable() {
  const tbody=document.getElementById('adminSaranTableBody'); if(!tbody)return;
  tbody.innerHTML=getSaran().map(s=>`<tr><td>${s.id}</td><td>${s.nama}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.pesan}</td><td>⭐${s.ratingWisata}</td><td><button class="admin-btn-delete" onclick="deleteAdminSaran(${s.id})">🗑️</button></td></tr>`).join('');
}
function deleteAdminSaran(id){if(!confirm('Hapus saran ini?'))return;setSaran(getSaran().filter(x=>x.id!==id));renderAdminSaranTable();renderSaranList();renderTestimoniList();showToast('🗑️ Saran dihapus.');}

/* ============ ADMIN: ORGANISASI ============ */
function renderAdminOrganisasiTable() {
  const tbody=document.getElementById('adminOrganisasiTableBody'); if(!tbody)return;
  tbody.innerHTML=getOrganisasi().sort((a,b)=>(a.urutan||99)-(b.urutan||99)).map(o=>`<tr><td>${o.urutan}</td><td>${o.nama}</td><td>${o.jabatan}</td><td><button class="admin-btn-edit" onclick="editAdminOrganisasi(${o.id})">✏️</button><button class="admin-btn-delete" onclick="deleteAdminOrganisasi(${o.id})">🗑️</button></td></tr>`).join('');
}
function openAdminOrganisasiForm()  { document.getElementById('adminOrganisasiForm')?.classList.remove('hidden'); document.getElementById('adminEditOrganisasiId').value=''; }
function closeAdminOrganisasiForm() { document.getElementById('adminOrganisasiForm')?.classList.add('hidden'); }
function editAdminOrganisasi(id) {
  const o=getOrganisasi().find(x=>x.id===id); if(!o)return; openAdminOrganisasiForm();
  document.getElementById('adminEditOrganisasiId').value=o.id; document.getElementById('adminNamaOrganisasi').value=o.nama; document.getElementById('adminJabatanOrganisasi').value=o.jabatan; document.getElementById('adminIconOrganisasi').value=o.icon; document.getElementById('adminUrutanOrganisasi').value=o.urutan;
}
function saveAdminOrganisasi() {
  const id=parseInt(document.getElementById('adminEditOrganisasiId').value)||0; const nama=document.getElementById('adminNamaOrganisasi').value.trim(); if(!nama){showToast('Nama wajib diisi!','error');return;}
  const data=getOrganisasi(); const obj={id:id||genId(data),nama,jabatan:document.getElementById('adminJabatanOrganisasi').value.trim(),icon:document.getElementById('adminIconOrganisasi').value.trim()||'👤',urutan:parseInt(document.getElementById('adminUrutanOrganisasi').value)||99};
  if(id){const idx=data.findIndex(x=>x.id===id);if(idx>=0)data[idx]=obj;}else data.push(obj);
  setOrganisasi(data); closeAdminOrganisasiForm(); renderAdminOrganisasiTable(); renderOrgChart(); showToast('✅ Pengurus disimpan!');
}
function deleteAdminOrganisasi(id){if(!confirm('Hapus pengurus ini?'))return;setOrganisasi(getOrganisasi().filter(x=>x.id!==id));renderAdminOrganisasiTable();renderOrgChart();showToast('🗑️ Pengurus dihapus.');}

/* ============ ADMIN: UPLOAD LAPORAN (Firebase) ============ */
function validateDriveLink(val) {
  const info=document.getElementById('adminDriveLinkInfo'); if(!info)return;
  if(!val.trim()){info.innerHTML='';return;}
  info.innerHTML=parseDriveLink(val)
    ?'<span style="color:var(--green-main);font-size:.8rem">✅ Link valid! Siap disimpan.</span>'
    :'<span style="color:var(--accent-dark);font-size:.8rem">⚠️ Format link tidak dikenali. Pastikan dari Google Drive.</span>';
}

async function saveAdminLaporan() {
  const nama=document.getElementById('adminLaporanNama')?.value.trim();
  const tahun=document.getElementById('adminLaporanTahun')?.value;
  const jenis=document.getElementById('adminLaporanJenis')?.value;
  const driveLink=document.getElementById('adminLaporanDriveLink')?.value.trim();
  if(!nama){showToast('Nama laporan wajib diisi!','error');return;}
  if(!driveLink){showToast('Link Google Drive wajib diisi!','error');return;}
  if(!parseDriveLink(driveLink)){showToast('Format link Google Drive tidak valid!','error');return;}

  const btn=document.querySelector('[onclick="saveAdminLaporan()"]');
  if(btn){btn.disabled=true;btn.textContent='⏳ Menyimpan...';}

  const entry={nama,tahun,jenis,driveLink,uploadDate:new Date().toLocaleDateString('id-ID')};
  const ok=await saveLaporanFirebase(entry);

  if(btn){btn.disabled=false;btn.textContent='💾 Simpan Laporan';}

  if(ok){
    showToast('✅ Laporan disimpan! Kini bisa dilihat semua pengguna.');
    document.getElementById('adminLaporanNama').value='';
    document.getElementById('adminLaporanDriveLink').value='';
    const info=document.getElementById('adminDriveLinkInfo'); if(info)info.innerHTML='';
    renderAdminLaporanList();
    renderLaporanList();
  } else {
    showToast('❌ Gagal menyimpan. Cek konfigurasi Firebase.','error');
  }
}

async function renderAdminLaporanList() {
  const el=document.getElementById('adminLaporanUploadList'); if(!el)return;
  el.innerHTML='<p style="color:var(--gray-500);font-size:.82rem">⏳ Memuat data...</p>';
  const data=await getLaporanFirebase();
  if(!data.length){el.innerHTML='<p style="color:var(--gray-500);font-size:.85rem;margin-bottom:1rem">Belum ada laporan yang ditambahkan.</p>';return;}
  el.innerHTML=`<div style="margin-bottom:.8rem"><strong style="font-size:.9rem;color:var(--green-dark)">📋 Laporan Tersimpan (${data.length}):</strong></div>`+
    [...data].reverse().map(l=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:.7rem .9rem;background:var(--green-pale);border-radius:8px;margin-bottom:.4rem;font-size:.82rem;gap:.5rem;flex-wrap:wrap">
        <div style="flex:1;min-width:0">
          📄 <strong>${l.nama}</strong> <span style="color:var(--gray-500)">— ${l.tahun} (${l.jenis})</span>
          ${l.uploadDate?`<br><small style="color:var(--gray-500)">📅 ${l.uploadDate}</small>`:''}
        </div>
        <button class="admin-btn-delete" onclick="deleteAdminLaporan('${l.fbKey||l.id}')">🗑️ Hapus</button>
      </div>`).join('');
}

async function deleteAdminLaporan(key) {
  if(!confirm('Hapus laporan ini?'))return;
  await deleteLaporanFirebase(key);
  renderAdminLaporanList();
  renderLaporanList();
  showToast('🗑️ Laporan dihapus.');
}

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
  renderUsahaGrid();
  renderOrgChart();
  renderInvestorTable();
  renderSaranList();
  renderTestimoniList();
  renderLaporanList();
  renderAnalisisGrid();
});
