import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function GovHeader() {
  const { user, logout } = useAuth();

  return (
    <header data-testid="gov-header">
      {/* Top Bar */}
      <div className="bg-[#071D41] text-white py-2 px-6 flex justify-between items-center">
        <span className="font-extrabold text-lg tracking-wide">gov.br</span>
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
        <h1 className="text-lg md:text-xl font-bold tracking-tight">
          Servico de Gerenciamento de Mudancas - SGMD
        </h1>
      </div>
    </header>
  );
}
