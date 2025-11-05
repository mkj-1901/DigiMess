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

    // Seed Admin
    let admin = await User.findOne({ email: 'admin@digimess.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@digimess.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } else {
      admin.password = 'admin123';
      await admin.save();
      console.log('Admin user updated');
    }

    // Seed 5 Students
    const students = [];
    for (let i = 1; i <= 5; i++) {
      let student = await User.findOne({ email: `student${i}@digimess.com` });
      if (!student) {
        student = await User.create({
          name: `Student ${i}`,
          email: `student${i}@digimess.com`,
          password: 'student123',
          role: 'student'
        });
        console.log(`✅ Student ${i} created`);
      } else {
        student.password = 'student123';
        await student.save();
        console.log(`Student ${i} updated`);
      }
      students.push(student);
    }

    // Seed sample attendance for each student (last 30 days, ~20 attended)
    const today = new Date();
    for (const student of students) {
      await MealAttendance.deleteMany({ user: student._id });

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
    console.log('✅ Sample attendance seeded');

    // Seed opt-outs (2 approved for first 2 students)
    for (let i = 0; i < 2; i++) {
      await OptOut.deleteMany({ user: students[i]._id });

      const optOut = await OptOut.create({
        user: students[i]._id,
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        reason: 'Sick leave',
        approved: true
      });
      students[i].optOuts = [optOut._id];
      await students[i].save();
    }
    console.log('✅ Sample opt-outs seeded');

    // Seed rebates (calculated for current month)
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    for (const student of students) {
      await Rebate.deleteMany({ user: student._id });

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
      student.rebates = [rebate._id];
      await student.save();
    }
    console.log('✅ Sample rebates seeded');

    // Seed reviews (3 submitted, 2 approved)
    for (let i = 0; i < 3; i++) {
      await Review.deleteMany({ user: students[i]._id });
    }

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
    console.log('✅ Sample reviews seeded');

    console.log('✅ All data seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  }
}

seedData();