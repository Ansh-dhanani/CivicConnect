import 'package:dio/dio.dart';

class ApiService {
  // For Android Emulator use 'http://10.0.2.2:4000/api'
  // For Physical Device use your computer's IP address, e.g., 'http://192.168.1.5:4000/api'
  // REPALCE THIS WITH YOUR COMPUTERS IP
  static const String _baseUrl = 'http://10.23.231.85:4000/api'; 
  
  final Dio _dio = Dio(BaseOptions(
    baseUrl: _baseUrl,
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 3),
    headers: {
      'Content-Type': 'application/json',
    },
  ));

  // Add interceptor to include token if needed
  void setToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  void clearToken() {
    _dio.options.headers.remove('Authorization');
  }

  Future<Response> login(String email, String password) async {
    try {
      return await _dio.post('/login', data: {'email': email, 'password': password});
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> register(String email, String password) async {
    try {
      return await _dio.post('/register', data: {'email': email, 'password': password});
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> testJwt() async {
    try {
      return await _dio.get('/test-jwt');
    } catch (e) {
      rethrow;
    }
  }
}
