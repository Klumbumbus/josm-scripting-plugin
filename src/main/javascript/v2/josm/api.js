/**
 * <p>This module provides functions to retrieve data from and upload data
 * to an OSM server.</p>
 *
 * @module josm/api
 */

/* global Java */
/* global require */

const URL = Java.type('java.net.URL')
const OsmApi = Java.type('org.openstreetmap.josm.io.OsmApi')
const Changeset = Java.type('org.openstreetmap.josm.data.osm.Changeset')
const OsmPrimitiveType = Java.type('org.openstreetmap.josm.data.osm.OsmPrimitiveType')
const PrimitiveId = Java.type('org.openstreetmap.josm.data.osm.PrimitiveId')
const SimplePrimitiveId = Java.type('org.openstreetmap.josm.data.osm.SimplePrimitiveId')
const NullProgressMonitor = Java.type('org.openstreetmap.josm.gui.progress.NullProgressMonitor')
const OsmServerChangesetReader = Java.type('org.openstreetmap.josm.io.OsmServerChangesetReader')
const OsmServerObjectReader = Java.type('org.openstreetmap.josm.io.OsmServerObjectReader')
const OsmServerBackreferenceReader = Java.type('org.openstreetmap.josm.io.OsmServerBackreferenceReader')
const Preferences = Java.type('org.openstreetmap.josm.data.Preferences')

const util = require('josm/util')

/**
 * <p>Provides methods to open, close, get, update, etc. changesets on the OSM
 * API server.</p>
 *
 * <p><strong>Note:</strong> this class doesn't provide a constructor. Methods
 * and properties
 * are "static".</p>
 *
 * @example
 * // load the changeset api
 * const api = require('josm/api').ChangesetApi
 *
 * // create a new changeset on the server
 * const cs = api.open()
 *
 * @class
 * @name ChangesetApi
 * @memberof josm/api
 */
exports.ChangesetApi = {}

/**
 * <p>Creates and opens a changeset</p>
 *
 * <ul>
 *   <li><code>open()</code>  - open a new changeset with no tags</li>
 *   <li><code>open(aChangeset)</code>  - open a new changeset with the tags
 *   from <code>aChangeset</code></li>
 *   <li><code>open(anObject)</code>  - open a new changeset with the tags
 *   given by the properties of <code>anObject</code></li>
 * </ul>
 *
 * @example
 * const api = require("josm/api").ChangesetApi
 * const Changeset = Java.type('org.openstreetmap.josm.data.osm.Changeset')
 *
 * // open a new changeset with no tags
 * const cs1 = api.open()
 *
 * // open a new changeset with the tags given by the supplied changeset
 * const cs2 = new Changeset()
 * cs2.put('comment', 'a test comment')
 * cs2 = api.open(cs2)
 *
 * // open a new changeset with the tags given by the object
 * var cs3 = api.open({comment: 'a test comment'})
 *
 * @name open
 * @memberOf ChangesetApi
 * @method
 * @static
 * @type org.openstreetmap.josm.data.osm.Changeset
 * @summary Creates and opens a changeset
 */
exports.ChangesetApi.open = function () {
  let cs
  switch (arguments.length) {
    case 0:
      cs = new Changeset()
      break

    case 1:
      var o = arguments[0]
      if (o instanceof Changeset) {
        cs = o
      } else if (typeof o === 'object') {
        cs = new Changeset()
        for (var p in o) {
          if (!util.hasProp(o, p)) continue
          var key = p
          var value = o[p]
          key = util.trim(key)
          value = value + '' // convert to string
          cs.put(key, value)
        }
      } else {
        util.assert(false,
          'Unexpected type of argument, expected Changeset or object, ' +
          'got {0}', o)
      }
      break

    default:
      util.assert(false, 'Unexpected number of arguments, got {0}',
        arguments.length)
  }
  var api = OsmApi.getOsmApi()
  api.openChangeset(cs, NullProgressMonitor.INSTANCE)
  return cs
}

/**
 * <p>Closes a changeset</p>
 *
 * <dl>
 *   <dt><code class="signature">close(id)</code></dt>
 *   <dd>closes the changeset with the given id</dd>
 *
 *   <dt><code class="signature">close(aChangeset)</code><dt>
 *   <dd>Xloses the changeset given by <code>aChangeset</code></dd>
 * </dl>
 *
 * @example
 * const api = require('josm/api').ChangesetApi
 * const util = require('josm/util')
 * const Changeset = Java.type('org.openstreetmap.josm.data.osm.Changeset')
 *
 * // closs the changeset 12345
 * api.close(12345)
 *
 * // open a new changeset with the tags given by the supplied changeset
 * const cs2 = new Changeset(12345)
 * cs2 = api.close(cs2)
 * util.assert(cs2.closed)  // the changeset is now closed
 *
 * @name close
 * @memberOf ChangesetApi
 * @param {number|org.openstreetmap.josm.data.osm.Changeset} changeset
 *         the changeset to close
 * @method
 * @static
 * @type org.openstreetmap.josm.data.osm.Changeset
 * @summary Closes a changeset
 */
exports.ChangesetApi.close = function () {
  let cs
  switch (arguments.length) {
    case 0:
      util.assert(false,
        'Missing arguments. Expected a changeset it or a changeset')
      break

    case 1: {
      const o = arguments[0]
      if (o instanceof Changeset) {
        cs = o
      } else if (util.isNumber(o)) {
        util.assert(o > 0, 'Expected a positive changeset id, got {0}', o)
        cs = new Changeset(o)
      } else {
        util.assert(false,
          'Unexpected type of argument, expected Changeset or number, ' +
          'got {0}', o)
      }
      break
    }

    default:
      util.assert(false, 'Unexpected number of arguments, got {0}',
        arguments.length)
  }
  const api = OsmApi.getOsmApi()
  api.closeChangeset(cs, NullProgressMonitor.INSTANCE)
  return cs
}

/**
 * <p>Updates a changeset</p>
 *
 * <dl>
 *   <dt><code class="signature">update(aChangeset)</code></dt>
 *   <dd>Updates the changeset <code>aChangeset</code></dd>
 * </dl>
 *
 * @example
 * const api = require('josm/api').ChangesetApi;
 * const Changeset = Java.type('org.openstreetmap.josm.data.osm.Changeset')
 *
 * // update the comment of a changeset
 * const cs2 = new Changeset(12345);
 * cs2.put('comment', 'an updated comment');
 * cs2 = api.update(cs2);
 *
 * @name update
 * @param {org.openstreetmap.josm.data.osm.Changeset} changeset  the changeset to update
 * @memberOf ChangesetApi
 * @method
 * @static
 * @type org.openstreetmap.josm.data.osm.Changeset
 * @summary Updates a changeset
 */
exports.ChangesetApi.update = function () {
  let cs
  switch (arguments.length) {
    case 0:
      util.assert(false, 'Missing arguments. Expected a changeset')
      break

    case 1: {
      const o = arguments[0]
      if (o instanceof Changeset) {
        cs = o
      } else {
        util.assert(false,
          'Unexpected type of argument, expected Changeset, got {0}', o)
      }
      break
    }

    default:
      util.assert(false, 'Unexpected number of arguments, got {0}',
        arguments.length)
  }
  const api = OsmApi.getOsmApi()
  api.updateChangeset(cs, NullProgressMonitor.INSTANCE)
  return cs
}

/**
 * <p>Get a changeset from the server</p>
 *
 * <dl>
 *   <dt><code class="signature>get(aChangeset)</code></dt>
 *   <dd>Gets the changeset specified by <code>aChangeset</code>. aChangset
 *   must be an instance of <code>Changeset</code>.
 *   aChangeset.id &gt; 0 expected.</dd>
 *
 *   <dt><code class="signature">get(id)</code></dt>
 *   <dd>gets the changeset for the id. id must be a number &gt; 0.</dd>
 * </dl>
 *
 * @example
 * const api = require('josm/api').ChangesetApi
 * const Changeset = Java.type('org.openstreetmap.josm.data.osm.Changeset')
 *
 * // get the changeset with id 12345
 * const cs1 = api.get(12345)
 *
 * // get the changeset with id 12345
 * const cs2 = new Changeset(12345)
 * cs2 = api.get(cs2)
 *
 * @name get
 * @memberOf ChangesetApi
 * @param {number|org.openstreetmap.josm.data.osm.Changeset} changeset
 *         the changeset to close
 * @method
 * @static
 * @type org.openstreetmap.josm.data.osm.Changeset
 * @summary Get a changeset from the server
 */
exports.ChangesetApi.get = function () {
  let cs
  switch (arguments.length) {
    case 0:
      util.assert(false,
        'Missing arguments. Expected a changeset id or a changeset')
      break

    case 1: {
      const o = arguments[0]
      if (o instanceof Changeset) {
        cs = o
      } else if (util.isNumber(o)) {
        util.assert(o > 0, 'Expected a positive changeset id, got {0}', o)
        cs = new Changeset(o)
      } else {
        util.assert(false,
          'Unexpected type of argument, expected Changeset or number, ' +
          'got {0}', o)
      }
      break
    }

    default:
      util.assert(false, 'Unexpected number of arguments, got {0}',
        arguments.length)
  }
  const reader = new OsmServerChangesetReader()
  cs = reader.readChangeset(cs.id, NullProgressMonitor.INSTANCE)
  return cs
}

/**
 * <p>Collection of static methods to download objects from and upload objects
 * to the OSM server.</p>
 *
 * <p><strong>Note:</strong> this class doesn't provide a constructor.
 * Methods and properties are "static".</p>
 *
 * @example
 * // load the changeset api
 * const api = require('josm/api').Api
 *
 * // download node 12345
 * const ds = api.downloadObject(12345, 'node')
 *
 * @class
 * @name Api
 * @memberof josm/api
 */
exports.Api = {}

function normalizeType (type) {
  util.assert(util.isSomething(type), 'type must not be null or undefined')
  if (util.isString(type)) {
    try {
      type = OsmPrimitiveType.fromApiTypeName(type)
    } catch (e) {
      util.assert(false, "Invalid primitive type, got ''{0}''", type)
    }
  } else if (type instanceof OsmPrimitiveType) {
    if (![OsmPrimitiveType.NODE, OsmPrimitiveType.WAY, OsmPrimitiveType.RELATION].contains(type)) {
      util.assert(false, 'Invalid primitive type, got {0}', type)
    }
  } else {
    util.assert(false, 'Invalid primitive type, got {0}', type)
  }
  return type
}

function normalizeId (id) {
  util.assert(util.isSomething(id), 'id must not be null or nothing')
  util.assert(util.isNumber(id), 'Expected a number as id, got {0}', id)
  util.assert(id > 0, 'Expected a positive number as id, got {0}', id)
  return id
}

function primitiveIdFromObject (o) {
  util.assert(util.hasProp(o, 'id'),
    "Mandatory property ''id'' is missing in object {0}", o)
  util.assert(util.hasProp(o, 'type'),
    "Mandatory property ''type'' is missing in object {0}", o)
  return new SimplePrimitiveId(normalizeId(o.id), normalizeType(o.type))
}

function downloadObject1 () {
  let id
  const o = arguments[0]
  util.assert(util.isSomething(o),
    'Argument 0: must not be null or undefined')
  if (o instanceof PrimitiveId) {
    id = o
  } else if (typeof o === 'object') {
    id = primitiveIdFromObject(o)
  } else {
    util.assert(false, 'Argument 0: unexpected type, got {0}', o)
  }
  var reader = new OsmServerObjectReader(id, false)
  var ds = reader.parseOsm(null /* null progress monitor */)
  return ds
}

function optionFull (options) {
  if (!util.hasProp(options, 'full')) return undefined
  var o = options.full
  if (typeof o === 'boolean') return o
  util.assert("Expected a boolean value for option ''full'', got {0}", o)
}

function optionVersion (options) {
  if (!util.hasProp(options, 'version')) return undefined
  var o = options.version
  util.assert(util.isNumber(o),
    "Expected a number for option ''version'', got {0}", o)
  util.assert(o > 0,
    "Expected a number > 0 for option ''version'', got {0}", o)
  return o
}

function downloadObject2 () {
  function parseOptions (arg) {
    const options = { full: undefined, version: undefined }
    if (!(typeof arg === 'object')) {
      return options
    }
    options.full = optionFull(arg)
    options.version = optionVersion(arg)
    return options
  }

  let id
  let options = { full: undefined, version: undefined }

  if (util.isNumber(arguments[0])) {
    id = normalizeId(arguments[0])
    var type = normalizeType(arguments[1])
    id = new SimplePrimitiveId(id, type)
  } else if (arguments[0] instanceof PrimitiveId) {
    id = arguments[0]
    options = parseOptions(arguments[1])
  } else if (typeof arguments[0] === 'object') {
    id = primitiveIdFromObject(arguments[0])
    options = parseOptions(arguments[1])
  } else {
    util.assert(false, 'Unsupported types of arguments')
  }
  var reader
  if (util.isDef(options.version)) {
    reader = new OsmServerObjectReader(id, options.version)
  } else {
    reader = new OsmServerObjectReader(id, !!options.full)
  }
  var ds = reader.parseOsm(null /* null progress monitor */)
  return ds
}

function downloadObject3 () {
  const options = { full: undefined, version: undefined }
  var n = normalizeId(arguments[0])
  var type = normalizeType(arguments[1])
  var id = new SimplePrimitiveId(n, type)

  util.assert(typeof arguments[2] === 'object',
    'Expected an object with named parameters, got {0}', arguments[2])
  options.full = optionFull(arguments[2])
  options.version = optionVersion(arguments[2])
  let reader
  if (util.isDef(options.version)) {
    reader = new OsmServerObjectReader(id, options.version)
  } else {
    reader = new OsmServerObjectReader(id, !!options.full)
  }
  var ds = reader.parseOsm(null /* null progress monitor */)
  return ds
}

/**
 * <p>Downloads an object from the server.</p>
 *
 * <p>There are multiple options to specify what object to download.
 * In addition, the function accepts a set of optional named parameters
 * as last argument.</p>
 *
 * <dl>
 *   <dt><code class="signature">downloadObject(id, type, ?options)</code></dt>
 *   <dd><code>id</code> is the global numeric id.
 *   <code>type</code> is either one of the strings "node", "way",
 *   or "relation", or one of the  enumeration OsmPrimitiveType.NODE,
 *   OsmPrimitiveType.WAY, or OsmPrimitiveType.RELATION
 *   </dd>
 *
 *   <dt><code class="signature">downloadObject(id, ?options)</code></dt>
 *   <dd><code>id</code> is a <code>PrimitiveId</code> or an object
 *   with the (mandatory) properties <code>id</code> and <code>type</code>,
 *   i.e. an object <code>{id: ..., type: ...}</code>.
 *   <code>id</code> is again a number, <code>type</code> is again either one
 *   of the strings "node", "way", or "relation", or one of the
 *   enumeration OsmPrimitiveType.NODE, OsmPrimitiveType.WAY,
 *   or OsmPrimitiveType.RELATION.
 *   </dd>
 * </dl>
 * In both cases, <code>?options</code> is an (optional) object with the
 * following two (optional) properties:
 * <dl>
 *   <dt><code class="signature">full</code>: boolean</dt>
 *   <dd>If <code>true</code>, the object and its immediate children are
 *   downloaded, i.e. the nodes of a way and
 *   the relation members of a relation. Default if missing is
 *   <code>false</code>.</dd>
 *
 *   <dt><code class="signature">version</code>: number</dt>
 *   <dd>If present, the specified version of the object is downloaded.
 *   If missing, the current version is downloaded. If present, the
 *   option <code>full</code> is ignored.</dd>
 * </dl>
 *
 * @example
 * const api = require('josm/api').Api
 * const SimlePrimitiveId = Java.type('org.openstreetmap.josm.data.osm.SimplePrimitiveId')
 * const OsmPrimitiveType = Java.type('org.openstreetmap.josm.data.osm.OsmPrimitiveType')
 *
 * // download the node with id 12345
 * const ds1 = api.downloadObject(12345, 'node')
 *
 * // download the node with id 12345
 * const ds2 = api.downloadObject({id: 12345, type: 'node'})
 *
 * // download the full relation (including its members) with id 12345
 * const id = new SimplePrimitiveId(12345, OsmPrimitiveType.RELATION)
 * const ds3 = api.downloadObject(id, {full: true})
 *
 * // download version 5 of the full way 12345 (including its nodes)
 * var ds4 = api.downloadObject(12345, OsmPrimitiveType.WAY,
 *         {version: 5});
 *
 * @method
 * @static
 * @name downloadObject
 * @memberOf Api
 * @type org.openstreetmap.josm.data.osm.DataSet
 * @summary Downloads an object from the server.
 */
exports.Api.downloadObject = function () {
  switch (arguments.length) {
    case 0:
      util.assert(false, 'Unexpected number of arguments, got {0}',
        arguments.length)
      break
    case 1:
      return downloadObject1.apply(this, arguments)

    case 2:
      return downloadObject2.apply(this, arguments)

    case 3:
      return downloadObject3.apply(this, arguments)

    default:
      util.assert(false, 'Unexpected number of arguments, got {0}',
        arguments.length)
  }
}

function downloadReferrer1 () {
  let id
  const o = arguments[0]
  util.assert(util.isSomething(o),
    'Argument 0: must not be null or undefined')
  if (o instanceof PrimitiveId) {
    id = o
  } else if (typeof o === 'object') {
    id = primitiveIdFromObject(o)
  } else {
    util.assert(false, 'Argument 0: unexpected type, got {0}', o)
  }
  const reader = new OsmServerBackreferenceReader(id.getUniqueId(),
    id.getType())
  const ds = reader.parseOsm(NullProgressMonitor.INSTANCE)
  return ds
}

function downloadReferrer2 () {
  let id
  let type
  const options = { full: undefined }
  if (util.isNumber(arguments[0])) {
    id = normalizeId(arguments[0])
    type = normalizeType(arguments[1])
    id = new SimplePrimitiveId(id, type)
  } else if (arguments[0] instanceof PrimitiveId) {
    id = arguments[0]
    const o = arguments[1]
    if (util.isSomething(o)) {
      util.assert(typeof o === 'object',
        'Expected an object with named parameters, got {0}', o)
      options.full = optionFull(o)
    }
  } else if (typeof arguments[0] === 'object') {
    id = primitiveIdFromObject(arguments[0])
    const o = arguments[1]
    if (util.isSomething(o)) {
      util.assert(typeof o === 'object',
        'Expected an object with named parameters, got {0}', o)
      options.full = optionFull(o)
    }
  } else {
    util.assert(false, 'Unsupported types of arguments')
  }
  const reader = new OsmServerBackreferenceReader(id.getUniqueId(),
    id.getType())
  if (options.full) {
    reader.setReadFull(true)
  }
  const ds = reader.parseOsm(NullProgressMonitor.INSTANCE)
  return ds
}

function downloadReferrer3 () {
  const options = { full: undefined }
  const n = normalizeId(arguments[0])
  const type = normalizeType(arguments[1])
  const id = new SimplePrimitiveId(n, type)

  util.assert(typeof arguments[2] === 'object',
    'Expected an object with named parameters, got {0}', arguments[2])
  options.full = optionFull(arguments[2])

  const reader = new OsmServerBackreferenceReader(id.getUniqueId(),
    id.getType())
  if (options.full) {
    reader.setReadFull(true)
  }
  const ds = reader.parseOsm(NullProgressMonitor.INSTANCE)
  return ds
}

/**
 * <p>Downloads the objects <em>referring</em> to another object from
 * the server.</p>
 *
 * <p>Downloads primitives from the OSM server which
 * refer to a specific primitive. Given a node, the referring ways and
 * relations are downloaded. Given a way or a relation, only referring
 * relations are downloaded.</p>
 *
 * <p>The default behaviour is to reply proxy objects only.</p>
 *
 * <p>If you set the option <code>{full: true}</code>, every referring object
 * is downloaded in full.</p>
 *
 * <p>There are multiple options to specify what referrers to download.
 * In addition, the function accepts a set of optional named parameters as
 * last argument.</p>
 *
 * <dl>
 *   <dt><code class="signature">downloadReferrer(id, type, ?options)
 *       </code></dt>
 *   <dd><code>id</code> is the global numeric id.
 *   <code>type</code> is either one of the strings "node", "way", or
 *   "relation", or one of the  enumeration
 *   {@class org.openstreetmap.josm.data.osm.OsmPrimitiveType}.NODE,
 *   {@class org.openstreetmap.josm.data.osm.OsmPrimitiveType}.WAY,
 *   or {@class org.openstreetmap.josm.data.osm.OsmPrimitiveType}.RELATION.
 *   </dd>
 *
 *   <dt><code class="signature">downloadReferrer(id, ?options)</code></dt>
 *   <dd><code>id</code> is a <code>PrimitiveId</code> or an object
 *   with the (mandatory) properties <code>id</code> and <code>type</code>,
 *   i.e. an object <code>{id: ..., type: ...}</code>.
 *   <code>id</code> is again a number, <code>type</code> is again either one
 *   of the strings "node", "way", or "relation", or one of the
 *   enumeration
 *   {@class org.openstreetmap.josm.data.osm.OsmPrimitiveType}.NODE,
 *   {@class org.openstreetmap.josm.data.osm.OsmPrimitiveType}.WAY,
 *   or {@class org.openstreetmap.josm.data.osm.OsmPrimitiveType}.RELATION.
 *   </dd>
 * </dl>
 * In both cases, <code>?options</code> is an (optional) object with the
 * following  (optional) property:
 * <dl>
 *   <dt><code class="signature">full</code>:boolean</dt>
 *   <dd>If <code>true</code>, the the <strong>full</strong> objects are
 *   retrieved using multi-gets. If missing or <code>false</code>,
 *   only proxy objects are downloaded. Default: false</dd>
 * </dl>
 *
 * @example
 * const api = require('josm/api').Api
 * const nbuilder = require('josm/builder').NodeBuilder
 * const SimlePrimitiveId = Java.type('org.openstreetmap.josm.data.osm.SimplePrimitiveId')
 * const OsmPrimitiveType = Java.type('org.openstreetmap.josm.data.osm.OsmPrimitiveType')
 *
 * // download the objects referring to the node with id 12345
 * const ds1 = api.downloadReferrer(12345, 'node')
 *
 * // download the objects referring to the node with id 12345
 * const ds2 = api.downloadReferrer({id: 12345, type: 'node'})
 *
 * // download the relations referring to the  relation with id 12345.
 * // Referring relations are downloaded in full.
 * const id = new SimplePrimitiveId(12345, OsmPrimitiveType.RELATION)
 * const ds3 = api.downloadReferrer(id, { full: true })
 *
 * // create the global node 12345 ...
 * const node = nbuilder.create(12345);
 * // ... and downloads its referrers in full
 * const ds = api.downloadReferrer(node, { full: true })
 *
 * @method
 * @static
 * @name downloadReferrer
 * @memberOf Api
 * @type org.openstreetmap.josm.data.osm.DataSet
 * @summary Downloads the objects <em>referring</em> to another object from
 *     the server.
 */
exports.Api.downloadReferrer = function () {
  switch (arguments.length) {
    case 0:
      util.assert(false, 'Unexpected number of arguments, got {0}',
        arguments.length)
      break

    case 1:
      return downloadReferrer1.apply(this, arguments)

    case 2:
      return downloadReferrer2.apply(this, arguments)

    case 3:
      return downloadReferrer3.apply(this, arguments)

    default:
      util.assert(false, 'Unexpected number of arguments, got {0}',
        arguments.length)
  }
}

/**
 * <p>Downloads the objects within a bounding box.</p>
 *
 * @example
 * const api = require('josm/api').Api
 * const ds1 = api.downloadArea(new Bounds(
 *     new LatLon(46.9479186,7.4619484),   // min
 *     new LatLon(46.9497642, 7.4660683)   // max
 * ))
 *
 * const ds2 = api.downloadArea({
 *     min: {lat: 46.9479186, lon: 7.4619484},
 *     max: {lat: 46.9497642, lon: 7.4660683}
 * })
 *
 * @method
 * @static
 * @name downloadArea
 * @memberOf Api
 * @type org.openstreetmap.josm.data.osm.DataSet
 * @summary Downloads the objects within a bounding box
 */
exports.Api.downloadArea = function () {
  const BoundingBoxDownloader =
    Java.type('org.openstreetmap.josm.io.BoundingBoxDownloader')
  const NullProgressMonitor =
    Java.type('org.openstreetmap.josm.gui.progress.NullProgressMonitor')
  const Bounds = Java.type('org.openstreetmap.josm.data.Bounds')

  util.assert(arguments.length === 1, 'Expected 1 argument, got {0}',
    arguments.length)
  let bounds = arguments[0]
  util.assert(util.isSomething(bounds),
    'bounds: must not be null or undefined')
  if (bounds instanceof Bounds) {
    // do nothing
  } else if (typeof bounds === 'object') {
    bounds = Bounds.make(bounds) // convert to bounds
  } else {
    util.assert(false,
      'expected an instance of Bounds or an object, got {0}', bounds)
  }
  const downloader = new BoundingBoxDownloader(bounds)
  return downloader.parseOsm(NullProgressMonitor.INSTANCE)
}

/**
 * <p>Uploads objects to the server.</p>
 *
 * <p>You can submit data either as
 * {@class org.openstreetmap.josm.data.osm.DataSet},
 * {@class org.openstreetmap.josm.data.APIDataSet}, javascript array of
 * {@class org.openstreetmap.josm.data.osm.OsmPrimitive}s or
 * a {@class java.util.Collection} of
 * {@class org.openstreetmap.josm.data.osm.OsmPrimitive}s.</p>
 *
 * <p>This method supports the same upload strategy as the JOSM upload dialog.
 * Supply the named parameter <code>{strategy: ...}</code> to choose the
 * strategy.</p>
 *
 * <p class="documentation-warning">
 * Be careful when uploading data to the OSM server! Do not upload copyright
 * protected or test data.
 * </p>
 *
 * <p>The method takes care to update the primitives in the uploaded data when
 * the upload succeeds. For instance, uploaded new primitives become global
 * objects and get assigned their new id and version, successfully deleted
 * objects become invisible, etc.</p>
 *
 * <p>Even if the entire upload of a dataset fails, a subset therefore may
 * have been uploaded successfully. In order to keep track, which pritives
 * have been uploaded successfully in case of an error, the method replies a
 * collection of the successfully uploaded objects.</p>
 * <p>Named options</p>
 * <dl>
 *   <dt><code class="signature">strategy: string|
 *   {@class org.openstreetmap.josm.io.UploadStrategy}</code></dt>
 *   <dd>Indicates how the data is uploaded. Either one of the strings
 *     <ul>
 *          <li>individualobjects</li>
 *          <li>chunked</li>
 *          <li>singlerequest</li>
 *       </ul>
 *      or one of the enumeration values in
 *      {@class org.openstreetmap.josm.io.UploadStrategy}.
 *      Default falue: UploadStrategy.DEFAULT_UPLOAD_STRATEGY
 *   </dd>
 *
 *    <dt><code class="signature">changeset:
 *        number|{@class org.openstreetmap.josm.data.osm.Changeset}</code></dt>
 *    <dd>The changeset to which the data is uploaded. Either a number
 *       (the changeset id) or a
 *       {@class org.openstreetmap.josm.data.osm.Changeset} instance.
 *       Default: creates a new changeset.</dd>
 *
 *    <dt><code class="signature">chunkSize: number</code></dt>
 *    <dd>The size of an upload chunk, if the data is uploaded with the
 *    upload strategy
 *    {@class org.openstreetmap.josm.io.UploadStrategy}.CHUNKED_DATASET_STRATEGY.</dd>
 *
 *    <dt><code class="signature">closeChangeset: boolean</code></dt>
 *    <dd>If true, closes the changeset after the upload. Default: true</dd>
 * </dl>
 *
 * @example
 * const DataSet = Java.type('org.openstreetmap.josm.data.osm.DataSet')
 * const ds = new DataSet()
 * ds.wayBuilder.withNodes(
 *     ds.nodeBuilder.withTags({name: 'node1'}).create(),
 *     ds.nodeBuilder.withTags({name: 'node2'}.create()
 * ).withTags({name: 'way1'}).create()
 *
 * const api = require('josm/api').Api
 *
 * // uploads the data in a new changeset in one chunk)
 * const processed = api.upload(ds, 'just testing');
 *
 * @param {(org.openstreetmap.josm.data.osm.DataSet|
 *         org.openstreetmap.josm.data.APIDataSet|array|java.util.Collection)}
 *         data the data to upload
 * @param {string} comment the upload comment
 * @param {object} options (optional) various options (see above)
 * @method
 * @static
 * @name upload
 * @memberOf Api
 * @type java.util.Collection
 * @summary Uploads objects
 */
exports.Api.upload = function (data, comment, options) {
  const UploadStrategy = Java.type('org.openstreetmap.josm.io.UploadStrategy')
  const Changeset = Java.type('org.openstreetmap.josm.data.osm.Changeset')
  const APIDataSet = Java.type('org.openstreetmap.josm.data.APIDataSet')
  const DataSet = Java.type('org.openstreetmap.josm.data.osm.DataSet')
  const UploadStrategySpecification =
    Java.type('org.openstreetmap.josm.io.UploadStrategySpecification')
  const Collection = Java.type('java.util.Collection')
  const OsmServerWriter = Java.type('org.openstreetmap.josm.io.OsmServerWriter')

  comment = comment || ''
  comment = String(comment)

  util.assertSomething(data, 'data: must not be null or undefined')
  options = options || {}
  util.assert(typeof options === 'object',
    'options: expected an object with named arguments, got {0}', options)

  function normalizeChunkSize (size) {
    util.assert(util.isNumber(size),
      'chunksize: expected a number, got {0}', size)
    util.assert(size >= -1,
      'chunksize: expected -1 or a number > 0, got {0]', size)
    return size
  }

  function normalizeChangeset (changeset) {
    if (util.isNothing(changeset)) {
      return new Changeset()
    } else if (util.isNumber(changeset)) {
      util.assert(changeset > 0,
        'changeset: expected a changeset id > 0, got {0}', changeset)
      return new Changeset(changeset)
    } else if (changeset instanceof Changeset) {
      return changeset
    } else {
      util.assert(false, 'changeset: unexpected value, got {0}',
        changeset)
    }
  }

  function uploadSpecFromOptions (options) {
    let strategy = options.strategy ||
      UploadStrategy.DEFAULT_UPLOAD_STRATEGY
    strategy = UploadStrategy.from(strategy)

    let chunkSize = options.chunkSize ||
      UploadStrategySpecification.UNSPECIFIED_CHUNK_SIZE
    chunkSize = normalizeChunkSize(chunkSize)

    let closeChangeset = util.isDef(options.closeChangeset)
      ? options.closeChangeset : true
    closeChangeset = Boolean(closeChangeset)

    const spec = new UploadStrategySpecification()
    spec.setStrategy(strategy)
    spec.setChunkSize(chunkSize)
    spec.setCloseChangesetAfterUpload(closeChangeset)
    return spec
  }

  let apiDataSet
  if (data instanceof DataSet) {
    apiDataSet = new APIDataSet(data)
  } else if (data instanceof APIDataSet) {
    apiDataSet = data
  } else if (util.isArray(data)) {
    apiDataSet = new APIDataSet(data)
  } else if (data instanceof Collection) {
    apiDataSet = new APIDataSet(data)
  } else {
    util.assert(false, 'data: unexpected type of value, got {0}', data)
  }

  if (apiDataSet.isEmpty()) return undefined
  apiDataSet.adjustRelationUploadOrder()
  const toUpload = apiDataSet.getPrimitives()

  let changeset = options.changeset || new Changeset()
  changeset = normalizeChangeset(changeset)
  changeset.put('comment', comment)
  const spec = uploadSpecFromOptions(options)
  const writer = new OsmServerWriter()

  writer.uploadOsm(spec, toUpload, changeset, null /* progress monitor */)
  if (spec.isCloseChangesetAfterUpload()) {
    exports.ChangesetApi.close(changeset)
  }

  return writer.getProcessedPrimitives()
}

/* -------------------------------------------------------------------------- */
/* ApiConfig                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * <p>ApiConfig provides methods and properties for configuring API parameters.
 * </p>
 *
 * @class ApiConfig
 * @memberof josm/api
 */
Object.defineProperty(exports, 'ApiConfig', {
  value: {},
  writable: false,
  enumerable: true
})

const DEFAULT_URL = 'http://api.openstreetmap.com/api/0.6'

/**
 * <p>Get or set the API server URL.</p>
 *
 * <dl>
 *   <dt><code class="signature">get</code></dt>
 *   <dd>Replies the currently configured server URL or undefinend, if no
 *   server URL is configured.</dd>
 *   <dt><code class="signature">set</code></dt>
 *   <dd>Sets the current server URL. If null or undefined, removes the
 *   current configuration. Accepts either a string or a {@class java.net.URL}.
 *   Only accepts http or https URLs.
 *   </dd>
 * </dl>
 *
 * @example
 * const conf = require('josm/api').ApiConfig
 * conf.serverUrl   // -> the current server url
 *
 * // set a new API url
 * conf.serverUrl = 'http://api06.dev.openstreetmap.org'
 *
 * @field
 * @memberOf ApiConfig
 * @static
 * @summary Get or set the API server URL.
 * @type string
 * @name serverUrl
 */
Object.defineProperty(exports.ApiConfig, 'serverUrl', {
  enumerable: true,
  get: function () {
    var url = Preferences.main().get('osm-server.url', null)
    if (url == null) url = DEFAULT_URL
    return url == null ? undefined : util.trim(url)
  },

  set: function (value) {
    if (util.isNothing(value)) {
      Preferences.main().put('osm-server.url', null)
    } else if (value instanceof URL) {
      util.assert(value.getProtocol() === 'http' || value.getProtocol() === 'https',
        'url: expected a http or https URL, got {0}', value)
      Preferences.main().put('osm-server.url', value.toString())
    } else if (util.isString(value)) {
      value = util.trim(value)
      try {
        const url = new URL(value)
        util.assert(url.getProtocol() === 'http' || url.getProtocol() === 'https',
          'url: expected a http or https URL, got {0}',
          url.toString())
        Preferences.main().put('osm-server.url', url.toString())
      } catch (e) {
        util.assert(false,
          "url: doesn''t look like a valid URL, got {0}. Error: {1}",
          value, e)
      }
    } else {
      util.assert(false, 'Unexpected type of value, got {0}', value)
    }
  }
})

/**
 * <p>Get the default server URL.</p>
 * @example
 * const conf = require('josm/api').ApiConfig
 * conf.defaultServerUrl   // -> the default server url
 *
 * @field
 * @memberOf ApiConfig
 * @static
 * @summary Get the default server URL-
 * @type string
 * @name defaultServerUrl
 * @readOnly
 */
Object.defineProperty(exports.ApiConfig, 'defaultServerUrl', {
  value: DEFAULT_URL,
  writable: false,
  enumerable: true
})

function normalizeAuthMethod (authMethod) {
  util.assert(util.isString(authMethod),
    'authMethod: expected a string, got {0}',
    authMethod)
  authMethod = util.trim(authMethod).toLowerCase()
  util.assert(authMethod === 'basic' || authMethod === 'oauth',
    'Unsupported value for authMethod, got {0}', authMethod)
  return authMethod
}

/**
 * <p>Get or set the authentication method.</p>
 *
 * <p>JOSM uses two authentication methods:</p>
 * <dl>
 *    <dt><code class="signature">basic</code></dt>
 *    <dd>Basic authentication with a username and a password</dd>
 *    <dt><code class="signature">oauth</code></dt>
 *    <dd>Authentication with the <a href="http://oauth.net/">OAuth</a>
 *        protocol.</dd>
 * </dl>
 *
 * @example
 * const conf = require('josm/api').ApiConfig
 * conf.authMethod;   // -> the current authentication method
 *
 * // set OAuth as authentication method
 * conf.authMethod = 'oauth'
 *
 * @field
 * @memberOf ApiConfig
 * @static
 * @summary Get or set the authentication method.
 * @type string
 * @name authMethod
 */
Object.defineProperty(exports.ApiConfig, 'authMethod', {
  enumerate: true,
  get: function () {
    var authMethod = Preferences.main().get('osm-server.auth-method', 'basic')
    authMethod = util.trim(authMethod).toLowerCase()
    if (authMethod === 'basic' || authMethod === 'oauth') return authMethod
    // unsupported value for authMethod in the preferences. Returning
    // 'basic' as default.
    return 'basic'
  },
  set: function (value) {
    value = normalizeAuthMethod(value)
    Preferences.main().put('osm-server.auth-method', value)
  }
})

/**
 * <p>Gets the credentials, i.e. username and password for the basic
 * authentication method.</p>
 *
 * <strong>Named options</strong>
 * <dl>
 *    <dt><code class="signature">host:string</code></dt>
 *    <dd>The host name of the API server for which credentials are retrieved.
 *    If missing, the host name of the currently configured OSM API server
 *    is used.</dd>
 * </dl>
 *
 * @example
 * const conf = require('josm/api').ApiConfig
 *
 * // get username/password for the current OSM API server
 * const credentials = conf.getCredentials('basic')
 *
 * @param {string} authMethod  the authentication method. Either "basic" or
 *         "oauth".
 * @param {object} options  (optional) additional options (see above)
 * @method
 * @memberOf ApiConfig
 * @static
 * @summary Gets the credentials.
 * @type object
 * @name getCredentials
 */
exports.ApiConfig.getCredentials = function (authMethod, options) {
  const CredentialsManager = Java.type('org.openstreetmap.josm.io.auth.CredentialsManager')
  const OsmApi = Java.type('org.openstreetmap.josm.io.OsmApi')
  const RequestorType = Java.type('java.net.Authenticator.RequestorType')
  const String = Java.type('java.lang.String')

  options = options || {}
  util.assert(typeof options === 'object',
    'options: expected an object with named options, got {0}', options)

  function getBasicCredentials () {
    const cm = CredentialsManager.getInstance()
    if (options.host) options.host = util.trim(String(options.host))
    const host = options.host ? options.host : OsmApi.getOsmApi().getHost()
    const pa = cm.lookup(RequestorType.SERVER, host)
    return pa ? {
      host: host,
      user: pa.getUserName(),
      password: String.valueOf(pa.getPassword())
    } : {
      host: host,
      user: undefined,
      password: undefined
    }
  }

  function getOAuthCredentials () {
    const cm = CredentialsManager.getInstance()
    const token = cm.lookupOAuthAccessToken()
    if (token == null) return undefined
    return { key: token.getKey(), secret: token.getSecret() }
  }

  authMethod = normalizeAuthMethod(authMethod)
  if (authMethod === 'basic') return getBasicCredentials()
  if (authMethod === 'oauth') return getOAuthCredentials()
  util.assert(false, 'Unsupported authentication method, got {0}',
    authMethod)
}

function normalizeBasicCredentials (credentials) {
  const PasswordAuthentication = Java.type('java.net.PasswordAuthentication')

  if (util.isNothing(credentials)) return null
  util.assert(credentials instanceof PasswordAuthentication || typeof credentials === 'object',
    'basic credentials: expected an object or an instance of ' +
    'PasswordAuthentication , got {0}', credentials)

  if (credentials instanceof PasswordAuthentication) {
    return credentials
  } else {
    const user = String.valueOf(credentials.user || '')
    let password = credentials.password || null
    password = password
      ? String.valueOf(password).toCharArray()
      : password
    return new PasswordAuthentication(user, password)
  }
}

function normalizeOAuthCredentials (credentials) {
  const OAuthToken = Java.type('org.openstreetmap.josm.data.oauth.OAuthToken')
  if (util.isNothing(credentials)) return null
  util.assert(credentials instanceof OAuthToken || typeof credentials === 'object',
    'oauth credentials: expected an object or an instance of OAuthToken, ' +
    'got {0}', credentials)
  if (credentials instanceof OAuthToken) {
    return credentials
  } else {
    const key = String(credentials.key || '')
    const secret = String(credentials.secret || '')
    return new OAuthToken(key, secret)
  }
}

/**
 * <p>Set the credentials, i.e. username and password for the basic
 * authentication method.</p>
 *
 * <p>Basic authentication credentials are either an instance of
 * java.net.PasswordAuthentication or
 * an object <code>{user: string, password: string}</code>.</p>
 *
 * <p>OAuth authentication credentials are either an instance of
 * {@class org.openstreetmap.josm.data.oauth.OAuthToken} or
 * an object <code>{key: string, secret: string}</code>.</p>
 * <strong>Named options</strong>
 * <dl>
 *    <dt><code class="signature">host:string</code></dt>
 *    <dd>The host name of the API server for which credentials are set.
 *    If missing, the host name of the currently configured OSM API server
 *    is used.</dd>
 * </dl>
 *
 * @example
 * const conf = require('josm/api').ApiConfig
 *
 * // set the credentials
 * conf.setCredentials('basic', { user:'test', password:'apassword' })
 *
 * @param {string} authMethod  the authentication method. Either "basic" or
 *         "oauth".
 * @param {(object|org.openstreetmap.josm.data.oauth.OAuthToken|java.net.PasswordAuthentication)}
 *         credentials  the credentials.
 * @param {object} options  (optional) additional options (see above)
 * @method
 * @memberOf ApiConfig
 * @static
 * @summary Set the credentials.
 * @type object
 * @name setCredentials
 */
exports.ApiConfig.setCredentials = function (authMethod, credentials, options) {
  const CredentialsManager = Java.type('org.openstreetmap.josm.io.auth.CredentialsManager')
  const RequestorType = Java.type('java.net.Authenticator.RequestorType')
  const OsmApi = Java.type('org.openstreetmap.josm.io.OsmApi')

  options = options || {}
  util.assert(typeof options === 'object',
    'options: expected an object with named options, got {0}', options)
  authMethod = normalizeAuthMethod(authMethod)
  if (authMethod === 'basic') {
    credentials = normalizeBasicCredentials(credentials)
    util.assert(credentials != null,
      "credentials: can''t store null credentials")
    let host = options.host ? String(options.host) : null
    host = host || OsmApi.getOsmApi().getHost()
    const cm = CredentialsManager.getInstance()
    cm.store(RequestorType.SERVER, host, credentials)
  } else if (authMethod === 'oauth') {
    credentials = normalizeOAuthCredentials(credentials)
    util.assert(credentials != null,
      "credentials: can''t store null credentials")
    const cm = CredentialsManager.getInstance()
    cm.storeOAuthAccessToken(credentials)
  } else {
    util.assert(false, 'Unsupported authentication method, got {0}',
      authMethod)
  }
}