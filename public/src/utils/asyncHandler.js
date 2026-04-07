//  ---> PROMISE-BASED ERROR HANDLING FOR ASYNC FUNCTIONS <---

const asyncHandler = (requestHandler) => {
    (req,res,next) => {
     Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}


import req from "express/lib/request"
import { json } from "express/lib/response"

export {asyncHandler}


/*  ------> TRY-CATCH BLOCK FOR ASYNC FUNCTIONS <------  
const asyncHandler = (fn) => (req,res,next) =>  {
    try {
        await fn(req,res,next)

    } catch (error) {
        res.status(error.code || 500).json({          
            success: false,
            message: error.message || "Internal Server Error"
        })
    }
}
    */