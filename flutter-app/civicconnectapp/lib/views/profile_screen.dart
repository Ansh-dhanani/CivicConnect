import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import 'my_complaints_screen.dart';

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
              final displayName = authController.fullName.value.isNotEmpty
                  ? authController.fullName.value
                  : email.split('@')[0].capitalizeFirst ?? "User";
              // Generate initials
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
              child: Column(
                children: [
                  // My Complaints Card
                  Card(
                    elevation: 0,
                    color: Colors.deepPurple.shade50,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: ListTile(
                      leading: const Icon(Icons.list_alt, color: Colors.deepPurple),
                      title: const Text("My Complaints"),
                      subtitle: const Text("View all your submitted complaints"),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () => Get.to(() => const MyComplaintsScreen()),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Verify Authentication Card
                  Card(
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
                ],
              ),
            ),
             // Add more profile options here if needed
          ],
        ),
      ),
    );
  }
}

