import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/complaint_controller.dart';

class MyComplaintsScreen extends StatefulWidget {
  const MyComplaintsScreen({super.key});

  @override
  State<MyComplaintsScreen> createState() => _MyComplaintsScreenState();
}

class _MyComplaintsScreenState extends State<MyComplaintsScreen> {
  // Use Get.put to ensure controller is initialized
  final ComplaintController complaintController = Get.put(ComplaintController());
  String selectedStatus = 'all';

  @override
  void initState() {
    super.initState();
    print('📱 MyComplaintsScreen initialized');
    _loadComplaints();
  }

  Future<void> _loadComplaints() async {
    try {
      print('📥 Fetching complaints with status: $selectedStatus');
      await complaintController.fetchMyComplaints(status: selectedStatus);
      print('✅ Complaints loaded: ${complaintController.myComplaints.length}');
    } catch (e) {
      print('❌ Error loading complaints: $e');
      Get.snackbar(
        'Error',
        'Failed to load complaints: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Complaints'),
        centerTitle: true,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              setState(() {
                selectedStatus = value;
              });
              _loadComplaints();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'all', child: Text('All')),
              const PopupMenuItem(value: 'pending', child: Text('Pending')),
              const PopupMenuItem(value: 'in_progress', child: Text('In Progress')),
              const PopupMenuItem(value: 'resolved', child: Text('Resolved')),
              const PopupMenuItem(value: 'rejected', child: Text('Rejected')),
            ],
          ),
        ],
      ),
      body: Obx(() {
        if (complaintController.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (complaintController.myComplaints.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.inbox_outlined,
                  size: 80,
                  color: Colors.grey.shade400,
                ),
                const SizedBox(height: 16),
                Text(
                  'No complaints found',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Start reporting issues in your area',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: _loadComplaints,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: complaintController.myComplaints.length,
            itemBuilder: (context, index) {
              final complaint = complaintController.myComplaints[index];
              return _buildComplaintCard(complaint);
            },
          ),
        );
      }),
    );
  }

  Widget _buildComplaintCard(dynamic complaint) {
    try {
      final status = complaint['status']?.toString() ?? 'pending';
      final title = complaint['title']?.toString() ?? 'No Title';
      final description = complaint['description']?.toString() ?? '';
      final category = complaint['category']?.toString() ?? 'other';
      final upvotes = complaint['upvote_count'] ?? complaint['upvotes'] ?? 0;
      final createdAt = complaint['created_at']?.toString() ?? '';
      
      // Debug: Print raw complaint data
      print('📦 Raw complaint data:');
      print('   Images field: ${complaint['images']}');
      print('   Images type: ${complaint['images'].runtimeType}');
      
      // Handle images - could be array of strings or array of objects
      List<String> imageUrls = [];
      if (complaint['images'] != null) {
        final imagesData = complaint['images'];
        print('   Processing images data: $imagesData');
        
        if (imagesData is List) {
          print('   Images is a List with ${imagesData.length} items');
          for (var i = 0; i < imagesData.length; i++) {
            var img = imagesData[i];
            print('   Image $i: $img (type: ${img.runtimeType})');
            
            if (img is String) {
              imageUrls.add(img);
              print('   ✅ Added string URL: $img');
            } else if (img is Map) {
              print('   Image is Map with keys: ${img.keys}');
              if (img['url'] != null) {
                imageUrls.add(img['url'].toString());
                print('   ✅ Added URL from map: ${img['url']}');
              } else if (img['image_url'] != null) {
                imageUrls.add(img['image_url'].toString());
                print('   ✅ Added image_url from map: ${img['image_url']}');
              }
            }
          }
        }
      }
      
      print('   Final imageUrls: $imageUrls');
      print('   Total images: ${imageUrls.length}');

      Color statusColor;
      IconData statusIcon;
      
      switch (status.toLowerCase()) {
        case 'resolved':
          statusColor = Colors.green;
          statusIcon = Icons.check_circle;
          break;
        case 'in_progress':
          statusColor = Colors.orange;
          statusIcon = Icons.pending;
          break;
        case 'rejected':
          statusColor = Colors.red;
          statusIcon = Icons.cancel;
          break;
        default:
          statusColor = Colors.blue;
          statusIcon = Icons.hourglass_empty;
      }

      return Card(
        margin: const EdgeInsets.only(bottom: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 2,
        child: InkWell(
          onTap: () => _showComplaintDetailDialog(
            title: title,
            description: description,
            status: status,
            category: category,
            upvotes: upvotes,
            createdAt: createdAt,
            imageUrls: imageUrls,
            statusColor: statusColor,
            statusIcon: statusIcon,
          ),
          borderRadius: BorderRadius.circular(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image if available
              if (imageUrls.isNotEmpty)
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                  child: Image.network(
                    imageUrls[0],
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 200,
                        color: Colors.grey.shade200,
                        child: const Icon(Icons.broken_image, size: 50),
                      );
                    },
                  ),
                ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status badge
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(statusIcon, size: 16, color: statusColor),
                          const SizedBox(width: 4),
                          Text(
                            status.toUpperCase(),
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    // Category badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.deepPurple.shade50,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        category.toUpperCase(),
                        style: TextStyle(
                          color: Colors.deepPurple.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                // Description
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade700,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                // Footer
                Row(
                  children: [
                    Icon(Icons.thumb_up_outlined, size: 16, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text(
                      '$upvotes',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                    const SizedBox(width: 16),
                    Icon(Icons.access_time, size: 16, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text(
                      _formatDate(createdAt),
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ));
    } catch (e) {
      print('❌ Error building complaint card: $e');
      print('   Complaint data: $complaint');
      return Card(
        margin: const EdgeInsets.only(bottom: 16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text('Error loading complaint: $e'),
        ),
      );
    }
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays > 0) {
        return '${difference.inDays}d ago';
      } else if (difference.inHours > 0) {
        return '${difference.inHours}h ago';
      } else if (difference.inMinutes > 0) {
        return '${difference.inMinutes}m ago';
      } else {
        return 'Just now';
      }
    } catch (e) {
      return dateStr;
    }
  }

  void _showComplaintDetailDialog({
    required String title,
    required String description,
    required String status,
    required String category,
    required int upvotes,
    required String createdAt,
    required List<String> imageUrls,
    required Color statusColor,
    required IconData statusIcon,
  }) {
    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 600, maxHeight: 700),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with close button
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Complaint Details',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Get.back(),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              
              // Scrollable content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Images gallery
                      if (imageUrls.isNotEmpty) ...[
                        SizedBox(
                          height: 250,
                          child: PageView.builder(
                            itemCount: imageUrls.length,
                            itemBuilder: (context, index) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: Image.network(
                                    imageUrls[index],
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        color: Colors.grey.shade200,
                                        child: const Icon(Icons.broken_image, size: 50),
                                      );
                                    },
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        if (imageUrls.length > 1)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Center(
                              child: Text(
                                '${imageUrls.length} images',
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        const SizedBox(height: 16),
                      ],
                      
                      // Status and Category badges
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: statusColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(statusIcon, size: 16, color: statusColor),
                                const SizedBox(width: 4),
                                Text(
                                  status.toUpperCase(),
                                  style: TextStyle(
                                    color: statusColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.deepPurple.shade50,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              category.toUpperCase(),
                              style: TextStyle(
                                color: Colors.deepPurple.shade700,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Title
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      // Description
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey.shade800,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Metadata
                      Row(
                        children: [
                          Icon(Icons.thumb_up_outlined, size: 18, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(
                            '$upvotes upvotes',
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                          const SizedBox(width: 16),
                          Icon(Icons.access_time, size: 18, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(
                            _formatDate(createdAt),
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
