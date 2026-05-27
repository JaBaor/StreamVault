const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

exports.register = async(req, res)=>{
  try{
    const {username,email, password, role} = req.body;

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Save user to database
    const userId = await userModel.createUser(username,email, hashedPassword, role);

    res.status(201).json({message: "User registered successfully", userId});
  } catch(error){
    res.status(500).json({message: error.message})
  }
};

exports.login = async (req, res)=>{
  try{
    const {username, password} = req.body;

    //Find user
    const user = await userModel.getUserByUsername(username);
    if(!user){
      return res.status(401).json({message: "Invalid credentials"});
    }

    //Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch){
      return res.status(401).json({message:"Invalid credentials"});
    }
    //generate JWT token and attach user's iD and role to the token payload
    const token = jwt.sign(
      { id: user.id, role: user.role},
      process.env.JWT_SECRET,
      { expiresIn: "1h"}
    );

    res.json({message:"Login successful", token});
  } catch (error){
    res.status(500).json({message: error.message});
  }
};