import type { User } from '../../types';
import storageService, { KEYS } from '../storage/storageService';
import { createId, mockHash } from '../../mock/seeds';
import auditService from '../audit/auditService';
import type { AuthSession } from '../../types';

const userService = {
  getAll(): User[] {
    return storageService.getArray<User>(KEYS.USERS)
      .map(u => ({ ...u, passwordHash: '***' })) // nunca exponer hash en UI
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getById(id: string): User | null {
    const u = storageService.getArray<User>(KEYS.USERS).find(u => u.id === id);
    return u ? { ...u, passwordHash: '***' } : null;
  },

  create(data: { username: string; password: string; name: string; email: string; role: User['role'] }, session: AuthSession): User {
    const user: User = {
      id: createId(),
      username: data.username,
      passwordHash: mockHash(data.password), // TODO: BACKEND bcrypt
      name: data.name,
      email: data.email,
      role: data.role,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storageService.appendToArray<User>(KEYS.USERS, user);
    auditService.log({ userId: session.userId, userName: session.name, action: 'CREATE', module: 'Usuarios', entityType: 'User', entityId: user.id, description: `Creó usuario: ${user.username} (${user.role})` });
    return { ...user, passwordHash: '***' };
  },

  update(id: string, data: Partial<Pick<User, 'name' | 'email' | 'role' | 'active'>>, session: AuthSession): boolean {
    const arr = storageService.getArray<User>(KEYS.USERS);
    const idx = arr.findIndex(u => u.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], ...data, updatedAt: new Date().toISOString() };
    storageService.set(KEYS.USERS, arr);
    auditService.log({ userId: session.userId, userName: session.name, action: 'UPDATE', module: 'Usuarios', entityType: 'User', entityId: id, description: `Actualizó usuario: ${arr[idx].username}` });
    return true;
  },

  changePassword(id: string, newPassword: string, session: AuthSession): boolean {
    const arr = storageService.getArray<User>(KEYS.USERS);
    const idx = arr.findIndex(u => u.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], passwordHash: mockHash(newPassword), updatedAt: new Date().toISOString() };
    storageService.set(KEYS.USERS, arr);
    auditService.log({ userId: session.userId, userName: session.name, action: 'CHANGE_PASSWORD', module: 'Usuarios', entityType: 'User', entityId: id, description: `Cambió contraseña del usuario: ${arr[idx].username}` });
    return true;
  },
};

export default userService;
