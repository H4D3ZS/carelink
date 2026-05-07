import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../data/api_service.dart';
import '../models/user_model.dart';
import 'login_screen.dart';
import 'admin_dashboard.dart';
import 'staff_dashboard.dart';
import 'family_portal.dart';
import 'qr_scan_screen.dart';
import 'profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  User? _user;
  int _currentIndex = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    try {
      final userData = await ApiService.getMe();
      setState(() {
        _user = User.fromJson(userData);
        _isLoading = false;
      });
    } catch (e) {
      // Token invalid or expired
      await ApiService.clearToken();
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    }
  }

  Future<void> _logout() async {
    await ApiService.clearToken();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  List<Widget> get _screens {
    if (_user == null) return [];

    if (_user!.isAdmin) {
      return [
        const AdminDashboard(),
        const QRScanScreen(),
        const ProfileScreen(),
      ];
    } else if (_user!.isStaff) {
      return [
        const StaffDashboard(),
        const QRScanScreen(),
        const ProfileScreen(),
      ];
    } else {
      return [
        const FamilyPortal(),
        const QRScanScreen(),
        const ProfileScreen(),
      ];
    }
  }

  List<BottomNavigationBarItem> get _navItems {
    if (_user == null) return [];

    if (_user!.isAdmin) {
      return const [
        BottomNavigationBarItem(
          icon: Icon(Icons.dashboard_outlined),
          activeIcon: Icon(Icons.dashboard),
          label: 'Dashboard',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.qr_code_scanner_outlined),
          activeIcon: Icon(Icons.qr_code_scanner),
          label: 'Scan QR',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline),
          activeIcon: Icon(Icons.person),
          label: 'Profile',
        ),
      ];
    } else if (_user!.isStaff) {
      return const [
        BottomNavigationBarItem(
          icon: Icon(Icons.assignment_outlined),
          activeIcon: Icon(Icons.assignment),
          label: 'Patients',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.qr_code_scanner_outlined),
          activeIcon: Icon(Icons.qr_code_scanner),
          label: 'Scan QR',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline),
          activeIcon: Icon(Icons.person),
          label: 'Profile',
        ),
      ];
    } else {
      return const [
        BottomNavigationBarItem(
          icon: Icon(Icons.family_restroom_outlined),
          activeIcon: Icon(Icons.family_restroom),
          label: 'My Family',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.qr_code_scanner_outlined),
          activeIcon: Icon(Icons.qr_code_scanner),
          label: 'Scan QR',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person_outline),
          activeIcon: Icon(Icons.person),
          label: 'Profile',
        ),
      ];
    }
  }

  String get _appBarTitle {
    if (_user == null) return 'CareLink QR';

    if (_user!.isAdmin) {
      return ['Admin Dashboard', 'Scan QR', 'Profile'][_currentIndex];
    } else if (_user!.isStaff) {
      return ['My Patients', 'Scan QR', 'Profile'][_currentIndex];
    } else {
      return ['My Family', 'Scan QR', 'Profile'][_currentIndex];
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Loading...'),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_appBarTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: _navItems,
        selectedItemColor: AppTheme.primaryColor,
        unselectedItemColor: AppTheme.slate400,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
