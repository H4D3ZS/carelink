import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../core/theme.dart';
import '../data/api_service.dart';

class QRScanScreen extends StatefulWidget {
  const QRScanScreen({super.key});

  @override
  State<QRScanScreen> createState() => _QRScanScreenState();
}

class _QRScanScreenState extends State<QRScanScreen> {
  bool _isScanning = false;
  bool _showResult = false;
  Map<String, dynamic>? _patientData;
  String? _error;

  Future<void> _simulateScan() async {
    setState(() {
      _isScanning = true;
      _error = null;
    });

    // Simulate camera delay
    await Future.delayed(const Duration(seconds: 2));

    try {
      // Fetch patient p1 via QR endpoint
      final response = await http.get(
        Uri.parse('${ApiService.apiBaseUrl}/qr/p1'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _patientData = data;
          _showResult = true;
          _isScanning = false;
        });
      } else if (response.statusCode == 403) {
        setState(() {
          _error = 'Family access is disabled for this patient';
          _isScanning = false;
        });
      } else if (response.statusCode == 404) {
        setState(() {
          _error = 'Patient not found';
          _isScanning = false;
        });
      } else {
        setState(() {
          _error = 'Failed to load patient data';
          _isScanning = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Network error. Please try again.';
        _isScanning = false;
      });
    }
  }

  void _reset() {
    setState(() {
      _showResult = false;
      _patientData = null;
      _error = null;
    });
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
    if (_error != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('QR Scan'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppTheme.dangerColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(40),
                  ),
                  child: const Icon(
                    Icons.error_outline,
                    size: 40,
                    color: AppTheme.dangerColor,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  _error!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 18,
                    color: AppTheme.slate700,
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _reset,
                  child: const Text('Try Again'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_showResult && _patientData != null) {
      final patient = _patientData!['patient'];
      final tasks = _patientData!['tasks'] as List<dynamic>;
      final notes = _patientData!['notes'] as List<dynamic>;

      return Scaffold(
        appBar: AppBar(
          title: const Text('Patient Information'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.pop(context),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _reset,
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Patient Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            patient['name'],
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
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
                            patient['status'],
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      patient['location'],
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Tasks Section
              const Text(
                'Care Tasks',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.slate900,
                ),
              ),
              const SizedBox(height: 12),
              if (tasks.isEmpty)
                const Text(
                  'No tasks available',
                  style: TextStyle(color: AppTheme.slate500),
                )
              else
                ...tasks.take(5).map((task) => Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.slate50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          task['title'],
                          style: TextStyle(
                            decoration: task['status'] == 'done'
                                ? TextDecoration.lineThrough
                                : null,
                            color: task['status'] == 'done'
                                ? AppTheme.slate400
                                : AppTheme.slate900,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: task['status'] == 'done'
                              ? AppTheme.successColor.withOpacity(0.1)
                              : AppTheme.warningColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          task['status'],
                          style: TextStyle(
                            fontSize: 12,
                            color: task['status'] == 'done'
                                ? AppTheme.successColor
                                : AppTheme.warningColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                )),

              const SizedBox(height: 20),

              // Notes Section
              const Text(
                'Recent Updates',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.slate900,
                ),
              ),
              const SizedBox(height: 12),
              if (notes.isEmpty)
                const Text(
                  'No updates available',
                  style: TextStyle(color: AppTheme.slate500),
                )
              else
                ...notes.take(3).map((note) => Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.slate50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.slate200),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 36,
                        height: 36,
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
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              note['author'],
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                color: AppTheme.slate900,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              note['text'],
                              style: const TextStyle(
                                color: AppTheme.slate700,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              note['createdAt'].toString().substring(0, 10),
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppTheme.slate400,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Scanner Frame
              Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  color: AppTheme.slate900,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    if (_isScanning)
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 60,
                            height: 60,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 4,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Scanning...',
                            style: TextStyle(
                              fontSize: 18,
                              color: Colors.white.withOpacity(0.8),
                            ),
                          ),
                        ],
                      )
                    else
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.qr_code_scanner,
                            size: 80,
                            color: Colors.white.withOpacity(0.3),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Camera Preview',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.white.withOpacity(0.5),
                            ),
                          ),
                        ],
                      ),
                    // Corner markers
                    Positioned(
                      top: 40,
                      left: 40,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          border: Border(
                            top: BorderSide(
                              color: AppTheme.primaryColor,
                              width: 4,
                            ),
                            left: BorderSide(
                              color: AppTheme.primaryColor,
                              width: 4,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      top: 40,
                      right: 40,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          border: Border(
                            top: BorderSide(
                              color: AppTheme.primaryColor,
                              width: 4,
                            ),
                            right: BorderSide(
                              color: AppTheme.primaryColor,
                              width: 4,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 40,
                      left: 40,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(
                              color: AppTheme.primaryColor,
                              width: 4,
                            ),
                            left: BorderSide(
                              color: AppTheme.primaryColor,
                              width: 4,
                            ),
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 40,
                      right: 40,
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(
                              color: AppTheme.primaryColor,
                              width: 4,
                            ),
                            right: BorderSide(
                              color: AppTheme.primaryColor,
                              width: 4,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: _isScanning ? null : _simulateScan,
                  icon: const Icon(Icons.camera_alt),
                  label: Text(_isScanning ? 'Scanning...' : 'Simulate QR Scan'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.slate100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Column(
                  children: [
                    Text(
                      'Demo Mode',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.slate700,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Tap "Simulate QR Scan" to instantly view John Mitchell\'s patient data.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
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
      ),
    );
  }
}
