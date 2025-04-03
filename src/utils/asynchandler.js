// const asynchandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//    res.status(error.code || 500).json({message: error.message || "Something went wrong",
//     success: false
//    });
//   }
// }

export const asynchandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};



