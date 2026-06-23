const User = require('../models/User');
const MealAttendance = require('../models/MealAttendance');
const OptOut = require('../models/OptOut');
const Rebate = require('../models/Rebate');
const Review = require('../models/Review');

/**
 * Auto-seed the database on first startup.
 * Checks if an admin user exists — if not, seeds sample data.
 * Runs silently on subsequent starts.
 */
async function autoSeed() {
  try {
    // Check if the database has already been seeded
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('✅ Database already seeded, skipping auto-seed');
      return;
    }

    console.log('🌱 First-time setup detected — seeding database...');

    // Seed Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@digimess.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('  ✅ Admin user created (admin@digimess.com / admin123)');

    // Seed 5 Students
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@digimess.com`,
        password: 'student123',
        role: 'student'
      });
      students.push(student);
    }
    console.log('  ✅ 5 student accounts created (student1-5@digimess.com / student123)');

    // Seed sample attendance for each student (last 30 days)
    const today = new Date();
    for (const student of students) {
      const attendanceRecords = [];
      for (let j = 0; j < 30; j++) {
        const date = new Date(today);
        date.setDate(today.getDate() - j);
        if (Math.random() > 0.33) { // ~67% attendance
          const attendance = await MealAttendance.create({
            user: student._id,
            date,
            breakfast: Math.random() > 0.2,
            lunch: Math.random() > 0.1,
            dinner: Math.random() > 0.2
          });
          attendanceRecords.push(attendance._id);
        }
      }
      student.attendanceHistory = attendanceRecords;
      await student.save();
    }
    console.log('  ✅ Sample attendance records seeded');

    // Seed opt-outs (2 approved for first 2 students)
    for (let i = 0; i < 2; i++) {
      const optOut = await OptOut.create({
        user: students[i]._id,
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        reason: 'Sick leave',
        approved: true
      });
      students[i].optOuts = [optOut._id];
      await students[i].save();
    }
    console.log('  ✅ Sample opt-out requests seeded');

    // Seed rebates (calculated for current month)
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    for (const student of students) {
      const rebate = await Rebate.create({
        user: student._id,
        monthYear: currentMonth,
        baseFee: 3000,
        totalDays: 30,
        attendedDays: 20,
        optOutDays: 0,
        missedDays: 10,
        calculatedAmount: 2000,
        status: 'pending'
      });
      student.rebates = [rebate._id];
      await student.save();
    }
    console.log('  ✅ Sample rebate records seeded');

    // Seed reviews
    const reviewsData = [
      { rating: 4, comment: 'Good food today!', approved: true },
      { rating: 3, comment: 'Average meal.', approved: true },
      { rating: 5, comment: 'Excellent!', approved: false }
    ];
    for (let i = 0; i < reviewsData.length; i++) {
      const review = await Review.create({
        user: students[i]._id,
        mealDate: today,
        rating: reviewsData[i].rating,
        comment: reviewsData[i].comment,
        approved: reviewsData[i].approved
      });
      if (!students[i].reviews) students[i].reviews = [];
      students[i].reviews.push(review._id);
      await students[i].save();
    }
    console.log('  ✅ Sample reviews seeded');

    console.log('🌱 Auto-seed completed successfully!');
  } catch (err) {
    console.error('❌ Auto-seed error:', err.message);
    // Don't crash the server — just log the error
  }
}

module.exports = autoSeed;
