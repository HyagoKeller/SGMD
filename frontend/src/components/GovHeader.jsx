import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function GovHeader() {
  const { user, logout } = useAuth();

  return (
    <header data-testid="gov-header">
      {/* Top Bar */}
      <div className="bg-[#071D41] text-white py-2 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#C5D4EB]">Acesse já o AGU Serviços:</span>
          <a href="https://aguservicos.agu.gov.br" target="_blank" rel="noopener noreferrer" className="text-sm tracking-wide hover:text-[#C5D4EB] transition-colors">aguservicos.agu.gov.br</a>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{user?.name || user?.email}</span>
          </div>
          <button
            data-testid="logout-button"
            onClick={logout}
            className="flex items-center gap-1 hover:text-[#C5D4EB] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
      {/* Sub Header */}
      <div className="bg-[#1351B4] text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/aguservicos-logo.png" alt="AGU Serviços" className="w-10 h-10 object-contain" />
          <h1 className="text-lg md:text-xl font-bold tracking-tight">
            Serviço de Gerenciamento de Mudanças - SGMD
          </h1>
        </div>
      </div>
    </header>
  );
}
