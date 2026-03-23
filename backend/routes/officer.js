const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

// GET /api/officer/complaints
router.get('/complaints', protect, authorize('officer'), async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const query = { assignedTo: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email phone')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const stats = await Complaint.aggregate([
      { $match: { assignedTo: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, total, complaints, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/officer/complaints/:id/status
router.put('/complaints/:id/status', protect, authorize('officer'), async (req, res) => {
  try {
    const { status, comment, resolutionDetails } = req.body;

    const validStatuses = ['In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update.' });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedTo: req.user._id
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found or not assigned to you.' });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      updatedBy: req.user._id,
      comment: comment || `Status updated to ${status}`
    });

    if (resolutionDetails) complaint.resolutionDetails = resolutionDetails;
    if (status === 'Resolved') complaint.resolvedAt = new Date();
    if (status === 'Closed') complaint.closedAt = new Date();

    await complaint.save();
    await complaint.populate('submittedBy', 'name email');
    await complaint.populate('statusHistory.updatedBy', 'name role');

    res.json({ success: true, message: `Complaint ${status.toLowerCase()} successfully.`, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/officer/stats
router.get('/stats', protect, authorize('officer'), async (req, res) => {
  try {
    const officerId = req.user._id;

    const [total, pending, inProgress, resolved, closed] = await Promise.all([
      Complaint.countDocuments({ assignedTo: officerId }),
      Complaint.countDocuments({ assignedTo: officerId, status: 'Assigned' }),
      Complaint.countDocuments({ assignedTo: officerId, status: 'In Progress' }),
      Complaint.countDocuments({ assignedTo: officerId, status: 'Resolved' }),
      Complaint.countDocuments({ assignedTo: officerId, status: 'Closed' }),
    ]);

    res.json({ success: true, stats: { total, pending, inProgress, resolved, closed } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;