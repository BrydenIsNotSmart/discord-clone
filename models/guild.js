const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    channel: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
        },
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    participant: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    guild_name: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    guild_picture: {
        type: String,
        default: "/img/placeholder.png",
    },
});

module.exports = mongoose.model("Guild", channelSchema);
