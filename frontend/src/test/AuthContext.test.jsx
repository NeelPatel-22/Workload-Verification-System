import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'wvs_current_user';

function TestConsumer() {
  const { currentUser, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{currentUser ? currentUser.username : 'none'}</span>
      <button onClick={() => login('dummy01', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function setup() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('AuthContext', () => {
  it('starts with no user when localStorage is empty', () => {
    setup();
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('rehydrates user from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: 'dummy01', role: 'staff' }));
    setup();
    expect(screen.getByTestId('user').textContent).toBe('dummy01');
  });

  it('sets user in state and localStorage after successful login', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, user: { username: 'dummy01', role: 'staff' } }),
    });

    setup();
    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(screen.getByTestId('user').textContent).toBe('dummy01');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).username).toBe('dummy01');
  });

  it('returns success: false and does not set user when credentials are wrong', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, message: 'Invalid username or password' }),
    });

    const results = [];
    function CapturingConsumer() {
      const { currentUser, login } = useAuth();
      return (
        <div>
          <span data-testid="user">{currentUser ? currentUser.username : 'none'}</span>
          <button
            onClick={async () => {
              const r = await login('wrong', 'wrong');
              results.push(r);
            }}
          >
            Login
          </button>
        </div>
      );
    }

    render(<AuthProvider><CapturingConsumer /></AuthProvider>);
    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(results[0].success).toBe(false);
  });

  it('returns success: false when fetch throws (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const results = [];
    function CapturingConsumer() {
      const { login } = useAuth();
      return (
        <button
          onClick={async () => {
            const r = await login('dummy01', 'password');
            results.push(r);
          }}
        >
          Login
        </button>
      );
    }

    render(<AuthProvider><CapturingConsumer /></AuthProvider>);
    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    expect(results[0].success).toBe(false);
    expect(results[0].message).toBe('Unable to connect to server');
  });

  it('clears user from state and localStorage after logout', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: 'dummy01', role: 'staff' }));
    setup();

    expect(screen.getByTestId('user').textContent).toBe('dummy01');

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
