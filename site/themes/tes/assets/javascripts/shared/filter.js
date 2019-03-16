// DOM Ready
(function() {

  var liveFilter = (function() {
    /**
     * Initializes a search field with associated list and filters it live while typing
     *
     * @param {string} searchFieldId     An ID of a search field input element
     * @param {string} listId            An ID of an element containing items that should be filtered
     * @param {object} [options]         Specifies additional options:
     *                                   * selector: specifies a query to be run against list; the results
     *                                     will be filtered according to the value of the search field. If
     *                                     not specified, the filter matches all direct children.
     *                                   * filterClass: specifies a class name to be applied to items that
     *                                     are going to be filtered out. If not specified, defaults to
     *                                     "filter-hidden".
     */
    function liveFilter( searchFieldId, listId, options) {

      var searchField = document.getElementById(searchFieldId),
          list = document.getElementById(listId),
          selector,
          filterClass;

      if (!searchField) {
        throw new Error("No search element found with id " + searchFieldId);
      }

      if (!list) {
        throw new Error("No list element found with id " + listId);
      }

      if (options !== undefined) {
        selector = options.selector;
        filterClass = options.filterClass;
      }

      if (filterClass === undefined) {
        filterClass = "filter-hidden";
      }

      var handler = function searchFieldChanged() {
        var text = this.value,     // this will be bound to the search field
            regexp = RegExp(text, 'i'),
            nodes = (selector === undefined) ? list.children
                                             : list.querySelectorAll(selector),
            node;

        for (var i = 0, l = nodes.length; i < l; i++) {
          node = nodes[i];
          if (node.textContent.search(regexp) < 0) {
            // note: classList is only available on modern browsers
            node.style.display = "none";
          } else {
            node.style.display = "initial";
          }
        }
      };

      // input is for modern browsers
      searchField.addEventListener("input", handler, false);
    }

    // If using CommonJS, you'd do module.exports = liveFilter, and it could be required later.
    return liveFilter;
  })();

  liveFilter("filter", "list", { selector: "li", filterClass: "filter-hidden" });

})(); // end DOM ready
