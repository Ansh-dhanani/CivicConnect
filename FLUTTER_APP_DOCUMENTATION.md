# CivicConnect Flutter App - Complete Architecture & Flow Documentation

**Framework:** Flutter  
**Platform:** iOS & Android Mobile  
**Users:** Citizens, Field Officers  
**Date:** February 2, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Data Flow Patterns](#data-flow-patterns)
4. [Navigation & Routing](#navigation--routing)
5. [State Management (GetX)](#state-management-getx)
6. [API Integration](#api-integration)
7. [Authentication Flow](#authentication-flow)
8. [Key Features Deep Dive](#key-features-deep-dive)
9. [Camera & Image Upload](#camera--image-upload)
10. [Offline Support](#offline-support)

---

## Architecture Overview

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      MOBILE DEVICE                              │
│                    (iOS / Android)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Screens    │  │   Widgets    │  │   Dialogs    │         │
│  │   (Views)    │  │  (UI Code)   │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               STATE MANAGEMENT LAYER (GetX)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Auth        │  │  Complaint   │  │  Profile     │         │
│  │  Controller  │  │  Controller  │  │  Controller  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  API         │  │  Cloudinary  │  │  Storage     │         │
│  │  Service     │  │  Service     │  │  Service     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Backend   │  │ Cloudinary  │  │   Local     │
│   API       │  │   CDN       │  │   Storage   │
│  (Express)  │  │   (Images)  │  │ (SQLite)    │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Tech Stack Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                       FLUTTER STACK                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Framework & Core                                       │   │
│  │  • Flutter SDK (Latest Stable)                         │   │
│  │  • Dart Language                                       │   │
│  │  • Material Design 3                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  State Management                                       │   │
│  │  • GetX (get: ^4.6.6)                                  │   │
│  │    - State management                                  │   │
│  │    - Dependency injection                              │   │
│  │    - Navigation                                        │   │
│  │    - Reactive programming                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Network & API                                          │   │
│  │  • Dio (dio: ^5.4.0)                                   │   │
│  │    - HTTP client                                       │   │
│  │    - Interceptors                                      │   │
│  │    - File upload/download                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Local Storage                                          │   │
│  │  • shared_preferences (^2.2.2)                         │   │
│  │    - Token storage                                     │   │
│  │    - User preferences                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Camera & Images                                        │   │
│  │  • camera (^0.10.5)                                    │   │
│  │  • image_picker (^1.0.7)                               │   │
│  │  • cached_network_image (^3.3.1)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Image Upload                                           │   │
│  │  • cloudinary_api (^2.0.1)                             │   │
│  │  • cloudinary_url_gen (^1.6.0)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Location & Maps                                        │   │
│  │  • geolocator (^11.0.0)                                │   │
│  │  • geocoding (^3.0.0)                                  │   │
│  │  • google_maps_flutter (^2.5.3)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Utilities                                              │   │
│  │  • intl (^0.19.0) - Date formatting                    │   │
│  │  • timeago (^3.6.0) - Relative time                    │   │
│  │  • permission_handler (^11.2.0)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

### Current & Proposed Structure

```
lib/
├── main.dart                         # App entry point
│
├── app/
│   ├── routes/
│   │   ├── app_routes.dart          # Route names
│   │   └── app_pages.dart           # Route configuration
│   │
│   ├── bindings/                     # Dependency injection bindings
│   │   ├── initial_binding.dart
│   │   ├── auth_binding.dart
│   │   └── complaint_binding.dart
│   │
│   └── middleware/
│       └── auth_middleware.dart      # Route guards
│
├── controllers/                      # GetX Controllers (State)
│   ├── auth_controller.dart
│   ├── complaint_controller.dart
│   ├── profile_controller.dart
│   ├── team_controller.dart          # NEW: For field officers
│   └── notification_controller.dart  # NEW
│
├── services/                         # Business logic & API calls
│   ├── api_service.dart              # Main API client
│   ├── auth_service.dart             # Auth-specific logic
│   ├── complaint_service.dart        # Complaint-specific logic
│   ├── cloudinary_service.dart       # Image upload
│   ├── storage_service.dart          # Local storage
│   ├── location_service.dart         # GPS & geocoding
│   └── notification_service.dart     # Push notifications
│
├── models/                           # Data models
│   ├── user.dart
│   ├── complaint.dart
│   ├── team.dart
│   ├── ward.dart
│   └── api_response.dart
│
├── views/                            # UI Screens
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── signup_screen.dart
│   │   └── forgot_password_screen.dart
│   │
│   ├── home/
│   │   ├── main_screen.dart          # Bottom nav wrapper
│   │   ├── home_screen.dart          # Dashboard/Home tab
│   │   ├── complaints_screen.dart    # My complaints tab
│   │   ├── map_screen.dart           # Nearby complaints map
│   │   └── profile_screen.dart       # Profile tab
│   │
│   ├── complaint/
│   │   ├── capture_screen.dart       # Camera + form
│   │   ├── complaint_detail_screen.dart
│   │   └── complaint_form_screen.dart
│   │
│   ├── team/                         # NEW: Field officer screens
│   │   ├── assigned_complaints_screen.dart
│   │   ├── update_status_screen.dart
│   │   └── completion_screen.dart
│   │
│   └── common/
│       ├── loading_screen.dart
│       └── error_screen.dart
│
├── widgets/                          # Reusable UI components
│   ├── common/
│   │   ├── custom_button.dart
│   │   ├── custom_input.dart
│   │   ├── loading_indicator.dart
│   │   └── error_widget.dart
│   │
│   ├── complaint/
│   │   ├── complaint_card.dart
│   │   ├── complaint_list.dart
│   │   ├── status_badge.dart
│   │   └── severity_badge.dart
│   │
│   └── camera/
│       ├── camera_preview_widget.dart
│       └── image_preview_widget.dart
│
├── utils/                            # Helper functions
│   ├── constants.dart                # App constants
│   ├── validators.dart               # Form validators
│   ├── date_formatter.dart
│   ├── image_helper.dart
│   └── network_helper.dart
│
└── config/
    ├── theme/
    │   ├── app_theme.dart
    │   ├── colors.dart
    │   └── text_styles.dart
    │
    └── environment/
        ├── env.dart
        └── api_config.dart
```

---

## Data Flow Patterns

### 1. Complete Flow: Submit Complaint

```
┌─────────────────────────────────────────────────────────────────┐
│          USER ACTION: Citizen Submits Complaint                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  SCREEN: CaptureScreen                                          │
├─────────────────────────────────────────────────────────────────┤
│  1. User takes photo with camera                                │
│  2. User fills form (title, description, location)              │
│  3. Auto-capture GPS coordinates                                │
│  4. User taps "Submit"                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  CONTROLLER: ComplaintController                                │
├─────────────────────────────────────────────────────────────────┤
│  Future<bool> submitComplaint({...}) async {                    │
│    isLoading.value = true;                                      │
│                                                                 │
│    // STEP 1: Upload images to Cloudinary                      │
│    final imageUrls = await _cloudinaryService                  │
│      .uploadMultipleImages(imageFiles);                        │
│                                                                 │
│    // STEP 2: Submit complaint to backend                      │
│    final response = await _apiService.submitComplaint(         │
│      title: title,                                             │
│      description: description,                                  │
│      images: imageUrls,                                        │
│      ...                                                        │
│    );                                                           │
│                                                                 │
│    isLoading.value = false;                                    │
│    return response.statusCode == 201;                          │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Cloudinary   │  │  API Service │  │   Storage    │
│   Upload     │  │  POST Call   │  │   (Token)    │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       │ URLs            │ Response
       ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  RESPONSE HANDLING                                              │
├─────────────────────────────────────────────────────────────────┤
│  if (success) {                                                 │
│    Get.snackbar('Success', 'Complaint submitted');            │
│    Get.back(); // Return to previous screen                    │
│    myComplaints.refresh(); // Refresh complaints list          │
│  } else {                                                       │
│    Get.snackbar('Error', 'Failed to submit');                 │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Image Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  IMAGE UPLOAD FLOW                              │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Capture Image
──────────────────────
┌──────────────────────────────────────────────────────┐
│  Camera Permission Check                             │
│  ✓ Request permission if not granted                │
│  ✓ Initialize camera controller                     │
│  ✓ Capture image                                     │
│  ✓ Save to temp directory                           │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
STEP 2: Compress & Validate
────────────────────────────
┌──────────────────────────────────────────────────────┐
│  Image Processing                                    │
│  • Compress to reduce file size                     │
│  • Validate image size (max 5MB)                    │
│  • Convert to JPEG format                           │
│  • Add metadata (timestamp, location)               │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
STEP 3: Upload to Cloudinary
─────────────────────────────
┌──────────────────────────────────────────────────────┐
│  CloudinaryService.uploadImage()                     │
│                                                      │
│  final response = await cloudinary.upload(          │
│    file: imageFile,                                 │
│    folder: 'civic_connect/complaints',              │
│    publicId: '${userId}_${timestamp}',              │
│    resourceType: CloudinaryResourceType.image       │
│  );                                                  │
│                                                      │
│  Returns: Cloudinary URL                            │
│  Example: https://res.cloudinary.com/.../image.jpg  │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
STEP 4: Store URL & Submit
───────────────────────────
┌──────────────────────────────────────────────────────┐
│  Add URL to complaint data                           │
│  Submit complaint with image URLs to backend        │
└──────────────────────────────────────────────────────┘

Progress Tracking:
──────────────────
0%   → Image captured
20%  → Compression started
40%  → Compression complete
60%  → Upload started
100% → Upload complete

Error Handling:
───────────────
• Permission denied → Show permission dialog
• File too large → Show compression dialog
• Upload failed → Retry with exponential backoff
• Network error → Queue for later upload
```

---

## Navigation & Routing

### Route Configuration (GetX)

```dart
// app/routes/app_routes.dart
class AppRoutes {
  static const INITIAL = '/';
  static const LOGIN = '/login';
  static const SIGNUP = '/signup';
  static const MAIN = '/main';
  static const CAPTURE = '/capture';
  static const COMPLAINT_DETAIL = '/complaint/:id';
  static const MY_COMPLAINTS = '/my-complaints';
  static const PROFILE = '/profile';
  static const SETTINGS = '/settings';
  
  // Field Officer Routes
  static const ASSIGNED_COMPLAINTS = '/assigned-complaints';
  static const UPDATE_STATUS = '/update-status/:id';
}

// app/routes/app_pages.dart
class AppPages {
  static final routes = [
    GetPage(
      name: AppRoutes.INITIAL,
      page: () => SplashScreen(),
      binding: InitialBinding(),
    ),
    GetPage(
      name: AppRoutes.LOGIN,
      page: () => LoginScreen(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.MAIN,
      page: () => MainScreen(),
      binding: MainBinding(),
      middlewares: [AuthMiddleware()], // Protected route
    ),
    GetPage(
      name: AppRoutes.CAPTURE,
      page: () => CaptureScreen(),
      binding: ComplaintBinding(),
      transition: Transition.cupertino,
    ),
    GetPage(
      name: AppRoutes.COMPLAINT_DETAIL,
      page: () => ComplaintDetailScreen(),
      binding: ComplaintBinding(),
    ),
  ];
}

// main.dart
void main() {
  runApp(
    GetMaterialApp(
      title: 'CivicConnect',
      initialRoute: AppRoutes.INITIAL,
      getPages: AppPages.routes,
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
    ),
  );
}
```

### Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  APP NAVIGATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

App Start
────────
    │
    ▼
┌────────────────┐
│ SplashScreen   │ ← Check if token exists
└────┬───────────┘
     │
     ├─── Has Token ────────┐
     │                      ▼
     │              ┌───────────────┐
     │              │  MainScreen   │
     │              │  (Bottom Nav) │
     │              └───────┬───────┘
     │                      │
     │              ┌───────┴────────────────────┐
     │              │                            │
     │              ▼                            ▼
     │      ┌──────────────┐          ┌──────────────┐
     │      │  HomeScreen  │          │ProfileScreen │
     │      └──────┬───────┘          └──────────────┘
     │             │
     │             ├─→ FAB: Capture Complaint
     │             │   └─→ CaptureScreen
     │             │
     │             ├─→ View Complaint
     │             │   └─→ ComplaintDetailScreen
     │             │
     │             └─→ My Complaints
     │                 └─→ MyComplaintsScreen
     │
     └─── No Token ─────┐
                        ▼
                ┌───────────────┐
                │  LoginScreen  │
                └───────┬───────┘
                        │
                        ├─→ Register
                        │   └─→ SignupScreen
                        │
                        └─→ Login Success
                            └─→ MainScreen
```

### Bottom Navigation Structure

```dart
// views/home/main_screen.dart
class MainScreen extends StatelessWidget {
  final List<Widget> _screens = [
    HomeScreen(),        // Tab 0: Dashboard
    MyComplaintsScreen(), // Tab 1: My Complaints
    MapScreen(),          // Tab 2: Nearby Map
    ProfileScreen(),      // Tab 3: Profile
  ];

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(MainController());

    return Scaffold(
      body: Obx(() => _screens[controller.currentIndex.value]),
      
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Get.toNamed(AppRoutes.CAPTURE),
        label: Text('Report Issue'),
        icon: Icon(Icons.camera_alt),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      
      bottomNavigationBar: Obx(() => BottomNavigationBar(
        currentIndex: controller.currentIndex.value,
        onTap: controller.changePage,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.list_alt),
            label: 'My Reports',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: 'Nearby',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      )),
    );
  }
}
```

---

## State Management (GetX)

### GetX Controller Pattern

```dart
// controllers/complaint_controller.dart
class ComplaintController extends GetxController {
  // Services (injected via binding)
  final ApiService _apiService = Get.find();
  final CloudinaryService _cloudinaryService = Get.find();
  final LocationService _locationService = Get.find();

  // Observable state
  var isLoading = false.obs;
  var isUploading = false.obs;
  var uploadProgress = 0.0.obs;
  var myComplaints = <Complaint>[].obs;
  var selectedComplaint = Rx<Complaint?>(null);

  // Lifecycle hook - called when controller is initialized
  @override
  void onInit() {
    super.onInit();
    fetchMyComplaints();
  }

  // Submit complaint
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

      // Upload images
      List<String> imageUrls = [];
      if (imageFiles.isNotEmpty) {
        Get.snackbar('Uploading', 'Uploading images...');
        
        for (int i = 0; i < imageFiles.length; i++) {
          uploadProgress.value = (i / imageFiles.length);
          final url = await _cloudinaryService.uploadImage(imageFiles[i]);
          imageUrls.add(url);
        }
      }

      isUploading.value = false;
      Get.snackbar('Submitting', 'Submitting complaint...');

      // Submit to backend
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

      if (response.statusCode == 201) {
        Get.snackbar(
          'Success',
          'Complaint submitted successfully',
          backgroundColor: Colors.green,
          colorText: Colors.white,
        );
        
        // Refresh my complaints list
        fetchMyComplaints();
        
        return true;
      }

      return false;
    } on DioException catch (e) {
      _handleError(e);
      return false;
    } finally {
      isLoading.value = false;
      isUploading.value = false;
      uploadProgress.value = 0.0;
    }
  }

  // Fetch user's complaints
  Future<void> fetchMyComplaints({int page = 1, String status = 'all'}) async {
    try {
      isLoading.value = true;
      
      final response = await _apiService.getMyComplaints(
        page: page,
        status: status,
      );

      if (response.statusCode == 200) {
        final data = response.data['data'];
        final complaints = (data['complaints'] as List)
            .map((json) => Complaint.fromJson(json))
            .toList();
        
        myComplaints.value = complaints;
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to fetch complaints');
    } finally {
      isLoading.value = false;
    }
  }

  // Get complaint details
  Future<void> getComplaintDetails(int complaintId) async {
    try {
      isLoading.value = true;
      
      final response = await _apiService.getComplaintById(complaintId);
      
      if (response.statusCode == 200) {
        selectedComplaint.value = Complaint.fromJson(response.data['data']);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to load complaint details');
    } finally {
      isLoading.value = false;
    }
  }

  // Upvote complaint
  Future<void> toggleUpvote(int complaintId) async {
    try {
      // Optimistic update
      final complaint = myComplaints.firstWhere((c) => c.id == complaintId);
      complaint.upvotesCount++;
      myComplaints.refresh();

      await _apiService.upvoteComplaint(complaintId);
    } catch (e) {
      // Rollback on error
      final complaint = myComplaints.firstWhere((c) => c.id == complaintId);
      complaint.upvotesCount--;
      myComplaints.refresh();
      
      Get.snackbar('Error', 'Failed to upvote');
    }
  }

  void _handleError(DioException e) {
    final message = e.response?.data['message'] ?? 'An error occurred';
    Get.snackbar(
      'Error',
      message,
      backgroundColor: Colors.red,
      colorText: Colors.white,
    );
  }
}
```

### Reactive UI with Obx

```dart
// views/home/home_screen.dart
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.find<ComplaintController>();

    return Scaffold(
      appBar: AppBar(title: Text('My Complaints')),
      body: Obx(() {
        // Automatically rebuilds when isLoading or myComplaints change
        if (controller.isLoading.value) {
          return Center(child: CircularProgressIndicator());
        }

        if (controller.myComplaints.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.inbox, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('No complaints yet'),
              ],
            ),
          );
        }

        return ListView.builder(
          itemCount: controller.myComplaints.length,
          itemBuilder: (context, index) {
            final complaint = controller.myComplaints[index];
            return ComplaintCard(complaint: complaint);
          },
        );
      }),
    );
  }
}
```

---

## API Integration

### API Service with Dio

```dart
// services/api_service.dart
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000/api', // Android emulator localhost
  );

  late final Dio _dio;

  Future<void> initialize() async {
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Request interceptor - Add token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await StorageService().getToken();
        
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
          print('🔑 Token attached for ${options.path}');
        }

        print('📡 ${options.method} ${options.baseUrl}${options.path}');
        
        return handler.next(options);
      },
      
      onResponse: (response, handler) {
        print('✅ ${response.statusCode} - ${response.requestOptions.path}');
        return handler.next(response);
      },
      
      onError: (error, handler) async {
        print('❌ ${error.response?.statusCode} - ${error.message}');
        
        if (error.response?.statusCode == 401) {
          // Token expired - logout
          await StorageService().clearToken();
          Get.offAllNamed(AppRoutes.LOGIN);
        }
        
        return handler.next(error);
      },
    ));

    print('✅ ApiService initialized. Base URL: $_baseUrl');
  }

  // ==================== AUTH ENDPOINTS ====================

  Future<Response> login(String email, String password) async {
    return await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> register({
    required String email,
    required String password,
    required String fullName,
    required String phone,
  }) async {
    return await _dio.post('/auth/register', data: {
      'email': email,
      'password': password,
      'full_name': fullName,
      'phone': phone,
    });
  }

  // ==================== USER ENDPOINTS ====================

  Future<Response> getUserProfile() async {
    return await _dio.get('/users/profile');
  }

  Future<Response> updateUserProfile({
    String? fullName,
    String? phone,
    String? address,
  }) async {
    Map<String, dynamic> data = {};
    if (fullName != null) data['full_name'] = fullName;
    if (phone != null) data['phone'] = phone;
    if (address != null) data['address'] = address;

    return await _dio.put('/users/profile', data: data);
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
  }

  Future<Response> getMyComplaints({
    int page = 1,
    String status = 'all',
  }) async {
    return await _dio.get('/complaints/my-complaints', queryParameters: {
      'page': page,
      'status': status,
    });
  }

  Future<Response> getComplaintById(int id) async {
    return await _dio.get('/complaints/$id');
  }

  Future<Response> upvoteComplaint(int id) async {
    return await _dio.post('/complaints/$id/upvote');
  }

  Future<Response> getNearbyComplaints({
    required double latitude,
    required double longitude,
    int radius = 1000,
  }) async {
    return await _dio.get('/complaints/nearby', queryParameters: {
      'lat': latitude,
      'lng': longitude,
      'radius': radius,
    });
  }
}
```

---

## Authentication Flow

### Complete Auth Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

App Launch
──────────
     │
     ▼
┌────────────────────────────────────────┐
│  SplashScreen                          │
│  • Check if token exists in storage   │
└────────┬───────────────────────────────┘
         │
    ┌────┴────┐
    │         │
Has Token   No Token
    │         │
    ▼         ▼
┌───────┐  ┌────────────┐
│ Auto  │  │   Login    │
│ Login │  │   Screen   │
└───┬───┘  └──────┬─────┘
    │             │
    │             │ User enters credentials
    │             │ Taps "Login"
    │             ▼
    │      ┌──────────────────────────────┐
    │      │  AuthController.login()      │
    │      │  • POST /api/auth/login      │
    │      │  • Get tokens                │
    │      │  • Save to storage           │
    │      └──────────┬───────────────────┘
    │                 │
    └─────────────────┤
                      │
                      ▼
          ┌───────────────────────────┐
          │  Store Token & User Data  │
          │  • StorageService.setToken()
          │  • AuthController.setUser()
          └───────────┬───────────────┘
                      │
                      ▼
          ┌───────────────────────────┐
          │  Navigate to MainScreen   │
          │  Get.offAllNamed('/main') │
          └───────────────────────────┘
```

### Auth Controller

```dart
// controllers/auth_controller.dart
class AuthController extends GetxController {
  final ApiService _apiService = Get.find();
  final StorageService _storageService = Get.find();

  var isLoggedIn = false.obs;
  var isLoading = false.obs;
  var user = Rx<User?>(null);

  @override
  void onInit() {
    super.onInit();
    checkLoginStatus();
  }

  Future<void> checkLoginStatus() async {
    final token = await _storageService.getToken();
    
    if (token != null && token.isNotEmpty) {
      isLoggedIn.value = true;
      await fetchUserProfile();
      Get.offAllNamed(AppRoutes.MAIN);
    } else {
      Get.offAllNamed(AppRoutes.LOGIN);
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      isLoading.value = true;

      final response = await _apiService.login(email, password);

      if (response.statusCode == 200) {
        final data = response.data['data'];
        
        // Save token
        await _storageService.setToken(data['accessToken']);
        
        // Save user
        user.value = User.fromJson(data['user']);
        isLoggedIn.value = true;

        Get.snackbar('Success', 'Login successful');
        Get.offAllNamed(AppRoutes.MAIN);
        
        return true;
      }

      return false;
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? 'Login failed';
      Get.snackbar('Error', message);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> register({
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
        
        // Auto-login after registration
        await _storageService.setToken(data['accessToken']);
        user.value = User.fromJson(data['user']);
        isLoggedIn.value = true;

        Get.snackbar('Success', 'Registration successful');
        Get.offAllNamed(AppRoutes.MAIN);
        
        return true;
      }

      return false;
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? 'Registration failed';
      Get.snackbar('Error', message);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    await _storageService.clearToken();
    user.value = null;
    isLoggedIn.value = false;
    Get.offAllNamed(AppRoutes.LOGIN);
  }

  Future<void> fetchUserProfile() async {
    try {
      final response = await _apiService.getUserProfile();
      
      if (response.statusCode == 200) {
        user.value = User.fromJson(response.data['data']);
      }
    } catch (e) {
      print('Failed to fetch profile: $e');
    }
  }
}
```

---

## Camera & Image Upload

### Camera Integration

```dart
// views/complaint/capture_screen.dart
class CaptureScreen extends StatefulWidget {
  @override
  _CaptureScreenState createState() => _CaptureScreenState();
}

class _CaptureScreenState extends State<CaptureScreen> {
  CameraController? _cameraController;
  List<File> capturedImages = [];
  bool isCameraInitialized = false;

  @override
  void initState() {
    super.initState();
    initializeCamera();
  }

  Future<void> initializeCamera() async {
    // Request permission
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      Get.snackbar('Permission Denied', 'Camera permission is required');
      return;
    }

    // Get available cameras
    final cameras = await availableCameras();
    final firstCamera = cameras.first;

    // Initialize controller
    _cameraController = CameraController(
      firstCamera,
      ResolutionPreset.high,
    );

    await _cameraController!.initialize();
    
    setState(() {
      isCameraInitialized = true;
    });
  }

  Future<void> takePicture() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    try {
      // Capture image
      final XFile image = await _cameraController!.takePicture();
      
      // Add to list
      setState(() {
        capturedImages.add(File(image.path));
      });

      Get.snackbar('Success', 'Image captured');

      // Show form after first image
      if (capturedImages.length == 1) {
        showComplaintForm();
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to capture image');
    }
  }

  void showComplaintForm() {
    Get.bottomSheet(
      ComplaintFormSheet(
        images: capturedImages,
        onSubmit: submitComplaint,
      ),
      isScrollControlled: true,
    );
  }

  Future<void> submitComplaint(ComplaintFormData formData) async {
    final controller = Get.find<ComplaintController>();
    
    // Get current location
    final position = await LocationService().getCurrentPosition();

    final success = await controller.submitComplaint(
      title: formData.title,
      description: formData.description,
      locationAddress: formData.locationAddress,
      latitude: position.latitude,
      longitude: position.longitude,
      category: formData.category,
      imageFiles: capturedImages,
      isAnonymous: formData.isAnonymous,
    );

    if (success) {
      Get.back(); // Close form
      Get.back(); // Return to home
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!isCameraInitialized || _cameraController == null) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text('Capture Issue')),
      body: Column(
        children: [
          // Camera preview
          Expanded(
            child: CameraPreview(_cameraController!),
          ),

          // Captured images preview
          if (capturedImages.isNotEmpty)
            Container(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: capturedImages.length,
                itemBuilder: (context, index) {
                  return Stack(
                    children: [
                      Padding(
                        padding: EdgeInsets.all(8),
                        child: Image.file(
                          capturedImages[index],
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 0,
                        right: 0,
                        child: IconButton(
                          icon: Icon(Icons.close, color: Colors.red),
                          onPressed: () {
                            setState(() {
                              capturedImages.removeAt(index);
                            });
                          },
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),

          // Controls
          Container(
            padding: EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Gallery picker
                IconButton(
                  icon: Icon(Icons.photo_library, size: 32),
                  onPressed: pickFromGallery,
                ),

                // Capture button
                FloatingActionButton(
                  onPressed: takePicture,
                  child: Icon(Icons.camera, size: 32),
                ),

                // Submit button
                ElevatedButton(
                  onPressed: capturedImages.isNotEmpty
                      ? showComplaintForm
                      : null,
                  child: Text('Next'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> pickFromGallery() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    
    if (image != null) {
      setState(() {
        capturedImages.add(File(image.path));
      });
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }
}
```

---

## Offline Support

### Offline Queue Pattern

```dart
// services/offline_service.dart
class OfflineService extends GetxService {
  final _storage = GetStorage();
  final _queue = <PendingComplaint>[].obs;

  static const String QUEUE_KEY = 'offline_queue';

  @override
  void onInit() {
    super.onInit();
    loadQueue();
    listenToConnectivity();
  }

  void listenToConnectivity() {
    Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        syncQueue();
      }
    });
  }

  Future<void> addToQueue(PendingComplaint complaint) async {
    _queue.add(complaint);
    await _saveQueue();
    Get.snackbar('Offline', 'Complaint queued for upload');
  }

  Future<void> syncQueue() async {
    if (_queue.isEmpty) return;

    Get.snackbar('Syncing', 'Uploading pending complaints...');

    final toRemove = <PendingComplaint>[];

    for (final pending in _queue) {
      try {
        // Upload images
        final imageUrls = await uploadImages(pending.imageFiles);

        // Submit complaint
        await ApiService().submitComplaint(
          title: pending.title,
          description: pending.description,
          locationAddress: pending.locationAddress,
          latitude: pending.latitude,
          longitude: pending.longitude,
          category: pending.category,
          images: imageUrls,
        );

        toRemove.add(pending);
      } catch (e) {
        print('Failed to sync: $e');
      }
    }

    _queue.removeWhere((item) => toRemove.contains(item));
    await _saveQueue();

    if (toRemove.isNotEmpty) {
      Get.snackbar('Success', '${toRemove.length} complaints uploaded');
    }
  }

  Future<void> loadQueue() async {
    final data = _storage.read<List>(QUEUE_KEY);
    if (data != null) {
      _queue.value = data
          .map((json) => PendingComplaint.fromJson(json))
          .toList();
    }
  }

  Future<void> _saveQueue() async {
    await _storage.write(
      QUEUE_KEY,
      _queue.map((c) => c.toJson()).toList(),
    );
  }
}
```

---

## Summary

This documentation provides complete architecture and implementation patterns for the CivicConnect Flutter mobile app:

✅ **Clean Architecture** - MVC pattern with GetX  
✅ **Reactive State Management** - GetX observables  
✅ **Professional Folder Structure** - Organized by features  
✅ **API Integration** - Dio with interceptors, token management  
✅ **Authentication** - Auto-login, token persistence  
✅ **Camera Integration** - Camera + gallery picker  
✅ **Image Upload** - Cloudinary integration with progress  
✅ **Navigation** - GetX routing with middleware  
✅ **Offline Support** - Queue and sync pattern  
✅ **Location Services** - GPS and geocoding  
✅ **Error Handling** - Comprehensive error management  

---

*Last Updated: February 2, 2026*  
*Version: 1.0 (Current + Proposed Architecture)*
