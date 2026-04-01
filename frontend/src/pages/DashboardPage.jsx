import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import GovHeader from '../components/GovHeader';
import MetricsCards from '../components/MetricsCards';
import CalendarGrid from '../components/CalendarGrid';
import ChangeList from '../components/ChangeList';
import ChangeModal from '../components/ChangeModal';
import Legend from '../components/Legend';
import ConflictAlert from '../components/ConflictAlert';
import {
  ChevronLeft, ChevronRight, Plus, Download, Calendar as CalendarIcon, List
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'planejada', label: 'Planejada' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
];

const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos os Tipos' },
  { value: 'infraestrutura', label: 'Infraestrutura' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'sapiens', label: 'SAPIENS' },
];

const VIEW_MODE_OPTIONS = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function DashboardPage() {
  const { getHeaders } = useAuth();
  const [changes, setChanges] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [selectedChange, setSelectedChange] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('calendar');
  const [calendarMode, setCalendarMode] = useState('mensal');

  const fetchChanges = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/changes`, { headers: getHeaders(), withCredentials: true });
      setChanges(res.data);
    } catch (err) {
      toast.error('Erro ao carregar mudanças');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => { fetchChanges(); }, [fetchChanges]);

  const filteredChanges = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return changes.filter(c => {
      // Date filter based on calendar mode
      const d = new Date(c.data_inicio + 'T00:00:00');
      let matchDate = false;

      if (calendarMode === 'semanal') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        matchDate = d >= startOfWeek && d <= endOfWeek;
      } else if (calendarMode === 'mensal') {
        matchDate = d.getFullYear() === year && d.getMonth() === month;
      } else if (calendarMode === 'semestral') {
        const startMonth = month < 6 ? 0 : 6;
        matchDate = d.getFullYear() === year && d.getMonth() >= startMonth && d.getMonth() < startMonth + 6;
      } else if (calendarMode === 'anual') {
        matchDate = d.getFullYear() === year;
      }

      const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
      const matchTipo = tipoFilter === 'todos' || (c.tipo_mudanca || 'sistemas') === tipoFilter;
      return matchDate && matchStatus && matchTipo;
    });
  }, [changes, currentDate, statusFilter, tipoFilter, calendarMode]);

  // For calendar view, pass all changes for the period (no status/tipo filter on the calendar itself)
  const calendarChanges = useMemo(() => {
    return filteredChanges;
  }, [filteredChanges]);

  const navigate = (dir) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (calendarMode === 'semanal') d.setDate(d.getDate() + (dir * 7));
      else if (calendarMode === 'mensal') d.setMonth(d.getMonth() + dir);
      else if (calendarMode === 'semestral') d.setMonth(d.getMonth() + (dir * 6));
      else if (calendarMode === 'anual') d.setFullYear(d.getFullYear() + dir);
      return d;
    });
  };

  const goToday = () => setCurrentDate(new Date());

  const getNavLabel = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    if (calendarMode === 'semanal') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}/${year}`;
    }
    if (calendarMode === 'mensal') return `${MONTH_NAMES[month]} ${year}`;
    if (calendarMode === 'semestral') return month < 6 ? `1º Semestre ${year}` : `2º Semestre ${year}`;
    return `${year}`;
  };

  const openCreate = () => { setSelectedChange(null); setModalMode('create'); };
  const openView = (change) => { setSelectedChange(change); setModalMode('view'); };
  const closeModal = () => { setSelectedChange(null); setModalMode(null); };

  const handleSave = async (formData) => {
    try {
      if (modalMode === 'create') {
        await axios.post(`${API}/changes`, formData, { headers: getHeaders(), withCredentials: true });
        toast.success('Mudança criada com sucesso');
      } else {
        await axios.put(`${API}/changes/${selectedChange.id}`, formData, { headers: getHeaders(), withCredentials: true });
        toast.success('Mudança atualizada com sucesso');
      }
      closeModal();
      fetchChanges();
    } catch (err) {
      toast.error('Erro ao salvar mudança');
    }
  };

  const handleDelete = async (changeId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mudança?')) return;
    try {
      await axios.delete(`${API}/changes/${changeId}`, { headers: getHeaders(), withCredentials: true });
      toast.success('Mudança excluída com sucesso');
      closeModal();
      fetchChanges();
    } catch (err) {
      toast.error('Erro ao excluir mudança');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await axios.get(`${API}/changes/export/csv`, { headers: getHeaders(), withCredentials: true, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mudancas_sgmd.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exportado com sucesso');
    } catch { toast.error('Erro ao exportar CSV'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <GovHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1351B4]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]" data-testid="dashboard-page">
      <GovHeader />

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-60 xl:w-64 bg-white border-r border-[#E6E6E6] p-4 lg:p-5 lg:min-h-[calc(100vh-96px)] flex-shrink-0 overflow-y-auto" data-testid="sidebar">
          <button
            data-testid="new-change-button"
            onClick={openCreate}
            className="w-full bg-[#1351B4] hover:bg-[#071D41] text-white rounded-full px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm mb-5"
          >
            <Plus className="w-5 h-5" />
            Nova Mudança
          </button>

          <div className="mb-5">
            <h3 className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">Filtrar por Status</h3>
            <select data-testid="status-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-[#E6E6E6] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#1351B4] focus:border-transparent outline-none bg-white">
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">Filtrar por Tipo</h3>
            <select data-testid="tipo-filter-select" value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)} className="w-full border border-[#E6E6E6] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#1351B4] focus:border-transparent outline-none bg-white">
              {TIPO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">Exportar</h3>
            <button data-testid="export-csv-button" onClick={handleExportCSV} className="w-full bg-transparent border-2 border-[#1351B4] text-[#1351B4] hover:bg-[#1351B4]/10 rounded-full px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>

          <Legend />

          <div className="mt-5">
            <h3 className="text-xs font-bold text-[#333333] mb-2 uppercase tracking-wide">Visualização</h3>
            <div className="flex gap-2">
              <button data-testid="view-calendar-button" onClick={() => setViewType('calendar')} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${viewType === 'calendar' ? 'bg-[#1351B4] text-white' : 'bg-white border border-[#E6E6E6] text-[#555555] hover:bg-[#f8f8f8]'}`}>
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button data-testid="view-list-button" onClick={() => setViewType('list')} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${viewType === 'list' ? 'bg-[#1351B4] text-white' : 'bg-white border border-[#E6E6E6] text-[#555555] hover:bg-[#f8f8f8]'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-y-auto" data-testid="main-content">
          <MetricsCards changes={filteredChanges} />

          {/* Conflict Alert */}
          <div className="mt-4">
            <ConflictAlert changes={filteredChanges} />
          </div>

          {/* Calendar Navigation + View Mode */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 mb-4 gap-3" data-testid="calendar-nav">
            <div className="flex items-center gap-2 md:gap-3">
              <button data-testid="calendar-prev" onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center bg-white border border-[#E6E6E6] rounded-md hover:bg-[#f8f8f8] transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#333333]" />
              </button>
              <h2 className="text-base md:text-xl font-bold text-[#333333] min-w-[140px] md:min-w-[200px] text-center" data-testid="calendar-nav-label">
                {getNavLabel()}
              </h2>
              <button data-testid="calendar-next" onClick={() => navigate(1)} className="w-9 h-9 flex items-center justify-center bg-white border border-[#E6E6E6] rounded-md hover:bg-[#f8f8f8] transition-colors">
                <ChevronRight className="w-5 h-5 text-[#333333]" />
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <button data-testid="calendar-today-button" onClick={goToday} className="bg-transparent border-2 border-[#1351B4] text-[#1351B4] hover:bg-[#1351B4]/10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors">
                Hoje
              </button>

              {/* View Mode Tabs */}
              <div className="flex bg-white border border-[#E6E6E6] rounded-md overflow-hidden" data-testid="calendar-mode-tabs">
                {VIEW_MODE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    data-testid={`calendar-mode-${opt.value}`}
                    onClick={() => setCalendarMode(opt.value)}
                    className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-semibold transition-colors border-r border-[#E6E6E6] last:border-r-0 ${
                      calendarMode === opt.value
                        ? 'bg-[#1351B4] text-white'
                        : 'text-[#555555] hover:bg-[#f8f8f8]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <span className="text-sm text-[#555555] font-medium" data-testid="changes-count">
                {filteredChanges.length} mudança{filteredChanges.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Calendar or List View */}
          {viewType === 'calendar' ? (
            <CalendarGrid
              currentDate={currentDate}
              changes={calendarChanges}
              onSelectChange={openView}
              viewMode={calendarMode}
            />
          ) : (
            <div className="bg-white border border-[#E6E6E6] rounded-md p-4 shadow-sm">
              <ChangeList changes={filteredChanges} onSelectChange={openView} />
            </div>
          )}
        </main>
      </div>

      {modalMode && (
        <ChangeModal
          change={selectedChange}
          mode={modalMode}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
