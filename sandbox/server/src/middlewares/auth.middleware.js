// import { verifyToken } from "../utilis.js";

// export function authMiddleware(req,res,next){
//     const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

//     if(!token){
//         return res.status(401).json({message: 'Authentication token is missing'})
//     }

//     const decoded = verifyToken(token);
//     if(!decoded){
//          return res.status(401).json({message: 'Invalid or expired token'})
//     }

//     req.user = decoded;
//     next();
// }

import { verifyToken } from "../utilis.js";

export function authMiddleware(req,res,next){

    console.log("Cookies:", req.cookies);
    console.log("Authorization:", req.headers.authorization);

    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    console.log("Token:", token);

    if(!token){
        return res.status(401).json({
            message:"Authentication token is missing"
        });
    }

    const decoded = verifyToken(token);

    console.log("Decoded:", decoded);

    if(!decoded){
        return res.status(401).json({
            message:"Invalid or expired token"
        });
    }

    req.user = decoded;

    next();
}