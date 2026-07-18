import mongoose from "mongoose"

const connectToDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongodb connected")
    }catch(err){
        console.error("Mongodb connection error: ", err)
        process.exit();
    }
}

export default connectToDB