const mongoose = require('mongoose');
// const Tour = require('./../models/tourModel')

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a User!']
    },
    price: {
        type:Number,
        required: [true, 'Booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

// bookingSchema.post('save', async function (doc, next) {
//     const tour = await Tour.findById(doc.tour);
//     if (tour) {
//         tour.bookings.push(doc._id);
//         await tour.save();
//     }
//     next();
// });

bookingSchema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
    next();
});


const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

