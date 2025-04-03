import {asynchandler} from "../utils/asynchandler.js"; 
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asynchandler(async (req, res) => {
   //get user details from frontend
   // validation - not empty
   //check if user already exists:username or email
   // check for images
   // check for avatar
   // upload images to cloudinary,avatar
   // create user object- create entry in db
   // remoeve password and refresh token from response
   // check for user creation
   // return response to frontend


   const {fullname, email, username, password}=req.body
   console.log("email",email)
   
    if([fullname, email, username, password].some((field)=> 
        field?.trim()==="")){
        throw new ApiError("Please fill all fields", 400)
    }

    const existedUser=User.findOne({$or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError("Username or email already exists", 409)
    }

    const avatarLocalPath= req.files?.avatar[0]?.path ;
    const coverImageLocalPath= req.files?.coverImage[0]?.path ;

    if(!avatarLocalPath){
        throw new ApiError("Please upload avatar", 400)
    }

   const avatar= await uploadOnCloudinary(avatarLocalPath)
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
          throw new ApiError("Error uploading images", 400)
     }
    
    const user= await User.create({
        fullname,
        email,
        username: username.tolowerCase(),
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })

    const createdUser= await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError("Error creating user", 500)
    }
    return res.status(201).json(
        new ApiResponse( 200, createdUser,"User registered successfully")
    )
})

export  {registerUser};