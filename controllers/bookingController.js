const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../controllers/handlerFactory');
const AppError = require('./../utils/appError')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId)

//     2) Create checkout session
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     success_url: `${req.protocol}://${req.get('host')}/`,
//     //  ?tour=${req.params.tourId}&$user=${req.user.id}&price=${tour.price}
//     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, 
//     customer_email: req.user.email,
//     client_reference_id: req.params.tourId,
//     line_items: [    
//     { 
//      name: `${tour.name} Tour`,
//      description: tour.summary,
//      images:[`https://www.natours.dev/img/tours/${tour.imageCover}`],
//      amount: tour.price,
//      currency: 'usd',
//      quantity: 1
//     }
//     ]
//   });

const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // these five lines are information about session itself
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      // this is the information about product which user is going to purchase
      {
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,
          tour_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            // images: [`https://picsum.photos/id/237/200/300`],
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });

    // 3)  Create session as response
    res.status(200).json({
        status: 'success',
        session
    })
});

exports.createBookingCheckout =catchAsync(async (req, res, next) => {
    // This is only TEMPORARY, because it,s UNSECURE: Everyone can make a bookings without paying
    const { tour, user, price } = req.query;

    if (!tour  && !user && !price) return next(new AppError('Missing parameters.', 400));

    const bookedTour = await Tour.findById(tour).populate('bookings');

    if (!bookedTour || bookedTour.maxBooking <= bookedTour.bookings.length) {
        return next(new AppError('This tour is fully booked.', 400));
    }


    await Booking.create({tour, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   console.log('123');
//   const tour = await Tour.findById(req.params.tourId).populate('bookings');
  
//   if (!tour || tour.maxBookings <= tour.bookings.length) {
//       return next(new AppError('This tour is fully booked.', 400));
//   }

//   const { user, price } = req.query;
//   await Booking.create({ tour: req.params.tourId, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });


exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);