const DataTypes = require('sequelize').DataTypes

module.exports = function (db) {
  /*
    A FareAttribute (defined in fare_attributes.txt) defines
    a fare class. A FareAttribute has a price, currency and
    whether it must be purchased on board the service or before
    boarding. It also defines the number of transfers it can be
    used for, and the duration it is valid.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/fare_attributes-file
  */
  const FareAttribute = db.define('fare_attribute', {
    /*
      Contains an ID that uniquely identifies a fare class. The
      fare_id is dataset unique.
    */
    fare_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Contains the fare price, in the unit specified by currency_type.
    */
    price: DataTypes.FLOAT,
    /*
      Defines the currency used to pay the fare. Please use the ISO 4217
      alphabetical currency codes which can be found at the following
      URL: http://en.wikipedia.org/wiki/ISO_4217.
    */
    currency_type: DataTypes.STRING(3),
    /*
      The payment_method field indicates when the fare must be paid.
      Valid values for this field are:
      - 0: Fare is paid on board.
      - 1: Fare must be paid before boarding.
    */
    payment_method: DataTypes.INTEGER,
    /*
      Specifies the number of transfers permitted on this fare.
      Valid values for this field are:
      - 0: No transfers permitted on this fare.
      - 1: Passenger may transfer once.
      - 2: Passenger may transfer twice.
      - (empty): If this field is empty, unlimited transfers are permitted.
    */
    transfers: DataTypes.INTEGER,
    /*
      Specifies the length of time in seconds before a transfer expires.
      When used with a transfers value of 0, the transfer_duration field
      indicates how long a ticket is valid for a fare where no transfers
      are allowed. Unless you intend to use this field to indicate ticket
      validity, transfer_duration should be omitted or empty when transfers
      is set to 0.
    */
    transfer_duration: DataTypes.INTEGER
  })

  FareAttribute.filename = 'fare_attributes.txt'

  return FareAttribute
}
