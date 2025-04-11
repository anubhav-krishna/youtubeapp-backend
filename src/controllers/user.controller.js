import {asynchandler} from "../utils/asynchandler.js"; 
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshToken=  async(userId)=>{
    try{
      const user=await User.findById(userId)
        const accesssToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
         user.refreshToken=refreshToken
         await user.save({validateBeforeSave:false})
            return {accesssToken, refreshToken}
    }
    catch(error){
        throw new ApiError("Error generating access tokens", 500)

    }
}

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
   //console.log("email",email)
   
    if([fullname, email, username, password].some((field)=> 
        field?.trim()==="")){
        throw new ApiError("Please fill all fields", 400)
    }

    const existedUser= await User.findOne({$or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError("Username or email already exists", 409)
    }

    const avatarLocalPath= req.files?.avatar[0]?.path ;
    //const coverImageLocalPath= req.files?.coverImage[0]?.path ;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
         coverImageLocalPath= req.files.coverImage[0].path ;
    }
//     console.log("Avatar Local Path:", avatarLocalPath);
// console.log("Cover Image Local Path:", coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError("Please upload avatar", 400)
    }

   const avatar= await uploadOnCloudinary(avatarLocalPath)
   const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if(!avatar){
          throw new ApiError("Error uploading images", 400)
     }
    
    const user= await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })

    const createdUser= await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError("Error creating user", 500)
    }
    return res.status(201).json(
        new ApiResponse(createdUser,201,"User registered successfully")
    )
})

const loginUser= asynchandler(async (req, res) => {
       // req body ->data
       // validation - not empty
       // check username or email exists
       // if not jump to register
         // check password
         // if does not match throw error(password incorrect)
         // create refresh token and access token
         //second cookie for refresh token
            // send response 
            const {email,username,password}=req.body
            if(!username && !email){
                throw new ApiError("Please provide username or email", 400)
            }
           const user= await User.findOne({$or:[{username}, {email}]
           })
              if(!user){
                throw new ApiError("User does not exist", 404)
              }
             const validPass= await user.isPasswordCorrect(password)
                if(!validPass){
                    throw new ApiError("Password is incorrect", 401)
                }
                const {accesssToken, refreshToken}= await generateAccessandRefreshToken(user._id)

              const loggedInUser= await  User.findByIdAndUpdate(user._id).select("-password -refreshToken")

              const options={
                httpOnly:true,
                secure:true,
              }
                return res
                .status(200)
                .cookie("accessToken", accesssToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(new ApiResponse({
                    user:loggedInUser,
                    accesssToken,
                    refreshToken
                }, 200, "User logged in successfully"))
})

const logoutUser= asynchandler(async (req, res) => {
   User.findByIdAndUpdate(
    req.user._id, {
          $set:{
            refreshToken: undefined
          }
   },
   {
    new:true
 }
)
const options={
    httpOnly:true,
    secure:true,
  }
  return res.status(200)
  .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(null, 200, "User logged out successfully"))
})

const refreshAccessToken= asynchandler(async (req, res) => {
   const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
      throw new ApiError("Please login again", 401)
    }
      try {
         const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
       const user=  await User.findById(decodedToken?._id).select("-password -refreshToken")
       if(!user){
          throw new ApiError("Invalid refresh token", 401)
       }
       if(user?.refreshToken !== refreshToken){
          throw new ApiError("IRefresh token is expired or used", 401)
       }
      const options={
          httpOnly:true,
          secure:true,
        }
        const {accesssToken, newRefreshToken}=await generateAccessandRefreshToken(user._id)
        return res
        .status(200)
        .cookie("accessToken", accesssToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse({
          accesssToken,
          newRefreshToken
        }, 200, "Access token refreshed successfully"))
      } catch (error) {
        throw new ApiError(error?.message || "Invalid refresh token", 401)
      }
})

const changeCurrentPassword= asynchandler(async (req, res) => {
    const {oldPassword, newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const checkPassword= await user.isPasswordCorrect(oldPassword)
    if(!checkPassword){
        throw new ApiError("Old password is incorrect", 401)
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false}) 
    return res.status(200)
    .json(new ApiResponse({}, 200, "Password changed successfully"))
})

const getCurrentUser= asynchandler(async (req, res) => {
    return res.status(200)
    .json(new ApiResponse(req.user, 200, "User fetched successfully"))
})

const updateAccountDetails = asynchandler(async (req, res) => {
    const {fullname, email}=req.body
    if(!fullname || !email){
        throw new ApiError("Please fill all fields", 400)
    }
   const user= await User.findByIdAndUpdate(req.user?._id, 
    {
       $set:{
        fullname
        , email
       }
    },
    {new:true}).select("-password")

    res.status(200)
    .json(new ApiResponse(user, 200, "User updated successfully"))
})

const updateUserAvatar= asynchandler(async (req, res) => {
     const avatarLocalPath= req.file?.path
      if(!avatarLocalPath){
          throw new ApiError("Please upload avatar", 400)
      }
      const avatar= await uploadOnCloudinary(avatarLocalPath)
      if(!avatar.url){
          throw new ApiError("Error uploading avatar", 400)
      }
      const user= await User.findByIdAndUpdate(req?.user._id, {
        $set:{
            avatar:avatar.url
        }
      },
      {new:true}).select("-password")
      return res
  .status(200)
  .json(new ApiResponse(user, 200, "Avatar image pdated successfully"))

})

const updateUserCoverImage= asynchandler(async (req, res) => {
  const coverImageLocalPath= req.file?.path
   if(!coverImageLocalPath){
       throw new ApiError("Please upload cover image", 400)
   }
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)
   if(!coverImage.url){
       throw new ApiError("Error uploading avatar", 400)
   }
   const user= await User.findByIdAndUpdate(req?.user._id, {
     $set:{
      coverImage:coverImage.url
     }
   },
   {new:true}).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(user, 200, "Cover Image updated successfully"))

})
export  {registerUser,
         loginUser,logoutUser,refreshAccessToken
         ,changeCurrentPassword,getCurrentUser
         ,updateAccountDetails,
         updateUserAvatar,updateUserCoverImage
};