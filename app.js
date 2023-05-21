const express = require("express");
const app = express();
const Client = require("./models/client");
const Admin = require("./models/admin");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const nodemailer = require("nodemailer");
const Product = require("./models/product");

// Seeder. Remove when run for the first time
//require("./seed");

const dbURI = process.env.MONGODBURI || "mongodb://127.0.0.1:27017/agileDB";

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Database Connected");
});

app.use((req, res, next) => {
  console.log("req.session: ", req.session);
  console.log("req.user = " + req.user);
  res.locals.currentUser = req.user;
  next();
});

app.get("/", async (req, res) => {
  const products = await Product.find({});
  res.render("index", { products });
});

app.get("/orders", loggedIn, async (req, res) => {
  const clients = await Client.find({});
  res.render("orders", { clients });
});

app.post("/order", async (req, res) => {
  console.log(req);
  console.log(req.body);
  const {
    color: orderedProduct,
    first_name: fullName,
    city,
    phone: phoneNumber,
    address: shippingAddress,
  } = req.body;
  const client = {
    fullName,
    city,
    phoneNumber,
    shippingAddress,
    orderedProduct,
  };

  const newClient = new Client(client);
  await newClient.save();

  res.sendStatus(200);
});

// use env variable to define tcp/ip port with a default
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Express running on localhost:" + PORT);
});
