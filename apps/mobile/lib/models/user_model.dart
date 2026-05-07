class User {
  final String id;
  final String email;
  final String role;
  final List<String> patientIds;

  User({
    required this.id,
    required this.email,
    required this.role,
    required this.patientIds,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      role: json['role'],
      patientIds: List<String>.from(json['patientIds'] ?? []),
    );
  }

  bool get isAdmin => role == 'admin';
  bool get isStaff => role == 'staff';
  bool get isFamily => role == 'family';
  bool get canManagePatients => isAdmin || isStaff;
  bool get canGenerateQR => isAdmin || isStaff;
  bool get canViewAllPatients => isAdmin || isStaff;
}

class Patient {
  final String id;
  final String name;
  final String status;
  final String location;
  final bool consentEnabled;

  Patient({
    required this.id,
    required this.name,
    required this.status,
    required this.location,
    required this.consentEnabled,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      id: json['id'],
      name: json['name'],
      status: json['status'],
      location: json['location'],
      consentEnabled: json['consentEnabled'] ?? false,
    );
  }
}

class Task {
  final String id;
  final String title;
  final String status;

  Task({
    required this.id,
    required this.title,
    required this.status,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'],
      title: json['title'],
      status: json['status'],
    );
  }

  bool get isDone => status == 'done';
}

class Note {
  final String id;
  final String author;
  final String text;
  final String audience;
  final String createdAt;

  Note({
    required this.id,
    required this.author,
    required this.text,
    required this.audience,
    required this.createdAt,
  });

  factory Note.fromJson(Map<String, dynamic> json) {
    return Note(
      id: json['id'],
      author: json['author'],
      text: json['text'],
      audience: json['audience'],
      createdAt: json['createdAt'],
    );
  }

  bool get isFamilyVisible => audience == 'family';
}
