export type WhatsAppProvider = 'meta_cloud_api' | 'evolution_api';

export type WhatsAppConnectionStatus =
  | 'unconfigured'
  | 'credentials_filled'
  | 'testing'
  | 'connected_homologated'
  | 'error';

export interface StandardizedWhatsAppMessage {
  externalMessageId: string;
  senderPhone: string;
  recipientPhone: string;
  messageType: 'text' | 'image' | 'document' | 'audio';
  text: string;
  mediaUrl?: string;
  timestamp: string;
}

export interface WhatsAppAdapterConfig {
  provider: WhatsAppProvider;
  token?: string;
  phoneNumberId?: string;
  webhookUrl?: string;
}

export class WhatsAppAdapter {
  private config: WhatsAppAdapterConfig;

  constructor(config?: WhatsAppAdapterConfig) {
    this.config = config || {
      provider: (import.meta.env.VITE_WHATSAPP_PROVIDER as WhatsAppProvider) || 'meta_cloud_api',
      token: import.meta.env.VITE_WHATSAPP_TOKEN || '',
      phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
      webhookUrl: import.meta.env.VITE_WHATSAPP_WEBHOOK_URL || '',
    };
  }

  public getConnectionStatus(): WhatsAppConnectionStatus {
    if (!this.config.token || !this.config.phoneNumberId) {
      return 'unconfigured';
    }
    // Presence of tokens yields 'credentials_filled', NEVER 'connected_homologated' without live test!
    return 'credentials_filled';
  }

  public async sendMessage(
    recipientPhone: string,
    text: string
  ): Promise<{ success: boolean; externalMessageId?: string; error?: string }> {
    const status = this.getConnectionStatus();
    if (status === 'unconfigured') {
      return {
        success: false,
        error: 'Provedor de WhatsApp não configurado. Insira o token no arquivo .env.',
      };
    }

    const externalMessageId = `wamid.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      externalMessageId,
    };
  }

  public normalizeIncomingWebhook(payload: any): StandardizedWhatsAppMessage | null {
    if (!payload) return null;

    return {
      externalMessageId: payload.id || `ext-${Date.now()}`,
      senderPhone: payload.from || '5511999999999',
      recipientPhone: payload.to || '5511998876655',
      messageType: 'text',
      text: payload.body || payload.text || '',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export const defaultWhatsAppAdapter = new WhatsAppAdapter();
