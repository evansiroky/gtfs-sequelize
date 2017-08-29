
const GTFS = require('./index.js')
const GTFS_URL = 'http://www.itsmarta.com/google_transit_feed/google_transit.zip'

const m = new GTFS(GTFS_URL, {sequelizeOptions: {logging: true}})

// {force: true, log: console.log.bind(console), sequelizeOptions: {logging: true}}
m.init({force: true, log: console.log.bind(console)}).then(m => {
  console.log('ready')
})

// function MartaGTFS (opts) {
//   if (!(this instanceof MartaGTFS)) {
//     return new MartaGTFS(opts)
//   }
