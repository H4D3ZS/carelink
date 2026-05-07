import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../data/api_service.dart';
import '../models/user_model.dart';

class PatientManageScreen extends StatefulWidget {
  final Patient patient;

  const PatientManageScreen({
    super.key,
    required this.patient,
  });

  @override
  State<PatientManageScreen> createState() => _PatientManageScreenState();
}

class _PatientManageScreenState extends State<PatientManageScreen> {
  late Patient _patient;
  List<Task> _tasks = [];
  List<Note> _notes = [];
  bool _isLoading = true;
  User? _currentUser;

  @override
  void initState() {
    super.initState();
    _patient = widget.patient;
    _loadData();
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final userData = await ApiService.getMe();
      setState(() {
        _currentUser = User.fromJson(userData);
      });
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        ApiService.getPatient(_patient.id),
        ApiService.getTasks(_patient.id),
        ApiService.getNotes(_patient.id),
      ]);
      setState(() {
        _patient = Patient.fromJson(results[0] as Map<String, dynamic>);
        _tasks = (results[1] as List).map((t) => Task.fromJson(t)).toList();
        _notes = (results[2] as List).map((n) => Note.fromJson(n)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
    }
  }

  Future<void> _toggleTask(String taskId) async {
    try {
      await ApiService.toggleTask(_patient.id, taskId);
      _loadData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _toggleConsent() async {
    try {
      await ApiService.setConsent(_patient.id, !_patient.consentEnabled);
      _loadData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _patient.consentEnabled
                ? 'Family access disabled'
                : 'Family access enabled',
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  void _showAddTaskDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Task'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Task description',
            hintText: 'e.g., Check vitals',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (controller.text.isNotEmpty) {
                Navigator.pop(context);
                try {
                  await ApiService.addTask(_patient.id, controller.text);
                  _loadData();
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _showAddNoteDialog() {
    final controller = TextEditingController();
    String audience = 'staff';
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Note'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                decoration: const InputDecoration(
                  labelText: 'Note text',
                  hintText: 'Enter note...',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: 'staff',
                    label: Text('Staff Only'),
                    icon: Icon(Icons.medical_services),
                  ),
                  ButtonSegment(
                    value: 'family',
                    label: Text('Family Visible'),
                    icon: Icon(Icons.family_restroom),
                  ),
                ],
                selected: {audience},
                onSelectionChanged: (value) {
                  setDialogState(() => audience = value.first);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (controller.text.isNotEmpty) {
                  Navigator.pop(context);
                  try {
                    await ApiService.addNote(
                      _patient.id,
                      controller.text,
                      audience,
                    );
                    _loadData();
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: $e')),
                    );
                  }
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
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
    final statusColor = _getStatusColor(_patient.status);
    final canManage = _currentUser?.canManagePatients ?? false;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                _patient.name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _patient.status,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _patient.location,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          if (_isLoading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // Consent Toggle (Admin only)
                  if (canManage) _buildConsentCard(),
                  if (canManage) const SizedBox(height: 16),
                  
                  // Tasks Section
                  _buildTasksSection(),
                  const SizedBox(height: 16),
                  
                  // Notes Section
                  _buildNotesSection(),
                ]),
              ),
            ),
        ],
      ),
      floatingActionButton: canManage
          ? Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FloatingActionButton.small(
                  heroTag: 'note',
                  onPressed: _showAddNoteDialog,
                  child: const Icon(Icons.note_add),
                ),
                const SizedBox(height: 8),
                FloatingActionButton(
                  heroTag: 'task',
                  onPressed: _showAddTaskDialog,
                  child: const Icon(Icons.add_task),
                ),
              ],
            )
          : null,
    );
  }

  Widget _buildConsentCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: _patient.consentEnabled
                    ? AppTheme.successColor.withOpacity(0.1)
                    : AppTheme.warningColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _patient.consentEnabled ? Icons.visibility : Icons.visibility_off,
                color: _patient.consentEnabled
                    ? AppTheme.successColor
                    : AppTheme.warningColor,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _patient.consentEnabled
                        ? 'Family Access Enabled'
                        : 'Family Access Disabled',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _patient.consentEnabled
                        ? 'Family can view patient updates'
                        : 'Family access is restricted',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.slate600,
                    ),
                  ),
                ],
              ),
            ),
            Switch(
              value: _patient.consentEnabled,
              onChanged: (_) => _toggleConsent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTasksSection() {
    final completedCount = _tasks.where((t) => t.isDone).length;
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Care Tasks',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '$completedCount/${_tasks.length}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (_tasks.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Text(
                    'No tasks yet',
                    style: TextStyle(color: AppTheme.slate500),
                  ),
                ),
              )
            else
              ..._tasks.map((task) => _buildTaskItem(task)),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskItem(Task task) {
    return InkWell(
      onTap: () => _toggleTask(task.id),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: task.isDone
                    ? AppTheme.successColor.withOpacity(0.1)
                    : AppTheme.slate100,
                borderRadius: BorderRadius.circular(6),
              ),
              child: task.isDone
                  ? const Icon(
                      Icons.check,
                      size: 16,
                      color: AppTheme.successColor,
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                task.title,
                style: TextStyle(
                  fontSize: 15,
                  decoration: task.isDone ? TextDecoration.lineThrough : null,
                  color: task.isDone ? AppTheme.slate400 : AppTheme.slate900,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: task.isDone
                    ? AppTheme.successColor.withOpacity(0.1)
                    : AppTheme.warningColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                task.isDone ? 'Done' : 'Open',
                style: TextStyle(
                  fontSize: 12,
                  color: task.isDone ? AppTheme.successColor : AppTheme.warningColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotesSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Notes & Updates',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (_notes.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Text(
                    'No notes yet',
                    style: TextStyle(color: AppTheme.slate500),
                  ),
                ),
              )
            else
              ..._notes.map((note) => _buildNoteItem(note)),
          ],
        ),
      ),
    );
  }

  Widget _buildNoteItem(Note note) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
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
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
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
              const SizedBox(width: 12),
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: note.isFamilyVisible
                      ? AppTheme.primaryColor.withOpacity(0.1)
                      : AppTheme.slate200,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  note.isFamilyVisible ? 'Family' : 'Staff',
                  style: TextStyle(
                    fontSize: 11,
                    color: note.isFamilyVisible
                        ? AppTheme.primaryColor
                        : AppTheme.slate700,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            note.text,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.slate700,
            ),
          ),
        ],
      ),
    );
  }
}
