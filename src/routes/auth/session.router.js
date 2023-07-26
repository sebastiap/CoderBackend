import { Router } from "express";
import passport from "passport";
import UserController from "../../controllers/user.controller.js";
import { publicAccess,passportCall } from "../../../utils.js";

const router = Router();
const controller = new UserController;
export default router;

router.get('/login',publicAccess,controller.loginPage);
router.get('/reset',publicAccess, controller.resetPage);

router.get('/reset/:time',publicAccess,controller.resetTime);
router.get('/register',publicAccess, controller.registerPage);

router.get('/fail-register',publicAccess, controller.failRegister);

router.get('/fail-login',publicAccess, controller.failLogin);

router.post('/register',passport.authenticate('register',{failureRedirect: 'fail-register'}), controller.postRegister);

router.post('/login',passportCall('login'), controller.postLogin);

router.post('/reset', controller.postReset);

router.get('/logout', controller.logout);

router.get('/github',
passport.authenticate('github',{scope: ['user:email']})
);

router.get('/github-callback',
passport.authenticate('github',{failureRedirect: '/login'}), controller.github);