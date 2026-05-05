import 'dart:io';

class AppConstants {
  // Application Settings
  static const String appName = 'CareLink QR';
  static const String appVersion = '1.0.0';
  static const String apiKey = 'CARELINK_API_KEY';
  
  // API Configuration
  static const String apiUrl = 'https://api.carelink-qr.com';
  static const int connectionTimeout = 30000;
  static const int receiveTimeout = 30000;
  
  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String authTokenRefreshKey = 'auth_token_refresh';
  static const String userDataKey = 'user_data';
  static const String qrCodeCacheKey = 'qr_code_cache';
  static const String patientPreferencesKey = 'patient_preferences';
  
  // Navigation Routes
  static const String loginRoute = '/login';
  static const String registerRoute = '/register';
  static const String homeRoute = '/home';
  static const String patientRoute = '/patient';
  static const String qrRoute = '/qr';
  static const String billingRoute = '/billing';
  
  // Default Page Sizes
  static const int pageSize = 20;
  static const int largePageSize = 50;
  static const int initialPage = 1;
  
  // Cache Configuration
  static const String localCacheDir = 'carelink_data';
  static const int cacheExpirationDays = 7;
  
  // Image Assets
  static const String assetPrefix = 'assets/images/';
  static const String defaultAvatar = '$assetPrefix/default_avatar.png';
  
  // Environment-Specific Configurations
  static Map<String, dynamic> get environmentConfig => {
    'production': {
      'environment': 'production',
      'apiKey': 'prod_api_key_123456',
      'apiUrl': apiUrl,
      'logLevel': LogLevel.info,
    },
    'development': {
      'environment': 'development',
      'apiKey': 'dev_api_key_789012',
      'apiUrl': '$apiUrl-dev.com',
      'logLevel': LogLevel.debug,
    },
    'staging': {
      'environment': 'staging',
      'apiKey': 'staging_api_key_345678',
      'apiUrl': '$apiUrl-staging.com',
      'logLevel': LogLevel.debug,
    },
  };
  
  // Feature Flags
  static const Map<String, bool> featureFlags = {
    'enablePushNotifications': true,
    'enableRealTimeUpdates': true,
    'enableOfflineMode': true,
    'enableQRScanEnhancements': true,
    'enableAdvancedAnalytics': true,
  };
  
  // Localization
  static const List<Locale> supportedLocales = [
    Locale('en', 'US'),
    Locale('es', 'ES'),
    Locale('fr', 'FR'),
    Locale('de', 'DE'),
    Locale('zh', 'CN'),
  ];
  
  // Security Settings
  static const Map<String, dynamic> securityConfig = {
    'jwtExpirationDays': 7,
    'refreshTokenExpirationDays': 30,
    'sessionTimeoutMinutes': 30,
    'maxLoginAttempts': 3,
    'lockoutDurationMinutes': 15,
    'passwordMinLength': 8,
    'requireMultiFactorAuth': false,
  };
  
  // Notification Settings
  static const Map<String, dynamic> notificationConfig = {
    'maxNotifications': 100,
    'pushNotificationEnabled: true,
    'inAppNotificationsEnabled: true,
    'emailNotificationsEnabled: true,
    'criticalAlertsPriority: HIGH,
    'reminderScheduleIntervalHours: 24,
  };
}

extension DateTimeExtensions on DateTime {
  String get formattedDate => '${year.toString().padLeft(4, '0')}-${month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
  
  String get formattedTime => '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
  
  String get formattedDateTime => '$formattedDate ${formattedTime}';
  
  Duration get daysSinceCreation => DateTime.now().subtract(this);
  Duration get hoursSinceCreation => DateTime.now().subtract(this);
  
  bool get isToday => DateTime.now().isSameDay(this);
  bool get isTomorrow => this.add(const Duration(days: 1)).isSameDay(DateTime.now());
  bool get isThisWeek => isSameWeek(DateTime.now());
  
  bool isSameDay(DateTime other) => year == other.year && month == other.month && day == other.day;
  
  bool isSameWeek(DateTime other) {
    final startOfYear = DateTime(year, 1, 1);
    final otherStartOfYear = DateTime(other.year, 1, 1);
    return getWeekNumber() == other.getWeekNumber() && year == other.year;
  }
  
  int getWeekNumber() {
    final daysInYear = (this - DateTime(year, 1, 1)).inDays + 1;
    return (daysInYear / 7).floor();
  }
}

// Extension methods for string operations
extension StringExtensions on String {
  bool isValidEmail() => RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(this);
  
  bool isValidURL() => RegExp(r'^(http|https):\/\/[^ "]+$').hasMatch(this);
  
  String sanitize() => trim().replaceAll(RegExp(r'\s+'), ' ');
  
  String capitalize() => isEmpty ? this : '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  
  String truncate(int maxLength, [String suffix = '...']) => length > maxLength ? '${substring(0, maxLength)}$suffix' : this;
  
  String toSlug() => toLowerCase()
      .replaceAll(RegExp(r'[^\w\s-]'), '')
      .replaceAll(RegExp(r'\s+'), '-');
}