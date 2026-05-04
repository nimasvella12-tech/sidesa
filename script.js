/* =====================================================
   BUMDes Suwaluh Mandiri Sejahtera — script.js
   FULL FIREBASE INTEGRATION - All data sync across users
   ===================================================== */

/* ============ FIREBASE CONFIG ============ */
const FIREBASE_CONFIG = {
  databaseURL: "https://bumdes-suwaluh-default-rtdb.asia-southeast1.firebasedatabase.app"
};
const DB_URL = FIREBASE_CONFIG.databaseURL;

function isFirebaseConfigured() {
  return DB_URL && DB_URL.includes('firebaseio.com');
}

/* Firebase REST helpers */
async function fbGet(path) {
  try { const r = await fetch(`${DB_URL}/${path}.json`); return r.ok ? await r.json() : null; }
  catch { return null; }
}
async function fbPush(path, data) {
  try { const r = await fetch(`${DB_URL}/${path}.json`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }); return r.ok ? await r.json() : null; }
  catch { return null; }
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
  return Object.entries(data).map(([fbKey, val]) => ({ ...val, fbKey, id: val.id || fbKey }));
}

/* ============ ALL DATA USING FIREBASE ============ */
const STORAGE_KEYS = {
  USAHA: 'usaha',
  INVESTOR: 'investor',
  ORGANISASI: 'organisasi',
  SARAN: 'saran',
  BERITA: 'berita',
  RESERVASI: 'reservasi',
  MODAL_PENDING: 'modal_pending',
  LAPORAN: 'laporan',
  FINANCIAL_DATA: 'financial_data'
};

async function getFirebaseData(collection, defaultData) {
  if (!isFirebaseConfigured()) return defaultData;
  const data = await fbGetAll(collection);
  return data.length ? data : defaultData;
}

async function saveFirebaseData(collection, item) {
  if (!isFirebaseConfigured()) return false;
  if (item.fbKey) {
    const { fbKey, ...rest } = item;
    return await fbSet(`${collection}/${fbKey}`, rest);
  }
  const result = await fbPush(collection, { ...item, id: item.id || Date.now() });
  return !!result;
}

async function deleteFirebaseData(collection, fbKey) {
  if (!isFirebaseConfigured()) return false;
  return await fbDelete(`${collection}/${fbKey}`);
}

/* ============ DEFAULT DATA ============ */
const DEFAULT_USAHA = [
  { id:1, nama:'Kolam Renang', kategori:'wisata', harga:'Rp 15.000/orang', hargaNum:15000, jadwal:'Setiap hari 07.00–17.00', icon:'🏊', deskripsi:'Kolam renang keluarga dengan wahana air yang menyenangkan.', gambar:'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80', fasilitas:['Loker','Kamar Ganti','Kantin','Parkir'], kapasitas:'200 orang/hari' },
  { id:2, nama:'Flying Fox', kategori:'wisata', harga:'Rp 25.000/orang', hargaNum:25000, jadwal:'Sabtu–Minggu 08.00–16.00', icon:'🪂', deskripsi:'Wahana flying fox memacu adrenalin sepanjang 150 meter.', gambar:'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&q=80', fasilitas:['Helm & Harness','Instruktur','Asuransi'], kapasitas:'50 orang/hari' },
  { id:3, nama:'Kolam Pancing', kategori:'wisata', harga:'Rp 20.000/jam', hargaNum:20000, jadwal:'Setiap hari 06.00–18.00', icon:'🎣', deskripsi:'Kolam pancing dengan ikan mas, nila, dan lele.', gambar:'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&q=80', fasilitas:['Gazebo','Sewa Pancing','Kantin'], kapasitas:'80 pemancing' },
  { id:4, nama:'ATV Track', kategori:'wisata', harga:'Rp 50.000/30 menit', hargaNum:50000, jadwal:'Sabtu–Minggu 08.00–17.00', icon:'🏍️', deskripsi:'Trek ATV off-road melewati medan berliku.', gambar:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', fasilitas:['Helm & Pelindung','Instruktur','Parkir'], kapasitas:'30 orang/sesi' },
  { id:5, nama:'Camping Ground', kategori:'wisata', harga:'Rp 35.000/malam', hargaNum:35000, jadwal:'Buka setiap hari', icon:'⛺', deskripsi:'Area perkemahan yang asri di bawah pepohonan.', gambar:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80', fasilitas:['Area Tenda','Toilet Umum','Api Unggun'], kapasitas:'100 orang' },
  { id:6, nama:'Warung Kuliner Desa', kategori:'kuliner', harga:'Mulai Rp 10.000', hargaNum:10000, jadwal:'Setiap hari 08.00–20.00', icon:'🍽️', deskripsi:'Sajian kuliner khas Desa Suwaluh.', gambar:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', fasilitas:['Tempat Duduk','WiFi','Parkir'], kapasitas:'60 kursi' },
  { id:7, nama:'Jasa Sewa Gazebo', kategori:'jasa', harga:'Rp 100.000/sesi', hargaNum:100000, jadwal:'Setiap hari 08.00–18.00', icon:'🛖', deskripsi:'Sewa gazebo tepi danau untuk keluarga atau gathering.', gambar:'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80', fasilitas:['Meja & Kursi','Stop Kontak','WiFi'], kapasitas:'10–20 orang' }
];

const DEFAULT_ORGANISASI = [
  { id:1, nama:'Bpk. Suwarno', jabatan:'Kepala Desa / Pembina', icon:'👑', urutan:1 },
  { id:2, nama:'Bpk. Hadi Santoso', jabatan:'Direktur BUMDes', icon:'🏛️', urutan:2 },
  { id:3, nama:'Ibu Siti Aminah', jabatan:'Sekretaris', icon:'📋', urutan:3 },
  { id:4, nama:'Bpk. Agus Riyanto', jabatan:'Bendahara', icon:'💰', urutan:4 }
];

const DEFAULT_BERITA = [
  { id:1, judul:'Peresmian Wahana Flying Fox Baru', kategori:'wisata', tanggal:'1 April 2025', icon:'🎉', deskripsi:'BUMDes Suwaluh resmi meluncurkan wahana flying fox sepanjang 150 meter.', konten:'Seluruh masyarakat diundang untuk mencoba wahana baru ini dengan harga promo di akhir pekan.' },
  { id:2, judul:'Rapat Anggota Tahunan 2025', kategori:'kegiatan', tanggal:'15 Maret 2025', icon:'📊', deskripsi:'Laporan keuangan BUMDes 2024 disampaikan secara transparan.', konten:'Rapat dihadiri oleh seluruh anggota dan pengurus BUMDes.' },
  { id:3, judul:'Pembagian Dividen Penyertaan Modal', kategori:'pengumuman', tanggal:'1 Februari 2025', icon:'💵', deskripsi:'BUMDes membagikan dividen kepada seluruh pemegang saham.', konten:'Pembagian dilakukan secara proporsional sesuai kepemilikan saham.' }
];

const DEFAULT_FINANCIAL_DATA = {
  tahun: '2024',
  totalAset: 10000000000,
  totalEkuitas: 646000000,
  labaBersih: 127000000,
  pendapatan: 890000000,
  dataHistoris: [
    { tahun: '2021', pendapatan: 320000000, laba: 28000000, aset: 5000000000, ekuitas: 300000000 },
    { tahun: '2022', pendapatan: 480000000, laba: 55000000, aset: 7000000000, ekuitas: 450000000 },
    { tahun: '2023', pendapatan: 620000000, laba: 89000000, aset: 8500000000, ekuitas: 550000000 },
    { tahun: '2024', pendapatan: 890000000, laba: 127000000, aset: 10000000000, ekuitas: 646000000 }
  ]
};

/* ============ DATA ACCESS FUNCTIONS ============ */
async function getUsaha() { return await getFirebaseData(STORAGE_KEYS.USAHA, DEFAULT_USAHA); }
async function saveUsahaItem(item) { return await saveFirebaseData(STORAGE_KEYS.USAHA, item); }
async function deleteUsahaItem(fbKey) { return await deleteFirebaseData(STORAGE_KEYS.USAHA, fbKey); }
async function updateUsahaAfterEdit() { await renderUsahaGrid(); }

async function getOrganisasi() { return await getFirebaseData(STORAGE_KEYS.ORGANISASI, DEFAULT_ORGANISASI); }
async function saveOrganisasiItem(item) { return await saveFirebaseData(STORAGE_KEYS.ORGANISASI, item); }
async function deleteOrganisasiItem(fbKey) { return await deleteFirebaseData(STORAGE_KEYS.ORGANISASI, fbKey); }

async function getBerita() { return await getFirebaseData(STORAGE_KEYS.BERITA, DEFAULT_BERITA); }
async function saveBeritaItem(item) { return await saveFirebaseData(STORAGE_KEYS.BERITA, item); }
async function deleteBeritaItem(fbKey) { return await deleteFirebaseData(STORAGE_KEYS.BERITA, fbKey); }

async function getSaran() { return await getFirebaseData(STORAGE_KEYS.SARAN, []); }
async function saveSaranItem(item) { return await saveFirebaseData(STORAGE_KEYS.SARAN, item); }

async function getReservasi() { return await getFirebaseData(STORAGE_KEYS.RESERVASI, []); }
async function saveReservasiItem(item) { return await saveFirebaseData(STORAGE_KEYS.RESERVASI, item); }
async function updateReservasiStatus(id, status, tiketUrl = null) { 
  const all = await getReservasi();
  const item = all.find(r => r.fbKey === id || r.id == id);
  if (item) {
    item.status = status;
    if (tiketUrl) item.tiketUrl = tiketUrl;
    return await saveFirebaseData(STORAGE_KEYS.RESERVASI, item);
  }
  return false;
}
async function kirimTiketOnline(id, tiketUrl) {
  if (!tiketUrl) {
    showToast('Masukkan URL tiket terlebih dahulu!', 'error');
    return false;
  }
  return await updateReservasiStatus(id, 'validated', tiketUrl);
}

async function getModalPending() { return await getFirebaseData(STORAGE_KEYS.MODAL_PENDING, []); }
async function saveModalPendingItem(item) { return await saveFirebaseData(STORAGE_KEYS.MODAL_PENDING, item); }
async function updateModalPendingStatus(id, status) {
  const all = await getModalPending();
  const item = all.find(m => m.fbKey === id || m.id == id);
  if (item) {
    item.status = status;
    return await saveFirebaseData(STORAGE_KEYS.MODAL_PENDING, item);
  }
  return false;
}

async function getInvestorFirebase() { return await getFirebaseData(STORAGE_KEYS.INVESTOR, []); }
async function saveInvestorFirebase(item) { return await saveFirebaseData(STORAGE_KEYS.INVESTOR, item); }
async function deleteInvestorFirebase(fbKey) { return await deleteFirebaseData(STORAGE_KEYS.INVESTOR, fbKey); }

async function getLaporanFirebase() { return await getFirebaseData(STORAGE_KEYS.LAPORAN, []); }
async function saveLaporanFirebase(item) { return await saveFirebaseData(STORAGE_KEYS.LAPORAN, item); }
async function deleteLaporanFirebase(fbKey) { return await deleteFirebaseData(STORAGE_KEYS.LAPORAN, fbKey); }

async function getFinancialData() { return await getFirebaseData(STORAGE_KEYS.FINANCIAL_DATA, DEFAULT_FINANCIAL_DATA); }
async function saveFinancialData(data) { 
  const existing = await getFinancialData();
  if (existing && existing.fbKey) {
    return await fbSet(`${STORAGE_KEYS.FINANCIAL_DATA}/${existing.fbKey}`, data);
  }
  return await saveFirebaseData(STORAGE_KEYS.FINANCIAL_DATA, data);
}

/* ============ UTILITIES ============ */
function rupiah(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
function formatNumber(n) { return Number(n).toLocaleString('id-ID'); }

function showToast(msg, type='success') {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type==='error' ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3500);
}

function genInvoiceNo() { return 'INV-' + Date.now().toString().slice(-8) + Math.floor(Math.random()*1000); }

/* ============ FINANCIAL ANALYTICS ============ */
function calculateFinancialRatios(finData) {
  const totalAset = finData.totalAset || 0;
  const totalEkuitas = finData.totalEkuitas || 0;
  const labaBersih = finData.labaBersih || 0;
  const pendapatan = finData.pendapatan || 0;
  
  const roi = totalAset > 0 ? (labaBersih / totalAset) * 100 : 0;
  const roe = totalEkuitas > 0 ? (labaBersih / totalEkuitas) * 100 : 0;
  const roa = totalAset > 0 ? (labaBersih / totalAset) * 100 : 0;
  const profitMargin = pendapatan > 0 ? (labaBersih / pendapatan) * 100 : 0;
  
  let paybackPeriod = null;
  if (finData.dataHistoris && finData.dataHistoris.length > 1) {
    const oldest = finData.dataHistoris[0];
    const newest = finData.dataHistoris[finData.dataHistoris.length - 1];
    const avgInvestment = (oldest.aset + newest.aset) / 2;
    const avgProfit = (oldest.laba + newest.laba) / 2;
    if (avgProfit > 0) paybackPeriod = avgInvestment / avgProfit;
  }
  
  return { roi, roe, roa, profitMargin, paybackPeriod };
}

async function renderAnalisisGrid() {
  const el = document.getElementById('analisisGrid'); 
  if (!el) return;
  
  el.innerHTML = '<div style="text-align:center;padding:2rem">⏳ Memuat data...</div>';
  
  const finData = await getFinancialData();
  const ratios = calculateFinancialRatios(finData);
  
  const items = [
    { icon:'📈', label:'ROI (Return on Investment)', value:`${ratios.roi.toFixed(2)}%`, desc:'Tingkat pengembalian investasi' },
    { icon:'🏦', label:'ROE (Return on Equity)', value:`${ratios.roe.toFixed(2)}%`, desc:'Pengembalian atas ekuitas' },
    { icon:'📊', label:'ROA (Return on Asset)', value:`${ratios.roa.toFixed(2)}%`, desc:'Efisiensi penggunaan aset' },
    { icon:'⏱️', label:'Payback Period', value: ratios.paybackPeriod ? `${ratios.paybackPeriod.toFixed(1)} tahun` : '—', desc:'Waktu balik modal investasi' },
    { icon:'💰', label:'Total Aset', value: rupiah(finData.totalAset), desc:'Nilai kekayaan BUMDes' },
    { icon:'💳', label:'Total Ekuitas', value: rupiah(finData.totalEkuitas), desc:'Modal dari pemegang saham' },
    { icon:'📉', label:'Laba Bersih', value: rupiah(finData.labaBersih), desc:'Keuntungan periode berjalan' },
    { icon:'🔄', label:'Profit Margin', value:`${ratios.profitMargin.toFixed(2)}%`, desc:'Persentase laba terhadap pendapatan' }
  ];
  
  el.innerHTML = `<div class="admin-financial-form" style="margin-bottom:2rem;background:#f8faf8;padding:1.5rem;border-radius:12px">
    <h4 style="margin-bottom:1rem;color:#1a4731">✏️ Edit Data Keuangan (Admin)</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
      <div><label style="font-size:.8rem">Total Aset (Rp)</label><input type="number" id="editTotalAset" class="admin-financial-input" value="${finData.totalAset}" style="width:100%;padding:.5rem;border-radius:6px;border:1px solid #ddd"></div>
      <div><label style="font-size:.8rem">Total Ekuitas (Rp)</label><input type="number" id="editTotalEkuitas" class="admin-financial-input" value="${finData.totalEkuitas}" style="width:100%;padding:.5rem;border-radius:6px;border:1px solid #ddd"></div>
      <div><label style="font-size:.8rem">Laba Bersih (Rp)</label><input type="number" id="editLabaBersih" class="admin-financial-input" value="${finData.labaBersih}" style="width:100%;padding:.5rem;border-radius:6px;border:1px solid #ddd"></div>
      <div><label style="font-size:.8rem">Pendapatan (Rp)</label><input type="number" id="editPendapatan" class="admin-financial-input" value="${finData.pendapatan}" style="width:100%;padding:.5rem;border-radius:6px;border:1px solid #ddd"></div>
    </div>
    <button onclick="updateFinancialData()" class="btn btn-primary" style="margin-top:1rem">💾 Simpan Data Keuangan</button>
  </div>
  <div class="analisis-grid-inner" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem">
    ${items.map(i => `<div class="analisis-card"><span class="analisis-icon">${i.icon}</span><div class="analisis-label">${i.label}</div><div class="analisis-value">${i.value}</div><div class="analisis-desc">${i.desc}</div></div>`).join('')}
  </div>`;
}

async function updateFinancialData() {
  const totalAset = parseInt(document.getElementById('editTotalAset')?.value) || 0;
  const totalEkuitas = parseInt(document.getElementById('editTotalEkuitas')?.value) || 0;
  const labaBersih = parseInt(document.getElementById('editLabaBersih')?.value) || 0;
  const pendapatan = parseInt(document.getElementById('editPendapatan')?.value) || 0;
  
  const existing = await getFinancialData();
  const newData = { ...existing, totalAset, totalEkuitas, labaBersih, pendapatan };
  await saveFinancialData(newData);
  await renderAnalisisGrid();
  showToast('✅ Data keuangan berhasil diperbarui dan tersinkron!');
}

/* ============ GOOGLE MAPS EMBED (LANGSUNG DI WEBSITE) ============ */
function initGoogleMaps() {
  const mapContainer = document.getElementById('googleMapEmbed');
  if (!mapContainer) return;
  mapContainer.innerHTML = `
    <iframe 
      width="100%" 
      height="100%" 
      style="border:0; border-radius:12px;"
      loading="lazy" 
      allowfullscreen 
      referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Desa+Suwaluh+Balongbendo+Sidoarjo&language=id">
    </iframe>
  `;
}

/* ============ NAVIGATION ============ */
(function initNav() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => { btn.classList.toggle('open'); links.classList.toggle('open'); });
})();

window.addEventListener('scroll', () => {
  document.getElementById('backToTop')?.classList.toggle('show', window.scrollY > 400);
});
document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

/* ============ ORG CHART ============ */
function personAvatarSVG(color='#40916c') {
  return `<svg viewBox="0 0 36 36" fill="none"><circle cx="18" cy="12" r="7" fill="${color}" opacity="0.8"/><ellipse cx="18" cy="28" rx="11" ry="8" fill="${color}" opacity="0.6"/></svg>`;
}

async function renderOrgChart() {
  const container = document.getElementById('orgChart'); 
  if (!container) return;
  const data = await getOrganisasi();
  const sorted = data.sort((a,b) => (a.urutan||99)-(b.urutan||99));
  if (!sorted.length) { container.innerHTML = '<p style="text-align:center">Belum ada data pengurus</p>'; return; }
  
  container.innerHTML = `
    <div class="org-level">${sorted.map(p => `
      <div class="org-card ${p.urutan === 1 ? 'top-card' : ''}">
        <div class="org-avatar">${personAvatarSVG(p.urutan === 1 ? '#1a4731' : '#40916c')}</div>
        <div class="org-name">${p.nama}</div>
        <div class="org-jabatan">${p.jabatan}</div>
      </div>
    `).join('')}</div>
  `;
}

/* ============ UNIT USAHA ============ */
async function renderUsahaGrid(filter='semua') {
  const grid = document.getElementById('usahaGrid'); 
  if (!grid) return;
  let data = await getUsaha();
  if (filter!=='semua') data = data.filter(u => u.kategori===filter);
  grid.innerHTML = data.map(u => `
    <div class="usaha-card" data-cat="${u.kategori}">
      <div class="usaha-img">
        ${u.gambar ? `<img src="${u.gambar}" alt="${u.nama}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />` : ''}
        <div class="usaha-img-fallback" style="${u.gambar ? 'display:none' : 'display:flex'}">${u.icon}</div>
        <span class="usaha-badge">${u.kategori}</span>
      </div>
      <div class="usaha-body">
        <h3 class="usaha-name">${u.nama}</h3>
        <p class="usaha-desc">${u.deskripsi?.substring(0,100)}${u.deskripsi?.length > 100 ? '...' : ''}</p>
        <div class="usaha-harga">${u.harga}</div>
        <div class="usaha-jadwal">🕐 ${u.jadwal}</div>
        <div class="usaha-actions">
          <button class="btn btn-outline" onclick="showDetailModal('${u.fbKey || u.id}')">Detail</button>
          <a href="unit-wisata.html#reservasi" class="btn btn-primary">Pesan</a>
        </div>
      </div>
    </div>`).join('');
  if (!data.length) grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:2rem">Tidak ada unit usaha.</p>';
}

async function showDetailModal(id) {
  const data = await getUsaha();
  const u = data.find(x => (x.fbKey === id) || (x.id == id));
  if(!u) return;
  const overlay = document.getElementById('modalDetail'); 
  if(!overlay) return;
  document.getElementById('modalContent').innerHTML = `
    ${u.gambar ? `<img class="modal-img" src="${u.gambar}" alt="${u.nama}" onerror="this.style.display='none'" />` : `<div class="modal-img-fallback">${u.icon}</div>`}
    <div class="modal-body">
      <span class="section-badge">${u.kategori}</span>
      <h3>${u.nama}</h3>
      <div class="modal-info-row">
        <div class="modal-info-item"><span class="modal-info-label">Harga</span><span class="modal-info-value">${u.harga}</span></div>
        <div class="modal-info-item"><span class="modal-info-label">Operasional</span><span class="modal-info-value">${u.jadwal}</span></div>
        ${u.kapasitas ? `<div class="modal-info-item"><span class="modal-info-label">Kapasitas</span><span class="modal-info-value">${u.kapasitas}</span></div>` : ''}
      </div>
      <p class="modal-desc">${u.deskripsi}</p>
      ${u.fasilitas?.length ? `<div class="modal-fasilitas"><h4>✅ Fasilitas</h4><ul>${u.fasilitas.map(f=>`<li>${f}</li>`).join('')}</ul></div>` : ''}
      <div class="modal-footer">
        <a href="unit-wisata.html#reservasi" class="btn btn-primary">📅 Reservasi Sekarang</a>
        <button class="btn btn-outline" onclick="closeModal()">Tutup</button>
      </div>
    </div>`;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() { 
  document.getElementById('modalDetail')?.classList.remove('active'); 
  document.body.style.overflow = ''; 
}

/* ============ BERITA DISPLAY (TAMPILAN USER) ============ */
async function renderBeritaDisplay() {
  const container = document.getElementById('beritaContainer');
  if (!container) return;
  const berita = await getBerita();
  const sorted = berita.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));
  if (!sorted.length) {
    container.innerHTML = '<p style="text-align:center;padding:2rem">Belum ada berita.</p>';
    return;
  }
  container.innerHTML = sorted.map(b => `
    <div class="berita-card">
      <div class="berita-icon">${b.icon || '📰'}</div>
      <div class="berita-content">
        <div class="berita-header">
          <h4>${b.judul}</h4>
          <span class="berita-kategori">${b.kategori}</span>
        </div>
        <p class="berita-tanggal">📅 ${b.tanggal}</p>
        <p class="berita-deskripsi">${b.deskripsi}</p>
        ${b.konten ? `<button class="btn btn-sm btn-outline" onclick="showBeritaDetail('${b.fbKey || b.id}')">Baca Selengkapnya →</button>` : ''}
      </div>
    </div>
  `).join('');
}

async function showBeritaDetail(id) {
  const berita = await getBerita();
  const b = berita.find(x => x.fbKey === id || x.id == id);
  if (!b) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div class="modal-card" style="max-width:600px;width:100%;max-height:80vh;overflow-y:auto">
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      <div style="padding:1.5rem">
        <div style="font-size:3rem;margin-bottom:.5rem">${b.icon || '📰'}</div>
        <span class="section-badge">${b.kategori}</span>
        <h3 style="margin:.5rem 0">${b.judul}</h3>
        <p style="color:var(--gray-500);font-size:.85rem;margin-bottom:1rem">📅 ${b.tanggal}</p>
        <p style="line-height:1.6">${b.konten || b.deskripsi}</p>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target === modal) modal.remove(); });
}

/* ============ FORM RESERVASI ============ */
async function submitReservasi(e) {
  e.preventDefault();
  const nama = document.getElementById('res-nama')?.value.trim();
  const telp = document.getElementById('res-telp')?.value.trim();
  const wisata = document.getElementById('res-wisata')?.value;
  const tanggal = document.getElementById('res-tanggal')?.value;
  const jumlah = parseInt(document.getElementById('res-jumlah')?.value) || 0;
  const catatan = document.getElementById('res-catatan')?.value.trim() || '';
  
  if (!nama || !telp || !wisata || !tanggal || jumlah < 1) {
    showToast('Harap lengkapi data!', 'error');
    return;
  }
  
  const invoiceNo = genInvoiceNo();
  const reservasiData = {
    id: Date.now(),
    invoiceNo,
    nama,
    telp,
    wisata,
    tanggal,
    jumlah,
    catatan,
    status: 'pending',
    tiketUrl: null,
    waktu: new Date().toLocaleDateString('id-ID')
  };
  
  await saveReservasiItem(reservasiData);
  showReservasiSuccessModal(reservasiData);
  document.getElementById('formReservasi')?.reset();
}

function showReservasiSuccessModal(data) {
  const existing = document.getElementById('reservasiSuccessModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'reservasiSuccessModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:8000;display:flex;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;max-width:440px;width:100%;padding:2rem;text-align:center">
      <div style="font-size:3.5rem">✅</div>
      <h3 style="color:#1a4731">Reservasi Berhasil!</h3>
      <p>No Invoice: <strong>${data.invoiceNo}</strong></p>
      <button onclick="window.print()" class="btn btn-primary" style="margin-top:1rem">🖨️ Cetak Invoice</button>
      <button onclick="this.closest('#reservasiSuccessModal').remove()" class="btn btn-outline" style="margin-top:1rem;margin-left:.5rem">Tutup</button>
    </div>`;
  document.body.appendChild(modal);
}

/* ============ FORM SAHAM ============ */
async function submitSaham(e) {
  e.preventDefault();
  const nama = document.getElementById('s-nama')?.value.trim();
  const alamat = document.getElementById('s-alamat')?.value.trim();
  const telp = document.getElementById('s-telp')?.value.trim();
  const lembar = parseInt(document.getElementById('s-lembar')?.value) || 0;
  
  if (!nama || !alamat || !telp || lembar < 1) {
    showToast('Harap lengkapi data!', 'error');
    return;
  }
  
  const pendingData = {
    id: Date.now(),
    nama,
    alamat,
    telp,
    lembar,
    total: lembar * 100000,
    status: 'pending',
    waktu: new Date().toLocaleDateString('id-ID')
  };
  
  await saveModalPendingItem(pendingData);
  showToast('✅ Permintaan pembelian saham dikirim!');
  document.getElementById('
