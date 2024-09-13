const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;


// task 1:
// update the authentication code under app.use("/customer/auth/*", 
// function auth(req,res,next){:


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use("/customer",
	session({
		secret:"fingerprint_customer",
		resave: true, 
		saveUninitialized: true}) 
	);
// first forgot the 'true}));'' that made login not work

// Middleware to authenticate requests to "/customer/auth/*" endpoint
app.use("/customer/auth/*", function auth(req,res,next){
    const authHeader = req.headers['authorization']; // Get the Authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

    if (token == null) {
        return res.status(401).json({ message: "no Authorization provided. user not logged in" });
    } // If there is no token, return 401
    else {
        console.log("That's the token submitted: ", token)

        // Verify JWT token
        jwt.verify(token, "access", (err, payload) => {
            if (!err) {
                 // `payload` contains the data you signed, including the username
                req.user = { username: payload.username }; // This needs to match how you're signing the JWT
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } 
 });


/* my own guess:
pp.use("/customer/auth/*", function auth(req,res,next){
// authenication mechanism to authenticate a user based on the access token.
	if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

*/
/* try this variant:
app.use("/customer/auth/*", function auth(req,res,next){
    let token = req.session.authorization;
    if(token) {
        token = token['accessToken'];
        jwt.verify(token, "access",(err,user)=>{
            if(!err){
                req.user = user;
                next();
            }
            else{
                return res.status(403).json({message: "Customer not authenticated"})
            }
         });
     } else {
         return res.status(403).json({message: "Customer not logged in"})
     }
 });
*/
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
