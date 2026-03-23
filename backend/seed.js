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
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 99999 00001'
    });

    // Create Officers
    const officer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'officer@demo.com',
      password: 'officer123',
      role: 'officer',
      department: 'Technical Support',
      phone: '+91 99999 00002'
    });

    const officer2 = await User.create({
      name: 'Priya Patel',
      email: 'officer2@demo.com',
      password: 'officer123',
      role: 'officer',
      department: 'Billing & Finance',
      phone: '+91 99999 00003'
    });

    // Create Users
    const user1 = await User.create({
      name: 'Amit Kumar',
      email: 'user@demo.com',
      password: 'user123',
      role: 'user',
      phone: '+91 98765 43210'
    });

    const user2 = await User.create({
      name: 'Sneha Joshi',
      email: 'user2@demo.com',
      password: 'user123',
      role: 'user',
      phone: '+91 87654 32109'
    });

    // Create Sample Complaints
    const complaints = [
      {
        title: 'Internet connection dropping frequently',
        description: 'My internet connection has been dropping every 30 minutes since last week.',
        category: 'Technical',
        priority: 'High',
        status: 'Resolved',
        submittedBy: user1._id,
        assignedTo: officer1._id,
        resolutionDetails: 'The issue was identified as a faulty cable. Our technician replaced it.',
        resolvedAt: new Date(),
        statusHistory: [
          { status: 'Pending', updatedBy: user1._id, comment: 'Complaint submitted.' },
          { status: 'Assigned', updatedBy: admin._id, comment: 'Assigned to Rahul Sharma.' },
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
        submittedBy: user1._id,
        assignedTo: officer2._id,
        statusHistory: [
          { status: 'Pending', updatedBy: user1._id, comment: 'Complaint submitted.' },
          { status: 'Assigned', updatedBy: admin._id, comment: 'Assigned to Priya Patel.' },
          { status: 'In Progress', updatedBy: officer2._id, comment: 'Reviewing invoice records.' }
        ]
      },
      {
        title: 'Support team not responding to emails',
        description: 'I sent 3 emails to support over the past 5 days and received no response.',
        category: 'Service',
        priority: 'Medium',
        status: 'Pending',
        submittedBy: user2._id,
        statusHistory: [
          { status: 'Pending', updatedBy: user2._id, comment: 'Complaint submitted.' }
        ]
      },
      {
        title: 'Product delivered in damaged condition',
        description: 'My order #ORD-789456 was delivered yesterday but the product was broken.',
        category: 'Product',
        priority: 'High',
        status: 'Assigned',
        submittedBy: user2._id,
        assignedTo: officer1._id,
        statusHistory: [
          { status: 'Pending', updatedBy: user2._id, comment: 'Complaint submitted.' },
          { status: 'Assigned', updatedBy: admin._id, comment: 'Assigned to technical team.' }
        ]
      },
      {
        title: 'App crashing on startup after latest update',
        description: 'Since the v2.3 update the mobile app crashes immediately on startup.',
        category: 'Technical',
        priority: 'High',
        status: 'Pending',
        submittedBy: user1._id,
        statusHistory: [
          { status: 'Pending', updatedBy: user1._id, comment: 'Complaint submitted.' }
        ]
      }
    ];

    for (const cData of complaints) {
      const c = new Complaint(cData);
      await c.save();
    }

    console.log('\n✨ Seed data created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Demo Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:    admin@demo.com   / admin123');
    console.log('🎯 Officer:  officer@demo.com / officer123');
    console.log('👤 User:     user@demo.com    / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();