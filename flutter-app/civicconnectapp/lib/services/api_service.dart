import 'package:dio/dio.dart';

class ApiService {

  /*static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000/api', // Android Emulator
  );*/
  static const String _baseUrl='http://10.23.231.85:4000/api';
  late final Dio _dio;

  ApiService() {
    // Enforce HTTPS in release mode
    const bool isRelease = bool.fromEnvironment('dart.vm.product');
    if (isRelease && !_baseUrl.startsWith('https://')) {
      throw Exception('Unsecure API URL in release build: $_baseUrl');
    }

    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 3),
      headers: {
        'Content-Type': 'application/json',
      },
    ));
  }

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
