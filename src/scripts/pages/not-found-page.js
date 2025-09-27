export default class NotFoundPage {
  async render() {
    return `
      <section class="container">
        <div class="not-found-container">
          <div class="not-found-content">
            <div class="not-found-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h1>404 - Halaman Tidak Ditemukan</h1>
            <p class="not-found-description">
              Maaf, halaman yang Anda cari tidak dapat ditemukan. 
              Mungkin halaman tersebut telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
            </p>
            <div class="not-found-actions">
              <a href="#/" class="btn btn-primary">
                <i class="fas fa-home"></i> Kembali ke Beranda
              </a>
              <a href="#/add-story" class="btn btn-outline">
                <i class="fas fa-plus"></i> Tambah Cerita
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Add any additional functionality if needed
  }
}


