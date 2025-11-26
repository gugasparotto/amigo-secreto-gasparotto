'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Gift {
  id: string;
  name: string;
  url: string | null;
  description: string | null;
}

export default function MeuAmigoPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [secretFriend, setSecretFriend] = useState<string | null>(null);
  const [secretFriendGifts, setSecretFriendGifts] = useState<Gift[]>([]);
  const [hasMatch, setHasMatch] = useState(false);
  const [message, setMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMyGifts, setShowMyGifts] = useState(false);
  const [myGifts, setMyGifts] = useState<Gift[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Form de presente
  const [giftName, setGiftName] = useState('');
  const [giftUrl, setGiftUrl] = useState('');
  const [giftDescription, setGiftDescription] = useState('');
  const [giftError, setGiftError] = useState('');
  const [giftSuccess, setGiftSuccess] = useState('');
  const [savingGift, setSavingGift] = useState(false);
  
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
        setSecretFriendGifts(data.gifts || []);
      } else {
        setMessage(data.message || 'O sorteio ainda não foi realizado');
      }
    } catch (err) {
      setMessage('Erro ao carregar informações');
    } finally {
      setLoading(false);
    }
  };

  const loadMyGifts = async () => {
    try {
      const res = await fetch('/api/gifts');
      const data = await res.json();
      setMyGifts(data.gifts || []);
    } catch (err) {
      console.error('Erro ao carregar presentes:', err);
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

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    setGiftError('');
    setGiftSuccess('');
    setSavingGift(true);

    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: giftName,
          url: giftUrl,
          description: giftDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGiftError(data.error || 'Erro ao adicionar presente');
        setSavingGift(false);
        return;
      }

      setGiftSuccess('Presente adicionado!');
      setGiftName('');
      setGiftUrl('');
      setGiftDescription('');
      loadMyGifts();
      
      setTimeout(() => setGiftSuccess(''), 2000);
    } catch (err) {
      setGiftError('Erro ao conectar ao servidor');
    } finally {
      setSavingGift(false);
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!confirm('Deseja remover este presente da lista?')) return;

    try {
      const res = await fetch(`/api/gifts?id=${giftId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadMyGifts();
        setGiftSuccess('Presente removido!');
        setTimeout(() => setGiftSuccess(''), 2000);
      }
    } catch (err) {
      setGiftError('Erro ao remover presente');
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
                  
                  {secretFriendGifts.length > 0 && (
                    <div className="alert alert-info mb-4">
                      <h6 className="mb-3">🎁 Sugestões de presentes:</h6>
                      <div className="list-group">
                        {secretFriendGifts.map((gift) => (
                          <div key={gift.id} className="list-group-item">
                            <h6 className="mb-1">{gift.name}</h6>
                            {gift.description && (
                              <p className="mb-1 text-muted small">{gift.description}</p>
                            )}
                            {gift.url && (
                              <a
                                href={gift.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary mt-1"
                              >
                                Ver link
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-muted mb-4">
                    🤫 Lembre-se: isso é um segredo!
                  </p>
                </>
              ) : (
                <div className="alert alert-info mb-4" role="alert">
                  <p className="mb-0">{message}</p>
                </div>
              )}

              <div className="d-flex gap-2 justify-content-center mb-3">
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => {
                    setShowMyGifts(!showMyGifts);
                    if (!showMyGifts) loadMyGifts();
                  }}
                >
                  {showMyGifts ? '🙈 Esconder' : '🎁 Meus Presentes'}
                </button>
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

              {showMyGifts && (
                <div className="mt-4">
                  <hr />
                  <h6 className="mb-3">🎁 Meus Presentes</h6>
                  
                  {giftError && (
                    <div className="alert alert-danger alert-sm mb-2">{giftError}</div>
                  )}
                  {giftSuccess && (
                    <div className="alert alert-success alert-sm mb-2">{giftSuccess}</div>
                  )}

                  <form onSubmit={handleAddGift} className="mb-3">
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Nome do presente *"
                        value={giftName}
                        onChange={(e) => setGiftName(e.target.value)}
                        required
                        disabled={savingGift}
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="Link (opcional)"
                        value={giftUrl}
                        onChange={(e) => setGiftUrl(e.target.value)}
                        disabled={savingGift}
                      />
                    </div>
                    <div className="mb-2">
                      <textarea
                        className="form-control form-control-sm"
                        placeholder="Descrição (opcional)"
                        rows={2}
                        value={giftDescription}
                        onChange={(e) => setGiftDescription(e.target.value)}
                        disabled={savingGift}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-success btn-sm w-100"
                      disabled={savingGift}
                    >
                      {savingGift ? 'Adicionando...' : '+ Adicionar'}
                    </button>
                  </form>

                  {myGifts.length > 0 ? (
                    <div className="list-group">
                      {myGifts.map((gift) => (
                        <div key={gift.id} className="list-group-item d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <strong>{gift.name}</strong>
                            {gift.description && (
                              <p className="mb-0 text-muted small">{gift.description}</p>
                            )}
                            {gift.url && (
                              <small>
                                <a href={gift.url} target="_blank" rel="noopener noreferrer">
                                  🔗 Link
                                </a>
                              </small>
                            )}
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteGift(gift.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-center small">
                      Nenhum presente cadastrado ainda
                    </p>
                  )}
                </div>
              )}

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
