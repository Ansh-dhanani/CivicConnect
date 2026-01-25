import 'dart:io';
import 'package:dio/dio.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';

class CloudinaryService {
  // Your Cloudinary credentials - NO UPLOAD PRESET NEEDED!
  static const String cloudName = 'do77spm1z';
  static const String apiKey = '859591785377419';
  static const String apiSecret = 'F6nbfVTv3SjZ86qmGfYGZYMT41U';
  
  final Dio _dio = Dio();

  /// Upload image to Cloudinary using SIGNED upload
  /// Uses cloud name, API key, and API secret
  /// NO upload preset needed!
  Future<String> uploadImage(File imageFile) async {
    try {
      final url = 'https://api.cloudinary.com/v1_1/$cloudName/image/upload';
      
      // Generate timestamp
      final timestamp = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      
      // Create signature
      final folder = 'civic_connect/complaints';
      final paramsToSign = 'folder=$folder&timestamp=$timestamp';
      final signature = _generateSignature(paramsToSign);
      
      // Create form data with API key and signature
      FormData formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.path.split(Platform.pathSeparator).last,
        ),
        'api_key': apiKey,
        'timestamp': timestamp,
        'signature': signature,
        'folder': folder,
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
      throw Exception('Error uploading image: $e');
    }
  }

  /// Generate SHA-1 signature for signed uploads
  String _generateSignature(String paramsToSign) {
    final bytes = utf8.encode('$paramsToSign$apiSecret');
    final digest = sha1.convert(bytes);
    return digest.toString();
  }

  /// Upload multiple images to Cloudinary
  /// Returns a list of secure URLs
  Future<List<String>> uploadMultipleImages(List<File> imageFiles) async {
    List<String> uploadedUrls = [];
    
    for (File imageFile in imageFiles) {
      try {
        String url = await uploadImage(imageFile);
        uploadedUrls.add(url);
      } catch (e) {
        // Continue with other images even if one fails
        print('Failed to upload ${imageFile.path}: $e');
      }
    }
    
    return uploadedUrls;
  }
}
