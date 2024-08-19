const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
//const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


const app = express();
const port = 8081;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");

//mongodb+srv://ashirafkyazze72:<password>@cluster0.aqaic.mongodb.net/

mongoose.connect("mongodb+srv://ashirafkyazze72:qNiLMnP1TEdswz2x@cluster0.aqaic.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});

app.listen(port, () => {
    console.log("Server is running on port 8000")
});

//endpoint to regster in the app
const User = require("./modules/user");
const Order = require("./modules/order");

//function to send verification email to user
const sendVerificationEmail = async (email, verificationToken) => {
    //create a nodemailer transport

    const transporter = nodemailer.createTransport({
        //configure the email service

        service: "gmail",
        auth: {
            user: "ashirafkyazze72@gmail.com",
            pass: "yxosmyauaydvusum"
        }
    });

    //compose the email message
    const mailOptions = {
        from: "amazon",
        to: email,
        subject: "Email verfication",
        text: `Please click the following link to verify your email: http://192.168.8.104:8081/verify/${verificationToken}`,
    };
    // Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully");
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
}


app.post("/register", async (req, res) => {
    try {
        const { name, password, email } = req.body;

        //checkif an email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        //create a new user
        const newUser = new User({ name, email, password });

        //generate and store the verification token
        newUser.verificationToken = crypto.randomBytes(20).toString("hex");

        //save the user to the database
        await newUser.save();

        //send verifiaction email to the user
        sendVerificationEmail(newUser.email, newUser, verificationToken);

    } catch (error) {
        console.log("error registering user", error);
        res.status(500).json({ message: "Registration failed" })
    }
});

//endpoint to verify the email
app.get("/verify/:token", async (req, res) => {
    try {
      const token = req.params.token;
  
      //Find the user witht the given verification token
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(404).json({ message: "Invalid verification token" });
      }
  
      //Mark the user as verified
      user.verified = true;
      user.verificationToken = undefined;
  
      await user.save();
  
      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Email Verification Failed" });
    }
  });



  const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");
  
    return secretKey;
  };
  
  const secretKey = generateSecretKey();


  //endpoint to login the user!
app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      //check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      //check if the password is correct
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }
  
      //generate a token
      const token = jwt.sign({ userId: user._id }, secretKey);
  
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: "Login Failed" });
    }
  });
