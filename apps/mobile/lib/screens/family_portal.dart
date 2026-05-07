import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../data/api_service.dart';
import '../models/user_model.dart';

class FamilyPortal extends StatefulWidget {
  const FamilyPortal({super.key});

  @override
  State<FamilyPortal> createState() => _FamilyPortalState();
}

class _FamilyPortalState extends State<FamilyPortal> {
  List<Patient> _patients = [];
  Map<String, List<Task>> _patientTasks = {};
  Map<String, List<Note>> _patientNotes = {};
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFamilyData();
  }

  Future<void> _loadFamilyData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final patients = await ApiService.getPatients();
      final patientList = patients.map((p) => Patient.fromJson(p)).toList();

      // Load tasks and notes for each patient
      for (final patient in patientList) {
        final tasks = await ApiService.getTasks(patient.id);
        final notes = await ApiService.getNotes(patient.id);
        
        _patientTasks[patient.id] = tasks.map((t) => Task.fromJson(t)).toList();
        _patientNotes[patient.id] = notes
            .where((n) => n['audience'] == 'family')
            .map((n) => Note.fromJson(n))
            .toList();
      }

      setState(() {
        _patients = patientList;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _getStatusColor(String status) {
    final s = status.toLowerCase();
    if (s.contains('stable')) return AppTheme.successColor;
    if (s.contains('critical')) return AppTheme.dangerColor;
    if (s.contains('surgery')) return AppTheme.primaryColor;
    if (s.contains('recover')) return AppTheme.warningColor;
    if (s.contains('discharge')) return Colors.purple;
    return AppTheme.slate500;
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadFamilyData,
      child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildErrorView()
              : _buildFamilyView(),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: AppTheme.dangerColor,
            ),
            const SizedBox(height: 16),
            Text(
              'Unable to load family data',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.slate700,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadFamilyData,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFamilyView() {
    if (_patients.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.family_restroom,
                size: 64,
                color: AppTheme.slate300,
              ),
              const SizedBox(height: 16),
              Text(
                'No family members linked',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.slate700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Contact hospital staff to link your family members',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppTheme.slate500,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _patients.length,
      itemBuilder: (context, index) {
        final patient = _patients[index];
        final tasks = _patientTasks[patient.id] ?? [];
        final notes = _patientNotes[patient.id] ?? [];
        return _buildFamilyPatientCard(patient, tasks, notes);
      },
    );
  }

  Widget _buildFamilyPatientCard(Patient patient, List<Task> tasks, List<Note> notes) {
    final statusColor = _getStatusColor(patient.status);
    final completedTasks = tasks.where((t) => t.isDone).length;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ExpansionTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(
              patient.name.substring(0, 1),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
        title: Text(
          patient.name,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.slate900,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              patient.location,
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.slate600,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    patient.status,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                if (!patient.consentEnabled)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.warningColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.lock,
                          size: 12,
                          color: AppTheme.warningColor,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Limited Access',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.warningColor,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Tasks Section
                Row(
                  children: [
                    const Icon(
                      Icons.check_circle_outline,
                      size: 20,
                      color: AppTheme.primaryColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Care Tasks',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.slate700,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '$completedTasks/${tasks.length}',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.slate500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (tasks.isEmpty)
                  Text(
                    'No tasks available',
                    style: TextStyle(
                      color: AppTheme.slate500,
                    ),
                  )
                else
                  ...tasks.take(5).map((task) => _buildTaskItem(task)),
                
                const SizedBox(height: 24),
                
                // Updates Section
                Row(
                  children: [
                    const Icon(
                      Icons.message_outlined,
                      size: 20,
                      color: AppTheme.primaryColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Recent Updates',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.slate700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (notes.isEmpty)
                  Text(
                    'No updates available',
                    style: TextStyle(
                      color: AppTheme.slate500,
                    ),
                  )
                else
                  ...notes.take(3).map((note) => _buildNoteItem(note)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTaskItem(Task task) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(
            task.isDone ? Icons.check_circle : Icons.radio_button_unchecked,
            size: 20,
            color: task.isDone ? AppTheme.successColor : AppTheme.slate400,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              task.title,
              style: TextStyle(
                fontSize: 14,
                decoration: task.isDone ? TextDecoration.lineThrough : null,
                color: task.isDone ? AppTheme.slate400 : AppTheme.slate800,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: task.isDone
                  ? AppTheme.successColor.withOpacity(0.1)
                  : AppTheme.slate100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              task.isDone ? 'Done' : 'Pending',
              style: TextStyle(
                fontSize: 11,
                color: task.isDone ? AppTheme.successColor : AppTheme.slate600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoteItem(Note note) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.slate50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    note.author.substring(0, 1),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      note.author,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      note.createdAt.substring(0, 10),
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.slate500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            note.text,
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.slate700,
            ),
          ),
        ],
      ),
    );
  }
}
