const middleware = require("../middleware/index");
const express = require("express");
const { ObjectID } = require("mongodb");
const User = require("../models/user");
const Guild = require("../models/guild")
const Channel = require("../models/channel")
const mime = require("mime-types");
const crypto = require("crypto");
const path = require("node:path");
const multer = require("multer");
const moment = require("moment");
const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, "../public/files/image"),
        filename: (req, file, cb)=>{
            crypto.pseudoRandomBytes(4, (err, raw)=>{
                const mimeType = mime.lookup(file.originalname);
                const nameSplit = file.originalname.split(".").slice(0, -1);
                const name = nameSplit.join(".").replace(/\s/g, "-");
                cb(null, raw.toString("hex") + name + "." + mime.extension(mimeType));
            });
        },
    }),
});

router.post("/new", middleware.isLogedIn, upload.single("guild_picture"), (req, res)=>{
    if(!ObjectID.isValid(req.user._id)){
        return res.redirect("/");
    }

    const guild = {
        creator: req.user._id,
        guild_name: req.body.guild_name,
    };

    if(req.file){
        const file = {
            path: "/files/image/" + req.file.filename,
        };

        guild.guild_picture = file.path;
    }

    User.findById(req.user._id).then((rUser)=>{
        if(!rUser){
            return res.redirect("/");
        }

        Guild.create(guild).then((rGuild)=>{
            rUser.guilds.push(rGuild._id);
            rUser.save();
            const channel = {
                creator: req.user._id,
                channel_name: "general",     
            };
            Channel.create(channel).then((rChannel)=>{
          rGuild.channel.push(rChannel._id);
          rGuild.participant.push(rUser._id);
          rGuild.save();
          res.redirect(`/guild/${rGuild._id}`);
        }).catch((e)=>{
            console.log(e);
           res.redirect("back");
    });
 }).catch((e)=>{
     console.log(e);
     res.redirect("back");
 });
});
});

router.get("/:id/join", (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Guild.findById(ObjectID(req.params.id)).populate("participant").then((rGuild)=>{
        if(!rGuild){
            res.redirect("/");
        }

        res.render("join", { guild: rGuild, title: "join" });
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
});

router.post("/:id/join", middleware.isLogedIn, (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Guild.findById(ObjectID(req.params.id)).then((rGuild)=>{
        if(!rGuild){
            res.redirect("/");
        }
        const numberUser = rGuild.participant.length;
        for(let i = 0; i < numberUser; i++){
            if(rGuild.participant[i].equals(ObjectID(req.user._id))){
                return res.redirect(`/guild/${rGuild._id}`);
            }
        }
        User.findById(req.user._id).then((rUser)=>{
            rUser.guilds.push(rGuild._id);
            rUser.save();

            rGuild.participant.push(req.user._id); 
            rGuild.save();
            return res.redirect(`/guild/${rGuild._id}`);
        });
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
});

router.get("/:id", middleware.isLogedIn, middleware.isChannelParticipant, (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Guild.findById(ObjectID(req.params.id)).populate({ path: "channel" }).populate("participant").limit(10).sort({date:-1}).then((rGuild)=>{
        if(!rGuild){
            return res.redirect("/");
        }
        User.findById(req.user._id).populate({ path: "guilds" }).then((rUser)=>{
            res.render("guild", { guild: rGuild, guilds: rUser.guilds, title: rGuild.guild_name, moment, channel: null });
        });
    })
    .catch((e)=>{
        res.redirect("/");
        console.log(e);
    });
});

router.get("/:id/channel/:channelId", middleware.isLogedIn, middleware.isChannelParticipant, (req, res)=>{

    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }
    if(!ObjectID.isValid(req.params.channelId)){
        return res.redirect("/");
    }
   
    Guild.findById(ObjectID(req.params.id)).populate({ path: "channel" }).populate("participant").limit(10).sort({date:-1}).then((rGuild)=>{
        if(!rGuild){
            return res.redirect("/");
        }
        Channel.findById(ObjectID(req.params.channelId)).populate({ path: "message", populate: { path: "author" } }).limit(10).sort({date:-1}).then((rChannel)=>{
            if(!rChannel){
                return res.redirect("/");
            }
        User.findById(req.user._id).populate({ path: "guilds" }).then((rUser)=>{
            res.render("chat", { guild: rGuild, guilds: rUser.guilds, title: rGuild.guild_name, moment, channel: rChannel });
        });
      });
    })
    .catch((e)=>{
        res.redirect("/");
        console.log(e);
    });
});

module.exports = router;
