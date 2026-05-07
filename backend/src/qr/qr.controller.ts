import { Controller, Get, Param, NotFoundException, ForbiddenException } from '@nestjs/common';
import { StoreService } from '../store/store.service';

// Public QR endpoint - no auth required, only works if patient consent is enabled
@Controller('qr')
export class QRController {
  constructor(private readonly store: StoreService) {}

  @Get(':patientId')
  getPatientByQR(@Param('patientId') patientId: string) {
    // Find patient by ID
    const patient = this.store.getPatientById(patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Only allow access if consent is enabled
    if (!patient.consentEnabled) {
      throw new ForbiddenException('Family access is disabled for this patient');
    }

    // Get tasks and notes for this patient (family-visible only)
    const tasks = this.store.listTasks(patientId);
    const allNotes = this.store.listNotesPublic(patientId);
    const notes = allNotes.filter(n => n.audience === 'family');

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        status: patient.status,
        location: patient.location,
        consentEnabled: patient.consentEnabled,
      },
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
      })),
      notes: notes.map(n => ({
        id: n.id,
        author: n.author,
        text: n.text,
        createdAt: n.createdAt,
      })),
    };
  }
}
