import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { MapPin, Lock, Mail, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    if (!success) {
      setError('Credenciales inválidas. Verifique su correo y contraseña.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-temocsa-gray-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8102E' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-temocsa-red rounded-2xl mb-4 shadow-lg shadow-temocsa-red/30">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            TEMOCSA <span className="text-temocsa-red">Geoportal</span>
          </h1>
          <p className="text-temocsa-gray-400 text-sm mt-1">
            Visor GeoBIM de Infraestructura Lineal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-temocsa-gray-800 rounded-2xl p-8 shadow-2xl border border-temocsa-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-temocsa-gray-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temocsa-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@temocsa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-temocsa-gray-900 border border-temocsa-gray-600 rounded-lg text-white placeholder:text-temocsa-gray-500 focus:outline-none focus:border-temocsa-red focus:ring-1 focus:ring-temocsa-red transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-temocsa-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-temocsa-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-temocsa-gray-900 border border-temocsa-gray-600 rounded-lg text-white placeholder:text-temocsa-gray-500 focus:outline-none focus:border-temocsa-red focus:ring-1 focus:ring-temocsa-red transition-colors"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-temocsa-accent text-sm bg-temocsa-accent/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-temocsa-red hover:bg-temocsa-red-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-temocsa-red/20"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-temocsa-gray-700">
            <p className="text-xs text-temocsa-gray-500 text-center mb-3">
              Credenciales de demostración
            </p>
            <div className="space-y-1.5 text-xs text-temocsa-gray-400">
              {[
                { role: 'Admin', email: 'admin@temocsa.com', pass: 'AdminTemocsa' },
                { role: 'Editor', email: 'editor@temocsa.com', pass: 'EditorTemocsa' },
                { role: 'Visor', email: 'visor@temocsa.com', pass: 'VisorTemocsa' },
              ].map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.pass);
                  }}
                  className="w-full flex justify-between items-center px-3 py-2 rounded-md hover:bg-temocsa-gray-700/50 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-temocsa-gray-300">
                    {cred.role}
                  </span>
                  <span className="text-temocsa-gray-500">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-temocsa-gray-600 mt-6">
          Desarrollado por{' '}
          <span className="text-temocsa-red">Kaab Map</span> · Geomática &
          Consultoría
        </p>
      </div>
    </div>
  );
}
