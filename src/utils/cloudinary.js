import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET  
    });

    const uploadOnCloudinary = async (localFilePath) => {
        try{
            if(!localFilePath) throw new Error("File path is required");
            
            const result=await cloudinary.uploader.upload(localFilePath,{
                resource_type: "auto"
            })
        // file uploaded to cloudinary
       
        fs.unlinkSync(localFilePath);// remove the locally saved temporary file
        return result;
     
        } catch(error) {
            fs.unlinkSync(localFilePath);// remove the locally saved temporary file
            return null;
        }
    }
    
export {uploadOnCloudinary} ;