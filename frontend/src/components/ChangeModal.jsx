import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit3, Server, Monitor, BookOpen } from 'lucide-react';
import { Input } from '../components/ui/input';
import { STATUS_CONFIG, RESULTADO_CONFIG } from './MetricsCards';

const IMPACTO_OPTIONS = [
  { value: 'baixo', label: 'Baixo' },
  { value: 'medio', label: 'Médio' },
  { value: 'alto', label: 'Alto' },
  { value: 'critico', label: 'Crítico' },
];

const TIPO_MUDANCA_OPTIONS = [
  { value: 'infraestrutura', label: 'Infraestrutura', icon: Server },
  { value: 'sistemas', label: 'Sistemas', icon: Monitor },
  { value: 'sapiens', label: 'SAPIENS', icon: BookOpen },
];

const CATEGORIA_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'padrao', label: 'Padrão' },
  { value: 'emergencial', label: 'Emergencial' },
];

const PRIORIDADE_OPTIONS = [
  { value: 'critica', label: 'Crítica' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
];

const RISCO_OPTIONS = [
  { value: 'alto', label: 'Alto' },
  { value: 'medio', label: 'Médio' },
  { value: 'baixo', label: 'Baixo' },
];

const selectClass = "w-full border border-[#E6E6E6] rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-[#1351B4] focus:border-transparent outline-none bg-white disabled:bg-[#f8f8f8]";
const textareaClass = "w-full border border-[#E6E6E6] rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-[#1351B4] focus:border-transparent outline-none resize-none disabled:bg-[#f8f8f8]";
const sectionTitle = "text-sm font-bold text-[#1351B4] uppercase tracking-wide pb-2 border-b border-[#E6E6E6] mb-3";

export default function ChangeModal({ change, mode, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    titulo: '', descricao: '', responsavel: '', sistema_afetado: '',
    data_inicio: '', data_fim: '', status: 'planejada', impacto: 'medio',
    tipo_mudanca: 'sistemas', categoria_itil: 'normal', prioridade: 'media',
    risco: 'medio', numero_rfc: '', justificativa: '', plano_rollback: '',
    janela_manutencao: '', aprovador: '', servicos_impactados: '',
    resultado_conclusao: ''
  });
  const [editing, setEditing] = useState(mode === 'create');

  useEffect(() => {
    if (change && mode !== 'create') {
      setForm({
        titulo: change.titulo || '',
        descricao: change.descricao || '',
        responsavel: change.responsavel || '',
        sistema_afetado: change.sistema_afetado || '',
        data_inicio: change.data_inicio || '',
        data_fim: change.data_fim || '',
        status: change.status || 'planejada',
        impacto: change.impacto || 'medio',
        tipo_mudanca: change.tipo_mudanca || 'sistemas',
        categoria_itil: change.categoria_itil || 'normal',
        prioridade: change.prioridade || 'media',
        risco: change.risco || 'medio',
        numero_rfc: change.numero_rfc || '',
        justificativa: change.justificativa || '',
        plano_rollback: change.plano_rollback || '',
        janela_manutencao: change.janela_manutencao || '',
        aprovador: change.aprovador || '',
        servicos_impactados: change.servicos_impactados || '',
        resultado_conclusao: change.resultado_conclusao || '',
      });
    }
  }, [change, mode]);

  const h = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

  const isReadonly = mode === 'view' && !editing;
  const statusCfg = STATUS_CONFIG[form.status] || STATUS_CONFIG.planejada;
  const tipoInfo = TIPO_MUDANCA_OPTIONS.find(t => t.value === form.tipo_mudanca);
  const TipoIcon = tipoInfo?.icon || Monitor;
  const showResultado = form.status === 'concluida';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4" data-testid="change-modal-overlay">
      <div className="bg-white rounded-md shadow-xl border-t-4 border-[#1351B4] w-full max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="change-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 pb-4 border-b border-[#E6E6E6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1351B4] flex items-center justify-center">
              <TipoIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#333333]">
                {mode === 'create' ? 'Nova Mudança' : editing ? 'Editar Mudança' : 'Detalhes da Mudança'}
              </h2>
              {form.numero_rfc && <span className="text-xs text-[#555555]">RFC: {form.numero_rfc}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'view' && !editing && (
              <button data-testid="change-edit-button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-[#1351B4] hover:text-[#071D41] font-semibold transition-colors">
                <Edit3 className="w-4 h-4" /> Editar
              </button>
            )}
            <button data-testid="change-modal-close" onClick={onClose} className="text-[#555555] hover:text-[#333333]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
          {/* Identificação */}
          <div>
            <h3 className={sectionTitle}>Identificação da Mudança</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Número RFC</label>
                  <Input data-testid="change-rfc-input" value={form.numero_rfc} onChange={(e) => h('numero_rfc', e.target.value)} disabled={isReadonly} className="border-[#E6E6E6]" placeholder="Ex: RFC-2026-0001" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Tipo de Mudança *</label>
                  <select data-testid="change-tipo-select" value={form.tipo_mudanca} onChange={(e) => h('tipo_mudanca', e.target.value)} disabled={isReadonly} className={selectClass}>
                    {TIPO_MUDANCA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Título *</label>
                <Input data-testid="change-titulo-input" value={form.titulo} onChange={(e) => h('titulo', e.target.value)} disabled={isReadonly} required className="border-[#E6E6E6]" placeholder="Título da mudança" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Descrição</label>
                <textarea data-testid="change-descricao-input" value={form.descricao} onChange={(e) => h('descricao', e.target.value)} disabled={isReadonly} rows={3} className={textareaClass} placeholder="Descreva a mudança detalhadamente" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Justificativa</label>
                <textarea data-testid="change-justificativa-input" value={form.justificativa} onChange={(e) => h('justificativa', e.target.value)} disabled={isReadonly} rows={2} className={textareaClass} placeholder="Motivo e necessidade da mudança" />
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div>
            <h3 className={sectionTitle}>Classificação</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Categoria</label>
                <select data-testid="change-categoria-select" value={form.categoria_itil} onChange={(e) => h('categoria_itil', e.target.value)} disabled={isReadonly} className={selectClass}>
                  {CATEGORIA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Status</label>
                <select data-testid="change-status-select" value={form.status} onChange={(e) => h('status', e.target.value)} disabled={isReadonly} className={selectClass}>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Prioridade</label>
                <select data-testid="change-prioridade-select" value={form.prioridade} onChange={(e) => h('prioridade', e.target.value)} disabled={isReadonly} className={selectClass}>
                  {PRIORIDADE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Risco</label>
                <select data-testid="change-risco-select" value={form.risco} onChange={(e) => h('risco', e.target.value)} disabled={isReadonly} className={selectClass}>
                  {RISCO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Impacto</label>
                <select data-testid="change-impacto-select" value={form.impacto} onChange={(e) => h('impacto', e.target.value)} disabled={isReadonly} className={selectClass}>
                  {IMPACTO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              {/* Resultado da Conclusão - só aparece quando status é concluída */}
              {showResultado && (
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Resultado da Conclusão</label>
                  <select data-testid="change-resultado-select" value={form.resultado_conclusao} onChange={(e) => h('resultado_conclusao', e.target.value)} disabled={isReadonly} className={selectClass}>
                    <option value="">Selecione...</option>
                    {Object.entries(RESULTADO_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Planejamento */}
          <div>
            <h3 className={sectionTitle}>Planejamento e Execução</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Data Início *</label>
                  <Input data-testid="change-data-inicio-input" type="date" value={form.data_inicio} onChange={(e) => h('data_inicio', e.target.value)} disabled={isReadonly} required className="border-[#E6E6E6]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Data Fim</label>
                  <Input data-testid="change-data-fim-input" type="date" value={form.data_fim} onChange={(e) => h('data_fim', e.target.value)} disabled={isReadonly} className="border-[#E6E6E6]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Janela de Manutenção</label>
                <Input data-testid="change-janela-input" value={form.janela_manutencao} onChange={(e) => h('janela_manutencao', e.target.value)} disabled={isReadonly} className="border-[#E6E6E6]" placeholder="Ex: Sábado 22h - Domingo 06h" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-1">Plano de Rollback</label>
                <textarea data-testid="change-rollback-input" value={form.plano_rollback} onChange={(e) => h('plano_rollback', e.target.value)} disabled={isReadonly} rows={2} className={textareaClass} placeholder="Descreva o plano de reversão caso a mudança falhe" />
              </div>
            </div>
          </div>

          {/* Responsáveis */}
          <div>
            <h3 className={sectionTitle}>Responsáveis e Impacto</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Responsável</label>
                  <Input data-testid="change-responsavel-input" value={form.responsavel} onChange={(e) => h('responsavel', e.target.value)} disabled={isReadonly} className="border-[#E6E6E6]" placeholder="Nome do responsável técnico" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Aprovador</label>
                  <Input data-testid="change-aprovador-input" value={form.aprovador} onChange={(e) => h('aprovador', e.target.value)} disabled={isReadonly} className="border-[#E6E6E6]" placeholder="Nome do aprovador (CAB)" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Sistema Afetado</label>
                  <Input data-testid="change-sistema-input" value={form.sistema_afetado} onChange={(e) => h('sistema_afetado', e.target.value)} disabled={isReadonly} className="border-[#E6E6E6]" placeholder="Sistema principal impactado" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#333333] mb-1">Serviços Impactados</label>
                  <Input data-testid="change-servicos-input" value={form.servicos_impactados} onChange={(e) => h('servicos_impactados', e.target.value)} disabled={isReadonly} className="border-[#E6E6E6]" placeholder="Ex: E-mail, VPN, Rede interna" />
                </div>
              </div>
            </div>
          </div>

          {/* View info */}
          {isReadonly && change && (
            <div className="bg-[#f8f8f8] rounded-md p-4 text-xs text-[#555555] space-y-2 border border-[#E6E6E6]">
              <h4 className="font-bold text-[#333333] text-sm mb-2">Informações do Registro</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {change.created_by && <p>Criado por: <span className="font-semibold text-[#333333]">{change.created_by}</span></p>}
                {change.created_at && <p>Criado em: <span className="font-semibold text-[#333333]">{new Date(change.created_at).toLocaleString('pt-BR')}</span></p>}
                {change.updated_at && <p>Atualizado em: <span className="font-semibold text-[#333333]">{new Date(change.updated_at).toLocaleString('pt-BR')}</span></p>}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#E6E6E6] flex-wrap">
                <div className="flex items-center gap-1">
                  <span>Status:</span>
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: statusCfg.color, color: statusCfg.darkText ? '#333333' : '#ffffff' }}>{statusCfg.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Tipo:</span>
                  <span className="font-semibold text-[#333333]">{tipoInfo?.label || form.tipo_mudanca}</span>
                </div>
                {change.resultado_conclusao && RESULTADO_CONFIG[change.resultado_conclusao] && (
                  <div className="flex items-center gap-1">
                    <span>Resultado:</span>
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: RESULTADO_CONFIG[change.resultado_conclusao].color, color: RESULTADO_CONFIG[change.resultado_conclusao].darkText ? '#333333' : '#ffffff' }}>
                      {RESULTADO_CONFIG[change.resultado_conclusao].label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isReadonly && (
            <div className="flex items-center justify-between pt-4 border-t border-[#E6E6E6]">
              <div>
                {mode === 'view' && editing && onDelete && (
                  <button data-testid="change-delete-button" type="button" onClick={() => onDelete(change.id)} className="flex items-center gap-1 bg-[#E52207] hover:bg-[#8A100B] text-white rounded-full px-4 py-2 text-sm font-semibold transition-colors">
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button data-testid="change-cancel-button" type="button" onClick={onClose} className="bg-transparent border-2 border-[#1351B4] text-[#1351B4] hover:bg-[#1351B4]/10 rounded-full px-6 py-2 text-sm font-semibold transition-colors">Cancelar</button>
                <button data-testid="change-save-button" type="submit" className="flex items-center gap-1 bg-[#1351B4] hover:bg-[#071D41] text-white rounded-full px-6 py-2 text-sm font-semibold transition-colors">
                  <Save className="w-4 h-4" /> Salvar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
