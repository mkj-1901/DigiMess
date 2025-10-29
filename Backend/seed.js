const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const MealAttendance = require('./models/MealAttendance');
const OptOut = require('./models/OptOut');
const Rebate = require('./models/Rebate');
const Review = require('./models/Review');

dotenv.config({ path: './.env' });

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await User.deleteMany({});
    await MealAttendance.deleteMany({});
    await OptOut.deleteMany({});
    await Rebate.deleteMany({});
    await Review.deleteMany({});

    // Seed Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@digimess.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin user created');

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
    console.log('✅ 5 Student users created');

    // Seed sample attendance for each student (last 30 days, ~20 attended)
    const today = new Date();
    for (const student of students) {
      const attendanceRecords = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
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
    console.log('✅ Sample attendance seeded');

    // Seed opt-outs (2 approved for first 2 students)
    for (let i = 0; i < 2; i++) {
      const optOut = await OptOut.create({
        user: students[i]._id,
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        reason: 'Sick leave',
        approved: true
      });
      students[i].optOuts.push(optOut._id);
      await students[i].save();
    }
    console.log('✅ Sample opt-outs seeded');

    // Seed rebates (calculated for current month)
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    for (const student of students) {
      const rebate = await Rebate.create({
        user: student._id,
        monthYear: currentMonth,
        baseFee: 3000,
        totalDays: 30,
        attendedDays: 20, // approximate
        optOutDays: 0,
        missedDays: 10,
        calculatedAmount: 2000, // approximate rebate
        status: 'pending'
      });
      student.rebates.push(rebate._id);
      await student.save();
    }
    console.log('✅ Sample rebates seeded');

    // Seed reviews (3 submitted, 2 approved)
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
      students[i].reviews.push(review._id);
      await students[i].save();
    }
    console.log('✅ Sample reviews seeded');

    console.log('✅ All data seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  }
}

seedData();
