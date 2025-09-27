// src/scripts/pages/contact/contact-page.js

const ContactPage = {
  async render() {
    return `
      <section class="contact-section" style="padding:4rem 0 2rem 0;background:#f8fafc;min-height:60vh;">
        <div class="container" style="max-width:600px;margin:0 auto;">
          <h1 style="font-size:2.5rem;font-weight:700;color:#a259c6;margin-bottom:1rem;">Kontak Kami</h1>
          <p style="font-size:1.1rem;color:#444;margin-bottom:2rem;">Ada pertanyaan, saran, atau ingin berkolaborasi? Silakan hubungi tim SahabatCerita melalui form di bawah ini atau kontak langsung ke email kami.</p>
          <form class="contact-form" style="background:#fff;padding:2rem 1.5rem;border-radius:18px;box-shadow:0 4px 24px rgba(162,89,198,0.07);display:flex;flex-direction:column;gap:1.2rem;">
            <div>
              <label for="name" style="font-weight:600;color:#7c3aad;">Nama</label>
              <input type="text" id="name" name="name" required style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e0e0e0;margin-top:0.3rem;" />
            </div>
            <div>
              <label for="email" style="font-weight:600;color:#7c3aad;">Email</label>
              <input type="email" id="email" name="email" required style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e0e0e0;margin-top:0.3rem;" />
            </div>
            <div>
              <label for="message" style="font-weight:600;color:#7c3aad;">Pesan</label>
              <textarea id="message" name="message" rows="4" required style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid #e0e0e0;margin-top:0.3rem;"></textarea>
            </div>
            <button type="submit" class="btn gradient-btn" style="margin-top:0.5rem;width:100%;max-width:200px;align-self:center;">
              <i class="fas fa-paper-plane"></i> Kirim Pesan
            </button>
          </form>
          <div style="margin-top:2.5rem;text-align:center;color:#7c3aad;font-size:1.1rem;">
            <strong>Email: </strong> <a href="mailto:support@sahabatcerita.com" style="color:#a259c6;">support@sahabatcerita.com</a>
          </div>
        </div>
      </section>
    `;
  },
  async afterRender() {
    // Form submit dummy (tidak benar-benar mengirim email)
    const form = document.querySelector('.contact-form');
    if(form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Terima kasih, pesan Anda sudah terkirim!');
        form.reset();
      });
    }
  },
};

export default ContactPage;
