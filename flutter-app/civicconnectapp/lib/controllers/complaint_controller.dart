import 'dart:io';
import 'package:get/get.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../services/cloudinary_service.dart';

class ComplaintController extends GetxController {
  final ApiService _apiService = ApiService();
  final CloudinaryService _cloudinaryService = CloudinaryService();
  
  var isLoading = false.obs;
  var isUploading = false.obs;
  var uploadProgress = 0.0.obs;
  var myComplaints = <dynamic>[].obs;
  var nearbyComplaints = <dynamic>[].obs;

  // Submit a new complaint
  Future<bool> submitComplaint({
    required String title,
    required String description,
    required String locationAddress,
    required double latitude,
    required double longitude,
    required String category,
    required List<File> imageFiles,
    bool isAnonymous = false,
  }) async {
    try {
      isLoading.value = true;
      isUploading.value = true;
      
      // Upload images to Cloudinary
      List<String> imageUrls = [];
      if (imageFiles.isNotEmpty) {
        Get.snackbar('Uploading', 'Uploading images...');
        imageUrls = await _cloudinaryService.uploadMultipleImages(imageFiles);
        
        if (imageUrls.isEmpty) {
          Get.snackbar('Error', 'Failed to upload images');
          return false;
        }
      }
      
      isUploading.value = false;
      Get.snackbar('Submitting', 'Submitting complaint...');
      
      // Submit complaint to backend
      final response = await _apiService.submitComplaint(
        title: title,
        description: description,
        locationAddress: locationAddress,
        latitude: latitude,
        longitude: longitude,
        category: category,
        images: imageUrls,
        isAnonymous: isAnonymous,
      );
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        Get.snackbar('Success', 'Complaint submitted successfully');
        return true;
      }
      
      return false;
    } on DioException catch (e) {
      String message = e.response?.data['message'] ?? 'Failed to submit complaint';
      Get.snackbar('Error', message);
      return false;
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred: $e');
      return false;
    } finally {
      isLoading.value = false;
      isUploading.value = false;
    }
  }

  // Get user's complaints
  Future<void> fetchMyComplaints({int page = 1, String status = 'all'}) async {
    try {
      isLoading.value = true;
      final response = await _apiService.getMyComplaints(page: page, status: status);
      
      if (response.statusCode == 200) {
        final data = response.data['data'];
        myComplaints.value = data['complaints'] ?? [];
      }
    } on DioException catch (e) {
      String message = e.response?.data['message'] ?? 'Failed to fetch complaints';
      Get.snackbar('Error', message);
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }

  // Get nearby complaints
  Future<void> fetchNearbyComplaints({
    required double latitude,
    required double longitude,
    int radius = 1000,
  }) async {
    try {
      isLoading.value = true;
      final response = await _apiService.getNearbyComplaints(
        latitude: latitude,
        longitude: longitude,
        radius: radius,
      );
      
      if (response.statusCode == 200) {
        final data = response.data['data'];
        nearbyComplaints.value = data['complaints'] ?? [];
      }
    } on DioException catch (e) {
      String message = e.response?.data['message'] ?? 'Failed to fetch nearby complaints';
      Get.snackbar('Error', message);
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    } finally {
      isLoading.value = false;
    }
  }

  // Upvote a complaint
  Future<void> upvoteComplaint(String complaintId) async {
    try {
      final response = await _apiService.upvoteComplaint(complaintId);
      
      if (response.statusCode == 200) {
        Get.snackbar('Success', 'Upvoted successfully');
        // Refresh complaints list
        await fetchMyComplaints();
      }
    } on DioException catch (e) {
      String message = e.response?.data['message'] ?? 'Failed to upvote';
      Get.snackbar('Error', message);
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    }
  }

  // Remove upvote
  Future<void> removeUpvote(String complaintId) async {
    try {
      final response = await _apiService.removeUpvote(complaintId);
      
      if (response.statusCode == 200) {
        Get.snackbar('Success', 'Upvote removed');
        // Refresh complaints list
        await fetchMyComplaints();
      }
    } on DioException catch (e) {
      String message = e.response?.data['message'] ?? 'Failed to remove upvote';
      Get.snackbar('Error', message);
    } catch (e) {
      Get.snackbar('Error', 'An unexpected error occurred');
    }
  }
}
