/**
 * Module that queries all agencies for their timezone
 * values up front and stores in memory, so that all
 * moment data can be cast to the appropriate zone.
 * This is faster than joining on agency every time,
 * and since typically the number of agencies is small,
 * the memory footprint should be low.
 *
 * Pass in the Agency model and this will return a
 * Promise which resolves to a lookup function which
 * returns the timezone string for a given agencyId.
 */
module.exports = function (Agency) {
  var agencyZones = {};

  function getZone(agencyId) {
    return agencyZones[agencyId]
  }

  return Agency.findAll({
    attributes: ['agency_id', 'agency_timezone']
  }).then(results => {
    results.forEach(result => {
      agencyZones[result.agency_id] = agency_timezone
    })
    return getZone
  })
}