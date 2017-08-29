const DataTypes = require('sequelize').DataTypes
const moment = require('moment-timezone')

module.exports = function (db) {
  /*
    Services define a range of dates between which a Trip is available,
    the days of the week when it is available (such as Monday through
    Friday), and are defined in the calendar.txt file. A single Service
    can be applied to multiple different Trips. If a given vehicle has
    different schedules, such as one schedule on weekdays and a different
    one on weekends, you should define two Trips with the same stops but
    different Services and different StopTimes.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/calendar-file
  */
  const Calendar = db.define('calendar', {
    /*
      Contains an ID that uniquely identifies a set of dates when service
      is available for one or more routes. Each service_id value can appear
      at most once in a calendar.txt file. This value is dataset unique.
      It is referenced by the trips.txt file.
    */
    service_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Contains a binary value that indicates whether the service is valid for all Mondays.
      A value of 1 indicates that service is available for all Mondays in the date range.
      (The date range is specified using the start_date and end_date fields.)
      A value of 0 indicates that service is not available on Mondays in the date range.
    */
    monday: DataTypes.INTEGER,
    /*
      Contains a binary value that indicates whether the service is valid for all Tuesdays.
      A value of 1 indicates that service is available for all Tuesdays in the date range.
      (The date range is specified using the start_date and end_date fields.)
      A value of 0 indicates that service is not available on Tuesdays in the date range.
    */
    tuesday: DataTypes.INTEGER,
    /*
      Contains a binary value that indicates whether the service is valid for all Wednesdays.
      A value of 1 indicates that service is available for all Wednesdays in the date range.
      (The date range is specified using the start_date and end_date fields.)
      A value of 0 indicates that service is not available on Wednesdays in the date range.
    */
    wednesday: DataTypes.INTEGER,
    /*
      Contains a binary value that indicates whether the service is valid for all Thursdays.
      A value of 1 indicates that service is available for all Thursdays in the date range.
      (The date range is specified using the start_date and end_date fields.)
      A value of 0 indicates that service is not available on Thursdays in the date range.
    */
    thursday: DataTypes.INTEGER,
    /*
      Contains a binary value that indicates whether the service is valid for all Fridays.
      A value of 1 indicates that service is available for all Fridays in the date range.
      (The date range is specified using the start_date and end_date fields.)
      A value of 0 indicates that service is not available on Fridays in the date range.
    */
    friday: DataTypes.INTEGER,
    /*
      Contains a binary value that indicates whether the service is valid for all Saturdays.
      A value of 1 indicates that service is available for all Saturdays in the date range.
      (The date range is specified using the start_date and end_date fields.)
      A value of 0 indicates that service is not available on Saturdays in the date range.
    */
    saturday: DataTypes.INTEGER,
    /*
      Contains a binary value that indicates whether the service is valid for all Sundays.
      A value of 1 indicates that service is available for all Sundays in the date range.
      (The date range is specified using the start_date and end_date fields.)
      A value of 0 indicates that service is not available on Sundays in the date range.
    */
    sunday: DataTypes.INTEGER,
    /*
      The start_date field contains the start date for the service.
      The start_date field's value should be in YYYYMMDD format.
    */
    start_date: {
      type: DataTypes.STRING(8),
      validate: { is: /^[0-9]{8}$/ }
    },
    /*
      Contains the end date for the service. This date is included in the service interval.
      The end_date field's value should be in YYYYMMDD format.
    */
    end_date: {
      type: DataTypes.STRING(8),
      validate: { is: /^[0-9]{8}$/ }
    }
  }, {
    getterMethods: {
      /*
        Get the start date as a moment object in the correct timezone.
      */
      startDateMoment () {
        return moment.tz(this.start_date, 'YYYYMMDD', db.timezoneFor(this.service_id))
      },
      /*
        Get the end date as a moment object in the correct timezone.
      */
      endDateMoment () {
        return moment(this.end_date, 'YYYYMMDD', db.timezoneFor(this.service_id))
      }
    }
  })

  Calendar.filename = 'calendar.txt'

  return Calendar
}
