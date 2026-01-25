import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Singleton pattern - ensures same instance is used everywhere
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Retrieve API base URL from environment variable or use default
  // Pass --dart-define=API_BASE_URL=http://your-ip:4000/api
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL', 
    defaultValue: 'http://10.23.231.85:4000/api'
  );
  late final Dio _dio;

  // Initialize Dio with interceptor
  Future<void> initialize() async {
    // Ensure SharedPreferences is ready if needed ahead of time
    // though we access it in the interceptor which is async.
    // However, making initialize async ensures main() waits for it.
    
    const bool isRelease = bool.fromEnvironment('dart.vm.product');
    if (isRelease && !_baseUrl.startsWith('https://')) {
      print('⚠️ Warning: Using insecure HTTP URL in release build: $_baseUrl');
    }

    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Add interceptor to automatically load token from storage before every request
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Load token from SharedPreferences before every request
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('auth_token');
        
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
          print('🔑 Token attached for ${options.path}');
        } else {
          print('⚠️ No token found in storage for ${options.path}');
        }
        
        print('📡 API Request: ${options.method} ${options.baseUrl}${options.path}');
        if (options.queryParameters.isNotEmpty) {
          print('   Query: ${options.queryParameters}');
        }
        
        return handler.next(options);
      },
      onError: (error, handler) {
        print('❌ API Error: ${error.response?.statusCode} - ${error.message}');
        print('   URL: ${error.requestOptions.baseUrl}${error.requestOptions.path}');
        if (error.response?.statusCode == 401) {
          print('❌ Unauthorized! Token might be invalid or expired');
        }
        if (error.response?.statusCode == 404) {
          print('❌ Not Found! Endpoint does not exist on backend');
          print('   Check if backend route is correct');
        }
        return handler.next(error);
      },
    ));
    
    print('✅ ApiService initialized with token interceptor. Base URL: $_baseUrl');
  }

  // Persist token to storage so interceptor can find it
  Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    print('✅ Token saved to storage via setToken');
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    print('✅ Token cleared from storage via clearToken');
  }

  // ==================== AUTH ENDPOINTS ====================
  
  Future<Response> login(String email, String password) async {
    try {
      return await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> register({
    required String email,
    required String password,
    required String fullName,
    required String phone,
  }) async {
    try {
      return await _dio.post('/auth/register', data: {
        'email': email,
        'password': password,
        'full_name': fullName,
        'phone': phone,
      });
    } catch (e) {
      rethrow;
    }
  }

  // ==================== USER ENDPOINTS ====================
  
  Future<Response> getUserProfile() async {
    try {
      return await _dio.get('/users/profile');
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> updateUserProfile({
    String? fullName,
    String? phone,
    String? address,
  }) async {
    try {
      Map<String, dynamic> data = {};
      if (fullName != null) data['full_name'] = fullName;
      if (phone != null) data['phone'] = phone;
      if (address != null) data['address'] = address;

      return await _dio.put('/users/profile', data: data);
    } catch (e) {
      rethrow;
    }
  }

  // ==================== COMPLAINT ENDPOINTS ====================
  
  Future<Response> submitComplaint({
    required String title,
    required String description,
    required String locationAddress,
    required double latitude,
    required double longitude,
    required String category,
    required List<String> images,
    bool isAnonymous = false,
  }) async {
    try {
      return await _dio.post('/complaints', data: {
        'title': title,
        'description': description,
        'location_address': locationAddress,
        'latitude': latitude,
        'longitude': longitude,
        'category': category,
        'images': images,
        'is_anonymous': isAnonymous,
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> getMyComplaints({int page = 1, String status = 'all'}) async {
    try {
      return await _dio.get('/complaints/my-complaints', queryParameters: {
        'page': page,
        'status': status,
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> getNearbyComplaints({
    required double latitude,
    required double longitude,
    int radius = 1000,
  }) async {
    try {
      return await _dio.get('/complaints/nearby', queryParameters: {
        'lat': latitude,
        'lng': longitude,
        'radius': radius,
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> upvoteComplaint(String complaintId) async {
    try {
      return await _dio.post('/complaints/$complaintId/upvote');
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> removeUpvote(String complaintId) async {
    try {
      return await _dio.delete('/complaints/$complaintId/upvote');
    } catch (e) {
      rethrow;
    }
  }

  // ==================== TEST ENDPOINT ====================
  
  Future<Response> testJwt() async {
    try {
      return await _dio.get('/test-jwt');
    } catch (e) {
      rethrow;
    }
  }
}

