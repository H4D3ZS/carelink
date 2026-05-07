import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export type Role = 'admin' | 'staff' | 'family';

export interface User {
  id: string;
  email: string;
  password: string; // plain for demo
  role: Role;
  patientIds: string[]; // for family
  token?: string;
}

export interface Patient {
  id: string;
  name: string;
  status: string;
  location: string;
  consentEnabled: boolean;
}

export interface Task {
  id: string;
  patientId: string;
  title: string;
  status: 'open' | 'done';
}

export interface Note {
  id: string;
  patientId: string;
  author: string;
  audience: 'staff' | 'family';
  text: string;
  createdAt: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  type: string;
  status: string;
  start: string;
  end?: string;
  assignee?: string;
}

@Injectable()
export class StoreService {
  private users: User[] = [
    {
      id: 'u-admin',
      email: 'admin@carelink.demo',
      password: 'admin',
      role: 'admin',
      patientIds: [],
    },
    {
      id: 'u-staff',
      email: 'staff@carelink.demo',
      password: 'staff',
      role: 'staff',
      patientIds: [],
    },
    {
      id: 'u-family',
      email: 'family@carelink.demo',
      password: 'family',
      role: 'family',
      patientIds: ['p1'],
    },
  ];

  private patients: Patient[] = [
    {
      id: 'p1',
      name: 'John Mitchell',
      status: 'Stable',
      location: 'Room 302, Cardiac Unit',
      consentEnabled: true,
    },
    {
      id: 'p2',
      name: 'Sarah Chen',
      status: 'Surgery',
      location: 'Room 405, Orthopedics',
      consentEnabled: true,
    },
    {
      id: 'p3',
      name: 'Robert Wilson',
      status: 'Critical',
      location: 'ICU-12, Intensive Care',
      consentEnabled: false,
    },
    {
      id: 'p4',
      name: 'Maria Rodriguez',
      status: 'Recovering',
      location: 'Room 208, Maternity',
      consentEnabled: true,
    },
    {
      id: 'p5',
      name: 'David Kim',
      status: 'Discharge',
      location: 'Room 115, General Medicine',
      consentEnabled: true,
    },
  ];

  private tasks: Task[] = [
    { id: 't1', patientId: 'p1', title: 'Morning vitals & meds', status: 'open' },
    { id: 't2', patientId: 'p1', title: 'Family update call', status: 'open' },
    { id: 't3', patientId: 'p1', title: 'Discharge teaching', status: 'done' },
  ];

  private notes: Note[] = [
    {
      id: 'n1',
      patientId: 'p1',
      author: 'Nurse A',
      audience: 'staff',
      text: 'Patient comfortable. Pain 2/10.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'n2',
      patientId: 'p1',
      author: 'Dr. Lee',
      audience: 'family',
      text: 'Cleared for family portal update.',
      createdAt: new Date().toISOString(),
    },
  ];

  private encounters: Encounter[] = [
    {
      id: 'e1',
      patientId: 'p1',
      type: 'Inpatient',
      status: 'in-progress',
      start: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  authRegister(email: string, password: string, role: Role = 'family'): { token: string; user: User } {
    if (this.users.find((u) => u.email === email)) {
      throw new UnauthorizedException('User exists');
    }
    const user: User = {
      id: randomUUID(),
      email,
      password,
      role,
      patientIds: role === 'family' ? ['p1'] : [],
    };
    const token = randomUUID();
    user.token = token;
    this.users.push(user);
    return { token, user };
  }

  authLogin(email: string, password: string): { token: string; user: User } {
    const user = this.users.find((u) => u.email === email && u.password === password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const token = randomUUID();
    user.token = token;
    return { token, user };
  }

  getUserByToken(token?: string): User | undefined {
    if (!token) return undefined;
    return this.users.find((u) => u.token === token);
  }

  listPatientsForUser(user: User): Patient[] {
    if (user.role === 'admin' || user.role === 'staff') return this.patients;
    return this.patients.filter((p) => user.patientIds.includes(p.id));
  }

  getPatient(user: User, patientId: string): Patient | undefined {
    if (user.role === 'admin' || user.role === 'staff') return this.patients.find((p) => p.id === patientId);
    if (user.patientIds.includes(patientId)) return this.patients.find((p) => p.id === patientId);
    return undefined;
  }

  setConsent(patientId: string, enabled: boolean): Patient | undefined {
    const p = this.patients.find((x) => x.id === patientId);
    if (!p) return undefined;
    p.consentEnabled = enabled;
    return p;
  }

  listTasks(patientId: string): Task[] {
    return this.tasks.filter((t) => t.patientId === patientId);
  }

  addTask(patientId: string, title: string): Task {
    const task: Task = { id: randomUUID(), patientId, title, status: 'open' };
    this.tasks = [task, ...this.tasks];
    return task;
  }

  toggleTask(patientId: string, id: string): Task | undefined {
    let found: Task | undefined;
    this.tasks = this.tasks.map((t) => {
      if (t.patientId === patientId && t.id === id) {
        found = { ...t, status: t.status === 'open' ? 'done' : 'open' };
        return found;
      }
      return t;
    });
    return found;
  }

  listNotes(patient: Patient, user: User): Note[] {
    const all = this.notes.filter((n) => n.patientId === patient.id);
    if (user.role === 'admin' || user.role === 'staff') return all;
    // family: only family-visible, and only if consent enabled
    if (!patient.consentEnabled) return [];
    return all.filter((n) => n.audience === 'family');
  }

  addNote(patientId: string, author: string, text: string, audience: 'family' | 'staff'): Note {
    const note: Note = {
      id: randomUUID(),
      patientId,
      author,
      text,
      audience,
      createdAt: new Date().toISOString(),
    };
    this.notes = [note, ...this.notes];
    return note;
  }

  listEncounters(patientId: string): Encounter[] {
    return this.encounters.filter((e) => e.patientId === patientId);
  }
}
