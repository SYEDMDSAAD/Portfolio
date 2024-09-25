const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = 3000;

// Middleware to parse JSON and serve static files
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Sample projects data
let projects = [
    { title: "Project 1", description: "A cool project", imageUrl: "/path/to/image1.jpg", projectUrl: "https://example.com/project1" },
    { title: "Project 2", description: "Another cool project", imageUrl: "/path/to/image2.jpg", projectUrl: "https://example.com/project2" }
];

// API to fetch all projects
app.get("/api/projects", (req, res) => {
    res.json(projects);
});

// API to handle contact form submissions
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;

    // Here you can save the contact data or send an email
    console.log("Contact form submitted:", { name, email, message });

    res.json({ success: true, message: "Thank you for contacting us!" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
