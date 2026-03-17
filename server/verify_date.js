import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './models/Attendance.js';
import User from './models/User.js';

dotenv.config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const todayISO = now.toISOString().split('T')[0];

        console.log('Calculated Today (Manual):', todayStr);
        console.log('Calculated Today (ISO):', todayISO);

        const latestRecord = await Attendance.findOne().sort({ createdAt: -1 }).populate('user', 'email');
        if (latestRecord) {
            console.log('Latest Attendance Record:');
            console.log('  User:', latestRecord.user?.email);
            console.log('  Date string in DB:', latestRecord.date);
            console.log('  Check-in time:', latestRecord.check_in);
            console.log('  Match with Manual:', latestRecord.date === todayStr);
            console.log('  Match with ISO:', latestRecord.date === todayISO);
        } else {
            console.log('No attendance records found.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
