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

//result_win 0=nodata, 1=player, 2=banker, 3=tie
//play_game_result 0=nodata, 1=win, 2=lose, 3=tie
let Bacarat7resultSchema = new Schema(
  {
    game_id: {
      type: Number,
    },
    result_win: {
      type: Number,//0=nodata, 1=player, 2=banker, 3=tie
    },
    his_01: {
      type: String,
    },
    his_02: {
      type: String,
    },
    his_03: {
      type: String,
    },
    his_04: {
      type: String,
    },
    his_05: {
      type: String,
    },
    his_06: {
      type: String,
    },
    his_07: {
      type: String,
    },
    his_08: {
      type: String,
    },
    his_09: {
      type: String,
    },
    his_20: {
      type: String,
    },
    his_50: {
      type: String,
    },
    his_50_notie: {
      type: String,
    },
    date_utc_create: {
      type: Date,
    },
    date_utc_create_int: {
      type: Number,
    },
    first_save: {
      type: Number,
    },
  },
  { 
    collection: process.env['MONGO_DB_BCGAME_COLLECTION_FOR_BACARAT_RESULT'],
    versionKey: false,
    statics: {
      //1 or true to include. The findOne() method always includes the _id field even if the field is not explicitly specified in the projection parameter.
      //0 or false to exclude.

      getInfo(game_id) {
        return this.findOne({ 'game_id': game_id});
      },

      getLastInfo() {
        return this.findOne().sort({'game_id':-1}).limit(1);
      },

      getLastFirstSave() {
        return this.findOne({ 'first_save': 1}).sort({'game_id':-1}).limit(1);
      },

      insertOrUpdate(case_save, data_save){
        let optx = {
          new: true,
          upsert: true
        };
        return this.findOneAndUpdate(case_save, data_save, optx);
      },

      // check_result_win(game_id) {
      //   return this.findOne({ 'game_id': game_id});
      // },

      // setLastGameId(botid, save_gameid) {
      //   let temp_date = new Date();
      //   let temp_date_int = Math.floor(Number(temp_date)/1000);
      //   return this.updateOne(
      //     { 
      //       bot_id: botid
      //     },
      //     {
      //       last_game_id: save_gameid,
      //       date_utc_lastupdate: temp_date,
      //       date_utc_lastupdate_int: temp_date_int
      //     }
      //   );
      // }
    }
  }
);

let Bacarat7result = conn.model("bacarat7result", Bacarat7resultSchema);

module.exports = Bacarat7result;