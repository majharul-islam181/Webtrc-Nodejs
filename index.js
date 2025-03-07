const express = require("express");
const app = express();
const mongoose = require("mongoose")
const {MONGO_DB_CONFIG} = require ("./config/app.config")
const http = require("http")
const server = http.createServer(app)
const {initMeetingServer} = require("./meeting-server")
initMeetingServer(server);


//meeting-server
//initMeetingServer(server)

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_DB_CONFIG, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>{
    console.log("Database Connected")
}),(error)=>{
    console.log("Database can't be Connected")
}

app.use(express.json());
app.use("/api", require("./routes/app.route"))
server.listen(process.env.port || 4000, function(){
    console.log("Reday to go!")
})