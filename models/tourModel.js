const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
const { promises } = require('nodemailer/lib/xoauth2');
const User = require('./userModel');
// const validator = require('validator');
const tourSchema = new mongoose.Schema({
name:{
    type: String,
    required:[ true, 'A Tour must have a name'],
    unique: true,
    trim: true,
    maxLength: [40, 'A tour name must have equal or less then 40 characters'],
    minLength: [10, 'A tour name must have equal or less then 10 characters']
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
},
slug: String,
duration:{
    type: Number,
    required: [true, 'A tour must have a duration']
},
maxGroupSize:{
    type: Number,
    required: [true, 'A tour must have a group size']
},
difficulty:
{
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
        values: ['eassy', 'medium', 'difficult', 'eassay'],
        message: 'Difficulty is either: eassy,medium,difficult,eassay'
    }
},
ratingsAverage:{
    type:Number,
    default: 4.5,
    min: [1, 'Rating must be have 1.0'],
    max: [5, 'Rating must be have 5.0'],
    set: val => Math.round(val * 10) /10 
},
ratingsQuantity:{
    type: Number,
    default:0
},
price:{
    type: Number, 
    required: [ true, 'A Tour must have a price']
},
priceDiscount: {
  type : Number,
  validate:{
    validator: function(val){
        // this only points current doc only point document creation
      return val < this.price;
  },
  message: 'Discount price ({VALUE}) should be below regular price'
}
},
summary:{
    type: String,
    trim: true,
    required:[true, 'A tour must have a description']
},
description:{
    type: String,
    trim: true
},
imageCover:{
    type: String,
    required: [true, 'A tour must have a cover image']
},
images: [String],
createdAt:
{
    type: Date,
    default: Date.now(),
    select: false
},
startDates: [Date],
secretTour: {
type: Boolean,
default: false
},
maxBooking: {
  type: Number,
  max: 4,
  min:  0
},
startLocation:{
    type: {
        type:String,
        default: 'Point',
        enum: ['Point']
    },
    coordinates:[Number],
    address: String,
    description: String
},
locations: [
    {
    type: {
        type: String,
        default: 'Point',
        enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String,
    day: Number
}
],
guides: [
   { 
    type: mongoose.Schema.ObjectId,
    ref: 'User'
 }
]
}, {
toJSON: { virtuals: true },
toObject: { virtauls : true }
}
);

tourSchema.index({ price: 1, ratingsAverage : 4});
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// Document MIddleware : runs before .save() and .create()

tourSchema.pre('save', function(next){
 this.slug = slugify(this.name ,{lower: true});
 next();
});

// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// tourSchema.pre('save', function(next){
//  console.log('will save document....');
//  next();
// });

// tourSchema.post('save', function(doc, next){
// console.log(doc);
// next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next){
    tourSchema.pre(/^find/, function(next) {
        this.find({ secretTour: { $ne: true } });
        
        this.start = Date.now();
        next();
    });

    tourSchema.pre(/^find/, function(next) {
this.populate({
    path: 'guides',
    select: "-__v -passwordChangedAt"
});

next();
    });
    
    tourSchema.post(/^find/, function(docs, next) {
        console.log(`Query took ${Date.now() - this.start} milliseconds`);
        // console.log(docs);

        next();
    });

    // AGGREGATION MIDDLEWARE 

    // tourSchema.pre('aggregate', function(next) {
    //     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    //     console.log(this.pipeline());
    //     next();
    // });
    
const Tour= mongoose.model('Tour', tourSchema);
module.exports = Tour;