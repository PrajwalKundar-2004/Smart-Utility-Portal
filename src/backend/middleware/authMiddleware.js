import jwt from "jsonwebtoken";
const authMiddleware = async (req, res, next) => {
    const header=req.headers.authorization;
    if(!header){
        return res.status(401).json({message:"Unauthorized  User"});
    }
    const token=header.split(" ")[1];
    try{
        const decoded=jwt.verify(token,process.env.jwt_student_key);
        req.student=decoded;
        next();
    }catch{
        return res.status(401).json({message:"Unauthorized  User"});
    }
};
export default authMiddleware;