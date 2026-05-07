import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../data/api_service.dart';

class PatientDetailScreen extends StatefulWidget {
  final String patientId;
  final String patientName;

  const PatientDetailScreen({
    super.key,
    required this.patientId,
    required this.patientName,
  });

  @override
  State<PatientDetailScreen> createState() => _PatientDetailScreenState();
}

class _PatientDetailScreenState extends State<PatientDetailScreen> {
  Map<String, dynamic>? _patient;
  List<dynamic> _tasks = [];
  List<dynamic> _notes = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        ApiService.getPatient(widget.patientId),
        ApiService.getTasks(widget.patientId),
        ApiService.getNotes(widget.patientId),
      ]);
      setState(() {
        _patient = results[0] as Map<String, dynamic>;
        _tasks = results[1] as List<dynamic>;
        _notes = results[2] as List<dynamic>;
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
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                widget.patientName,
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
                child: _patient != null
                    ? Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 80),
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
                                _patient!['status'],
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _patient!['location'],
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      )
                    : null,
              ),
            ),
          ),
          _isLoading
              ? const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              : _error != null
                  ? SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Error: $_error',
                              style:
                                  const TextStyle(color: AppTheme.dangerColor),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _loadData,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverList(
                        delegate: SliverChildListDelegate([
                          // Consent Card
                          _buildConsentCard(),
                          const SizedBox(height: 16),
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
    );
  }

  Widget _buildConsentCard() {
    final consentEnabled = _patient?['consentEnabled'] ?? false;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: consentEnabled
                    ? AppTheme.successColor.withOpacity(0.1)
                    : AppTheme.warningColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                consentEnabled ? Icons.visibility : Icons.visibility_off,
                color: consentEnabled
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
                    consentEnabled
                        ? 'Family Access Enabled'
                        : 'Family Access Disabled',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    consentEnabled
                        ? 'Family members can view updates'
                        : 'Family access is currently restricted',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.slate600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTasksSection() {
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
                Text(
                  '${_tasks.where((t) => t['status'] == 'done').length}/${_tasks.length}',
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppTheme.slate500,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (_tasks.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Center(
                  child: Text(
                    'No tasks yet',
                    style: TextStyle(
                      color: AppTheme.slate500,
                    ),
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

  Widget _buildTaskItem(dynamic task) {
    final isDone = task['status'] == 'done';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: isDone
                  ? AppTheme.successColor.withOpacity(0.1)
                  : AppTheme.slate100,
              borderRadius: BorderRadius.circular(6),
            ),
            child: isDone
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
              task['title'],
              style: TextStyle(
                fontSize: 14,
                decoration: isDone ? TextDecoration.lineThrough : null,
                color: isDone ? AppTheme.slate400 : AppTheme.slate900,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isDone
                  ? AppTheme.successColor.withOpacity(0.1)
                  : AppTheme.slate100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              task['status'],
              style: TextStyle(
                fontSize: 12,
                color: isDone ? AppTheme.successColor : AppTheme.slate600,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
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
              'Updates & Notes',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (_notes.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Center(
                  child: Text(
                    'No updates yet',
                    style: TextStyle(
                      color: AppTheme.slate500,
                    ),
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

  Widget _buildNoteItem(dynamic note) {
    final isFamily = note['audience'] == 'family';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
                    note['author'].toString().substring(0, 1),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      note['author'],
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      note['createdAt'].toString().substring(0, 10),
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.slate500,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isFamily
                      ? AppTheme.primaryColor.withOpacity(0.1)
                      : AppTheme.slate200,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isFamily ? 'Family' : 'Staff',
                  style: TextStyle(
                    fontSize: 11,
                    color: isFamily
                        ? AppTheme.primaryColor
                        : AppTheme.slate700,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            note['text'],
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
