const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require("path");
const app = express();
const fs = require('fs');
const { render } = require('ejs');
const port = process.env.PORT || 3000;
const filePath = './public/discount.txt';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'agribirdindia@gmail.com', // replace with your Gmail account
        pass: 'gchakqrozlxywggf', // replace with your Gmail password
    },
});

// Serve static files
app.use(express.static('public'));

app.get("/", async(req, res) => {
        res.sendFile(path.join(__dirname, "/public/main.html"));
    })
    // Express route to send bill via Gmail
app.post('/send-bill', (req, res) => {
    const { userEmail, billContent } = req.body;

    if (!userEmail || !billContent) {
        return res.status(400).json({ message: 'Invalid request parameters.' });
    }

    const mailowner = {
        from: userEmail,
        to: 'agribirdindia@gmail.com',
        subject: 'New Purchase Order',
        text: billContent,
    };
    const mailuser = {
        from: 'agribirdindia@gmail.com',
        to: userEmail,
        subject: 'New Order placed with Satyam Engineering Works',
        text: billContent,
    };

    transporter.sendMail(mailowner, function(error, info) {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ message: "Failed to send email." });
        } else {
            console.log("Email sent successfully:", info.response);
            res.status(200).json({ success: true, message: "Email sent successfully." });
        }
    });
    transporter.sendMail(mailuser, function(error, info) {
        if (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ message: "Failed to send email." });
        } else {
            console.log("Email sent successfully:", info.response);
            res.status(200).json({ success: true, message: "Email sent successfully." });
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
app.get('/success', (req, res) => {
    res.render('success');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
