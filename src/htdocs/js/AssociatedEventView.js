'use strict';

var EventComparisonView = require('./EventComparisonView'),
    CatalogEvent = require('./CatalogEvent'),
    Collection = require('mvc/Collection'),
    Util = require('util/Util'),
    View = require('mvc/View');


var AssociatedEventView = function (options) {

  var _this,
      _initialize,

      // variables
      _associatedEventsEl,
      _el,
      _event,
      _subEvents,

      // methods
      _disassociateCallback,
      _createView;

  options = Util.extend({}, options);
  _this = View(options);


  _initialize = function () {
    _el = _this.el;
    _event = CatalogEvent(options.eventDetails);

    _el.innerHTML = '<h3>Associated Events</h3>' +
        '<div class="associated-events"></div>';
    _associatedEventsEl = _el.querySelector('.associated-events');

    _createView();
    options = null;
  };

  /**
   * Create the associated events table, this table contains all sub-events
   * a disassociate button.
   */
  _createView = function () {
    var id = null,
        events = [];

    _subEvents = _event.getSubEvents();

    for (id in _subEvents) {
      events.push(_subEvents[id].getSummary());
    }

    // Collection table inserts markup via innerHTML
    EventComparisonView({
      el: _associatedEventsEl,
      referenceEvent: _event.getSummary(),
      collection: Collection(events),
      buttons: [
        {
          title: 'Disassociate',
          className: 'disassociate',
          callback: _disassociateCallback
        }
      ]
    });
  };

  /**
   * Disassociates a subevent from the event.
   *
   * @param  {object} eventSummary,
   *         summary of the event to be removed
   */
  _disassociateCallback = function (eventSummary) {
    var preferredEventId = _event.getSummary().id;
    // TODO, disassociate eventSummary.id from _event.getSummary().id (preferred)
    console.log('preferred id: ' + preferredEventId);
    console.log('remove id: ' + eventSummary.id);
    console.log(eventSummary);
  };

  /**
   * Clean up private variables, methods, and remove event listeners.
   */
  _this.destroy = function () {

    // methods
    _disassociateCallback = null;
    _createView = null;

    // variables
    _associatedEventsEl = null;
    _el = null;
    _event = null;
    _subEvents = null;
  };

  _initialize();
  return _this;
};


module.exports = AssociatedEventView;