import { UnauthorizedException } from '@nestjs/common';
import { StoreService, User } from '../store/store.service';

export function getToken(headers: Record<string, string | string[] | undefined>): string | undefined {
  const auth = headers['authorization'] || headers['Authorization'];
  if (!auth || Array.isArray(auth)) return undefined;
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return auth;
}

export function getUserFromHeaders(store: StoreService, headers: Record<string, string | string[] | undefined>): User {
  const token = getToken(headers);
  const user = store.getUserByToken(token);
  if (!user) throw new UnauthorizedException('Invalid token');
  return user;
}
