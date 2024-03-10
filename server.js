const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require("path");
const app = express();
const fs = require('fs');
const port = process.env.PORT || 3000;
const filePath = './public/discount.txt';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '22it016@charusat.edu.in', // replace with your Gmail account
        pass: 'AcPatel1506', // replace with your Gmail password
    },
});

// Serve static files
app.use(express.static('public'));

app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "/public/main.html"));
    })
    // Express route to send bill via Gmail
app.post('/send-bill', (req, res) => {
    const { userEmail, billContent } = req.body;

    if (!userEmail || !billContent) {
        return res.status(400).json({ message: 'Invalid request parameters.' });
    }

    const mailOptions = {
        from: '22it016@charusat.edu.in',
        to: userEmail,
        subject: 'Bill',
        text: billContent,
    };

    // Send email
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            res.send("Enter the Valid E-mail Address");
        } else {
            res.send('Thank You!, Email is successfully sent to the Company name');
        }
    });
});
let discounts;
app.post("/dcode", (req, res) => {
    let data = req.body;
    let ucode = data.ucode;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
        } else {
            const lines = data.split('\n');
            discounts = lines.filter(line => line.trim() !== '').map(line => {
                const [code, per] = line.split(',');
                return { discode: code, disper: per };
            });
            if (discounts.find(obj => obj.discode === ucode)) {
                res.render("index", {
                    udis: ucode
                });
            } else {
                res.render("err");
            }
        }

    });


})
app.post("/back", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/main.html"));
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
