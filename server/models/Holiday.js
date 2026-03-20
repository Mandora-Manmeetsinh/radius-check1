import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD format
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Holiday = mongoose.model('Holiday', holidaySchema);

export default Holiday;
