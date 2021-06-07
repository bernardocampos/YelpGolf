const express = require('express');
const app = express();
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const Course = require('../models/course');
const cities = require('./cities.js');
const {places, descriptors} = require('./seedHelpers.js');

mongoose.connect('mongodb://localhost:27017/yelp-golf', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected')
});

const sample = array => array[Math.floor(array.length * Math.random())];

const seedDB = async() => {
    await Course.deleteMany({});
    for(let i = 0; i<20; i++){

        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*100);
        const course = new Course({
            name: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            image: 'https://source.unsplash.com/1600x900/?golf_course',
            price: price
        })
        await course.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});