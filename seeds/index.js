const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('MONGO CONNECTION OPEN!')
    })
    .catch(err => {
        console.log('OH NO MONGO CONNECTION ERROR!')
        console.log(err)
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Get random value from array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Create random campgrounds
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            // Me as the author for now
            author: '61eca437ad2cd9495d67ede6',
            // Get random city
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // Get random camp name
            title: `${sample(descriptors)} ${sample(places)}`,
            // Get a random photo from Unsplash Source API -> collections called 'in-the-woods'
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Autem commodi eius optio, excepturi illum obcaecati modi suscipit eligendi laboriosam, corrupti laudantium, voluptates laborum placeat facere. Assumenda laboriosam obcaecati omnis ea?',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    "url": "https://res.cloudinary.com/duoz8rdh3/image/upload/v1642992898/YelpCamp/gscmqvfh3csv0jmvka8n.jpg",
                    "filename": "YelpCamp/gscmqvfh3csv0jmvka8n",
                },
                {
                    "url": "https://res.cloudinary.com/duoz8rdh3/image/upload/v1642992885/YelpCamp/v4gihgrd6xprzollnhkq.jpg",
                    "filename": "YelpCamp/v4gihgrd6xprzollnhkq",
                }
            ]
        });
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})