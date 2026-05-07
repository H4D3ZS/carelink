import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Production backend on Render
  static const String apiBaseUrl = 'https://carelink-api-vag7.onrender.com';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 15));
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await setToken(data['token']);
        return data;
      }
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Login failed');
    } on FormatException {
      throw Exception('Invalid response from server');
    } catch (e) {
      throw Exception('Network error: Please check your connection');
    }
  }

  static Future<Map<String, dynamic>> register(String email, String password, String role) async {
    try {
      final response = await http.post(
        Uri.parse('$apiBaseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password, 'role': role}),
      ).timeout(const Duration(seconds: 15));
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await setToken(data['token']);
        return data;
      }
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Registration failed');
    } on FormatException {
      throw Exception('Invalid response from server');
    } catch (e) {
      throw Exception('Network error: Please check your connection');
    }
  }

  static Future<List<dynamic>> getPatients() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$apiBaseUrl/patients'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 15));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load patients');
  }

  static Future<Map<String, dynamic>> getPatient(String id) async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$apiBaseUrl/patients/$id'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 15));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load patient');
  }

  static Future<List<dynamic>> getTasks(String patientId) async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$apiBaseUrl/patients/$patientId/tasks'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 15));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load tasks');
  }

  static Future<List<dynamic>> getNotes(String patientId) async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$apiBaseUrl/patients/$patientId/notes'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    ).timeout(const Duration(seconds: 15));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load notes');
  }

  // Public QR endpoint - no auth required
  static Future<Map<String, dynamic>> getPatientByQR(String patientId) async {
    final response = await http.get(
      Uri.parse('$apiBaseUrl/qr/$patientId'),
      headers: {'Content-Type': 'application/json'},
    ).timeout(const Duration(seconds: 15));
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    final error = jsonDecode(response.body);
    throw Exception(error['message'] ?? 'Failed to load patient');
  }
}
