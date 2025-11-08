import mongoose from "mongoose" 

const uri = "" ; 

mongoose.connect(uri).then(()=>console.log("mongoose connected succesfully")).catch((err) => console.error("error in db",err)) ; 
