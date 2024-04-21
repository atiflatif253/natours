const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('unCaughtException', err => {   
         console.log('UNCAUGHT EXCEPTION!  shutting down');
         console.log(err.name, err.message);
          process.exit(1);
        });

dotenv.config({path: './config.env' });

const app = require('./app');

const DB = process.env.DATEBASE;

mongoose.connect(DB,{
// useNewUrlParser:true
// useCreateIndex:  true,
// useFindAndModify: false
}).then(() => console.log('DB connect successfully'));
// const testTour = new Tour({
//     name: 'The Park Camper',
//     price:997
// });

// testTour.save().then(doc =>{
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR :', err);
// });

const port =process.env.PORT || 3000;
app.listen(port , () => {
    console.log(`app is running on the ${port}...`);
}); 

// HANDLE TO THE UNHANDLED REJECTION
// process.on('unhandledRejection', err => {
//     console.log(err.name, err.message);
//   console.log('UNHANDLED REJECTION!  shutting down');
//  server.close(() =>{
//   process.exit(1);
// })
// });

// process.on('unCaughtException', err => {   
//      console.log('UNCAUGHT EXCEPTION!  shutting down');
//      console.log(err.name, err.message);
//      server.close(() => {
//       process.exit(1);
//     });
//     });
