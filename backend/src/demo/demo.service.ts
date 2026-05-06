import { Injectable } from '@nestjs/common';
import { StoreService } from '../store/store.service';

type TaskStatus = 'open' | 'done';
type NoteAudience = 'family' | 'staff';

export interface DemoTask {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface DemoNote {
  id: string;
  author: string;
  text: string;
  audience: NoteAudience;
  createdAt: string;
}

export interface DemoState {
  consentEnabled: boolean;
  patient: {
    id: string;
    name: string;
    status: string;
    location: string;
  };
  tasks: DemoTask[];
  notes: DemoNote[];
}

// In-memory demo data for hackathon
@Injectable()
export class DemoService {
  constructor(private readonly store: StoreService) {}

  getState(): DemoState {
    const patient = this.store.getPatient({ id: '', email: '', password: '', role: 'admin', patientIds: [] }, 'p1');
    return {
      consentEnabled: patient?.consentEnabled ?? true,
      patient: patient || { id: 'p1', name: 'Unknown', status: 'Unknown', location: '' },
      tasks: this.store.listTasks('p1').map((t) => ({ id: t.id, title: t.title, status: t.status })),
      notes: this.store
        .listNotes(patient || ({} as any), { id: '', email: '', password: '', role: 'admin', patientIds: [] } as any)
        .map((n) => ({
          id: n.id,
          author: n.author,
          text: n.text,
          audience: n.audience,
          createdAt: n.createdAt,
        })),
    };
  }

  setConsent(enabled: boolean) {
    this.store.setConsent('p1', enabled);
    return this.getState();
  }

  addTask(title: string) {
    return this.store.addTask('p1', title);
  }

  toggleTask(id: string) {
    return this.store.toggleTask('p1', id);
  }

  addNote(text: string, audience: NoteAudience, author = 'You') {
    return this.store.addNote('p1', author, text, audience);
  }
}
