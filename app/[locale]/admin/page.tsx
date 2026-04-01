'use client';

import { useState, useEffect } from 'react';

interface Submission {
  id: number;
  timestamp: string;
  name: string;
  phone: string;
  message: string;
  ip: string;
  telegramStatus: string;
  telegramError: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Проверяем токен при загрузке
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      validateToken(savedToken);
    }
  }, []);

  const validateToken = async (t: string) => {
    try {
      const response = await fetch('/api/admin/validate', {
        headers: {
          'Authorization': `Bearer ${t}`
        }
      });
      
      if (response.ok) {
        setToken(t);
        setIsLoggedIn(true);
        fetchSubmissions(t);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch {
      localStorage.removeItem('admin_token');
    }
  };

  const login = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Ошибка входа');
        setIsLoggedIn(false);
        return;
      }
      
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      fetchSubmissions(data.token);
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (t: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/submissions', {
        headers: {
          'Authorization': `Bearer ${t}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Сессия истекла. Войдите снова.');
          setIsLoggedIn(false);
          localStorage.removeItem('admin_token');
        } else {
          setError('Ошибка загрузки данных');
        }
        return;
      }
      
      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsLoggedIn(false);
    setSubmissions([]);
    setPassword('');
  };

  const handleRefresh = () => {
    if (token) {
      fetchSubmissions(token);
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('uk-UA');
    } catch {
      return timestamp;
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.name.toLowerCase().includes(filter.toLowerCase()) ||
    sub.phone.includes(filter) ||
    sub.message.toLowerCase().includes(filter.toLowerCase())
  );

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            🔐 Админ-панель
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-white">
            📋 Заявки с сайта
            <span className="text-gray-400 text-lg ml-2">({submissions.length})</span>
          </h1>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Поиск..."
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500"
            />
            <button
              onClick={handleRefresh}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Обновить
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Всего заявок</div>
            <div className="text-2xl font-bold text-white">{submissions.length}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Telegram sent</div>
            <div className="text-2xl font-bold text-green-400">
              {submissions.filter(s => s.telegramStatus === 'sent').length}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Telegram failed</div>
            <div className="text-2xl font-bold text-red-400">
              {submissions.filter(s => s.telegramStatus === 'failed').length}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Загрузка...</div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Дата</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Имя</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Телефон</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Сообщение</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {formatDate(sub.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {sub.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {sub.phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                      {sub.message}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.telegramStatus === 'sent' 
                          ? 'bg-green-900 text-green-300'
                          : sub.telegramStatus === 'failed'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {sub.telegramStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Нет заявок
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
