import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { SandiegoLogo } from './SandiegoLogo';
import { ImportRow } from '../types/chatwoot';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Zap,
  Send,
  Trash2,
  Plus,
  ShieldCheck,
  X,
  Users,
  Sliders,
  Edit3,
  MessageCircle,
  ExternalLink,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'sandiego_imported_dispatches_v1';

export function ImporterView() {
  const { triggerBatchConfirmations, team, vaccines } = useChatStore();

  const availableServices = Array.from(
    new Set([
      ...team.map((t) => t.role),
      ...vaccines.map((v) => `Imunização / Vacina ${v.name}`),
      'Alergia e Imunologia',
      'Obstetrícia, Saúde e Imunização',
      'Consulta Pediatria',
      'Coleta de Sangue / Exames',
    ])
  );

  const [rawPastedText, setRawPastedText] = useState('');

  // Persistent Rows State
  const [importedRows, setImportedRows] = useState<ImportRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler disparos salvos:', e);
    }
    return [
      {
        id: 'imp-1',
        patientName: 'Roberto Carlos',
        phone: '(73) 98112-3344',
        doctorName: 'Dr. Diego Santiago Granato',
        specialty: 'Alergia e Imunologia',
        date: new Date().toISOString().slice(0, 10),
        time: '09:00',
        insurance: 'Amil',
        unit: 'Unidade Central',
        notes: 'Trazer exames anteriores',
        isValid: true,
      },
      {
        id: 'imp-2',
        patientName: 'Adriana Lima',
        phone: '(73) 97711-2233',
        doctorName: 'Priscila Santiago Granato',
        specialty: 'Obstetrícia e Imunização',
        date: new Date().toISOString().slice(0, 10),
        time: '10:30',
        insurance: 'SulAmérica',
        unit: 'Unidade Central',
        notes: '',
        isValid: true,
      },
    ];
  });

  // Modal States
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [editingRow, setEditingRow] = useState<ImportRow | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Row Form State
  const [newRowForm, setNewRowForm] = useState({
    patientName: '',
    phone: '',
    doctorName: 'Dr. Diego Santiago Granato',
    specialty: 'Alergia e Imunologia',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    insurance: 'Particular',
    notes: '',
  });

  const saveRows = (rows: ImportRow[]) => {
    setImportedRows(rows);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch (e) {
      console.error('Erro ao armazenar disparos:', e);
    }
  };

  const handleParsePaste = () => {
    if (!rawPastedText.trim()) return toast.error('Cole os dados ou selecione um arquivo primeiro.');

    const lines = rawPastedText.trim().split('\n');
    const parsed: ImportRow[] = lines.map((line, idx) => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      const patientName = parts[0]?.trim() || `Paciente ${idx + 1}`;
      const phone = parts[1]?.trim() || '';
      const doctorName = parts[2]?.trim() || 'Dr. Diego Santiago Granato';
      const specialty = parts[3]?.trim() || 'Alergia e Imunologia';
      const time = parts[4]?.trim() || '14:00';
      const insurance = parts[5]?.trim() || 'Particular';

      const isValid = phone.replace(/\D/g, '').length >= 10;

      return {
        id: 'paste-' + idx + '-' + Date.now(),
        patientName,
        phone,
        doctorName,
        specialty,
        date: new Date().toISOString().slice(0, 10),
        time,
        insurance,
        unit: 'Unidade Central',
        notes: '',
        isValid,
        errorReason: isValid ? undefined : 'Telefone inválido',
      };
    });

    const updated = [...importedRows, ...parsed];
    saveRows(updated);
    setRawPastedText('');
    toast.success(`${parsed.length} agendamentos adicionados à fila de disparo!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawPastedText(text);
        toast.info(`Arquivo "${file.name}" lido. Clique em "Adicionar Linhas" para carregar.`);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteRow = (id: string) => {
    const updated = importedRows.filter((r) => r.id !== id);
    saveRows(updated);
    toast.info('Agendamento removido da fila.');
  };

  const handleClearAll = () => {
    saveRows([]);
    toast.info('Fila zerada.');
  };

  const handleSaveEditRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const isValid = editingRow.phone.replace(/\D/g, '').length >= 10;
    const updatedRow: ImportRow = {
      ...editingRow,
      isValid,
      errorReason: isValid ? undefined : 'Telefone inválido',
    };

    const updatedRows = importedRows.map((r) => (r.id === editingRow.id ? updatedRow : r));
    saveRows(updatedRows);
    setEditingRow(null);
    toast.success(`Agendamento de "${editingRow.patientName}" alterado com sucesso!`);
  };

  const handleAddNewSinglePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowForm.patientName.trim()) return toast.error('Informe o nome do paciente.');

    const isValid = newRowForm.phone.replace(/\D/g, '').length >= 10;
    const newRow: ImportRow = {
      id: `manual-${Date.now()}`,
      patientName: newRowForm.patientName.trim(),
      phone: newRowForm.phone.trim(),
      doctorName: newRowForm.doctorName.trim(),
      specialty: newRowForm.specialty.trim(),
      date: newRowForm.date,
      time: newRowForm.time,
      insurance: newRowForm.insurance,
      unit: 'Unidade Central',
      notes: newRowForm.notes,
      isValid,
      errorReason: isValid ? undefined : 'Telefone inválido',
    };

    const updated = [...importedRows, newRow];
    saveRows(updated);
    setIsAddModalOpen(false);
    setNewRowForm({
      patientName: '',
      phone: '',
      doctorName: 'Dr. Diego Santiago Granato',
      specialty: 'Alergia e Imunologia',
      date: new Date().toISOString().slice(0, 10),
      time: '09:00',
      insurance: 'Particular',
      notes: '',
    });
    toast.success(`Paciente "${newRow.patientName}" adicionado à fila!`);
  };

  const validRows = importedRows.filter((r) => r.isValid);

  const handleConfirmManualDispatch = () => {
    setShowDispatchModal(false);
    triggerBatchConfirmations();
    toast.success(`Disparo manual executado para ${validRows.length} pacientes!`);
  };

  return (
    <div className="flex-1 bg-[#f4f7fc] overflow-y-auto p-6 sm:p-8 text-slate-800 space-y-6 select-none">
      {/* LUXURY HERO BANNER (NAVY & GOLD DEEP GRADIENT) */}
      <div className="bg-gradient-to-r from-[#0a1f5e] via-[#0d287a] to-[#0a1124] border border-[#C59B27]/40 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 text-white relative overflow-hidden">
        {/* Decorative subtle gold glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C59B27]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C59B27] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#E5C782] block">
                CENTRAL DE CONFIRMAÇÕES DA AGENDA
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-['Plus_Jakarta_Sans'] leading-tight tracking-tight">
              Disparo de Confirmações WhatsApp
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              As mensagens são entregues via WhatsApp de acordo com o horário agendado de cada consulta médica.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              disabled={validRows.length === 0}
              onClick={() => setShowDispatchModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition flex items-center gap-2 cursor-pointer backdrop-blur-xs disabled:opacity-40"
            >
              <Sliders className="h-4 w-4 text-[#C59B27]" />
              <span>Disparo Manual</span>
            </button>

            <a
              href="#adicionar-clientes"
              className="px-4 py-2.5 bg-[#C59B27]/15 hover:bg-[#C59B27]/25 text-[#E5C782] font-bold text-xs rounded-2xl border border-[#C59B27]/40 transition flex items-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Users className="h-4 w-4 text-[#C59B27]" />
              <span>Fila ({importedRows.length} Pacientes)</span>
            </a>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#C59B27] to-[#d4af37] hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Paciente</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABELA PRINCIPAL: Fila de Agendamentos */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#b8860b]" /> Pacientes Agendados para Hoje
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Clique em qualquer número de WhatsApp para abrir a conversa direta com o paciente.
            </p>
          </div>

          {importedRows.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              <span>Limpar Fila</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="p-4">Paciente</th>
                <th className="p-4">Telefone WhatsApp (Link Direto)</th>
                <th className="p-4">Médico / Especialidade</th>
                <th className="p-4">Horário da Consulta</th>
                <th className="p-4">Status de Envio</th>
                <th className="p-4 text-right">Ações de Edição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {importedRows.map((r) => {
                const cleanPhone = r.phone.replace(/\D/g, '');
                const waLink = cleanPhone.startsWith('55') ? `https://wa.me/${cleanPhone}` : `https://wa.me/55${cleanPhone}`;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">{r.patientName}</td>
                    <td className="p-4">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:underline font-bold font-mono transition bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60"
                        title="Abrir WhatsApp direto do cliente"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{r.phone}</span>
                        <ExternalLink className="h-3 w-3 text-emerald-500 ml-0.5" />
                      </a>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{r.doctorName}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{r.specialty}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 font-mono">
                      {r.time} hs
                    </td>
                    <td className="p-4">
                      {r.isValid ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Agendado para envio automático</span>
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-3 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                          <span>{r.errorReason || 'Telefone Inválido'}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingRow(r)}
                          className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#85610d] border border-amber-300/80 text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1"
                          title="Editar paciente e horário"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-[#C59B27]" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRow(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Excluir da fila"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LÁ EMBAIXO: Adicionar Agendamentos por Planilha */}
      <div id="adicionar-clientes" className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 pt-4 border-t-2 border-t-[#C59B27]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-[#b8860b]" /> Opção Manual: Importar Vários Agendamentos por Planilha
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Utilize se quiser colar várias linhas de uma só vez ou carregar um arquivo Excel/CSV.
            </p>
          </div>

          <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer self-start sm:self-auto">
            <UploadCloud className="h-4 w-4 text-amber-400" />
            <span>Importar Arquivo Excel / CSV</span>
            <input
              type="file"
              accept=".csv, .txt, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <textarea
          rows={3}
          value={rawPastedText}
          onChange={(e) => setRawPastedText(e.target.value)}
          placeholder="Cole as linhas da planilha aqui (ex: Roberto Carlos, (73) 99123-4567, Dr. Diego, Alergia, 14:30, Unimed)..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:border-[#C59B27] focus:outline-none transition"
        />

        <div className="flex justify-end">
          <button
            onClick={handleParsePaste}
            className="px-4 py-2.5 bg-[#C59B27] hover:bg-[#b8860b] text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Linhas à Fila</span>
          </button>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO INDIVIDUAL */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <form
            onSubmit={handleSaveEditRow}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-[#C59B27]" /> Alterar Agendamento de Disparo
              </h3>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Nome do Paciente:</label>
                <input
                  type="text"
                  required
                  value={editingRow.patientName}
                  onChange={(e) => setEditingRow({ ...editingRow, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp:</label>
                <input
                  type="text"
                  required
                  value={editingRow.phone}
                  onChange={(e) => setEditingRow({ ...editingRow, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Horário da Consulta:</label>
                <input
                  type="text"
                  required
                  value={editingRow.time}
                  onChange={(e) => setEditingRow({ ...editingRow, time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Médico Especialista:</label>
                <select
                  value={editingRow.doctorName}
                  onChange={(e) => {
                    const selectedDoc = team.find((d) => d.name === e.target.value);
                    setEditingRow({
                      ...editingRow,
                      doctorName: e.target.value,
                      specialty: selectedDoc ? selectedDoc.role : editingRow.specialty,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900 outline-none focus:border-[#C59B27]"
                >
                  {team.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                  {!team.some((doc) => doc.name === editingRow.doctorName) && (
                    <option value={editingRow.doctorName}>{editingRow.doctorName}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Especialidade / Serviço:</label>
                <select
                  value={editingRow.specialty}
                  onChange={(e) => setEditingRow({ ...editingRow, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900 outline-none focus:border-[#C59B27]"
                >
                  {availableServices.map((service, i) => (
                    <option key={i} value={service}>
                      {service}
                    </option>
                  ))}
                  {!availableServices.includes(editingRow.specialty) && (
                    <option value={editingRow.specialty}>{editingRow.specialty}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Convênio:</label>
                <input
                  type="text"
                  value={editingRow.insurance}
                  onChange={(e) => setEditingRow({ ...editingRow, insurance: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data da Consulta:</label>
                <input
                  type="date"
                  value={editingRow.date}
                  onChange={(e) => setEditingRow({ ...editingRow, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b8860b] text-slate-950 font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL ADICIONAR NOVO PACIENTE INDIVIDUAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <form
            onSubmit={handleAddNewSinglePatient}
            className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#2563eb]" /> Adicionar Paciente à Fila de Disparo
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Nome do Paciente:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newRowForm.patientName}
                  onChange={(e) => setNewRowForm({ ...newRowForm, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp:</label>
                <input
                  type="text"
                  required
                  placeholder="(73) 99999-8888"
                  value={newRowForm.phone}
                  onChange={(e) => setNewRowForm({ ...newRowForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Horário da Consulta:</label>
                <input
                  type="text"
                  required
                  placeholder="09:00"
                  value={newRowForm.time}
                  onChange={(e) => setNewRowForm({ ...newRowForm, time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Médico Especialista:</label>
                <select
                  required
                  value={newRowForm.doctorName}
                  onChange={(e) => {
                    const selectedDoc = team.find((d) => d.name === e.target.value);
                    setNewRowForm({
                      ...newRowForm,
                      doctorName: e.target.value,
                      specialty: selectedDoc ? selectedDoc.role : newRowForm.specialty,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900 outline-none focus:border-[#C59B27]"
                >
                  {team.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Especialidade / Serviço:</label>
                <select
                  required
                  value={newRowForm.specialty}
                  onChange={(e) => setNewRowForm({ ...newRowForm, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900 outline-none focus:border-[#C59B27]"
                >
                  {availableServices.map((service, i) => (
                    <option key={i} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b8860b] text-slate-950 font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Paciente</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Emergency Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Confirmar Disparo Manual
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Esta ação enviará confirmações imediatas para os <strong>{validRows.length} pacientes</strong> da fila sem aguardar o envio automático programado.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmManualDispatch}
                className="flex-1 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Confirmar Envio Manual</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
