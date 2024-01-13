const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var conn = mongoose.createConnection(
  process.env['MONGO_DB_BCGAME_URI'],
  {
    dbName: process.env['MONGO_DB_BCGAME_DATABASE_NAME'],
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

let BotinfoSchema = new Schema(
  {
    bot_id: {
      type: String,
    },
    bot_status: {
      type: Number,
    },
    last_command: {
      type: Number,
    },
    last_game_id: {
      type: Number,
    },
    last_score: {
      type: Number,
    },
    bot_process: {
      type: Number,
    },
    date_utc_lastupdate: {
      type: Date,
    },
    date_utc_lastupdate_int: {
      type: Number,
    },
  },
  {
    collection: process.env['MONGO_DB_BCGAME_COLLECTION_FOR_BOTINFO'],
    versionKey: false,
    statics: {
      getInfo(botid) {
        return this.findOne({ bot_id: botid});
      },
      insertOrUpdate(case_save, data_save){
        let optx = {
          new: true,
          upsert: true
        };
        return this.findOneAndUpdate(case_save, data_save, optx);
      },
      setLastGameId(botid, save_gameid) {
        ///////////////
        let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
        let now_long = Date.now();//milliseconds 13 digit longint
        let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
        ///////////////
        return this.updateOne(
          { 
            bot_id: botid
          },
          {
            last_game_id: save_gameid,
            date_utc_lastupdate: now,
            date_utc_lastupdate_int: now_int
          }
        );
      },
      setBot_inprocess(botid, save_gameid) {
        ///////////////
        let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
        let now_long = Date.now();//milliseconds 13 digit longint
        let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
        ///////////////
        return this.updateOne(
          { 
            bot_id: botid
          },
          {
            bot_process: 1,
            date_utc_lastupdate: now,
            date_utc_lastupdate_int: now_int
          }
        );
      },
      setBot_endprocess(botid, save_gameid) {
        ///////////////
        let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
        let now_long = Date.now();//milliseconds 13 digit longint
        let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
        ///////////////
        return this.updateOne(
          { 
            bot_id: botid
          },
          {
            bot_process: 0,
            date_utc_lastupdate: now,
            date_utc_lastupdate_int: now_int
          }
        );
      },
      setBot_lastupdate(botid, save_gameid) {
        ///////////////
        let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
        let now_long = Date.now();//milliseconds 13 digit longint
        let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
        ///////////////
        return this.updateOne(
          { 
            bot_id: botid
          },
          {
            date_utc_lastupdate: now,
            date_utc_lastupdate_int: now_int
          }
        );
      },
      setBot_update_score(botid, save_score) {
        ///////////////
        let now = new Date(new Date().toUTCString());//2022-11-23T20:35:37.000Z
        let now_long = Date.now();//milliseconds 13 digit longint
        let now_int =  Math.floor(now_long/1000); //seconds 10 digit int
        ///////////////
        if(save_score==null){
          save_score = 0;
        }
        return this.updateOne(
          { 
            bot_id: botid
          },
          {
            last_score: save_score,
            date_utc_lastupdate: now,
            date_utc_lastupdate_int: now_int
          }
        );
      }
    }
  },
  // {
  //   statics: {
  //     getInfo(botid) {
  //       return this.findOne({ bot_id: botid});
  //     }
  //   }
  // }
);

let Botinfo = conn.model("botinfo", BotinfoSchema);

module.exports = Botinfo;