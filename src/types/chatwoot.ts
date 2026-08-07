export type ConversationStatus =
  | 'awaiting_clinic'
  | 'awaiting_patient'
  | 'finalized';

export type AppointmentStatus =
  | 'awaiting_dispatch'
  | 'awaiting_confirmation'
  | 'awaiting_patient'
  | 'confirmed'
  | 'reschedule_requested'
  | 'reschedule_in_progress'
  | 'rescheduled'
  | 'cancellation_requested'
  | 'cancelled'
  | 'no_response'
  | 'finalized'
  | 'send_error';

export type ConfirmationStatus = AppointmentStatus;

export type FollowUpStatus = 'none' | 'no_return';

export type InsuranceType =
  | 'Unimed'
  | 'Bradesco Saúde'
  | 'SulAmérica'
  | 'Amil'
  | 'Porto Seguro'
  | 'Particular'
  | 'Outro';

export type MainView = 'chat' | 'importer' | 'automations' | 'sandbox';

export type MessageSender = 'patient' | 'system_bot' | 'agent' | 'system_event';

export interface Message {
  id: string;
  sender: MessageSender;
  senderName?: string;
  text: string;
  timestamp: string;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  fileName?: string;
  fileSize?: string;
  mediaType?: 'audio' | 'image' | 'video' | 'document' | 'sticker' | 'text';
  mediaStatus?: 'loaded' | 'processing' | 'processing_error' | 'none';
  transcription?: string;
  transcriptionStatus?: 'completed' | 'processing' | 'error' | 'none';
  meta?: {
    intentDetected?: 'confirmation_yes' | 'confirmation_no' | 'cancellation' | 'faq' | 'unrecognized';
    statusChangedTo?: AppointmentStatus;
  };
}

export interface PatientConversation {
  id: string;
  patientName: string;
  patientPhone: string;
  patientCpf?: string;
  patientBirthDate?: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  unitName?: string;
  insurance: InsuranceType;
  insuranceNumber?: string;
  conversationStatus: ConversationStatus;
  appointmentStatus: AppointmentStatus;
  status: AppointmentStatus;
  unreadCount: number;
  unread: boolean;
  followUpStatus?: FollowUpStatus;
  reschedulePreference?: string;
  notes?: string;
  origin?: 'Importação Excel' | 'API' | 'Manual' | 'WhatsApp';
  messages: Message[];
  lastActivity: string;
  externalAppointmentId?: string;
}

export type InboxFilterTab =
  | 'all'
  | 'awaiting_clinic'
  | 'awaiting_patient'
  | 'reschedule';

export type SecondaryFilterOption =
  | 'all'
  | 'confirmed'
  | 'finalized'
  | 'cancelled'
  | 'no_response'
  | 'send_error';

export interface CannedResponse {
  id?: string;
  shortcut: string;
  title: string;
  category: string;
  content: string;
  isActive?: boolean;
  lastUpdated?: string;
}

export interface AutomationSettings {
  initialGreeting: string;
  confirmationMessage: string;
  rescheduleMessage: string;
  cancellationPrompt: string;
  cancellationFinalMessage: string;
  unrecognizedMessage: string;
  receptiveMenuText: string;
  prepartyInstructions: string;
  requiredDocs: string;
  clinicAddress: string;
  acceptedInsurances: string;
  businessHours: string;
  afterHoursResponse: string;
  keywordsYes: string[];
  keywordsNo: string[];
  keywordsCancel: string[];
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  type: 'incoming_message' | 'outgoing_message' | 'appointment_sync' | 'error';
  source: 'WhatsApp Cloud API' | 'Sistema da Clínica' | 'Automação Sandiego';
  status: 'success' | 'rejected' | 'pending';
  summary: string;
  externalId?: string;
}

export interface ImportRow {
  id: string;
  patientName: string;
  patientPhone?: string;
  phone: string;
  doctorName: string;
  specialty: string;
  appointmentDate?: string;
  date: string;
  appointmentTime?: string;
  time: string;
  insurance: string;
  unit?: string;
  notes?: string;
  externalId?: string;
  isValid?: boolean;
  errorMessage?: string;
  errorReason?: string;
}
