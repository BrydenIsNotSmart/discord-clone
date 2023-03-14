const express = require("express");
const User = require("../models/user");
const Guild = require("../models/guild")
const router = express.Router();

router.get("/", (req, res)=>{
    if(req.user){
        User.findById(req.user._id).then(()=>res.redirect("/users/@me"))
        .catch((e)=>{
            console.log(e);
            return res.redirect("/users/login");
        });
    }else{
        res.redirect("/users/login");
    }
});

router.get("/discover", async (req, res)=>{
    if(req.user){
        User.findById(req.user._id).populate("guilds").then(async (rUser)=>{
            const displayGuilds = await Guild.find({ public: true }); 
            res.render("discover", { guilds: rUser.guilds, displayGuilds, user: rUser, title: "Discover", channel: null });
        }).catch((e)=>{
            res.send(e.stack);
        });
    }else{
        res.redirect("/users/login");
    }
});


module.exports = router;
