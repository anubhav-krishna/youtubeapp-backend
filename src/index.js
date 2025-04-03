// require("dotenv").config({path: "/.env"});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";
import app from "./app.js";
dotenv.config({path: "./.env"});

// app= express();
app.use(express.json());


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.error("Error connecting to the database", err);
    process.exit(1);
});
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