const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers, totalOfficers, totalComplaints,
      pendingComplaints, resolvedComplaints, inProgressComplaints
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'officer', isActive: true }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
      Complaint.countDocuments({ status: 'In Progress' }),
    ]);

    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalOfficers, totalComplaints,
        pendingComplaints, resolvedComplaints, inProgressComplaints,
        categoryStats, priorityStats, monthlyTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/complaints
router.get('/complaints', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, category, priority, assignedTo, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo === 'unassigned') query.assignedTo = null;
    else if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true, total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/complaints/:id/assign
router.put('/complaints/:id/assign', protect, authorize('admin'), async (req, res) => {
  try {
    const { officerId } = req.body;

    const officer = await User.findOne({ _id: officerId, role: 'officer', isActive: true });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer not found.' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: officerId,
        status: 'Assigned',
        $push: {
          statusHistory: {
            status: 'Assigned',
            updatedBy: req.user._id,
            comment: `Assigned to ${officer.name}`
          }
        }
      },
      { new: true }
    )
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email department');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({ success: true, message: `Complaint assigned to ${officer.name}.`, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/officers
router.post('/officers', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const officer = await User.create({
      name, email, password, phone, department, role: 'officer'
    });

    res.status(201).json({ success: true, message: 'Support officer created.', officer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/officers
router.get('/officers', protect, authorize('admin'), async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer', isActive: true })
      .select('name email department');
    res.json({ success: true, officers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;