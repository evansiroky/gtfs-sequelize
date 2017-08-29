module.exports = function (db) {
  var models = {
    agency:         require('./agency')(db),
    calendar:       require('./calendar')(db),
    calendarDate:   require('./calendar_date')(db),
    fareAttribute:  require('./fare_attribute')(db),
    fareRule:       require('./fare_rule')(db),
    freedInfo:      require('./feed_info')(db),
    frequency:      require('./frequency')(db),
    route:          require('./route')(db),
    shape:          require('./shape')(db),
    stop:           require('./stop')(db),
    stopTime:       require('./stop_time')(db),
    trasfer:        require('./transfer')(db),
    trip:           require('./trip')(db)
  }

  if (db.gisEnabled) {
    models.shapeGIS = require('./spatial/shape_gis')(db)
  }
  return models
}
