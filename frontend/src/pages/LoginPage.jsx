import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') setError(detail);
      else if (Array.isArray(detail)) setError(detail.map(e => e.msg || JSON.stringify(e)).join(' '));
      else setError('Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col" data-testid="login-page">
      {/* Top Header */}
      <div className="bg-[#071D41] text-white py-2 px-6 flex items-center">
        <span className="font-extrabold text-lg tracking-wide">aguservicos.agu.gov.br</span>
      </div>

      {/* Sub Header */}
      <div className="bg-[#1351B4] text-white py-4 px-6">
        <h1 className="text-lg font-semibold">Servico de Gerenciamento de Mudancas - SGMD</h1>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white border border-[#E6E6E6] rounded-md shadow-sm w-full max-w-md p-8" data-testid="login-form">
          <div className="border-t-4 border-[#1351B4] -mt-8 -mx-8 mb-6 rounded-t-md"></div>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1351B4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#333333]">Acesso ao Sistema</h2>
            <p className="text-sm text-[#555555] mt-1">Informe suas credenciais para continuar</p>
          </div>

          {error && (
            <div className="bg-[#FDE0DB] border border-[#E52207] text-[#E52207] px-4 py-3 rounded-md text-sm mb-4" data-testid="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                <Input
                  data-testid="login-email-input"
                  type="email"
                  placeholder="seu@email.gov.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-[#E6E6E6] focus:ring-2 focus:ring-[#1351B4]"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333333] mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                <Input
                  data-testid="login-password-input"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-[#E6E6E6] focus:ring-2 focus:ring-[#1351B4]"
                  required
                />
              </div>
            </div>
            <button
              data-testid="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-[#1351B4] hover:bg-[#071D41] text-white rounded-full py-3 font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#071D41] text-white text-center py-3 text-xs">
        SGMD - Servico de Gerenciamento de Mudancas | Departamento de Tecnologia da Informacao
      </div>
    </div>
  );
}
