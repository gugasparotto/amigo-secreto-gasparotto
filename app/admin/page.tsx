'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    } catch (err) {
      setError('Erro ao realizar sorteio');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
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
                        <th style={{ width: '100px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regularUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
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

          {/* Botão de sorteio */}
          <div className="card mt-4">
            <div className="card-body text-center">
              <h5 className="card-title mb-3">Realizar Sorteio</h5>
              <p className="text-muted mb-4">
                O sorteio distribuirá os amigos secretos entre todos os
                usuários cadastrados. Cada pessoa tirará exatamente uma pessoa.
              </p>
              <button
                className="btn btn-success btn-lg"
                onClick={handleDraw}
                disabled={formLoading || regularUsers.length < 2}
              >
                {formLoading ? 'Sorteando...' : '🎲 Realizar Sorteio'}
              </button>
              {regularUsers.length < 2 && (
                <p className="text-danger mt-2 mb-0">
                  <small>
                    É necessário pelo menos 2 usuários para realizar o sorteio
                  </small>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
