import {asynhandler} from  "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWT =asynhandler(async (req, _, next) => { //if you use "res" in the second parameter, it will throw an error because you are not using it in the function
  // "res" is not used in the function, so it should be "_"
 try {
    const token =req.cookies?.accessToken || req.header("Authorization")?.
    replace("Bearer ","")
    if(!token){
      throw new ApiError("Unauthorized access",401)
    }
       const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
     
       const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
       if(!user){
         throw new ApiError("Invalid Access Token",401)
       }
         req.user=user
         next()
 } catch (error) {
     throw new ApiError(error?.message || "Invalid Access Token",401)
 }
})

