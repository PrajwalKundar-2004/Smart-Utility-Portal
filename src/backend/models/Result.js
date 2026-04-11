import mongoose, { mongo } from "mongoose";
const resultSchema = new mongoose.Schema({
    usn:{
        type: String,
        required: true,
        unique: true
    },
    web_internal:Number,
    web_external:Number,
    web_total:Number,

    c_internal:Number,
    c_external:Number,
    c_total:Number,

    dbms_internal:Number,
    dbms_external:Number,
    dbms_total:Number,

    os_internal:Number,
    os_external:Number,
    os_total:Number,

    maths_internal:Number,
    maths_external:Number,
    maths_total:Number,
    
    web_and_dbms_lab_internal:Number,
    web_and_dbms_lab_external:Number,
    web_and_dbms_lab_total:Number,

    c_lab_internal:Number,
    c_lab_external:Number,
    c_lab_total:Number,

    total_marks:Number,
    percentage:Number


})
export default mongoose.model("Result", resultSchema);