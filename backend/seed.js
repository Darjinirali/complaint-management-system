/**
 * Database Seed Script
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/complaint_management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin0936@gmail.com',
      password: 'admin1234',
      role: 'admin',
      isVerified: true,
      isActive: true,
      phone: '+91 99999 00001'
    });

    // Create Officers
    const officer1 = await User.create({
      name: 'Nishtha Darji',
      email: 'niiish2003@gmail.com',
      password: 'nishtha1234',
      role: 'officer',
      isVerified: true,
      isActive: true,
      department: 'Technical Support',
      phone: '+91 99999 00002'
    });

    const officer2 = await User.create({
      name: 'Nirali Darji',
      email: 'niralidarji890@gmail.com',
      password: 'nirali1234',
      role: 'officer',
      isVerified: true,
      isActive: true,
      department: 'Billing & Finance',
      phone: '+91 99999 00003'
    });

    // Create Sample Complaints
    const complaints = [
      {
        title: 'Internet connection dropping frequently',
        description: 'My internet connection has been dropping every 30 minutes since last week.',
        category: 'Technical',
        priority: 'High',
        status: 'Resolved',
        submittedBy: admin._id,
        assignedTo: officer1._id,
        resolutionDetails: 'The issue was identified as a faulty cable. Our technician replaced it.',
        resolvedAt: new Date(),
        statusHistory: [
          { status: 'Pending', updatedBy: admin._id, comment: 'Complaint submitted.' },
          { status: 'Assigned', updatedBy: admin._id, comment: 'Assigned to Nishtha Darji.' },
          { status: 'In Progress', updatedBy: officer1._id, comment: 'Investigating the issue.' },
          { status: 'Resolved', updatedBy: officer1._id, comment: 'Cable replaced, issue resolved.' }
        ]
      },
      {
        title: 'Incorrect billing amount on last invoice',
        description: 'I was charged Rs. 2500 extra on my last invoice. Invoice number INV-2024-0342.',
        category: 'Billing',
        priority: 'Critical',
        status: 'In Progress',
        submittedBy: admin._id,
        assignedTo: officer2._id,
        statusHistory: [
          { status: 'Pending', updatedBy: admin._id, comment: 'Complaint submitted.' },
          { status: 'Assigned', updatedBy: admin._id, comment: 'Assigned to Nirali Darji.' },
          { status: 'In Progress', updatedBy: officer2._id, comment: 'Reviewing invoice records.' }
        ]
      },
      {
        title: 'App crashing on startup after latest update',
        description: 'Since the v2.3 update the mobile app crashes immediately on startup.',
        category: 'Technical',
        priority: 'High',
        status: 'Pending',
        submittedBy: admin._id,
        statusHistory: [
          { status: 'Pending', updatedBy: admin._id, comment: 'Complaint submitted.' }
        ]
      }
    ];

    for (const cData of complaints) {
      const c = new Complaint(cData);
      await c.save();
    }

    console.log('\n✨ Seed data created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Real Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:     admin0936@gmail.com     / admin1234');
    console.log('🎯 Officer 1: niiish2003@gmail.com    / nishtha1234');
    console.log('🎯 Officer 2: niralidarji890@gmail.com / nirali1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();