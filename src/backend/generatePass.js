import bcrypt from "bcryptjs";
const plainPassword = "admin123";
const generatePass = async () => {
    const hash=await bcrypt.hash(plainPassword, 10);
    console.log("hashed password:",hash);
};
generatePass();