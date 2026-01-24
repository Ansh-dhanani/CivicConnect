import 'package:get/get.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../views/main_screen.dart';
import '../views/login_screen.dart';

class AuthController extends GetxController {
  final ApiService _apiService = ApiService();
  
  var isLoading = false.obs;
  var isAuthenticated = false.obs;
  var userEmail = ''.obs;
  var authToken = ''.obs;

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
        isAuthenticated.value = true;
        
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

  void register(String email, String password) async {
    try {
      isLoading.value = true;
      final response = await _apiService.register(email, password);
      
      if (response.statusCode == 201) {
        final data = response.data['data'];
        final token = data['accessToken'];
        final user = data['user'];

        authToken.value = token;
        userEmail.value = user['email'];
        isAuthenticated.value = true;

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

  void logout() {
    isAuthenticated.value = false;
    userEmail.value = '';
    authToken.value = '';
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
