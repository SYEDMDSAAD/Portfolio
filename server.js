const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: './create.env' }); // Load the custom create.env file

const app = express();
const port = process.env.PORT || 5000; // Use environment variable for port or default to 5000

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from Frontend and Backend directories
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use(express.static(path.join(__dirname, '../Backend')));

// Route to handle form submissions
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER, // Use env variable from create.env
            pass: process.env.EMAIL_PASS  // Use env variable from create.env
        }
    });

    // Email options
    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER, // Use env variable from create.env
        subject: `New message from ${name}`,
        text: message
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: 'Error sending email' });
        }
        res.status(200).json({ message: 'Message sent successfully' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
