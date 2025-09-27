// src/scripts/pages/about/about-page.js

const AboutPage = {
  async render() {
    return `
      <section class="about-section" style="padding:4rem 0 2rem 0;background:#f8fafc;min-height:60vh;">
        <div class="container" style="max-width:800px;margin:0 auto;">
          <h1 style="font-size:2.5rem;font-weight:700;color:#a259c6;margin-bottom:1rem;">Tentang SahabatCerita</h1>
          <p style="font-size:1.15rem;color:#444;margin-bottom:2rem;">SahabatCerita adalah platform berbagi kisah, pengalaman, dan inspirasi untuk komunitas developer Indonesia. Kami percaya setiap cerita memiliki kekuatan untuk menginspirasi, mengedukasi, dan mempererat komunitas.</p>
          <div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:center;justify-content:center;">
            <img src="images/story.png" alt="Ilustrasi SahabatCerita" style="width:220px;max-width:100%;border-radius:18px;box-shadow:0 4px 24px rgba(162,89,198,0.10);background:#fff;" loading="lazy" />
            <ul style="flex:1;min-width:220px;font-size:1.05rem;color:#555;list-style:disc inside;">
              <li>Berbagi cerita coding, pengalaman kerja, dan inspirasi teknologi</li>
              <li>Menemukan kisah menarik dari developer lain di seluruh Indonesia</li>
              <li>Mendukung kolaborasi, pembelajaran, dan pertumbuhan komunitas</li>
              <li>Fitur peta, foto, dan notifikasi untuk pengalaman interaktif</li>
            </ul>
          </div>
          <div style="margin-top:2.5rem;font-size:1.1rem;color:#7c3aad;">
            <strong>Gabung bersama SahabatCerita dan jadikan kisahmu inspirasi untuk komunitas developer Indonesia!</strong>
          </div>
        </div>
      </section>
    `;
  },
  async afterRender() {
    // Tambahkan interaksi jika diperlukan
  },
};

export default AboutPage;
