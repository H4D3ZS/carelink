// Backend API Routes and Controllers
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthService } from './authentication/auth.service';
import { PatientService } from './patient/patient.service';
import { BillingService } from './billing/billing.service';
import { NotificationService } from './notifications/notification.service';

// Auth Controller
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DOCTOR', 'FAMILY_MEMBER')
  getProfile(@Param('id') id: string) {
    return this.authService.getProfile(id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body('userId') userId: string) {
    return this.authService.logout(userId);
  }
}

// Patient Controller
@Controller('api/patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'DOCTOR', 'FAMILY_MEMBER')
  getAllPatients(
    @Query() queryParams: QueryParams,
  ): Promise<FreshedResult<Page<Patient>>> {
    return this.paticientService.findAll(queryParams);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'DOCTOR', 'FAMILY_MEMBER')
  getPatientById(@Param('id') id: string): Promise<Patient> {
    return this.patientService.findOne(id);
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  getPatientStatus(@Param('id') id: string) {
    return this.patientService.getPatientStatus(id);
  }

  @Get(':id/medical-summary')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'DOCTOR')
  getMedicalSummary(@Param('id') id: string) {
    return this.patientService.getM