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
import {
  ChevronLeft, ChevronRight, Plus, Download, Filter, Calendar as CalendarIcon, List
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'planejada', label: 'Planejada' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'emergencial', label: 'Emergencial' },
];

const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos os Tipos' },
  { value: 'infraestrutura', label: 'Infraestrutura' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'sapiens', label: 'SAPIENS' },
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
  const [viewMode, setViewMode] = useState('calendar');

  const fetchChanges = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/changes`, {
        headers: getHeaders(),
        withCredentials: true
      });
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
      const d = new Date(c.data_inicio + 'T00:00:00');
      const matchMonth = d.getFullYear() === year && d.getMonth() === month;
      const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
      const matchTipo = tipoFilter === 'todos' || (c.tipo_mudanca || 'sistemas') === tipoFilter;
      return matchMonth && matchStatus && matchTipo;
    });
  }, [changes, currentDate, statusFilter, tipoFilter]);

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => setCurrentDate(new Date());

  const openCreate = () => {
    setSelectedChange(null);
    setModalMode('create');
  };

  const openView = (change) => {
    setSelectedChange(change);
    setModalMode('view');
  };

  const closeModal = () => {
    setSelectedChange(null);
    setModalMode(null);
  };

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
      const res = await axios.get(`${API}/changes/export/csv`, {
        headers: getHeaders(),
        withCredentials: true,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mudancas_sgmd.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exportado com sucesso');
    } catch {
      toast.error('Erro ao exportar CSV');
    }
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
        <aside className="w-full lg:w-64 bg-white border-r border-[#E6E6E6] p-4 lg:p-6 lg:min-h-[calc(100vh-96px)] flex-shrink-0" data-testid="sidebar">
          {/* New Change Button */}
          <button
            data-testid="new-change-button"
            onClick={openCreate}
            className="w-full bg-[#1351B4] hover:bg-[#071D41] text-white rounded-full px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm mb-6"
          >
            <Plus className="w-5 h-5" />
            Nova Mudança
          </button>

          {/* Status Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#333333] mb-3 uppercase tracking-wide">Filtrar por Status</h3>
            <select
              data-testid="status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-[#E6E6E6] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#1351B4] focus:border-transparent outline-none bg-white"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Tipo Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#333333] mb-3 uppercase tracking-wide">Filtrar por Tipo</h3>
            <select
              data-testid="tipo-filter-select"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full border border-[#E6E6E6] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#1351B4] focus:border-transparent outline-none bg-white"
            >
              {TIPO_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Export */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#333333] mb-3 uppercase tracking-wide">Exportar</h3>
            <button
              data-testid="export-csv-button"
              onClick={handleExportCSV}
              className="w-full bg-transparent border-2 border-[#1351B4] text-[#1351B4] hover:bg-[#1351B4]/10 rounded-full px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>

          {/* Legend */}
          <Legend />

          {/* View toggle */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#333333] mb-3 uppercase tracking-wide">Visualização</h3>
            <div className="flex gap-2">
              <button
                data-testid="view-calendar-button"
                onClick={() => setViewMode('calendar')}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[#1351B4] text-white'
                    : 'bg-white border border-[#E6E6E6] text-[#555555] hover:bg-[#f8f8f8]'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button
                data-testid="view-list-button"
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#1351B4] text-white'
                    : 'bg-white border border-[#E6E6E6] text-[#555555] hover:bg-[#f8f8f8]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto" data-testid="main-content">
          {/* Metrics */}
          <MetricsCards changes={filteredChanges} />

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mt-6 mb-4" data-testid="calendar-nav">
            <div className="flex items-center gap-3">
              <button
                data-testid="calendar-prev-month"
                onClick={prevMonth}
                className="w-10 h-10 flex items-center justify-center bg-white border border-[#E6E6E6] rounded-md hover:bg-[#f8f8f8] transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#333333]" />
              </button>
              <h2 className="text-xl font-bold text-[#333333] min-w-[200px] text-center">
                {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                data-testid="calendar-next-month"
                onClick={nextMonth}
                className="w-10 h-10 flex items-center justify-center bg-white border border-[#E6E6E6] rounded-md hover:bg-[#f8f8f8] transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#333333]" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                data-testid="calendar-today-button"
                onClick={goToday}
                className="bg-transparent border-2 border-[#1351B4] text-[#1351B4] hover:bg-[#1351B4]/10 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              >
                Hoje
              </button>
              <span className="text-sm text-[#555555] font-medium" data-testid="changes-count">
                {filteredChanges.length} mudança{filteredChanges.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Calendar or List View */}
          {viewMode === 'calendar' ? (
            <CalendarGrid
              currentDate={currentDate}
              changes={filteredChanges}
              onSelectChange={openView}
            />
          ) : (
            <div className="bg-white border border-[#E6E6E6] rounded-md p-4 shadow-sm">
              <ChangeList changes={filteredChanges} onSelectChange={openView} />
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
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
