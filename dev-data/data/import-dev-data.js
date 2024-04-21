const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
dotenv.config({path: './config.env' });

const DB = process.env.DATEBASE;

mongoose.connect(DB,{
useNewUrlParser:true
// useCreateIndex:  true,
// useFindAndModify: false
}).then(() => console.log('DB connect successfully'));

// Read Json file
const tours =JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
    );

// Import data into DB
const importData = async () => {
    try{
   await Tour.create(tours);
   console.log('data successfully loaded!')
    } catch(err){
    console.log(err);
    }
};

// Delete all data from DB
const deleteData = async () => {
try{
await Tour.deleteMany();
console.log('data deleted successfully');
} catch(err) {
    console.log(err);
}
};


console.log(process.argv);