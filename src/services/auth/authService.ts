// ============================================================
// AUTH SERVICE
// TODO: BACKEND — reemplazar por JWT/session real
// ============================================================
import type { User, AuthSession, Role } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import { mockHash } from '../../mock/seeds';

const authService = {
  login(username: string, password: string): AuthSession | null {
    const users = storageService.getArray<User>(KEYS.USERS);
    const user = users.find(u => u.username === username && u.active);
    if (!user) return null;
    // TODO: BACKEND — usar bcrypt.compare(password, user.passwordHash)
    if (user.passwordHash !== mockHash(password)) return null;
    const session: AuthSession = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      loginAt: new Date().toISOString(),
    };
    storageService.set(KEYS.SESSION, session);
    return session;
  },

  logout(): void {
    storageService.remove(KEYS.SESSION);
  },

  getSession(): AuthSession | null {
    return storageService.get<AuthSession>(KEYS.SESSION);
  },

  isAuthenticated(): boolean {
    return !!this.getSession();
  },
};

// RBAC
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ['dashboard','customers','products','inventory','sales','dte','reports','ar','users','settings','audit'],
  cajero: ['dashboard','customers','products','sales','dte'],
  supervisor: ['dashboard','customers','products','inventory','sales','dte','reports'],
  contador: ['dashboard','dte','reports','ar','customers'],
};

export function canAccess(role: Role, module: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(module) ?? false;
}

export default authService;
