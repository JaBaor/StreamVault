const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userModel = require("../models/userModel");
const { ConflictError, UnauthorizedError } = require("../errors/errors");
//Refresh token
function generateRefreshToken(){
  return crypto.randomBytes(40).toString("hex");
}

//POST /api/v1/auth/register
exports.register = async(req, res, next)=>{
  try{
    const {username, email, password, role} = req.body;

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Save user to database
    const userId = await userModel.createUser(username,email, hashedPassword, role);

    res.status(201).json({message: "User registered successfully", userId});
  } catch(error){
    // Duplicate username/email → MySQL error 1062
    if (error.code === "ER_DUP_ENTRY") {
      return next(new ConflictError("Username or email already exists"));
    }
    next(error);
  }
};

//POST /api/v1/auth/login
exports.login = async (req, res, next)=>{
  try{
    const {username, password} = req.body;

    // 1. Find user
    const user = await userModel.getUserByUsername(username);
    if(!user){
      return next(new UnauthorizedError("Invalid credentials"))
      
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch){
      return next(new UnauthorizedError("Invalid credentials"))
    }
    // 3. generate ACCESS token - short-lived JWT token and attach user's id and role to the token payload
    //The server never stored this. It signs it and trusts the signature later.
    const accessToken = jwt.sign(
      { id: user.id, role: user.role},
      process.env.JWT_SECRET,
      { expiresIn: "15m"}
    );
    
    // 4. Create REFRESH token - stored in DB
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await userModel.saveRefreshToken(user.id, refreshToken, expiresAt);

    // 5. Send REFRESH token as httpOnly so J cant read
    //    Send ACCESS token in JSON body so client can use it in headers
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({message:"Login successful", accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error){
    next(error);
  }
};

//POST /api/v1/auth/refresh
exports.refresh = async (req, res, next)=>{
  try{
    // 1. Read the refresh token from the cookie
    const token = req.cookies?.refreshToken;
    if(!token){
      return res.status(401).json({message: "No refresh token provided"});
    }

    // 2. Look it up in the DB
    const user = await userModel.getUserByRefreshToken(token);
    if (!user) {
      return res.status(403).json({message:"Invalid refresh token"});
    }

    // 3. Check it hasn't expired
    if (new Date() > new Date(user.refresh_token_expires)) {
      await userModel.clearRefreshToken(user.id);  //clean up expired token
      return res.status(403).json({message: "Rerfresh token expired, please log in again"});
    }
    // 4. Issue a brand-new access token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: "15m"}
    );

    res.json({ accessToken });   //client replace its old access token
    } catch (error){
      next(error);
    }
  };

//POST /api/v1/auth/logout
// Deletes the refresh token from DB. The access token will expire on its own.
exports.logout = async (req, res, next)=>{
  try{
    // 1. Read token from cookie
    const token = req.cookies?.refreshToken;

    if(token){
      // 2. Find user and deletes token from DB
      const user = await userModel.getUserByRefreshToken(token)
      if(user) {
        await userModel.clearRefreshToken(user.id);
      }
    }

    // 3. Clear the cookie on the client side too
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    res.json({message:"Logged out successfully"});
  } catch(error) {
    next(error);
  }
};
