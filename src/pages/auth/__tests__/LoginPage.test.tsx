// SEC-27: login com verificação em duas etapas.
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import LoginPage from '@/pages/auth/LoginPage';
import { API, AUTH, baseMe, renderWithApp, server } from '@/test/render';

const fillAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('E-mail'), 'ana@barberos.dev');
  await user.type(screen.getByLabelText('Senha'), 'Barberos#Dev2026');
  await user.click(screen.getByRole('button', { name: /entrar na plataforma/i }));
};

const renderLogin = () => renderWithApp(<LoginPage />, { route: '/login', path: '/login', extraRoutes: { '/dashboard': <p>Painel do dono</p> } });

describe('LoginPage', () => {
  it('sem 2FA entra direto no painel', async () => {
    server.use(
      http.post(`${AUTH}/login`, () => HttpResponse.json({ token: 'abc' })),
      http.get(`${API}/me`, () => HttpResponse.json(baseMe()))
    );
    const user = userEvent.setup();
    renderLogin();
    await fillAndSubmit(user);
    expect(await screen.findByText('Painel do dono')).toBeInTheDocument();
  });

  it('com 2FA pede o código e abre a sessão depois da verificação', async () => {
    let verifyBody: unknown;
    server.use(
      http.post(`${AUTH}/login`, () => HttpResponse.json({ two_factor_required: true, challenge_token: 'chal' })),
      http.post(`${AUTH}/2fa/verify`, async ({ request }) => {
        verifyBody = await request.json();
        return HttpResponse.json({ token: 'abc' });
      }),
      http.get(`${API}/me`, () => HttpResponse.json(baseMe({ two_factor_enabled: true })))
    );
    const user = userEvent.setup();
    renderLogin();
    await fillAndSubmit(user);
    const code = await screen.findByLabelText('Código');
    await user.type(code, '12a3456');
    expect(code).toHaveValue('123456');
    await user.click(screen.getByRole('button', { name: /verificar e entrar/i }));
    expect(await screen.findByText('Painel do dono')).toBeInTheDocument();
    expect(verifyBody).toEqual({ challenge_token: 'chal', code: '123456' });
  });

  it('código errado mostra o erro e permite usar um código de recuperação', async () => {
    let verifyBody: unknown;
    server.use(
      http.post(`${AUTH}/login`, () => HttpResponse.json({ two_factor_required: true, challenge_token: 'chal' })),
      http.post(`${AUTH}/2fa/verify`, async ({ request }) => {
        verifyBody = await request.json();
        return (verifyBody as { code?: string }).code
          ? HttpResponse.json({ message: 'Código inválido', code: 'TWO_FACTOR_INVALID' }, { status: 401 })
          : HttpResponse.json({ token: 'abc' });
      }),
      http.get(`${API}/me`, () => HttpResponse.json(baseMe()))
    );
    const user = userEvent.setup();
    renderLogin();
    await fillAndSubmit(user);
    await user.type(await screen.findByLabelText('Código'), '000000');
    await user.click(screen.getByRole('button', { name: /verificar e entrar/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/código inválido ou expirado/i);

    await user.click(screen.getByRole('button', { name: /código de recuperação/i }));
    await user.type(screen.getByLabelText('Código de recuperação'), 'ABCDE-12345');
    await user.click(screen.getByRole('button', { name: /verificar e entrar/i }));
    expect(await screen.findByText('Painel do dono')).toBeInTheDocument();
    expect(verifyBody).toEqual({ challenge_token: 'chal', recovery_code: 'ABCDE-12345' });
  });

  it('desafio expirado volta para a senha com explicação', async () => {
    server.use(
      http.post(`${AUTH}/login`, () => HttpResponse.json({ two_factor_required: true, challenge_token: 'chal' })),
      http.post(`${AUTH}/2fa/verify`, () => HttpResponse.json({ message: 'expirado', code: 'TOKEN_INVALID_OR_EXPIRED' }, { status: 401 }))
    );
    const user = userEvent.setup();
    renderLogin();
    await fillAndSubmit(user);
    await user.type(await screen.findByLabelText('Código'), '123456');
    await user.click(screen.getByRole('button', { name: /verificar e entrar/i }));
    expect(await screen.findByText(/o tempo para digitar o código acabou/i)).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('senha errada mostra mensagem amigável', async () => {
    server.use(http.post(`${AUTH}/login`, () => HttpResponse.json({ message: 'x', code: 'INVALID_CREDENTIALS' }, { status: 401 })));
    const user = userEvent.setup();
    renderLogin();
    await fillAndSubmit(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.');
  });
});
