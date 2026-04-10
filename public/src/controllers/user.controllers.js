// import { response } from 'express';
import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {User} from '../models/User.model.js';
import {uploadOnCloudinary} from '../utils/Cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';


   // FUNCTION TO GENERATE ACCESS TOKEN AND REFRESH TOKEN FOR THE USER
   const generateAccessAndRefreshToken = async(userId) =>
   {
    try {
        const user = await User.findById(userId)  
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    //  SAVE THE REFRESH TOKEN IN THE DATABASE
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
    
        return {accessToken, refreshToken};
    } 
    catch (error) 
    {
        throw new ApiError(500, "Error while generating access and refresh token");
    }
}


const registerUser = asyncHandler(async (req,res) => 
    {
    // STEPS TO REGISTER A USER  

    // STEP-1: VALIDATE THE USER DETAILS
    const { fullName, email, username, password } = req.body;
    console.log("email", email);

    if(fullName === "" || email === "" || username === "" || password === "") 
    {
        throw new ApiError(400, "All fields are required"); 
    }    

    // STEP-2: CHECK IF THE USER ALREADY EXISTS
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser)
    {
        throw new ApiError(409, "User already exists with the provided email or username");
    }

    // CHECK FOR IMAGE UPLOAD & AVATAR CREATION 
    //  HANDLE IMAGE UPLOAD USING MULTER
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("avatarLocalPath:", avatarLocalPath);
    // HANDLE COVER IMAGE UPLOAD
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log("coverImageLocalPath:", coverImageLocalPath);


    // CHECK IF AVATAR IMAGE IS UPLOADED  
    if(!avatarLocalPath)
    {
        throw new ApiError(400, "Avatar image is required");
    }
    
    // STEP-4: UPLOAD THE AVATAR IMAGE & COVER IMAGE TO CLOUDINARY AND GET THE URL

    // UPLOAD THE AVATAR IMAGE TO CLOUDINARY AND GET THE URL
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("CLOUDINARY RESPONSE:", avatar);
    // UPLOAD THE COVER IMAGE TO CLOUDINARY AND GET THE URL
     const coverImage = coverImageLocalPath? await uploadOnCloudinary(coverImageLocalPath): null;
     
    // CHECK IF AVATAR UPLOAD WAS SUCCESSFUL
    if(!avatar)
    {
        throw new ApiError(400, "Error while uploading avatar image");
    }

    // STEP-5: CREATE A NEW USER OBJECT - CREATE ENTRY IN THE DATABASE
    const user = await User.create
    ({
        fullName,
        // avatar: avatar.url,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
        username: username.toLowerCase(),
        email,
        password
    })
 
    // STEP-6: CHECK IF THE USER WAS CREATED SUCCESSFULLY
    const createdUser = await User.findById(user._id).select(
    // STEP-7: REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM THE RESPONSE
        "-password -refreshToken"
    )

    //  STEP-8: CHECK IF THE USER WAS CREATED SUCCESSFULLY
    if(!createdUser)
    {
        throw new ApiError(500, "Error while creating user");
    }

    // STEP-9: RETURN A RESPONSE TO THE FRONTEND
    return res.status(201).json
    (
        new ApiResponse(201, createdUser, "User registered successfully")
    );

})

    //  STEPS TO LOGIN A USER

    const loginUser = asyncHandler(async (req,res) =>
    {
    // STEP-1: EXTRACT USER BODY --> DATA
    const{username,email,password} = req.body;
    console.log(email);
    //  STEP-2: VALIDATE THE USER DETAILS
    if(!username  && !email)
    {
        throw new ApiError(400, "Username or email is required");
    }

    //  STEP-3: FIND THE USER IN THE DATABASE USING USERNAME OR EMAIL
    const user = await User.findOne(
    {
        $or: [{username}, {email}]
    })

        if(!user)
        {
            throw new ApiError(404, "User not found with the provided username or email");
        }

    //  STEP-4: PASSWORD CHECK
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid)
    {
        throw new ApiError(401, "Invalid password");
    }

    //  STEP-5: GENERATE ACCESS TOKEN AND REFRESH TOKEN
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    // STEP-6: SAVE TOKENS IN COOKIE 
    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const cookieOptions =
    {
        httpOnly: true,
        secure: true,
    }
    // RETURN THE ACCESS TOKEN AND REFRESH TOKEN TO THE FRONTEND 
    return res.status(200).cookie("accessToken", accessToken, cookieOptions).
    cookie("refreshToken", refreshToken, cookieOptions)
    .json
    (
        new ApiResponse(200, 
            {
                user: LoggedInUser,
                accessToken,
                refreshToken
             },
              "User logged in successfully"
            )
            )      
    })

    //  STEPS TO LOGOUT USER CONTROLLER
    const logoutUser = asyncHandler(async (req,res) =>
    {
    // STEP-1: EXTRACT USER ID FROM THE REQUEST OBJECT
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set:
            {refreshToken: undefined}
         },
        {
            new: true
        })

         const cookieOptions =
        {
        httpOnly: true,
        secure: true,
        }
        // STEP-2: CLEAR THE ACCESS TOKEN AND REFRESH TOKEN FROM THE COOKIE
        return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "User logged out successfully"))
    })
export {registerUser, loginUser, logoutUser}
