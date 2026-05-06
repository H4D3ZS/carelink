import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { StoreService, Role, User } from '../store/store.service';

function getToken(headers: Record<string, string | string[] | undefined>): string | undefined {
  const auth = headers['authorization'] || headers['Authorization'];
  if (!auth || Array.isArray(auth)) return undefined;
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return auth;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly store: StoreService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; role?: Role }) {
    const { email, password, role } = body;
    if (!email || !password) throw new UnauthorizedException('Missing credentials');
    const { token, user } = this.store.authRegister(email, password, role || 'family');
    return { token, user: { id: user.id, email: user.email, role: user.role, patientIds: user.patientIds } };
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    if (!email || !password) throw new UnauthorizedException('Missing credentials');
    const { token, user } = this.store.authLogin(email, password);
    return { token, user: { id: user.id, email: user.email, role: user.role, patientIds: user.patientIds } };
  }

  @Get('me')
  me(@Headers() headers: Record<string, string | string[] | undefined>) {
    const token = getToken(headers);
    const user = this.store.getUserByToken(token);
    if (!user) throw new UnauthorizedException('Invalid token');
    return { id: user.id, email: user.email, role: user.role, patientIds: user.patientIds };
  }
}
