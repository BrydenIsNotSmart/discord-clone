const express = require("express");
const User = require("../models/user");
const middleware  = require("../middleware/index");
const router = express.Router();

router.get("/", middleware.isLogedIn, (req, res)=>{
    User.findById(req.user._id).populate("channels").then((rUser)=>{
        res.render("friends", { channels: rUser.channels, title: "Friends" });
    }).catch((e)=>{
        res.send(e);
    });
});


module.exports = router;
