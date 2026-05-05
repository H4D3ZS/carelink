// app/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:carelink_qr/core/config/app_config.dart';
import 'package:carelink_qr/core/constants/env_constants.dart';
import 'package:carelink_qr/core/theme/app_theme.dart';
import 'package:carelink_qr/routes/app_router.dart';

import 'injection_container.dart' as di;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize dependency injection
  await di.init();
  
  // Initialize Firebase (if needed)
  // await Firebase.initializeApp();
  
  runApp(SetupProvider(
    child: const CareLinkQRApp(),
  ));
}

final appRouter = Provider<GoRouter>((ref) {
  return createAppRouter();
});

/// Main Application Widget
class CareLinkQRApp extends ConsumerWidget {
  const CareLinkQRApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouter);
    
    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      
      // Material 3 Design
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      
      // App Router
      routerConfig: router,
      
      // App Theme
      builder: AppTheme.appBuilder,
      
      // Locale Configuration
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('es', 'ES'),
        Locale('fr', 'FR'),
      ],
    );
  }
}

/// Router Configuration
GoRouter createAppRouter() {
  return GoRouter(
    initialLocation: AppRoutes.login,
    debugLogDiagnostics: true,
    onError: (routerState, error) {
      // Handle navigation errors
      logger.error('Navigation error: ${error.message}');
    },
    
    // Root Redirect
    redirect: (context, state) {
      final path = state.fullPath;
      
      // Authentication Redirect
      if (path.contains(AppRoutes.login)) {
        if (!SessionService.isAuthenticated) {
          return null;
        }
      }
      
      // Admin Route Protection
      if (path.startsWith(AppRoutes.admin) && !SessionService.isAdmin) {
        return AppRoutes.login;
      }
      
      return null;
    },
    
    // Route Configuration
    routes: [
      // Authentication Routes
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      
      // Main Dashboard - Patient Information
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          // Patient Profile
          GoRoute(
            path: AppRoutes.patients,
            name: 'patient-detail',
            builder: (context, state) {
              final patientId = requestParametersHelper(state).patientId;
              return PatientDetailScreen(patientId: patientId);
            },
          ),
          
          // QR Code Scanning
          GoRoute(
            path: AppRoutes.qrScan,
            name: 'qr-scan',
            builder: (context, state) => const QRScannerScreen(),
          ),
          
          // Billing Dashboard
          GoRoute(
            path: AppRoutes.billing,
            name: 'billing',
            builder: (context, state) => const BillingDashboard(),
          ),
        ],
      ),
      
      // Admin Portal
      GoRoute(
        path: AppRoutes.admin,
        name: 'admin-portal',
        builder: (context, state) => const AdminDashboard(),
      ),
    ],
    
    // Error Handling
    errorPageBuilder: (context, state) => MaterialPage<void>(
      child: ErrorScreen(error: state.error, onRetry: () {
        state.context.goNamed('home');
      }),
    ),
  );
}

extension RouterStateHelper on RouterState {
  String? get patientId =>
      pathParameters['patientId'] ??
      queryParameters['patientId'];
      
  Map<String, dynamic> get queryParameters =>
      extra as Map<String, dynamic>? ?? <String, dynamic>{};
}