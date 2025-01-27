/*
 * This program is part of the OpenCms Mercury Template.
 *
 * Copyright (c) Alkacon Software GmbH & Co. KG (http://www.alkacon.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { _OpenCmsReinitEditButtons } from './opencms-callbacks.js';

/**
 * Definitions of the types locally used.
 *
 * NOTE: Definition may be incomplete since the HTML attribute "data-list" contains a JSON object
 * that the list object extends from. It might provide some keys not documented/typed here.
 *
 * @typedef {Object} List Wrapper for a single list.
 * @property {JQuery<HTMLElement>} $element the HTML element of the list.
 * @property {string} id the lists unique id on the page.
 * @property {string} elementId the id of the list element's content.
 * @property {boolean} loadAll flag, indicating if all items are loaded directly.
 * @property {?number[]} pageSizes the page sizes as array. Only provided in load all case.
 * @property {JQuery<HTMLElement>} $editbox HTML element representing the edit box for empty lists.
 * @property {JQuery<HTMLElement>} $entries HTML element representing the list entries shown.
 * @property {JQuery<HTMLElement>} $spinner HTML element representing the spinner shown when loading
 * @property {JQuery<HTMLElement>} $pagination HTML element where pagination is put.
 * @property {?Map<number, JQuery>} pageEntries the entries per page. Only filled in loadAll mode.
 * @property {?JQuery<HTMLElement>} $noresults HTML element where information about the empty list is placed.
 * @property {boolean} locked flag, indicating if the list is locked for reloading.
 * @property {boolean} autoload flag, indicating if the list should automatically load more items on scroll.
 * @property {boolean} notclicked flag, indicating if the "load more" button was already clicked.
 * @property {string} option pagination option, either "append" or "paginate".
 * @property {JQuery<HTMLElement>} $facets the facet elements of the list.
 * @property {string} initparams the initial search state parameters to apply on first load of the list.
 * @property {PageData} pageData the pagination state.
 * @property {PaginationCallback} paginationCallback the pagination callback function.
 *
 * @typedef {Object.<string, List>} ListMap Object holding only lists as property values.
 *
 * @typedef {Object.<string, List[]>} ListArrayMap Object holding only list arrays as property values.
 *
 * @typedef {Object} ListFilter Wrapper for a list's filter.
 * @property {JQuery<HTMLElement>} $element the HTML element of the filter.
 * @property {string} id the id attribute of the filter HTML element.
 * @property {string} elementId the id of the list element the filter belongs to.
 * @property {?JQuery<HTMLElement>} $textsearch  the search form of the filter (for full text search).
 * @property {string} initparams the initial search state parameters to apply on first load of the list.

 * @typedef {Object.<string, ListFilter>} ListFilterMap Object holding only list filters as property values.
 *
 * @typedef {Object.<string, ListFilter[]>} ListFilterArrayMap Object holding only list filters as property values.
 *
 * @typedef {Object} PageData Holds the list's pagination data.
 * @property {boolean} reloaded flag, indicating if ????
 * @property {number} currentPage the currently shown page.
 * @property {number} pages the total number of pages.
 * @property {number} found the total number of results.
 * @property {number} start the first result to show on the page.
 * @property {number} end the last result to show on the page.
 *
 * @callback PaginationCallback
 * @param {PageData} pageData the current state of the list pagination.
 *
 /

// the global objects that must be passed to this module
/** @type {jQuery} jQuery object */
var jQ;
/** @type {boolean} flag, indicating if in debug mode. */
var DEBUG;

/** @type {ListMap} all initialized lists by unique instance id  */
var m_lists = {};

/** @type {ListFilterMap} all initialized list archive filters by unique instance id  */
var m_archiveFilters = {};

/** @type {ListArrayMap} groups of lists by element id (potentially more then one on a page) */
var m_listGroups = {};

/** @type {ListFilterArrayMap} groups of archive filters lists by list element id (potentially more then one on a page) */
var m_archiveFilterGroups = {};

/** @type {List[]} all auto loading lists as array for easy iteration  */
var m_autoLoadLists = [];

/** @type {boolean} flag indicating whether to scroll to the list head on filter or on page change. */
var m_flagScrollToAnchor = true;

/**
 * Calculates the search state parameters.
 * @param {*} filter
 * @param {string} elId id of the element the search state parameters should be calculated for.
 * @param {boolean} resetActive flag, indicating if other active filters should be reset.
 * @returns {string} the search state parameters corresponding to the filter action.
 */
function calculateStateParameter(filter, elId, resetActive) {
    var $el = $( '#' + elId);
    var value = $el.data("value")
    var paramkey = elId.indexOf('cat_') == 0 ? (resetActive && $el.hasClass("active") ? '' : filter.catparamkey) : elId.indexOf('folder_') == 0 ? filter.folderparamkey : resetActive && $el.hasClass("active") ? '' : filter.archiveparamkey;
    var stateParameter =
        typeof paramkey !== 'undefined' && paramkey != '' && typeof value !== 'undefined' && value != ''
            ? '&' + paramkey + '=' + encodeURIComponent(value)
            : '';
    return stateParameter;
}


/**
 * Splits the request parameters in a key-value map.
 * @param {string} paramstring
 * @returns {Map<string,string>} parameters as key-value map.
 */
function splitRequestParameters(paramstring) {
    var params={};
    paramstring.replace(/[?&]*([^=&]+)=([^&]*)/gi, function(str,key,value) {
        params[key] = decodeURIComponent(value);
    });
    return params;
}


/**
 * Generates the search state parameters for the provided filter.
 *
 * @param {ListFilter} filter the filter element to get the additional parameters for.
 * @returns {string} the additional search state parameters generated by the filter.
 */
// retrieves the set filters from other category filters and combines the filter parameters
function getAdditionalFilterParams(filter) {
    var filterGroup = m_archiveFilterGroups[filter.elementId];
    var params = "";
    if (typeof filterGroup !== 'undefined') {
        for (var i=0; i<filterGroup.length; i++) {
            var fi = filterGroup[i];
            //TODO: Query
            if (fi.combinable && fi.id != filter.id) {
                var query = fi.$textsearch.val();
                if(typeof query !== 'undefined' && query != '') {
                    params += '&' + fi.$textsearch.attr('name') + '=' + encodeURIComponent(query);
                }
                fi.$element.find(".active").each( function() {
                    var p = calculateStateParameter(fi, this.id, false);
                    params += p;
                });
            }
        }
    }
    return params;
}

/**
 * Applies a list filter.
 *
 * @param {string} id the id of the list to apply the filter for.
 * @param {string} triggerId the id of the element that triggered the filter action (TODO: correct?)
 * @param {string} filterId the id of the list filter element.
 * @param {string} searchStateParameters the search state parameters corresponding to the filter action.
 * @param {boolean} removeOthers flag, indicating if other filters should be cleared.
 * @returns {void}
 */
function listFilter(id, triggerId, filterId, searchStateParameters, removeOthers) {

    if (DEBUG) console.info("Lists.listFilter() called elementId=" + id);

    // reset filters of not sorting
    var filterGroup = m_archiveFilterGroups[id];
    var filter = m_archiveFilters[filterId]
    var removeAllFilters = !(filter && filter.combine);
    if ((triggerId != "SORT") && (typeof filterGroup !== "undefined")) {
        // potentially the same filter may be on the same page
        // here we make sure to reset them all
        var triggeredWasActive = triggerId != null && jQ("#" + triggerId).hasClass("active");
        for (var i=0; i<filterGroup.length; i++) {
            var fi = filterGroup[i];
            // remove all active / highlighted filters
            // unless filters should be combined
            if (removeOthers && (removeAllFilters || !fi.combinable || fi.id == filterId)) {
                var $elactive = fi.$element.find(".active");
                $elactive.removeClass("active");
                // clear text input if wanted
                if (triggerId != fi.$textsearch.id) {
                    fi.$textsearch.val('');
                }
            }
            if (triggerId != null) {
                fi.$element.find(".currentpage").removeClass("currentpage");
                var $current = fi.$element.find("#" + triggerId).first();
                if (DEBUG) console.info("Lists.listFilter() Current has class active? : " + $current.hasClass("active") + " - " + $current.attr("class"));
                // activate / highlight clicked filter
                if (triggerId.indexOf("folder_") == 0) {
                    $current.addClass("currentpage");
                    $current.parentsUntil("ul.list-group").addClass("currentpage");
                } else if (triggeredWasActive){
                    $current.removeClass("active");
                } else {
                    $current.addClass("active");
                }
            } else if (fi.id == filterId && (typeof searchStateParameters === 'string' || searchStateParameters instanceof String) && searchStateParameters.length > 0) {
                // highlight possibly already checked category restrictions
                var catparamkey = fi.catparamkey;
                if(typeof catparamkey !== 'undefined') {
                    var params = splitRequestParameters(searchStateParameters);
                    var initValue = params[catparamkey];
                        if (typeof initValue !== 'undefined' && initValue != '') {
                            fi.$element.find("li").each(function () {
                            var $this = $(this);
                            var itemValue = $this.data("value");
                            if (itemValue === initValue) {
                                $this.addClass("active");
                            }
                        });
                    }
                }
            }
        }
    }

    var listGroup = m_listGroups[id];
    if (typeof listGroup !== "undefined") {
        // required list is an element on this page
        for (var i=0; i<listGroup.length; i++) {
            updateInnerList(listGroup[i].id, searchStateParameters, true);
        }
        updateDirectLink(filter, searchStateParameters);
    } else {
        var archive = m_archiveFilters[filterId];
        // list is not on this page, check filter target attribute
        var target = archive.target;
        if (typeof target !== "undefined" && target !== window.location.pathname && target + "index.html" !== window.location.pathname) {
            if (DEBUG) console.info("Lists.listFilter() No list group found on page, trying redirect to " + target);
            var params = splitRequestParameters("reloaded=true&" + searchStateParameters);

            Mercury.post(target, params);
        } else {
            console.error("Lists.listFilter() Unable to load list!\nNo dynamic list found on the page and property 'mercury.list' not set.");
        }
    }
}

/**
 * Updates the direct link for a changed search state.
 *
 * @param {Object} filter the filter 
 * @param {string} searchStateParameters the search state paramters
 */
function updateDirectLink(filter, searchStateParameters) {
    if (!filter.$directlink) {
        return;
    }
    var link = filter.$directlink.find("a");
    if (!link) {
        return;
    }
    link.attr("href", "?" + searchStateParameters);
}

/**
 * Updates the list (results) for a changed search state.
 * Search is performed on the server and results are returned according to the state parameters.
 *
 * @param {string} id the lists id.
 * @param {string} searchStateParameters the search state parameters.
 * @param {boolean} reloadEntries flag, indicating if the shown list entries should be reloaded (in contrast to appending new ones only).
 * @returns {void}
 */
function updateInnerList(id, searchStateParameters, reloadEntries) {
    searchStateParameters = searchStateParameters || "";
    reloadEntries = reloadEntries || false;

    var list = m_lists[id];

    if (DEBUG) console.info("Lists.updateInnerList() called instanceId=" + list.id + " elementId=" + list.elementId + " parameters=" + searchStateParameters);

    if ((list.ajax == null)) {
        if (DEBUG) console.warn("Lists.updateInnerList() called instanceId=" + list.id + " elementId=" + list.elementId + " parameters=" + searchStateParameters + " does not support updates since no AJAX link is provided.");
    } else {
        if (!list.locked) {
            list.locked = true;

            var ajaxOptions = "&";
            if (reloadEntries) {
                // hide the "no results found" message during search
                list.$editbox.hide();
                list.$pagination.show();
            } else {
                // fade out the load more button
                list.$element.find('.btn-append').addClass("fadeOut");
                // we don't need to calculate facets again if we do not reload all entries
                ajaxOptions = "&hideOptions=true&";
            }
            if (list.initialLoad) {
                list.$element.addClass("initial-load");
            }

            // calculate the spinner position in context to the visible list part
            var scrollTop = Mercury.windowScrollTop();
            var windowHeight = window.innerHeight;
            var elementTop = list.$element.offset().top;
            var offsetTop = scrollTop > elementTop ? (elementTop - scrollTop) * -1 : 0;
            var elementHeight = list.$element.outerHeight(true);
            var visibleHeight = Math.min(scrollTop + windowHeight, elementTop + elementHeight) - Math.max(scrollTop, elementTop);
            var spinnerPos = ((0.5 * visibleHeight) + offsetTop) / elementHeight * 100.0;

            if (false && DEBUG) console.info("Lists.updateInnerList() Spinner animation" +
                " scrollTop=" + scrollTop +
                " windowHeight=" + windowHeight +
                " elementTop=" + elementTop +
                " offsetTop=" + offsetTop +
                " elementHeight=" + elementHeight +
                " visibleHeight=" + visibleHeight +
                " spinnerPos=" + spinnerPos + "%"
            )

            // show the spinner
            if (visibleHeight > 0) {
                list.$spinner.css("top", spinnerPos + "%").fadeIn(250);
            }

            // get requested page
            var page = 1;
            var pageParamPos = searchStateParameters.indexOf("page=");
            if (pageParamPos >= 0) {
                var helper = searchStateParameters.substring(pageParamPos + 5);
                var pageFromParam = parseInt(helper);
                if (!isNaN(pageFromParam) && pageFromParam > 1) {
                    page = pageFromParam;
                }
            }
            if (DEBUG) console.info("Lists.updateInnerList() showing page " + page);

            jQ.get(buildAjaxLink(list, ajaxOptions, searchStateParameters), function(ajaxListHtml) {
                generateListHtml(list, reloadEntries, ajaxListHtml, page)
            }, "html");
        }
    }
}

/**
 * Generates the AJAX link to call to retrieve the list entries and pagination for the
 * provided state.
 *
 * @param {List} list the list to generate the link for.
 * @param {string} ajaxOptions the ajax options to pass with the link as parameters.
 * @param {string} searchStateParameters the search state parameters to pass with the link.
 * @returns {string} the AJAX link.
 */
function buildAjaxLink(list, ajaxOptions, searchStateParameters) {

    if (DEBUG) console.info("Lists.buildAjaxLink() called - searchStateParameters='" + searchStateParameters + "' ajaxOptions='" + ajaxOptions + "'");

    var params = "contentpath=" + list.path
        + "&instanceId="
        + list.id
        + "&elementId="
        + list.elementId
        + "&sitepath="
        + list.sitepath
        + "&subsite="
        + list.subsite
        + "&__locale="
        + list.locale
        + "&loc="
        + list.locale
        + "&option="
        + list.option;

    if (list.$facets.length != 0) {
        // The first option is only used by the old lists. NG lists use the settings.
        params = params + "&facets=" + list.$facets.data("facets");
        params = params + list.$facets.data("settings");
    }
    return list.ajax + (list.ajax.indexOf('?') >= 0 ? '&' : '?') + params + ajaxOptions + searchStateParameters;
}

/**
 * Makes the list's HTML (results and pagination) visible on the client.
 * Call it after new results are returned from the server.
 *
 * @param {List} list the list to render the HTML for.
 * @param {boolean} reloadEntries flag, indicating if the current results should be reloaded/replaced.
 * @param {string} listHtml the list HTML as received from the server.
 * @param {number} page the number of the result page to show.
 * @returns {void}
*/
function generateListHtml(list, reloadEntries, listHtml, page) {
    if (DEBUG) console.info("Lists.generateListHtml() called");

    var $result = jQ(listHtml);
    // collect information about the search result
    var resultData = $result.find('#resultdata').first().data('result');
    list.pageData = resultData;
    list.pageData.itemsPerPage = parseInt(list.itemsPerPage, 10);
    if (DEBUG) console.info("Lists.generateListHtml() Search result - list=" + list.id + ", reloaded=" + list.pageData.reloaded + ", start=" + list.pageData.start + ", end=" + list.pageData.end + ", entries=" + list.pageData.found + ", pages=" + list.pageData.pages + ", currentPage=" + list.pageData.currentPage + ", page to show=" + page);

    var $newEntries;
    var $groups = $result.find("div[listgroup]");
    var hasGroups = $groups.length > 0;
    if (hasGroups) {
        // the search results should be grouped
        if (DEBUG) console.info("Lists.generateListHtml() Search result - list=" + list.id + " contains " + $groups.length + " groups");
        hasGroups = combineGroups($groups, false);
        $newEntries = $result.find(".list-entry:parent");
    } else {
        // no grouping of search results required
        $newEntries = $result.find(".list-entry:not(:empty)");
        // :not(:empty) added to remove 'invalid' decoys
    }

    if (list.loadAll) {
        list.pageEntries = paginateEntries(list, $newEntries);
        list.pageData.pages = list.pageEntries.size;
    }
    // clear the pagination element
    list.$pagination.empty();

    // initial list load:
    // entries are already there, if there are no groups in the result we can skip the reload
    // but never skip if all items are displayed
    var skipInitialLoad = list.initialLoad && !hasGroups && !list.loadAll;
    list.initialLoad = false;
    if (DEBUG && skipInitialLoad) console.info("Lists.generateListHtml() Skipping initial reload for list=" + list.id);

    if (reloadEntries && !skipInitialLoad) {
        // set min-height of list to avoid screen flicker
        list.$entries.css("min-height", list.$entries.height() + 'px');
        // remove the old entries when list is reloaded
        list.$entries.empty();
    }

    // add the new elements to the list and set pagination element with new content.
    if (list.loadAll) {
        if (list.pageEntries.size == 0) {
            list.$entries.hide();
                if (list.$noresults != null) {
                var $noResultsElements = $result.find(".list-no-entries");
                if ($noResultsElements.length > 0) {
                    list.$noresults.empty();
                    $noResultsElements.appendTo(list.$noresults)
                }
                list.$noresults.show();
            }
        } else {
            if ((page < 1) || (page > list.pageData.pages)) {
                page = 1;
            }
            if (list.$noresults != null) list.$noresults.hide();
            if ((page > 1) && (list.option === 'append')) {
                list.$entries.empty();
                for (var i=1; i<page; i++) {
                    list.pageEntries.get(i).appendTo(list.$entries);
                }
            }
            list.pageEntries.get(page).appendTo(list.$entries);
            if (list.pageEntries.size > 1) {
                var paginationString = generatePagination(list, page);
                if (!paginationString.empty) {
                    jQ(paginationString).appendTo(list.$pagination);
                }
            } else {
                updatePageData(list, page);
            }
        }
    } else {
        if (!skipInitialLoad) {
            $newEntries.appendTo(list.$entries);
        }
        // set pagination element with new content
        $result.find('.list-append-position').appendTo(list.$pagination);
    }

    if (reloadEntries) {
        var $facetOptions = list.$facets;

        // reset the list option box
        $facetOptions.find(".list-options").remove();
        $result.find(".list-options").appendTo($facetOptions);

        // check if we have found any results
        if ($newEntries.length == 0) {
            // show the "no results found" message
            list.$editbox.show();
            // no results means we don't need any pagination element
            list.$pagination.hide();
        }
        // reset the min-height of the list now that the elements are visible
        list.$entries.animate({'min-height': "0px"}, 500);
    }

    // trigger "list:loaded" event
    jQ('#' + list.id)[0].dispatchEvent(new CustomEvent("list:loaded", { bubbles: true, cancelable: true }));

    // fade out the spinner
    list.$spinner.fadeOut(250);
    list.$element.removeClass("initial-load");
    list.locked = false;

    if ((list.appendOption === "clickfirst") && list.notclicked && !reloadEntries) {
        // this is a auto loading list that is activated on first click
        m_autoLoadLists.push(list);
        list.notclicked = false;
        if (m_autoLoadLists.length == 1) {
            // enable scroll listener because we now have one autoloading gallery
            jQ(window).bind('scroll', handleAutoLoaders);
        }
        handleAutoLoaders();
    } else if (reloadEntries && list.autoload) {
        // check if we can render more of this automatic loading list
        handleAutoLoaders();
    }

    // there may be media elements in the list
    Mercury.update('#' + list.id);

    if (resultData.reloaded == "true" && reloadEntries) {
        if (! list.$element.visible()) {
            if (DEBUG) console.info("Lists.generateListHtml() Scrolling to anchor");
            if (m_flagScrollToAnchor) {
                Mercury.scrollToAnchor(list.$element, -20);
            }
        }
    }
}

/**
 *
 * @param {List} list the list to update the page data for.
 * @param {number} page the new current page.
 */
function updatePageData(list, page) {
    var pageData = list.pageData;
    var previousEnd = 0;
    for(var i = 1; i < page; i++) {
        previousEnd = previousEnd + getPageSize(i, list.pageSizes);
    }
    if (list.option !== 'append') {
        pageData.start = previousEnd + 1;
    } else {
        pageData.start = 1;
    }
    pageData.currentPage = page;
    pageData.end = previousEnd + getPageSize(page, list.pageSizes);
    if (pageData.end > pageData.found) {
        pageData.end = pageData.found;
    }
    if (null != list.paginationCallback) {
        list.paginationCallback(pageData);
    }
}

/**
 * Generates the pagination on the client side.
 * This is only used when all items are prefetched.
 * @param {Object} list the list (object) to generate the pagination for.
 * @param {number} page the current page
 * @returns {string | null} the HTML to render for the pagination, or null if no pagination should be rendered.
 */
function generatePagination(list, page) {

    updatePageData(list, page);
    var pagination = list.paginationInfo;
    var messages = pagination.messages;
    var listId = list.id;
    var result = [];
    var lastPage = list.pageEntries.size;
    if (lastPage > 1) {
        if (list.option === 'paginate') {
            // show the pagination
            var pagesToShow = 5;
            var firstShownPage;
            var lastShownPage;
            var isShowAll = lastPage <= pagesToShow;
            if (isShowAll) {
                firstShownPage = 1;
                lastShownPage = pagesToShow;
            } else {
                firstShownPage = page - 2 <= 1 ? 1 :  page - 2;
                lastPage = list.pageEntries.size;
                lastShownPage = firstShownPage + pagesToShow - 1;
            }
            if (lastShownPage > lastPage) {
                var diffPages = lastShownPage - lastPage;
                firstShownPage = firstShownPage - diffPages <= 1 ? 1 : firstShownPage - diffPages;
                lastShownPage = lastPage;
            }
            result.push('<ul class="pagination">');
            // previous page and first page
            result.push(generatePaginationItem("previous", page <= 1, false, page <= 1 ? 1 : page -1, messages.tpp, null, "ico fa fa-angle-left", listId)); // mercury:icon
            if (firstShownPage > 1) {
                var liClassesFirstPage = "first";
                if (firstShownPage > 2) {
                    liClassesFirstPage += " gap";
                }
                result.push(generatePaginationItem(liClassesFirstPage, page <= 1, false, 1, messages.tfp, "{{p}}", null, listId));
            }
            for (var p = firstShownPage; p <= lastShownPage; p++) {
                result.push(generatePaginationItem(p == lastShownPage ? "lastpage" : "page", false, page == p, p, messages.tp, messages.lp, "number", listId));
            }
            result.push(generatePaginationItem("next", page >= lastPage, false, page < lastPage ? page + 1 : lastPage, messages.tnp, null, "ico fa fa-angle-right", listId)); // mercury:icon
        } else if (list.option === 'append' && page < lastPage) {
            // show the button to append more results.
            result.push('<div class="list-append-position" data-dynamic="false">');
            result.push('<button class="btn btn-append" onclick="DynamicList.appendPage(\'');
            result.push(listId);
            result.push('\',');
            result.push(page + 1);
            result.push(')"><span>');
            result.push(messages.la);
            result.push("</span></button></div>");
        }
    }
    return result.empty ? null : result.join('');
}

/**
 * Renders a single pagination entry.
 * @param {string} liClasses classes for the li element additionally to active or disabled.
 * @param {boolean} isDisabled flag, indicating if the entry is disabled.
 * @param {boolean} isActive flag, indicating if the entry is active.
 * @param {string} liClasses the classes to put on the li item (except active and disabled).
 * @param {number} page the page to go to when the entry is clicked.
 * @param {string} title the (hover) title of the entry, can contain macro "{{p}}" that will be resolved to the page number of the page to go to on click.
 * @param {string} label the label of the entry, can contain macro "{{p}}" that will be resolved to the page number of the page to go to on click.
 * @param {string} spanClasses the classes to put on the &lt;span&gt; contained in the list entry.
 * @param {string} listId the id of the list the pagination entry is generated for.
 * @returns {string} the HTML to render for the pagination item.
 */
function generatePaginationItem(liClasses, isDisabled, isActive, page, title, label, spanClasses, listId) {
    /** @type {string[]} the HTML to return. The array is joined at the end. This performs better than plain string concatination.*/
    var result = []
    var resolvedTitle = title.replace(/\{\{p\}\}/g,page);
    result.push('<li');
    var classes = "";
    if (isDisabled) classes +=" disabled";
    if (isActive) classes +=" active";
    if (!(liClasses == null)) classes = " " + liClasses + classes;
    if (classes.length > 0) {
        result.push(' class="');
        result.push(classes.substring(1));
        result.push('"');
    }
    result.push('><a href="javascript:void(0)"');
    if(isDisabled) {
        result.push(' tabindex="-1"');
    }
    result.push('onclick="DynamicList.switchPage(\'');
    result.push(listId);
    result.push('\',');
    result.push(page);
    result.push(')" title="');
    result.push(resolvedTitle);
    result.push('">');
    var noLabel = (label == null);
    if (noLabel) {
        result.push('<span class="visually-hidden">');
        result.push(resolvedTitle);
        result.push('</span>');
    }
    result.push('<span class="');
    result.push(spanClasses);
    result.push('"');
    if(noLabel) {
        result.push(' aria-hidden="true"');
    }
    result.push('>');
    if(!noLabel) {
        result.push(label.replace(/\{\{p\}\}/g, page));
    }
    result.push('</span></a></li>');
    return result.join('');
}

/**
 * To support grouping of list elements do the following:
 *
 * 1. For grouping, you need a markup structure like this:
 *    <div>
 *          Some repeating content here that should appear only one, like a date etc.
 *          <div class="${the_group_id}">
 *              Content here will will be grouped.
 *          </div>
 *    <div>
 *
 *    Consider the following example:
 *    <div class="list-entry">
 *          <div listgroup="xy-1">
 *              Content from group 1.
 *          </div>
 *    <div>
 *    <div>
 *          <div listgroup="xy-2">
 *              Content from group 2.
 *          </div>
 *    <div>
 *
 *    This will be grouped like this:
 *     <div class="list-entry">
 *          <div>
 *              Content from group 1.
 *          </div>
 *          <div>
 *              Content from group 2.
 *          </div>
 *    <div>
 *
 * 2. In the formatter of the list element, mark the div to be extracted
 *    like this: <div class="list-group" listgroup="${some_group_id}">.
 *    The group ID must be created in the formatter.
 *    It must be the same for each element that belongs to the same group.
 *
 * 3. In the formatter XML settings, include the following configuration:
 *      <Setting>
 *        <PropertyName><![CDATA[requiredListWrapper]]></PropertyName>
 *        <Widget><![CDATA[hidden]]></Widget>
 *        <Default><![CDATA[list-with-groups]]></Default>
 *        <Visibility><![CDATA[parent]]></Visibility>
 *      </Setting>
 *
 * @param {JQuery} $groups The groups to manipulate (combine) the HTML for.
 * @param {boolean} isStatic flag, indicating if the rendered list is a static or dynamic list.
 *
 */
function combineGroups($groups, isStatic) {
    isStatic = isStatic || false;
    if (DEBUG) console.info("Lists.combineGroups() Combining list with " + $groups.length + " groups for a " + (isStatic ? "static" : "dynamic") + " list" );
    var lastGroupId, $lastGroup;
    var hasGroups = false;
    $groups.each(function(index) {
        var $this = $(this);
        var thisGroupId = $this.attr("listgroup");
        $this.removeAttr("listgroup");
        var $thisListEntry = $this.parents(".list-entry");
        if (Mercury.isEditMode()) {
            // reshuffle edit points
            var $editpointstart = $thisListEntry.find(".oc-editable");
            var $editpointend = $thisListEntry.find(".oc-editable-end");
            $this.prepend($editpointstart);
            $this.append($editpointend);
        }
        if (thisGroupId != lastGroupId) {
            // start of a new group
            $lastGroup = $this.parent();
            lastGroupId = thisGroupId;
        } else {
            // append to current group
            hasGroups = true;
            $this.appendTo($lastGroup);
            if (isStatic) {
                // must handle HTML differently for static lists
                $thisListEntry.remove();
            } else {
                $thisListEntry.empty();
            }
        }
    });
    return hasGroups;
}

/**
 * Splits the list of entries into several pages.
 * This is only used if all entries are loaded directly and pagination is done by the client.
 *
 * @param {List} list the list to split the entries for. It contains the pagination information.
 * @param {JQuery} $entries all list entries (this might be the groups of entries already where each group is counted as one entry).
 * @returns {Map<number, JQuery>} the map from page number to entries of the page.
 */
function paginateEntries(list, $entries) {
    var pageEntries = new Map();
    var pageSizes = list.pageSizes;
    var numEntries = $entries.length;
    var currentPage = 1;
    var pageStart = 0;
    while (pageStart < numEntries) {
        var pageSize = getPageSize(currentPage, pageSizes);
        pageEntries.set(currentPage, $entries.slice(pageStart, pageSize + pageStart)); //does it work when the end index is gt the entries length?
        pageStart = pageStart + pageSize;
        currentPage++;
    }
    return pageEntries;
}

/**
 * Returns the size of the provided page.
 *
 * @param {number} page the page to get the size for.
 * @param {number[]} pageSizes the page sizes array.
 */
function getPageSize(page, pageSizes) {
    if (page > pageSizes.length) {
        return pageSizes[pageSizes.length - 1];
    } else {
        return pageSizes[page-1];
    }
}

/**
 * Handles loading of a additional entries for lists that automatically load more entries on scroll.
 * NOTE: works currently only for lists where not all entries are loaded upfront.
 */
function handleAutoLoaders() {
    if (m_autoLoadLists != null) {
        for (var i=0; i<m_autoLoadLists.length; i++) {

            var list = m_autoLoadLists[i];
            var appendPosition = list.$element.find(".list-append-position");

            if (appendPosition.length
                && !list.locked
                && appendPosition.data("dynamic")
                // NOTE: jQuery.visible() is defined in jquery-extensions.js
                && appendPosition.visible()) {

                updateInnerList(list.id, list.$element.find('.btn-append').attr('data-load'), false);
            }
        }
    }
}

/****** Exported functions ******/

/**
 * Applies a facet filter to a list.
 *
 * @param {string} id the id of the list the filter belongs to.
 * @param {string} triggerId the id of the HTML element that triggered the filter action.
 * @param {string} searchStateParameters the search state parameters representing the filter action.
 */
export function facetFilter(id, triggerId, searchStateParameters) {
    listFilter(id, triggerId, null, searchStateParameters, true);
}

/**
 * Applies an archive filter option to the list.
 *
 * @param {string} idthe id of the list the filter belongs to.
 * @param {string} triggerId the id of the HTML element that triggered the filter action.
 */
export function archiveFilter(id, triggerId) {
    var filter = m_archiveFilters[id];
    // if filters of other filter elements should be combined with that one - get the other filters that are set
    var additionalFilters = filter.combine ? getAdditionalFilterParams(filter) : "";
    // calculate the filter query part for the just selected item
    var additionalStateParameter = calculateStateParameter(filter, triggerId, true);
    listFilter(filter.elementId, triggerId, id, filter.searchstatebase + additionalFilters + additionalStateParameter, true);
}


/**
 * Applies an query filter to the list.
 *
 * @param {string} idthe id of the list the filter belongs to.
 * @param {string} triggerId the id of the HTML element that triggered the filter action.
 */
export function archiveSearch(id, searchStateParameters) {
    var filter = m_archiveFilters[id];
    // if filters of other filter elements should be combined with that one - get the other filters that are set
    var additionalFilters = filter.combine ? getAdditionalFilterParams(filter) : "";
    listFilter(filter.elementId, null, filter.id, searchStateParameters + encodeURIComponent(filter.$textsearch.val()) + additionalFilters, true);
}

/**
 * Switches to the given page. The method can only be used when all results are preloaded directly.
 *
 * @param {string} id the id of the list where the page should be appended to.
 * @param {number} page the number of the page to append.
 */
export function switchPage(id, page) {
    var list = m_lists[id];
    list.$entries.empty();
    list.pageEntries.get(page).appendTo(list.$entries);
    list.$pagination.empty();
    list.pageData.start = 1 + (page - 1) * list.itemsPerPage;
    var paginationString = generatePagination(list, page);
    if (!paginationString.empty) {
        jQ(paginationString).appendTo(list.$pagination);
    }
    // there may be media elements in the list
    Mercury.update('#' + list.id);
    if (! list.$element.visible()) {
        if (DEBUG) console.info("Lists.switchPage() - scrolling to anchor");
        if (m_flagScrollToAnchor) {
            Mercury.scrollToAnchor(list.$element, -20);
        }
    }
}

/**
 * Appends a further page of items to the currently shown items.
 * The method can only be used if all items are already preloaded.
 *
 * @param {string} id the id of the list where the page should be appended to.
 * @param {number} page the number of the page to append.
 */
export function appendPage(id, page) {
    var list = m_lists[id];
    list.pageEntries.get(page).appendTo(list.$entries);
    list.$pagination.empty();
    var paginationString = generatePagination(list, page);
    if (!paginationString.empty) {
        jQ(paginationString).appendTo(list.$pagination);
    }
    // there may be media elements in the list
    Mercury.update('#' + list.id);
}

/**
 * Update the list in the case where not all items are already loaded.
 * This will update the list according to the provided search state parameters.
 * A call to the server is made to fetch the entries according to the parameters.
 * This method is e.g., called when the page is switched for a list where the entries
 * are not preloaded completely.
 *
 * @param {string} id the id of the list for which the update should take place.
 * @param {string} searchStateParameters the search state parameters to use for the update.
 * @param {boolean} reloadEntries a flag, indicating if the currently shown results should be reloaded/replaced (or if new results should only be appended).
 */
export function update(id, searchStateParameters, reloadEntries) {
    updateInnerList(id, searchStateParameters, reloadEntries == "true");
}

/**
 * This method can be used to allow pagination for the lists that retrieve their results not via the default AJAX call.
 *
 * @param {string} id the id of the list for which the update should take place.
 * @param {string} searchStateParameters the search state parameters to use for the update.
 * @param {boolean} reloadEntries a flag, indicating if the currently shown results should be reloaded/replaced (or if new results should only be appended).
 * @param {ListCallback} [paginationCallback] a callback triggered when a page is loaded or appended.
 */
export function injectResults(id, resultHtml, paginationCallback, pageToShow) {

    if (DEBUG) console.info("Lists.injectResults() id=" + id + ", pageToShow=" + pageToShow);
    pageToShow = pageToShow || 1;
    var list = m_lists[id];
    list.paginationCallback = paginationCallback;
    generateListHtml(list, true, resultHtml, pageToShow);
}

/**
 * Initialize the list script.
 * @param {jQuery} jQuery jQuery object.
 * @param {boolean} debug a flag, determining iff in debug mode.
 */
export function init(jQuery, debug) {

    jQ = jQuery;
    DEBUG = debug;

    if (DEBUG) console.info("Lists.init()");

    var $listElements = jQ('.list-dynamic');
    if (DEBUG) console.info("Lists.init() .list-dynamic elements found: " + $listElements.length);

    if ($listElements.length > 0 ) {
        $listElements.each(function() {

            // initialize lists with values from data attributes
            var $list = jQ(this);

            if (typeof $list.data("list") !== 'undefined') {
                // read list data
                /** @type {List} a single list. */
                var list = $list.data("list");
                // add more data to list
                list.$element = $list;
                list.id = $list.attr("id");
                list.elementId = $list.data("id");
                // read and store the page size information
                var pageSizes = list.itemsPerPage;
                var sizeArrayNum = [];
                if (pageSizes !== undefined) {
                    var sizeArrayString = pageSizes.split("-");
                    sizeArrayString.forEach(function (numString) {
                        sizeArrayNum.push(Number(numString)) })
                }
                if (sizeArrayNum.length == 0) {
                    sizeArrayNum.push(5); // default size
                }
                list.pageSizes = sizeArrayNum;
                list.$editbox = $list.find(".list-editbox");
                list.$entries = $list.find(".list-entries");
                list.$spinner = $list.find(".list-spinner");
                list.$pagination = $list.find(".list-pagination");
                list.$noresults = $list.find(".list-noresults");
                list.initialLoad = true;
                list.locked = false;
                list.autoload = false;
                list.notclicked = true;
                let screenSize = Mercury.gridInfo().grid == 'xxl' ? 'xl' : Mercury.gridInfo().grid;
                if (list.appendSwitch.indexOf(screenSize) >= 0) {
                    // I think this is a cool way for checking the screen size ;)
                    list.option = "append";
                    $list.removeClass("list-paginate").addClass("list-append");
                } else {
                    list.option = "paginate";
                    $list.removeClass("list-append").addClass("list-paginate");
                }
                if (DEBUG) console.info("Lists.init() List data found - id=" + list.id + ", elementId=" + list.elementId + " option=" + list.option);
                if ((list.option === "append") && (list.appendOption === "noclick")) {
                    // list automatically loads in scrolling
                    list.autoload = true;
                    m_autoLoadLists.push(list);
                };
                list.$facets = jQ("#facets_" + list.elementId);
                // store list data in global array
                m_lists[list.id] = list;
                // store list in global group array
                var group = m_listGroups[list.elementId];
                if (typeof group !== 'undefined') {
                    group.push(list);
                } else {
                    m_listGroups[list.elementId] = [list];
                }
            }

            var initParams = "";
            if (typeof list.initparams !== "undefined") {
                initParams = list.initparams;
                if (DEBUG) console.info("Lists.init() Data init params - " + initParams);
            }
            // load the initial list
            updateInnerList(list.id, initParams, true);
        });

        if (m_autoLoadLists.length > 0) {
            // only enable scroll listener if we have at least one autoloading gallery
            jQ(window).on('scroll', handleAutoLoaders);
        }
    }

    var $staticGroupListElements = jQ('.type-static-list .list-with-groups.list-entries');
    if (DEBUG) console.info("Lists.init() .type-static-list .list-with-groups elements found: " + $staticGroupListElements.length);

    if ($staticGroupListElements.length > 0 ) {
        $staticGroupListElements.each(function() {

            // rewrite content of each list group
            var $list = jQ(this);
            var $clone = $list.clone();

            var $groups = $clone.find("div[listgroup]");
            if ($groups.length > 0) {
                // the search results should be grouped
                if (DEBUG) console.info("Lists.init() Found static list with " + $groups.length + " groups");
                combineGroups($groups, true);
                $list.replaceWith($clone);
            }
        });
        _OpenCmsReinitEditButtons(DEBUG);
    }

    var $listArchiveFilters = jQ('.type-list-filter, .type-list-calendar');
    if (DEBUG) console.info("Lists.init() .type-list-filter elements found: " + $listArchiveFilters.length);

    if ($listArchiveFilters.length > 0) {
        $listArchiveFilters.each(function() {

            // initialize filter archives
            var $archiveFilter = jQ(this);

            /** @type {ListFilter} */
            var filter = $archiveFilter.data("filter");
            if (typeof filter !== 'undefined') {
                filter.$element = $archiveFilter;
                filter.id = $archiveFilter.attr("id");
                filter.elementId = $archiveFilter.data("id");
                filter.$textsearch = $archiveFilter.find("#textsearch_" + filter.id);
                filter.$directlink = $archiveFilter.find(".directlink");

                // unfold categories if on desktop and responsive setting is used
                var $collapses = $archiveFilter.find('#cats_' + filter.id + ', #folder_' + filter.id  + ', #arch_' + filter.id);
                if ($collapses.length > 0) {
                    if (DEBUG) console.info("Lists.init() collapse elements found for filter id " + filter.id + ": " + $collapses.length);
                    $collapses.each(function() {
                        var $collapse = jQ(this);
                        if (($collapse.hasClass('op-lg') && Mercury.gridInfo().isMinLg())
                            || ($collapse.hasClass('op-md') && Mercury.gridInfo().isMinMd())
                            || ($collapse.hasClass('op-sm') && Mercury.gridInfo().isMinSm())) {
                            $collapse.collapse('show');
                        }
                    });
                }

                // store filter data in global array
                m_archiveFilters[filter.id] = filter;

                // store filter in global group array
                var group = m_archiveFilterGroups[filter.elementId];
                if (typeof group !== 'undefined') {
                    group.push(filter);
                } else {
                    m_archiveFilterGroups[filter.elementId] = [filter];
                }

                // attach key listeners for keyboard support
                $archiveFilter.find("li > a").on("keydown", function(e) {
                    if (e.type == "keydown" && (e.which == 13 || e.which == 32)) {
                        jQ(this).click();
                        e.preventDefault();
                    }
                });
                if (DEBUG) console.info("Lists.init() .type-list-filter data found - id=" + filter.id + ", elementId=" + filter.elementId);

                if (typeof filter.initparams !== "undefined" && filter.initparams != "") {
                    if (DEBUG) console.info("Lists.init() Data filter init params - " + filter.initparams);
                    // highlight filter correctly
                    listFilter(filter.elementId, null, filter.id, filter.initparams, false);
                }
            } else {
                if (DEBUG) console.info("Lists.init() .type-list-filter found without data, ignoring!");
            }

        });
    }
}

export function setFlagScrollToAnchor(flagScrollToAnchor) {

    m_flagScrollToAnchor = !!flagScrollToAnchor;
}
