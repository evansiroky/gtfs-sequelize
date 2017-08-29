const DataTypes = require('sequelize').DataTypes

module.exports = function (db) {
  /*
    An Agency is an operator of a public transit network, often a
    public authority. Agencies are defined in the file agency.txt,
    and can have URLs, phone numbers, and language indicators. If
    you are providing a feed that includes vehicles operated by
    different agencies, you can define multiple agencies in this
    file and associate them with each Trip.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/agency-file
  */
  const Agency = db.define('agency', {
    /*
      Uniquely identifies a transit agency. A transit feed may
      represent data from more than one agency. The agency_id
      is dataset unique. This field is optional for transit feeds
      that only contain data for a single agency.
    */
    agency_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      The agency_name field contains the full name of the transit
      agency. Google Maps will display this name.
    */
    agency_name: DataTypes.STRING(255),
    /*
      Contains the URL of the transit agency. The value must be a fully
      qualified URL that includes http:// or https://, and any special
      characters in the URL must be correctly escaped.
      See http://www.w3.org/Addressing/URL/4_URI_Recommentations.html
      for a description of how to create fully qualified URL values.
    */
    agency_url: DataTypes.STRING(255),
    /*
      Contains the timezone where the transit agency is located.
      Timezone names never contain the space character but may
      contain an underscore. Please refer to
      http://en.wikipedia.org/wiki/List_of_tz_zones for a list of
      valid values. If multiple agencies are specified in the feed,
      each must have the same agency_timezone.
    */
    agency_timezone: DataTypes.STRING(100),
    /*
      Contains a two-letter ISO 639-1 code for the primary language
      used by this transit agency. The language code is case-insensitive
      (both en and EN are accepted). This setting defines capitalization
      rules and other language-specific settings for all text contained
      in this transit agency's feed. Please refer to
      http://www.loc.gov/standards/iso639-2/php/code_list.php for a list
      of valid values.
    */
    agency_lang: DataTypes.STRING(2),
    /*
      Contains a single voice telephone number for the specified agency.
      This field is a string value that presents the telephone number as
      typical for the agency's service area. It can and should contain
      punctuation marks to group the digits of the number. Dialable text
      (for example, TriMet's "503-238-RIDE") is permitted, but the field
      must not contain any other descriptive text.
    */
    agency_phone: DataTypes.STRING(50),
    /*
      Specifies the URL of a web page that allows a rider to purchase tickets
      or other fare instruments for that agency online. The value must be a
      fully qualified URL that includes http:// or https://, and any special
      characters in the URL must be correctly escaped. See
      http://www.w3.org/Addressing/URL/4_URI_Recommentations.html for a
      description of how to create fully qualified URL values.
    */
    agency_fare_url: DataTypes.STRING(255),
    /*
      Contains a single valid email address actively monitored by the agency’s
      customer service department. This email address will be considered a direct
      contact point where transit riders can reach a customer service
      representative at the agency.
    */
    agency_email: DataTypes.STRING(255)
  })

  Agency.filename = 'agency.txt'

  return Agency
}
