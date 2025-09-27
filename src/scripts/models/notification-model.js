export class NotificationModel {
  constructor() {
    this.VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  }

  async requestPermission() {
    const result = await Notification.requestPermission();
    if (result !== 'granted') {
      throw new Error('Izin notifikasi ditolak');
    }
    return result;
  }

  async getServiceWorkerRegistration() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error('Service worker belum terdaftar');
    }
    return registration;
  }

  async getPushSubscription(registration) {
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: Uint8Array.from(
          atob(this.VAPID_PUBLIC_KEY.replace(/_/g, '/').replace(/-/g, '+')), 
          c => c.charCodeAt(0)
        ),
      });
    }
    return subscription;
  }

  async unsubscribeFromPush() {
    const registration = await this.getServiceWorkerRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    
    if (!subscription) {
      throw new Error('Belum berlangganan');
    }

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    return endpoint;
  }
}



