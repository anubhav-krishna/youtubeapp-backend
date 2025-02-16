// require("dotenv").config({path: "/.env"});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({path: "./.env"});

connectDB()

/*
;( async ()=>{
    try{
         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
         application.on("error", (error)=>{
            console.log("Error connecting to the database",error)
            throw error;
    });


    application.listen(process.env.PORT, ()=>{
        console.log(`App is running on port ${process.env.PORT}`);
    });
     }
     catch(err){
        console.error("ERROR: ", err)
        throw err
    }
})()
    */