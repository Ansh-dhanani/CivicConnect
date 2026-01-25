import 'dart:io';
import 'package:dio/dio.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';

class CloudinaryService {
  // Use environment variables or pass these in
  // Run with: flutter run --dart-define=CLOUDINARY_CLOUD_NAME=your_name
  static const String cloudName = String.fromEnvironment('CLOUDINARY_CLOUD_NAME', defaultValue: 'do77spm1z');
  static const String apiKey = String.fromEnvironment('CLOUDINARY_API_KEY', defaultValue: '859591785377419');
  
  // Default upload preset for development - create this in Cloudinary or pass via env
  static const String defaultUploadPreset = String.fromEnvironment('CLOUDINARY_UPLOAD_PRESET', defaultValue: 'civic_connect_unsigned');
  
  final Dio _dio = Dio();

  /// Upload image to Cloudinary using UNSIGNED upload
  /// Requires an upload preset to be configured in Cloudinary Dashboard
  Future<String> uploadImage(File imageFile, {String? uploadPreset}) async {
    try {
      final preset = uploadPreset ?? defaultUploadPreset;
      final url = 'https://api.cloudinary.com/v1_1/$cloudName/image/upload';
      
      // Create form data validation
      FormData formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.path.split(Platform.pathSeparator).last,
        ),
        'upload_preset': preset,
        'folder': 'civic_connect/complaints', // Folder can be defined in preset too
      });

      // Upload to Cloudinary
      final response = await _dio.post(
        url,
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );

      if (response.statusCode == 200) {
        return response.data['secure_url'];
      } else {
        throw Exception('Failed to upload image: ${response.statusCode}');
      }
    } catch (e) {
      print('Cloudinary upload error. Ensure you have an UNSIGNED upload preset named "$defaultUploadPreset" or pass one.');
      throw Exception('Error uploading image: $e');
    }
  }

  /// Upload multiple images to Cloudinary
  Future<List<String>> uploadMultipleImages(List<File> imageFiles, {String? uploadPreset}) async {
    List<String> uploadedUrls = [];
    
    for (File imageFile in imageFiles) {
      try {
        String url = await uploadImage(imageFile, uploadPreset: uploadPreset);
        uploadedUrls.add(url);
      } catch (e) {
        print('Failed to upload ${imageFile.path}: $e');
      }
    }
    
    return uploadedUrls;
  }
}
