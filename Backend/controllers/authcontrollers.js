import pool from "../config/Db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup=async(req,res)=>{

try{

const {full_name,email,password}=req.body;

if(!full_name||!email||!password){

return res.status(400).json({
message:"All fields required"
});

}

const user=await pool.query(

"SELECT * FROM users WHERE email=$1",

[email]

);

if(user.rows.length>0){

return res.status(400).json({

message:"Email already exists"

});

}

const hashedPassword=await bcrypt.hash(password,10);

await pool.query(

`INSERT INTO users
(full_name,email,password)
VALUES($1,$2,$3)`,

[full_name,email,hashedPassword]

);

return res.status(201).json({

message:"Signup Successful"

});

}

catch(err){
console.log(err);
return res.status(500).json({
message:"Server Error"

});

}

}
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
  return res.status(400).json({
    message: "Email and password are required",
  });
}const result = await pool.query(
  "SELECT * FROM users WHERE email=$1",
  [email]
);
const user = result.rows[0];
const isMatch = await bcrypt.compare(
  password,
  user.password
);
if (!isMatch) {
  return res.status(401).json({
    message: "Invalid Credentials",
  });
}
const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d",
  }
);
return res.status(200).json({
  message: "Login Successful",
  token,
  user: {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
  },
});
  } catch (err) {
  console.log(err);

  return res.status(500).json({
    message: "Internal Server Error",
  });
}
};
