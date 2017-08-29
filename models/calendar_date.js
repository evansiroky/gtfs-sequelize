const DataTypes = require('sequelize').DataTypes
const moment = require('moment-timezone')

module.exports = function (db) {
  /*
    If there are specific days when a trip is not available, such as holidays,
    you should define these in the calendar_dates.txt file. You can use this
    to define exceptional days when the Trip is operated, as well as when it
    is not operated. For example, you may have special services that are only
    operated on a public holiday, and they would be defined as unavailable
    (in calendar.txt) and as available on the holiday (in calendar_dates.txt).

    The calendar_dates table allows you to explicitly activate or disable
    service IDs by date. You can use it in two ways.

    - Recommended: Use calendar_dates.txt in conjunction with calendar.txt,
      where calendar_dates.txt defines any exceptions to the default service
      categories defined in the calendar.txt file. If your service is generally
      regular, with a few changes on explicit dates (for example, to accomodate
      special event services, or a school schedule), this is a good approach.
    - Alternate: Omit calendar.txt, and include ALL dates of service in
      calendar_dates.txt. If your schedule varies most days of the month,
      or you want to programmatically output service dates without specifying a
      normal weekly schedule, this approach may be preferable.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/calendar_dates-file
  */
  const CalendarDate = db.define('calendar_date', {
    /*
      Contains an ID that uniquely identifies a set of dates when a service
      exception is available for one or more routes. Each (service_id, date)
      pair can only appear once in calendar_dates.txt. If the a service_id
      value appears in both the calendar.txt and calendar_dates.txt files,
      the information in calendar_dates.txt modifies the service information
      specified in calendar.txt. This field is referenced by the trips.txt file.
    */
    service_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Specifies a particular date when service availability is different than
      the norm. You can use the exception_type field to indicate whether service
      is available on the specified date.
      The date field's value should be in YYYYMMDD format.
    */
    date: {
      type: DataTypes.STRING(8),
      primaryKey: true,
      validate: { is: /^[0-9]{8}$/ }
    },
    /*
      Indicates whether service is available on the date specified in the date field.
      - A value of 1 indicates that service has been added for the specified date.
      - A value of 2 indicates that service has been removed for the specified date.
      For example, suppose a route has one set of trips available on holidays and
      another set of trips available on all other days. You could have one service_id
      that corresponds to the regular service schedule and another service_id that
      corresponds to the holiday schedule. For a particular holiday, you would use
      the calendar_dates.txt file to add the holiday to the holiday service_id and to
      remove the holiday from the regular service_id schedule.
    */
    exception_type: DataTypes.INTEGER
  }, {
    getterMethods: {
      /*
        Get the exception date as a moment object in the correct timezone.
      */
      dateMoment () {
        return moment.tz(this.start_date, 'YYYYMMDD', db.timezoneFor(this.service_id))
      }
    }
  })

  CalendarDate.prototype.isOpen = function () {
    return this.exception_type === CalendarDate.EXCEPTION_OPEN
  }

  CalendarDate.EXCEPTION_OPEN = 1
  CalendarDate.EXCEPTION_CLOSED = 2
  CalendarDate.filename = 'calendar_dates.txt'

  return CalendarDate
}
