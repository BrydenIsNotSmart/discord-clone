const   express     = require("express");
const   { ObjectID } = require("mongodb");
const   moment      = require("moment");
const   multer      = require("multer");
const   mime        = require("mime-types");
const   path        = require("path");
const   crypto      = require("crypto");
const   User        = require("../models/user");
const   middleware  = require("../middleware/index");
const   Channel     = require("../models/channel");

const       router = express.Router();

router.post("/new", middleware.isLogedIn, (req, res)=>{
    if(!ObjectID.isValid(req.user._id)){
        return res.redirect("/");
    }

    const channel = {
        creator: req.user._id,
        channel_name: req.body.channel_name,
    };

    User.findById(req.user._id).then((rUser)=>{
        if(!rUser){
            return res.redirect("/");
        }

        Channel.create(channel).then((rChannel)=>{
            rUser.channels.push(rChannel._id);
            rUser.save();

            rChannel.participant.push(rUser._id);
            // rChannel.online
            rChannel.save();
            res.redirect(`/channel/${rChannel._id}`);
        }).catch((e)=>{
            console.log(e);
            res.redirect("back");
        });
    });
});


router.get("/join/:id", (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).populate("participant").then((rChannel)=>{
        if(!rChannel){
            res.redirect("/");
        }

        res.render("join", { channel: rChannel, title: "join" });
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
});

router.post("/join/:id", middleware.isLogedIn, (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).then((rChannel)=>{
        if(!rChannel){
            res.redirect("/");
        }
        const numberUser = rChannel.participant.length;
        for(let i = 0; i < numberUser; i++){
            if(rChannel.participant[i].equals(ObjectID(req.user._id))){
                return res.redirect(`/channel/${rChannel._id}`);
            }
        }
        User.findById(req.user._id).then((rUser)=>{
            rUser.channels.push(rChannel._id);
            rUser.save();

            rChannel.participant.push(req.user._id);
            rChannel.save();
            return res.redirect(`/channel/${rChannel._id}`);
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

    Channel.findById(ObjectID(req.params.id)).populate({ path: "message", populate: { path: "author" } }).populate("participant").limit(10).sort({date:-1}).then((rChannel)=>{
        if(!rChannel){
            return res.redirect("/");
        }


        User.findById(req.user._id).populate("channels").then((rUser)=>{
            res.render("chat", { channel: rChannel, channels: rUser.channels, title: rChannel.channel_name, moment });
        });
    })
    .catch((e)=>{
        res.redirect("/");
        console.log(e);
    });
});


module.exports = router;
