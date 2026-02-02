import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../controllers/complaint_controller.dart';

class CaptureScreen extends StatefulWidget {
  const CaptureScreen({super.key});

  @override
  State<CaptureScreen> createState() => _CaptureScreenState();
}

class _CaptureScreenState extends State<CaptureScreen> {
  final ComplaintController complaintController = Get.put(ComplaintController());
  final ImagePicker _picker = ImagePicker();

  Future<void> _captureImage() async {
    // Request camera permission
    final cameraStatus = await Permission.camera.request();
    
    if (cameraStatus.isDenied) {
      Get.snackbar(
        'Permission Denied',
        'Camera permission is required to take photos',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    if (cameraStatus.isPermanentlyDenied) {
      Get.snackbar(
        'Permission Required',
        'Please enable camera permission in app settings',
        snackPosition: SnackPosition.BOTTOM,
        mainButton: TextButton(
          onPressed: () => openAppSettings(),
          child: const Text('Open Settings'),
        ),
      );
      return;
    }

    // Capture image
    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
    );

    if (photo != null) {
      // Show complaint form dialog
      _showComplaintForm(File(photo.path));
    }
  }

  Future<void> _pickFromGallery() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );

    if (image != null) {
      _showComplaintForm(File(image.path));
    }
  }

  Future<Position?> _getCurrentLocation() async {
    try {
      // Request location permission
      final locationStatus = await Permission.location.request();
      
      if (locationStatus.isDenied) {
        Get.snackbar(
          'Permission Denied',
          'Location permission is required to tag complaints',
          snackPosition: SnackPosition.BOTTOM,
        );
        return null;
      }
      
      if (locationStatus.isPermanentlyDenied) {
        Get.snackbar(
          'Permission Required',
          'Please enable location permission in app settings',
          snackPosition: SnackPosition.BOTTOM,
          mainButton: TextButton(
            onPressed: () => openAppSettings(),
            child: const Text('Open Settings'),
          ),
        );
        return null;
      }

      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        Get.snackbar(
          'Location Disabled',
          'Please enable location services in device settings',
          snackPosition: SnackPosition.BOTTOM,
        );
        return null;
      }

      // Get current position with high accuracy
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      print('📍 Location obtained: ${position.latitude}, ${position.longitude}');
      return position;
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to get location: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
      return null;
    }
  }

  void _showComplaintForm(File imageFile) {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    final locationController = TextEditingController();
    String selectedCategory = 'pothole';
    bool isAnonymous = false;

    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: StatefulBuilder(
          builder: (context, setDialogState) {
            return SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Submit Complaint',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Get.back(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Image preview
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(
                        imageFile,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Title field
                    TextField(
                      controller: titleController,
                      decoration: InputDecoration(
                        labelText: 'Title',
                        prefixIcon: const Icon(Icons.title),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Description field
                    TextField(
                      controller: descriptionController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: 'Description',
                        prefixIcon: const Icon(Icons.description),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Location field
                    TextField(
                      controller: locationController,
                      decoration: InputDecoration(
                        labelText: 'Location Address',
                        prefixIcon: const Icon(Icons.location_on),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Category dropdown
                    DropdownButtonFormField<String>(
                      value: selectedCategory,
                      decoration: InputDecoration(
                        labelText: 'Category',
                        prefixIcon: const Icon(Icons.category),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'pothole', child: Text('Pothole')),
                        DropdownMenuItem(value: 'streetlight', child: Text('Street Light')),
                        DropdownMenuItem(value: 'garbage', child: Text('Garbage')),
                        DropdownMenuItem(value: 'drainage', child: Text('Drainage')),
                        DropdownMenuItem(value: 'other', child: Text('Other')),
                      ],
                      onChanged: (value) {
                        setDialogState(() {
                          selectedCategory = value!;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    // Anonymous checkbox
                    CheckboxListTile(
                      title: const Text('Submit Anonymously'),
                      value: isAnonymous,
                      onChanged: (value) {
                        setDialogState(() {
                          isAnonymous = value ?? false;
                        });
                      },
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                    ),
                    const SizedBox(height: 20),
                    // Submit button
                    Obx(() => complaintController.isLoading.value
                        ? const Center(child: CircularProgressIndicator())
                        : ElevatedButton(
                            onPressed: () async {
                              print('🚀 Submit button clicked');
                              
                              if (titleController.text.isEmpty ||
                                  descriptionController.text.isEmpty ||
                                  locationController.text.isEmpty) {
                                Get.snackbar(
                                  'Error',
                                  'Please fill all fields',
                                  snackPosition: SnackPosition.BOTTOM,
                                );
                                return;
                              }

                              print('✅ Form validation passed');
                              print('📝 Title: ${titleController.text}');
                              print('📝 Description: ${descriptionController.text}');
                              print('📝 Location: ${locationController.text}');
                              print('📝 Category: $selectedCategory');

                              // Get current location
                              print('📍 Requesting location...');
                              Position? position = await _getCurrentLocation();
                              if (position == null) {
                                Get.snackbar(
                                  'Error',
                                  'Could not get location. Please enable location services.',
                                  snackPosition: SnackPosition.BOTTOM,
                                );
                                return;
                              }

                              print('✅ Location obtained: ${position.latitude}, ${position.longitude}');
                              print('📤 Submitting complaint...');

                              // Submit complaint
                              bool success = await complaintController.submitComplaint(
                                title: titleController.text,
                                description: descriptionController.text,
                                locationAddress: locationController.text,
                                latitude: position.latitude,
                                longitude: position.longitude,
                                category: selectedCategory,
                                imageFiles: [imageFile],
                                isAnonymous: isAnonymous,
                              );

                              print('📊 Submission result: $success');

                              if (success) {
                                print('✅ Complaint submitted successfully!');
                                Get.back(); // Close dialog
                              } else {
                                print('❌ Complaint submission failed');
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              backgroundColor: Theme.of(context).primaryColor,
                              foregroundColor: Colors.white,
                            ),
                            child: const Text(
                              'Submit Complaint',
                              style: TextStyle(fontSize: 16),
                            ),
                          )),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Capture & Complain"),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              height: 200,
              width: 200,
              decoration: BoxDecoration(
                color: Colors.deepPurple.shade50,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.deepPurple.withOpacity(0.2),
                    blurRadius: 20,
                    spreadRadius: 5,
                  )
                ],
              ),
              child: IconButton(
                iconSize: 100,
                icon: const Icon(Icons.camera_alt_rounded, color: Colors.deepPurple),
                onPressed: _captureImage,
              ),
            ),
            const SizedBox(height: 30),
            Text(
              "Spot an issue?",
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.deepPurple,
                  ),
            ),
            const SizedBox(height: 10),
            const Text(
              "Tap the camera to report it now.",
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 30),
            // Gallery button
            OutlinedButton.icon(
              onPressed: _pickFromGallery,
              icon: const Icon(Icons.photo_library),
              label: const Text('Choose from Gallery'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
