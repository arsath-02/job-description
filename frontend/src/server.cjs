const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to the database
mongoose.connect('mongodb://localhost:27017/job-description', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => {
        console.log('Database connection error:', err);
    });

// User schema
const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);


// Register new user
app.post('/auth/sign-up', async (req, res, next) => {
    const { firstname, lastname, email, password, phoneNo } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ firstname, lastname, email, password: hashedPassword, phoneNo});

    try {
        await newUser.save();
        const newToken = jwt.sign({ email: email }, "secretkey");
        res.status(200).json({
            success: true,
            data: {
                token: newToken,
                user: { firstname, lastname, email, phoneNo }
            }
        });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).send('Email already exists');
        } else {
            res.status(400).send('Error creating user');
        }
        next(err);
    }
});

// Authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (token) {
        jwt.verify(token, "secretkey", (err, user) => {
            if (err) {
                return res.sendStatus(403); // Forbidden
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

// User login
app.post('/auth/sign-in', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: 'Password does not match' });
        }

        const token = jwt.sign({
            userid: existingUser._id,
            email: existingUser.email
        }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });

        res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    firstname: existingUser.firstname,
                    lastname: existingUser.lastname,
                    email: existingUser.email,
                    phonenumber: existingUser.phonenumber
                }
            }
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
        next(err);
    }
});


// GET user profile
app.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.userid)
                               .populate({
                                   path: 'bookings',
                                   populate: {
                                       path: 'turfId',
                                       model: 'Turf'
                                   }
                               });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { firstname, lastname, email, phonenumber} = user;
        const userData = { firstname, lastname, email, phonenumber};
        const data = { ...userData};

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Error fetching user', error: err.message });
    }
});

