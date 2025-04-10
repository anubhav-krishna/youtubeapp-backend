import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        typeof: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{
        typeof: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
},
    {timestamps: true}
);


export default mongoose.model("Subscription", subscriptionSchema);