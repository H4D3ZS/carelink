import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { StoreService, Patient, User } from '../store/store.service';
import { getUserFromHeaders } from '../utils/auth-utils';

@Controller('patients')
export class PatientController {
  constructor(private readonly store: StoreService) {}

  private ensurePatientAccess(user: User, patientId: string): Patient {
    const patient = this.store.getPatient(user, patientId);
    if (!patient) throw new UnauthorizedException('No access to patient');
    return patient;
  }

  @Get()
  list(@Headers() headers: Record<string, string | string[] | undefined>) {
    const user = getUserFromHeaders(this.store, headers);
    return this.store.listPatientsForUser(user);
  }

  @Get(':id')
  getOne(@Headers() headers: Record<string, string | string[] | undefined>, @Param('id') id: string) {
    const user = getUserFromHeaders(this.store, headers);
    const patient = this.ensurePatientAccess(user, id);
    return patient;
  }

  @Get(':id/consent')
  getConsent(@Headers() headers: Record<string, string | string[] | undefined>, @Param('id') id: string) {
    const user = getUserFromHeaders(this.store, headers);
    const patient = this.ensurePatientAccess(user, id);
    return { consentEnabled: patient.consentEnabled };
  }

  @Post(':id/consent')
  setConsent(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
    @Body() body: { enabled: boolean },
  ) {
    const user = getUserFromHeaders(this.store, headers);
    if (user.role === 'family') throw new UnauthorizedException('Only staff/admin can change consent');
    const patient = this.store.setConsent(id, !!body.enabled);
    if (!patient) throw new UnauthorizedException('Patient not found');
    return { consentEnabled: patient.consentEnabled };
  }

  @Get(':id/tasks')
  listTasks(@Headers() headers: Record<string, string | string[] | undefined>, @Param('id') id: string) {
    const user = getUserFromHeaders(this.store, headers);
    this.ensurePatientAccess(user, id);
    return this.store.listTasks(id);
  }

  @Post(':id/tasks')
  addTask(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
    @Body() body: { title: string },
  ) {
    const user = getUserFromHeaders(this.store, headers);
    if (user.role === 'family') throw new UnauthorizedException('Only staff/admin can add tasks');
    this.ensurePatientAccess(user, id);
    return this.store.addTask(id, body.title || 'Task');
  }

  @Patch(':id/tasks/:taskId/toggle')
  toggleTask(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ) {
    const user = getUserFromHeaders(this.store, headers);
    this.ensurePatientAccess(user, id);
    const t = this.store.toggleTask(id, taskId);
    if (!t) throw new UnauthorizedException('Task not found');
    return t;
  }

  @Get(':id/notes')
  listNotes(@Headers() headers: Record<string, string | string[] | undefined>, @Param('id') id: string) {
    const user = getUserFromHeaders(this.store, headers);
    const patient = this.ensurePatientAccess(user, id);
    return this.store.listNotes(patient, user);
  }

  @Post(':id/notes')
  addNote(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Param('id') id: string,
    @Body() body: { text: string; audience: 'family' | 'staff'; author?: string },
  ) {
    const user = getUserFromHeaders(this.store, headers);
    this.ensurePatientAccess(user, id);
    // family can only add family-visible notes
    const audience: 'family' | 'staff' =
      user.role === 'family' ? 'family' : body.audience || 'family';
    const author = body.author || user.email;
    return this.store.addNote(id, author, body.text || '', audience);
  }

  @Get(':id/encounters')
  listEncounters(@Headers() headers: Record<string, string | string[] | undefined>, @Param('id') id: string) {
    const user = getUserFromHeaders(this.store, headers);
    this.ensurePatientAccess(user, id);
    return this.store.listEncounters(id);
  }
}
