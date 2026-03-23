const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/complaints — Submit complaint
router.post('/', protect, authorize('user'), upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, description, and category are required.' });
    }

    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const complaint = await Complaint.create({
      title, description, category,
      priority: priority || 'Medium',
      submittedBy: req.user._id,
      attachments,
      statusHistory: [{
        status: 'Pending',
        updatedBy: req.user._id,
        comment: 'Complaint submitted successfully.'
      }]
    });

    await complaint.populate('submittedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully!',
      complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/complaints/my — User's own complaints
router.get('/my', protect, authorize('user'), async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const query = { submittedBy: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
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

// GET /api/complaints/:id — Get single complaint
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email department')
      .populate('statusHistory.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (
      req.user.role === 'user' &&
      complaint.submittedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/complaints/:id/feedback
router.post('/:id/feedback', protect, authorize('user'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      submittedBy: req.user._id,
      status: { $in: ['Resolved', 'Closed'] }
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found or not resolved yet.' });
    }

    complaint.feedback = { rating, comment, submittedAt: new Date() };
    await complaint.save();

    res.json({ success: true, message: 'Feedback submitted. Thank you!', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;