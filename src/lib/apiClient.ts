import { PatientConversation, Message, AppointmentStatus, ConversationStatus } from '../types/chatwoot';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function fetchConversationsFromBackend(): Promise<PatientConversation[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations`);
    if (!res.ok) throw new Error('Falha ao buscar conversas do backend');
    return await res.json();
  } catch (err) {
    console.warn('[ApiClient] Backend offline ou indisponível, utilizando dados sincronizados locais.');
    return [];
  }
}

export async function postMessageToBackend(conversationId: string, message: Message): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateConversationStatusInBackend(
  conversationId: string,
  updates: { status?: AppointmentStatus; appointmentStatus?: AppointmentStatus; conversationStatus?: ConversationStatus }
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}
