import 'package:get/get.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../views/main_screen.dart';
import '../views/login_screen.dart';

class AuthController extends GetxController {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();
  
  var isLoading = false.obs;
  var isAuthenticated = false.obs;
  var userEmail = ''.obs;
  var authToken = ''.obs;
  var fullName = ''.obs;

  @override
  void onInit() {
    super.onInit();
    checkLoginStatus();
  }

  // Check if user is already logged in
  Future<void> checkLoginStatus() async {
    try {
      final token = await _storageService.getToken();
      if (token != null && token.isNotEmpty) {
        authToken.value = token;
        userEmail.value = await _storageService.getUserEmail() ?? '';
        fullName.value = await _storageService.getFullName() ?? '';
        isAuthenticated.value = true;
        _apiService.setToken(token);
        
        // Navigate to main screen if logged in
        Get.offAll(() => const MainScreen());
      }
    } catch (e) {
      print('Error checking login status: $e');
    }
  }

  void login(String email, String password) async {
    try {
      isLoading.value = true;
      final response = await _apiService.login(email, password);
      
      if (response.statusCode == 200) {
        final data = response.data['data'];
        final token = data['accessToken'];
        final user = data['user'];
        
        authToken.value = token;
        userEmail.value = user['email'];
        fullName.value = user['full_name'] ?? '';
        isAuthenticated.value = true;
        
        // Save to local storage
        await _storageService.saveAuthData(
          token: token,
          email: user['email'],
          userId: user['user_id']?.toString(),
          fullName: user['full_name'],
        );
        
        _apiService.setToken(token);
        
        Get.offAll(() => const MainScreen());
        Get.snackbar('Success', 'Logged in successfully');
      }
    } on DioException catch (e) {
      String message = e.response?.data['message'] ?? 'Login failed';
      Get.snackbar('Error', message);
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }

  void register({
    required String email,
    required String password,
    required String fullName,
    required String phone,
  }) async {
    try {
      isLoading.value = true;
      final response = await _apiService.register(
        email: email,
        password: password,
        fullName: fullName,
        phone: phone,
      );
      
      if (response.statusCode == 201) {
        final data = response.data['data'];
        final token = data['accessToken'];
        final user = data['user'];

        authToken.value = token;
        userEmail.value = user['email'];
        this.fullName.value = user['full_name'] ?? fullName;
        isAuthenticated.value = true;

        // Save to local storage
        await _storageService.saveAuthData(
          token: token,
          email: user['email'],
          userId: user['user_id']?.toString(),
          fullName: user['full_name'] ?? fullName,
        );

        _apiService.setToken(token);

        Get.offAll(() => const MainScreen());
        Get.snackbar('Success', 'Account created successfully');
      }
    } on DioException catch (e) {
      String message = e.response?.data['message'] ?? 'Registration failed';
      Get.snackbar('Error', message);
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }

  void logout() async {
    isAuthenticated.value = false;
    userEmail.value = '';
    authToken.value = '';
    fullName.value = '';
    
    // Clear local storage
    await _storageService.clearAuthData();
    
    _apiService.clearToken();
    Get.offAll(() => LoginScreen());
  }

  void checkJwt() async {
    try {
      final response = await _apiService.testJwt();
      Get.snackbar('JWT Check', response.data['message']);
    } catch (e) {
      Get.snackbar('Error', 'JWT Check failed');
    }
  }
}

