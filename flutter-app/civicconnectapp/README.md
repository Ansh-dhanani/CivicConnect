# CivicConnect Flutter App

A Flutter mobile application for reporting civic issues like potholes, street lights, garbage, and drainage problems.

## Features

✅ **User Authentication**
- Login and Registration with JWT tokens
- Token persistence in local storage
- Auto-login on app restart

✅ **Complaint Management**
- Camera integration to capture issues
- Gallery image picker
- Upload images to Cloudinary
- Submit complaints with title, description, location, and category
- View all submitted complaints
- Filter complaints by status
- Upvote/downvote complaints

✅ **Location Services**
- Automatic location detection
- GPS coordinates for complaints

✅ **Profile Management**
- View user profile
- View all submitted complaints
- Logout functionality

## Prerequisites

- Flutter SDK (3.6.0 or higher)
- Dart SDK
- Android Studio / VS Code
- A Cloudinary account (for image uploads)

## Setup Instructions

### 1. Install Dependencies

```bash
cd civicconnectapp
flutter pub get
```

### 2. Configure Cloudinary

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Go to your Cloudinary Dashboard
3. Note your **Cloud Name**, **API Key**, and **API Secret**

4. Update the Cloudinary credentials in `lib/services/cloudinary_service.dart`:

**Option 1: Signed Upload (Recommended for Production)**
```dart
static const String cloudName = 'YOUR_CLOUD_NAME';
static const String apiKey = 'YOUR_API_KEY';
static const String apiSecret = 'YOUR_API_SECRET';
```

**Option 2: Unsigned Upload (Easier for Development)**

If you prefer unsigned uploads:
- Go to Settings → Upload in Cloudinary Dashboard
- Scroll to "Upload presets"
- Click "Add upload preset"
- Set signing mode to "Unsigned"
- Save the preset name
- Use the `uploadImageUnsigned` method in the service

Then in `lib/controllers/complaint_controller.dart`, update the upload call:
```dart
// For unsigned upload
imageUrls = await _cloudinaryService.uploadMultipleImages(
  imageFiles, 
  uploadPreset: 'YOUR_UPLOAD_PRESET'
);
```

**Note:** For production apps, use signed uploads (Option 1) for better security.

### 3. Configure API Base URL

Update the API base URL in `lib/services/api_service.dart`:

```dart
static const String _baseUrl = 'http://YOUR_IP_ADDRESS:4000/api';
```

**Note:** 
- For Android Emulator: Use `http://10.0.2.2:4000/api`
- For Physical Device: Use your computer's IP address (e.g., `http://192.168.1.100:4000/api`)
- For iOS Simulator: Use `http://localhost:4000/api`

### 4. Android Permissions

The app requires the following permissions (already configured in AndroidManifest.xml):

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

Add these to `android/app/src/main/AndroidManifest.xml` if not present.

### 5. iOS Permissions

Add these to `ios/Runner/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture images of civic issues</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select images</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need location access to tag complaints with GPS coordinates</string>
```

## Running the App

### Development Mode

```bash
flutter run
```

### Build APK (Android)

```bash
flutter build apk --release
```

### Build iOS

```bash
flutter build ios --release
```

## Project Structure

```
lib/
├── controllers/
│   ├── auth_controller.dart          # Authentication logic
│   └── complaint_controller.dart     # Complaint management logic
├── services/
│   ├── api_service.dart              # API calls to backend
│   ├── storage_service.dart          # Local storage (SharedPreferences)
│   └── cloudinary_service.dart       # Image upload to Cloudinary
├── views/
│   ├── login_screen.dart             # Login page
│   ├── signup_screen.dart            # Registration page
│   ├── main_screen.dart              # Main navigation
│   ├── capture_screen.dart           # Camera & complaint submission
│   ├── profile_screen.dart           # User profile
│   └── my_complaints_screen.dart     # List of user complaints
└── main.dart                         # App entry point
```

## API Endpoints Used

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /complaints` - Submit new complaint
- `GET /complaints/my-complaints` - Get user's complaints
- `GET /complaints/nearby` - Get nearby complaints
- `POST /complaints/:id/upvote` - Upvote a complaint
- `DELETE /complaints/:id/upvote` - Remove upvote

## Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  get: ^4.7.3                    # State management & navigation
  dio: ^5.9.0                    # HTTP client
  image_picker: ^1.0.7           # Camera & gallery access
  shared_preferences: ^2.2.2     # Local storage
  geolocator: ^11.0.0           # Location services
  permission_handler: ^11.2.0    # Runtime permissions
  cloudinary_api: ^1.1.1        # Cloudinary SDK for uploads
  cloudinary_url_gen: ^1.8.0    # Cloudinary URL generation
```

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted
- Check AndroidManifest.xml has camera permission
- For iOS, check Info.plist has camera usage description

### Location not working
- Enable location services on device
- Grant location permission to the app
- Check GPS is enabled

### Image upload failing
- Verify Cloudinary credentials are correct
- Check internet connection
- Ensure upload preset is set to "Unsigned"

### API connection issues
- Verify backend server is running
- Check API base URL is correct
- For physical devices, ensure device and computer are on same network
- Check firewall settings

## Features to Implement (Future)

- [ ] Nearby complaints map view
- [ ] Push notifications for complaint updates
- [ ] Image compression before upload
- [ ] Offline mode with sync
- [ ] Dark mode support
- [ ] Multi-language support

## License

This project is part of the CivicConnect system.
