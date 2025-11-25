'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MeuAmigoPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [secretFriend, setSecretFriend] = useState<string | null>(null);
  const [hasMatch, setHasMatch] = useState(false);
  const [message, setMessage] = useState('');
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

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleLogout}
              >
                Sair
              </button>
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
