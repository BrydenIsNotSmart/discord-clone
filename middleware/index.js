const { ObjectID } = require("mongodb");
const Guild = require("../models/guild");

const middleware = {};

middleware.isLogedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/users/login");
    }
};

middleware.isChannelParticipant = (req, res, next)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }


    Guild.findById(ObjectID(req.params.id)).then((rGuild)=>{
        if(!rGuild){
            return res.redirect("/");
        }
        for(let i = 0; i < rGuild.participant.length; i++){
            if(rGuild.participant[i].equals(ObjectID(req.user._id))){
                return next();
            }
        }
        res.redirect("/guild/" + rGuild._id+"/join`");
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
};

middleware.isChannelCreator = (req, res, next)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).then((rChannel)=>{
        if(!rChannel){
            return res.redirect("/");
        }

        if(rChannel.creator.equals(ObjectID(req.user._id))){
            next();
        }else{
            return res.redirect("/");
        }
    });
};

// middleware.isItUserProfile = (req, res, next)=>{
//     User.findById(req.params.id).then((rUser)=>{
//         if(!rUser){
//             res.redirect("/");
//             console.log("NO user with this ID");
//         }else{
//             console.log(rUser._id, req.user._id);
//             if(rUser._id.equals(req.user._id)){
//                 next();
//             }else{
//                 res.redirect("/");
//                 console.log("not the user profile");
//             }
//         }
//     })
// };

module.exports = middleware;
