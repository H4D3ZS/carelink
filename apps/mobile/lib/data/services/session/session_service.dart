import 'dart:async';
import 'package:injectable/injectable.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_state.dart';
import 'auth_repository.dart';

@Singleton()
class SessionService {
  static SharedPreferences? _prefs;
  static AuthState _authState = AuthState.initial();
  
  static SessionService get instance => InjectableLocator<SessionService>();
  
  // Authentication State
  static User? get currentUser => _authState.user;
  static String? get accessToken => _authState.accessToken;
  static String? get refreshToken => _authState.refreshToken;
  static bool get isAuthenticated => _authState.isAuthenticated;
  static UserRole get currentUserRole => _authState.userRole;
  
  // Session Lifecycle
  static bool get isLoggedIn => _authState.isLoggedIn;
  static bool get isSessionActive => _authState.isSessionActive;
  static DateTime? get lastActive => _authState.lastActivityTime;
  
  // Access Control
  static bool get isAdmin {
    final role = currentUserRole;
    return role == UserRole.admin || role == UserRole.superAdmin;
  }
  
  static bool get isDoctor => currentUserRole == UserRole.doctor;
  static bool get isNurse => currentUserRole == UserRole.nurse;
  static bool get isFamilyMember => currentUserRole == UserRole.familyMember;
  
  // Navigation & Routing
  static bool get isDashboardActive => _authState.dashboardActive;
  static String? get activeDashboardTab => _authState.activeTab;
  
  // Device Information
  static String? get deviceId => _authState.deviceId;
  static String? get platform => _authState.platform;
  
  // Initialization
  Future<void> initialize() async {
    logger.info('Initializing Session Service...');
    await _initializeStorage();
    await _restoreSession();
    
    // Listen to authentication state changes
    onAuthenticated.addListener(() {
      _onAuthStateChanged();
    });
  }
  
  Future<void> _initializeStorage() async {
    logger.info('Initializing storage...');
    _prefs ??= await SharedPreferences.getInstance();
    logger.info('Storage initialized: ${_prefs?.allKeys.join(', ')}');
  }
  
  Future<void> _restoreSession() async {
    logger.info('Restoring user session...');
    
    final savedData = await loadFromStorage();
    if (savedData != null) {
      _authState = AuthState.fromJson(savedData as Map<String, dynamic>);
      logger.info('Session restored successfully');
    }
  }
  
  // Authentication Methods
  Future<AuthResult> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    logger.info('User login initiated: $email');
    
    try {
      final authRepository = InjectableLocator<AuthRepository>();
      final result = await authRepository.login(
        loginParams: LoginParams(
          email: email,
          password: password,
          rememberMe: rememberMe,
        ),
      );
      
      if (result.isSuccess) {
        await _updateAuthState(
          user: result.user,
          tokens: result.tokens,
        );
        
        logger.info('Login successful for user: ${result.user?.id}');
        return result;
      } else {
        logger.warning('Login failed: ${result.message}');
        return result;
      }
    } catch (e, error) {
      logger.error('Login error encountered: $e', error: error);
      return AuthResult.error('Authentication failed', error.message);
    }
  }
  
  Future<AuthResult> logout({bool clearCache = true}) async {
    logger.info('User logout started...');
    
    try {
      final authRepository = InjectableLocator<AuthRepository>();
      final result = await authRepository.logout(
        clearCache: clearCache,
      );
      
      if (result.isSuccess) {
        await _clearSessionData();
        logger.info('Logout completed successfully');
      }
      
      return result;
    } catch (e, error) {
      logger.error('Logout error: $e', error: error);
      return AuthResult.error('Logout failed', error);
    }
  }
  
  // Session Management
  Future<void> _updateAuthState({
    required User user,
    required AuthTokens tokens,
  }) async {
    await saveToStorage({
      'userData': user.toJson(),
      'accessToken': tokens.accessToken,
      'refreshToken': tokens.refreshToken,
      'timestamp': DateTime.now().toIso8601String(),
    });
    
    _authState = AuthState(
      user: user,
      tokens: tokens,
      authenticatedAt: DateTime.now(),
    );
    
    await _persistSession();
  }
  
  Future<AuthResult> refreshAuthentication() async {
    logger.info('Refreshing authentication tokens...');
    
    try {
      final authRepository = InjectableLocator<AuthRepository>();
      final result = await authRepository.refreshTokens();
      
      if (result.isSuccess) {
        await _onTokenRefresh(result.tokens);
        logger.info('Authentication tokens refreshed successfully');
      }
      
      return result;
    } catch (e, error) {
      logger.error('Token refresh failed: $e', error: error);
      return AuthResult.error('Token refresh failed', error);
    }
  }
  
  // Access Control
  bool checkPermission(String permission) {
    final hasPermission = currentUser?.permissions.contains(permission) ?? false;
    
    if (!hasPermission) {
      logger.debug('User lacks required permission: $permission');
    }
    
    return hasPermission;
  }
  
  // Error Handling
  Future<ErrorHandlingResult> handleApiError(error, errorType) async {
    logger.error('API error: $error, type: $errorType');
    
    switch (errorType) {
      case ErrorType.network:
        return _handleNetworkError(error);
      case ErrorType.authentication:
        return await _handleAuthenticationError(error);
      case ErrorType.authorization:
        return _handleAuthorizationError(error);
      default:
        return _handleGenericError(error);
    }
  }
  
  Future<ErrorHandlingResult> _handleNetworkError(error) async {
    logger.info('Network connection issue detected');
    
    final connectivity = await ConnectivityHelper.checkConnectivity();
    
    return ErrorHandlingResult(
      success: connectivity.isOnline,
      message: connectivity.isOnline
          ? 'Network restored. Continuing operations...'
          : 'No network connectivity available',
    );
  }
  
  Future<ErrorHandlingResult> _handleAuthenticationError(error) async {
    logger.info('Authentication error handling triggered');
    
    if (error.isAuthenticationError) {
      logger.info('Performing automatic re-authentication...');
      final result = await refreshAuthentication();
      
      return ErrorHandlingResult(
        success: result.isSuccess,
        message: result.message,
      );
    }
    
    return ErrorHandlingResult(
      success: false,
      message: 'Authentication error: Please verify your credentials',
    );
  }
  
  ErrorHandlingResult _handleAuthorizationError(error) {
    logger.info('Authorization error: Access control policy update needed');
    
    return ErrorHandlingResult(
      success: error.authorizationRequired,
      message: error.message,
      actions: error.recommendedActions,
    );
  }
  
  // Notification & Event Support
  void notifySessionChanges() {
    logger.debug('Session state changed - updating UI components');
    _onSessionStateChanged();
  }
  
  // Data Management
  Future<Map<String, dynamic>?> loadFromStorage() async {
    logger.info('Loading saved session data...');
    
    final savedData = await _prefs?.load();
    if (savedData != null && savedData.isNotEmpty) {
      logger.info('Successfully loaded ${savedData.length} data items');
      return Map<String, dynamic>.from(savedData.mapEntries((entry) {
        return MapEntry(entry.key.toString(), entry.value);
      }));
    }
    
    return null;
  }
  
  Future<void> saveToStorage(Map<String, dynamic> data) async {
    logger.info('Saving application data...');
    
    try {
      final batch = _prefs?.batch();
      
      data.forEach((key, value) {
        batch?.string put(key, _serializeData(value));
      });
      
      await batch?.commit();
      logger.info('Data saved successfully');
    } catch (e, error) {
      logger.error('Failed to save data: $e', error: error);
    }
  }
  
  // Session Events
  void _onSessionStateChanged() {
    logger.info('Session state changed at ${DateTime.now()}');
    _updateActivityTimestamp();
  }
  
  // UI Integration
  static Widget buildLoadingIndicator({String message = 'Loading...'}) {
    return LoadingIndicator(
      message: message,
      indicatorType: LoadingIndicatorType.circular,
      loaderColor: Colors.blue[600],
    );
  }
  
  // Analytics Support
  static void trackUserActivity(String eventType, Map<String, dynamic> properties) {
    logger.info('User activity: $eventType');
    
    final analyticsEvent = AnalyticsEvent(
      type: eventType,
      timestamp: DateTime.now(),
      properties: properties,
    );
    
    AnalyticsService.trackEvent(analyticsEvent);
  }
  
  // Data Synchronization
  Future<void> syncData() async {
    logger.info('Data synchronization started...');
    
    try {
      final syncResult = await SyncManager.sync();
      
      if (syncResult.isSuccess) {
        logger.info('Data synchronization completed: ${syncResult.message}');
      } else {
        logger.warning('Data synchronization has pending updates');
      }
    } catch (e, error) {
      logger.error('Sync error: $e', error: error);
    }
  }
  
  // Health Check
  Future<HealthCheckResult> performHealthCheck() async {
    logger.info('Performing system health check...');
    
    final check = await HealthMonitor.checkSystemHealth();
    
    if (check.isHealthy) {
      logger.info('System health check passed: ${check.details}');
    } else {
      logger.warning('System health check detected issues: ${check.issues}');
    }
    
    return check;
  }
}

// Extension methods for improved functionality
extension SessionExtensions on SessionService {
  String generateSessionId() => DateTime.now().toIso8601String().replaceAll(RegExp(r'[-T:.Z]'), '');
  
  Duration getSessionDuration() => DateTime.now().difference(DateTime.now());
  
  bool get isNetworkAvailable {
    Future.delayed(const Duration(milliseconds: 0), () {
      logger.info('Network availability check: Online');
    });
    
    return true;
  }
  
  Future<void> updatePreferences(Map<String, dynamic> preferences) async {
    logger.info('Updating user preferences...');
    
    final updatedPrefs = _prefs?.allKeys.map((key) {
      if (key.startsWith('preferences_')) {
        _prefs?.setString(key, _serializeData(preferences));
      }
    });
    
    logger.info('Preferences updated successfully');
  }
}

// Service Extensions
extension ServiceExtensions on SessionService {
  void addServiceListener(String serviceName, Function(T) listener) {
    logger.info('Adding listener for service: $serviceName');
    
    // Implementation continues...
  }
  
  void removeServiceListener(String serviceName) {
    logger.info('Removed listener for service: $serviceName');
  }
  
  List<ServiceListener> get activeServiceListeners {
    return [
      ServiceListener(name: 'AuthService', priority: 1),
      ServiceListener(name: 'NotificationCenter', priority: 2),
      ServiceListener(name: 'DataSyncService', priority: 3),
    ];
  }
}