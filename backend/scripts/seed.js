/**
 * Database Seeder Script
 * Creates initial admin user and sample data
 *
 * Usage: node scripts/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../models");

// Admin user credentials
const ADMIN_USER = {
  username: "admin",
  email: "admin@queue.com",
  password: "Admin@123",
  role: "admin",
  isActive: true,
};

// Staff user credentials (optional)
const STAFF_USER = {
  username: "staff",
  email: "staff@queue.com",
  password: "Staff@123",
  role: "staff",
  isActive: true,
};

/**
 * Connect to database
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

/**
 * Seed admin user
 */
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });

    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return existingAdmin;
    }

    // Create admin user
    const admin = await User.create(ADMIN_USER);
    console.log("✅ Admin user created successfully");
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${ADMIN_USER.password}`);
    console.log(`   Role: ${admin.role}`);

    return admin;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  }
};

/**
 * Seed staff user
 */
const seedStaff = async () => {
  try {
    // Check if staff already exists
    const existingStaff = await User.findOne({ email: STAFF_USER.email });

    if (existingStaff) {
      console.log("ℹ️  Staff user already exists");
      console.log(`   Email: ${existingStaff.email}`);
      console.log(`   Role: ${existingStaff.role}`);
      return existingStaff;
    }

    // Create staff user
    const staff = await User.create(STAFF_USER);
    console.log("✅ Staff user created successfully");
    console.log(`   Username: ${staff.username}`);
    console.log(`   Email: ${staff.email}`);
    console.log(`   Password: ${STAFF_USER.password}`);
    console.log(`   Role: ${staff.role}`);

    return staff;
  } catch (error) {
    console.error("❌ Error creating staff user:", error);
    throw error;
  }
};

/**
 * Main seeder function
 */
const seed = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    await connectDB();

    // Seed admin user
    console.log("\n--- Seeding Admin User ---");
    await seedAdmin();

    // Seed staff user (optional)
    console.log("\n--- Seeding Staff User ---");
    await seedStaff();

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📝 Default credentials:");
    console.log("   Admin: admin@queue.com / Admin@123");
    console.log("   Staff: staff@queue.com / Staff@123");
    console.log("\n⚠️  Please change these passwords in production!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run seeder if executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
