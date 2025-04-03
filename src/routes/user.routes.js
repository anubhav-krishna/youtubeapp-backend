import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"; // Ensure the correct path and `.js` extension
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route('/register').post(
    upload.fields([
        { name: "name", 
            maxCount: 1 
        },
        { name: 'coverimages', 
            maxCount: 1 
        }

    ]),
    registerUser);

export default router;