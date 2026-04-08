import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

    // Configuration
cloudinary.config(
{ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});   

const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath)  return null;

        //  UPLOAD THE FILE ON CLOUDINARY
        const response =await cloudinary.uploader.upload(filePath, { 
            resource_type: "auto",    
            })

        // FILE UPLOADED SUCCESSFULLY, NOW DELETE THE LOCAL FILE
        console.log("File uploaded to Cloudinary successfully. NOW Deleting local file...",response.url);
        return response.url;
    }   
      catch (error) {
        fs.unlinkSync(filePath); // DELETE THE LOCAL FILE IN CASE OF ERROR  
        return null ;
      }
    } 

    export { uploadOnCloudinary };





// cloudinary.v2.uploader.upload("path/to/your/image.jpg", function(error, result) {
//     if (error) {
//         console.error("Error uploading to Cloudinary:", error); 
//     });
//     console.log("Upload result:", result);  



