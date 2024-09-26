const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from 'D:/VsCode/Portfolio/'
app.use(express.static(path.join('D:', 'VsCode', 'Portfolio')));

// Route to handle form submissions
app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'mdsaadsyed29@gmail.com',
            pass: 'vljajchaqcqjuonl'
        }
    });

    // Email options
    const mailOptions = {
        from: email,
        to: 'mdsaadsyed29@gmail.com',
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
