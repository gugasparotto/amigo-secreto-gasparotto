'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  last_login: string | null;
  last_activity: string | null;
  is_online: boolean;
  gifts_count: number;
}

interface DrawResult {
  giver_name: string;
  receiver_name: string;
}

interface Gift {
  id: string;
  name: string;
  url: string | null;
  description: string | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [showGiftsModal, setShowGiftsModal] = useState(false);
  const [selectedUserGifts, setSelectedUserGifts] = useState<Gift[]>([]);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [loadingGifts, setLoadingGifts] = useState(false);
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    loadUsers();
    
    // Recarregar usuários a cada 30 segundos para atualizar status online
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();

      if (!data.user || !data.user.isAdmin) {
        router.push('/');
        return;
      }

      setCurrentUser(data.user);
    } catch (err) {
      router.push('/');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/admin/api/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/admin/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao criar usuário');
        setFormLoading(false);
        return;
      }

      setMessage('Usuário criado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      loadUsers();
    } catch (err) {
      setError('Erro ao criar usuário');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const res = await fetch(`/admin/api/delete-user?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao excluir usuário');
        return;
      }

      setMessage('Usuário excluído com sucesso!');
      loadUsers();
    } catch (err) {
      alert('Erro ao excluir usuário');
    }
  };

  const handleDraw = async () => {
    if (!confirm('Realizar o sorteio? Os resultados anteriores serão apagados.')) {
      return;
    }

    setFormLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/admin/api/draw', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao realizar sorteio');
        setFormLoading(false);
        return;
      }

      setMessage(data.message);
      setShowResults(false);
    } catch (err) {
      setError('Erro ao realizar sorteio');
    } finally {
      setFormLoading(false);
    }
  };

  const handleClearDraw = async () => {
    if (!confirm('Zerar o sorteio? Todos os resultados serão apagados e será necessário sortear novamente.')) {
      return;
    }

    setFormLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/admin/api/clear-draw', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao zerar sorteio');
        setFormLoading(false);
        return;
      }

      setMessage(data.message);
      setShowResults(false);
      setDrawResults([]);
    } catch (err) {
      setError('Erro ao zerar sorteio');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewResults = async () => {
    if (showResults) {
      setShowResults(false);
      return;
    }

    setLoadingResults(true);
    setError('');

    try {
      const res = await fetch('/admin/api/draw-results');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao buscar resultados');
        setLoadingResults(false);
        return;
      }

      if (data.count === 0) {
        setError('Nenhum sorteio foi realizado ainda');
        setLoadingResults(false);
        return;
      }

      setDrawResults(data.results);
      setShowResults(true);
    } catch (err) {
      setError('Erro ao buscar resultados');
    } finally {
      setLoadingResults(false);
    }
  };

  const loadUserGifts = async (userId: string, userName: string) => {
    setLoadingGifts(true);
    setSelectedUserName(userName);
    setShowGiftsModal(true);
    
    try {
      const res = await fetch(`/api/gifts?userId=${userId}`);
      const data = await res.json();
      setSelectedUserGifts(data.gifts || []);
    } catch (err) {
      console.error('Erro ao carregar presentes:', err);
      setSelectedUserGifts([]);
    } finally {
      setLoadingGifts(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Nunca';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  const regularUsers = users.filter((u) => !u.is_admin);

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h1 className="text-white mb-3">🎄 Painel Administrativo</h1>
          <p className="text-white-50">
            Olá, {currentUser?.name}!
            <button
              className="btn btn-sm btn-outline-light ms-3"
              onClick={handleLogout}
            >
              Sair
            </button>
          </p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage('')}
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      <div className="row g-4">
        {/* Formulário de cadastro */}
        <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Cadastrar Usuário</h5>
              <form onSubmit={handleCreateUser}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nome
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Senha
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={formLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={formLoading}
                >
                  {formLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Lista de usuários */}
        <div className="col-lg-7">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">
                Usuários Cadastrados ({regularUsers.length})
              </h5>

              {regularUsers.length === 0 ? (
                <p className="text-muted">Nenhum usuário cadastrado ainda.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Último Login</th>
                        <th>Presentes</th>
                        <th style={{ width: '100px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regularUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            {user.name}
                            {user.is_online && (
                              <span className="badge bg-success ms-2" style={{ fontSize: '0.7rem' }}>
                                Online
                              </span>
                            )}
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span 
                              className={`badge ${user.is_online ? 'bg-success' : 'bg-secondary'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {user.is_online ? '🟢 Ativo' : '⚫ Offline'}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatLastLogin(user.last_login)}
                            </small>
                          </td>
                          <td>
                            {user.gifts_count > 0 ? (
                              <span 
                                className="badge bg-info text-dark" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => loadUserGifts(user.id, user.name)}
                                title="Clique para ver os presentes"
                              >
                                🎁 {user.gifts_count}
                              </span>
                            ) : (
                              <small className="text-muted">Nenhum</small>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Botões de sorteio */}
          <div className="card mt-4">
            <div className="card-body text-center">
              <h5 className="card-title mb-3">Gerenciar Sorteio</h5>
              <p className="text-muted mb-4">
                O sorteio distribuirá os amigos secretos entre todos os
                usuários cadastrados. Cada pessoa tirará exatamente uma pessoa.
              </p>
              
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleDraw}
                  disabled={formLoading || regularUsers.length < 2}
                >
                  {formLoading ? 'Sorteando...' : '🎲 Realizar Sorteio'}
                </button>
                
                <button
                  className="btn btn-warning btn-lg"
                  onClick={handleClearDraw}
                  disabled={formLoading}
                >
                  🔄 Zerar Sorteio
                </button>
                
                <button
                  className="btn btn-info btn-lg"
                  onClick={handleViewResults}
                  disabled={loadingResults}
                >
                  {loadingResults ? 'Carregando...' : showResults ? '🙈 Esconder Resultados' : '👁️ Ver Resultados'}
                </button>
              </div>
              
              {regularUsers.length < 2 && (
                <p className="text-danger mt-3 mb-0">
                  <small>
                    É necessário pelo menos 2 usuários para realizar o sorteio
                  </small>
                </p>
              )}
            </div>
          </div>

          {/* Resultados do sorteio */}
          {showResults && drawResults.length > 0 && (
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title mb-4">📋 Resultados do Sorteio</h5>
                <div className="alert alert-warning" role="alert">
                  <strong>⚠️ Atenção!</strong> Estes resultados são confidenciais. 
                  Não compartilhe com os participantes!
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Quem dá</th>
                        <th className="text-center">→</th>
                        <th>Quem recebe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawResults.map((result, index) => (
                        <tr key={index}>
                          <td><strong>{result.giver_name}</strong></td>
                          <td className="text-center">🎁</td>
                          <td><strong>{result.receiver_name}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-muted text-center mt-3 mb-0">
                  <small>Total: {drawResults.length} participantes</small>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Presentes */}
      {showGiftsModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">🎁 Presentes de {selectedUserName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowGiftsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loadingGifts ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                ) : selectedUserGifts.length === 0 ? (
                  <p className="text-muted text-center py-4">Nenhum presente cadastrado.</p>
                ) : (
                  <div className="list-group">
                    {selectedUserGifts.map((gift) => (
                      <div key={gift.id} className="list-group-item">
                        <div className="d-flex w-100 justify-content-between align-items-start">
                          <h6 className="mb-1">🎁 {gift.name}</h6>
                        </div>
                        {gift.description && (
                          <p className="mb-1 text-muted">
                            <small>{gift.description}</small>
                          </p>
                        )}
                        {gift.url && (
                          <a
                            href={gift.url.startsWith('http') ? gift.url : `https://${gift.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary mt-2"
                          >
                            🔗 Ver produto
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGiftsModal(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
