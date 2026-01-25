import { db } from '../utils/db.js';
import crypto from 'crypto';

const ComplaintController = {
  create: async (req, res) => {
    try {
      const { userId } = req.payload;
      const {
        title, description, location_address, landmark,
        latitude, longitude, category, images, is_anonymous
      } = req.body;

      // Fix: Validate lat/long properly (allow 0) and check finiteness
      if (!title || !description || !location_address || latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
        return res.status(400).json({
          message: 'Missing required fields',
        });
      }

      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      
      if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
        return res.status(400).json({ message: 'Invalid latitude/longitude' });
      }

      // Fetch user to get details if not anonymous
      let citizenName = 'Anonymous';
      let citizenEmail = 'anonymous@example.com';
      let citizenPhone = '0000000000';
      let userIdToSave = null;

      if (!is_anonymous) {
        const user = await db.user.findUnique({ where: { id: userId } });
        if (user) {
          citizenName = user.full_name;
          citizenEmail = user.email;
          citizenPhone = user.phone || '';
          userIdToSave = userId;
        }
      }

      // Generate complaint number securely to avoid race conditions
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      // Use random suffix instead of count+1 to prevent collisions
      const suffix = crypto.randomUUID().split('-')[0].toUpperCase();
      const complaintNumber = `CMP${dateStr}-${suffix}`;

      // Create complaint using standard Prisma
      const complaint = await db.complaint.create({
        data: {
          complaint_number: complaintNumber,
          user_id: userIdToSave,
          citizen_name: citizenName,
          citizen_email: citizenEmail,
          citizen_phone: citizenPhone,
          title,
          description,
          category: category || 'pothole',
          location_address,
          landmark: landmark || '',
          latitude: latNum,
          longitude: lngNum,
        }
      });

      // Add images (mock handling where images is array of URLs)
      if (images && Array.isArray(images)) {
        for (const imgUrl of images) {
           await db.complaintImage.create({
             data: {
               complaint_id: complaint.id,
               image_url: imgUrl,
               uploaded_by: userIdToSave
             }
           });
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        data: {
          complaint_id: complaint.id,
          complaintNumber: complaint.complaint_number, // Consistent casing
          status: 'Submitted',
          created_at: complaint.created_at
        }
      });

    } catch (error) {
      console.error('Submit complaint error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  getMyComplaints: async (req, res) => {
    try {
      const { userId } = req.payload;
      const { page = 1, limit = 20, status } = req.query;
      
      const skip = (page - 1) * limit;
      const where = { user_id: userId };
      
      // Map frontend status 'all' to undefined (no filter)
      if (status && status !== 'all') {
          const statusMap = {
              'pending': 'Submitted', // 'pending' in UI maps to 'Submitted' in DB
              'submitted': 'Submitted',
              'under_review': 'Under_Review',
              'in_progress': 'In_Progress',
              'resolved': 'Resolved',
              'rejected': 'Rejected', // Added rejected mapping
              'closed': 'Closed'
          };
          
          const mappedStatus = statusMap[status.toLowerCase()] || statusMap[status];

          if (mappedStatus) {
            where.status = mappedStatus;
          } else {
             // Optional: Return error or ignore invalid status? 
             // Ignoring to prevent crashing on random strings, or return 400
             // where.status = status; // Fallback to raw status if not mapped? Risk of enum error
          }
      }

      const complaints = await db.complaint.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { created_at: 'desc' },
        include: { images: true }
      });

      const total = await db.complaint.count({ where });

      return res.json({
        success: true,
        data: {
          complaints,
          pagination: {
            current_page: Number(page),
            total_items: total,
            total_pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get my complaints error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  getNearby: async (req, res) => {
     try {
       const { lat, lng, radius = 1000 } = req.query;
       
       if (lat === undefined || lat === null || lat === '' || lng === undefined || lng === null || lng === '') {
         return res.status(400).json({ message: 'lat and lng required' });
       }

       const userLat = parseFloat(lat);
       const userLng = parseFloat(lng);
       const maxRadius = parseFloat(radius);

       if (!Number.isFinite(userLat) || !Number.isFinite(userLng) || !Number.isFinite(maxRadius)) {
         return res.status(400).json({ message: 'Invalid lat/lng/radius' });
       }

       // Fetch all complaints and calculate distance using Haversine formula
       // For production, you'd want to use PostGIS or add bounds filtering first
       const allComplaints = await db.complaint.findMany({
         select: {
           id: true,
           complaint_number: true,
           title: true,
           status: true,
           severity: true,
           location_address: true,
           latitude: true,
           longitude: true,
           created_at: true,
           images: {
             where: { is_primary: true },
             take: 1
           }
         }
       });

       const nearbyComplaints = allComplaints
         .map(complaint => {
           // Haversine formula for distance in meters
           const R = 6371e3; // Earth radius in meters
           const φ1 = userLat * Math.PI / 180;
           const φ2 = complaint.latitude * Math.PI / 180;
           const Δφ = (complaint.latitude - userLat) * Math.PI / 180;
           const Δλ = (complaint.longitude - userLng) * Math.PI / 180;

           const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                     Math.cos(φ1) * Math.cos(φ2) *
                     Math.sin(Δλ/2) * Math.sin(Δλ/2);
           const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
           const distance = R * c;

           return {
             ...complaint,
             distance_meters: Math.round(distance),
             image_thumbnail: complaint.images[0]?.image_thumbnail_url || null
           };
         })
         .filter(c => c.distance_meters <= maxRadius)
         .sort((a, b) => a.distance_meters - b.distance_meters)
         .slice(0, 20);

       return res.json({
         success: true,
         data: {
           complaints: nearbyComplaints,
           total_count: nearbyComplaints.length
         }
       });

     } catch (error) {
        console.error('Get nearby error:', error);
        return res.status(500).json({ message: 'Internal server error' });
     }
  },

  toggleUpvote: async (req, res) => {
    try {
        const { userId } = req.payload;
        const { complaintId } = req.params;
        const id = parseInt(complaintId);
        
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid complaint ID' });
        }

        // Use transaction for atomic operation
        const result = await db.$transaction(async (tx) => {
            const existing = await tx.complaintUpvote.findUnique({
                where: {
                    complaint_id_user_id: {
                        complaint_id: id,
                        user_id: userId
                    }
                }
            });

            if (existing) {
                // Remove
                await tx.complaintUpvote.delete({ where: { id: existing.id } });
                await tx.complaint.update({
                    where: { id },
                    data: { upvotes_count: { decrement: 1 } }
                });
                return { action: 'removed', has_upvoted: false };
            } else {
                // Add
                await tx.complaintUpvote.create({
                    data: {
                        complaint_id: id,
                        user_id: userId
                    }
                });
                await tx.complaint.update({
                    where: { id },
                    data: { upvotes_count: { increment: 1 } }
                });
                return { action: 'added', has_upvoted: true };
            }
        });

        if (result.action === 'removed') {
             return res.json({ success: true, message: 'Upvote removed', has_upvoted: false });
        } else {
             return res.json({ success: true, message: 'Complaint upvoted', has_upvoted: true });
        }

    } catch (error) {
        console.error('Toggle upvote error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
  },

  removeUpvote: async (req, res) => {
      try {
          const { userId } = req.payload;
          const { complaintId } = req.params;
          const id = parseInt(complaintId);
          
          if (isNaN(id)) {
              return res.status(400).json({ message: 'Invalid complaint ID' });
          }
          
          await db.$transaction(async (tx) => {
              const existing = await tx.complaintUpvote.findUnique({
                  where: {
                      complaint_id_user_id: {
                          complaint_id: id,
                          user_id: userId
                      }
                  }
              });

              if (existing) {
                  await tx.complaintUpvote.delete({ where: { id: existing.id } });
                  await tx.complaint.update({
                      where: { id },
                      data: { upvotes_count: { decrement: 1 } }
                  });
              }
              // If not existing, do nothing (idempotent)
          });
          
          return res.json({ success: true, message: 'Upvote removed', has_upvoted: false });

      } catch (error) {
          console.error('Remove upvote error:', error);
          return res.status(500).json({ message: 'Internal server error' });
      }
  }
};

export default ComplaintController;
