import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final AuthController authController = Get.find<AuthController>();

    return Scaffold(
      appBar: AppBar(
        title: const Text("My Profile"),
        centerTitle: true,
        actions: [
           IconButton(
            icon: const Icon(Icons.logout, color: Colors.red),
            onPressed: () => authController.logout(),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 40),
            Obx(() {
              final email = authController.userEmail.value;
              final displayName = email.split('@')[0].capitalizeFirst ?? "User";
              // Generate initials (e.g., "J" or "JD" from display name)
              // Since display name here is just email prefix, we take first letter
              // If we had full name, we could split by space
              final initials = displayName.isNotEmpty ? displayName[0].toUpperCase() : "U";

              return  Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 60,
                      backgroundColor: Colors.grey.shade200,
                      child: Text(
                        initials,
                        style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      displayName,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      email,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.grey),
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 40),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Card(
                elevation: 0,
                color: Colors.deepPurple.shade50,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: ListTile(
                  leading: const Icon(Icons.verified_user, color: Colors.deepPurple),
                  title: const Text("Verify Authentication"),
                  subtitle: const Text("Test connectivity with backend"),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => authController.checkJwt(),
                ),
              ),
            ),
             // Add more profile options here if needed
          ],
        ),
      ),
    );
  }
}
