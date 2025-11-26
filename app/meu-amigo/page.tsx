'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MeuAmigoPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [secretFriend, setSecretFriend] = useState<string | null>(null);
  const [hasMatch, setHasMatch] = useState(false);
  const [message, setMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();

      if (!data.user) {
        router.push('/');
        return;
      }

      if (data.user.isAdmin) {
        router.push('/admin');
        return;
      }

      setCurrentUser(data.user);
      await loadSecretFriend();
    } catch (err) {
      router.push('/');
    }
  };

  const loadSecretFriend = async () => {
    try {
      const res = await fetch('/api/secret-friend');
      const data = await res.json();

      if (data.hasMatch) {
        setHasMatch(true);
        setSecretFriend(data.secretFriend);
      } else {
        setMessage(data.message || 'O sorteio ainda não foi realizado');
      }
    } catch (err) {
      setMessage('Erro ao carregar informações');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 3) {
      setPasswordError('A nova senha deve ter pelo menos 3 caracteres');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Erro ao alterar senha');
        setChangingPassword(false);
        return;
      }

      setPasswordSuccess('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError('Erro ao conectar ao servidor');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-5">
          <div className="card">
            <div className="card-body p-5 text-center">
              <h1 className="mb-4 h3">🎁 Amigo Secreto</h1>
              
              <p className="text-muted mb-4">
                Olá, <strong>{currentUser?.name}</strong>!
              </p>

              {hasMatch ? (
                <>
                  <div className="alert alert-success mb-4" role="alert">
                    <h5 className="mb-3">Você tirou:</h5>
                    <h2 className="display-4 mb-0">{secretFriend}</h2>
                  </div>
                  <p className="text-muted mb-4">
                    🤫 Lembre-se: isso é um segredo!
                  </p>
                </>
              ) : (
                <div className="alert alert-info mb-4" role="alert">
                  <p className="mb-0">{message}</p>
                </div>
              )}

              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  {showChangePassword ? 'Cancelar' : 'Trocar Senha'}
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>

              {showChangePassword && (
                <div className="mt-4">
                  <hr />
                  <h6 className="mb-3">Alterar Senha</h6>

                  {passwordError && (
                    <div className="alert alert-danger alert-sm" role="alert">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="alert alert-success alert-sm" role="alert">
                      {passwordSuccess}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label form-label-sm">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={changingPassword}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label form-label-sm">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={changingPassword}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label form-label-sm">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={changingPassword}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm w-100"
                      disabled={changingPassword}
                    >
                      {changingPassword ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {hasMatch && (
            <div className="text-center mt-4">
              <p className="text-white-50">
                <small>
                  💡 Dica: Anote o nome em algum lugar seguro!
                </small>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
