// -----------------------------------------------------------------------------
// Copyright(c) 2016 Kain De Luca. All Rights Reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. No Trademark License - Microsoft Public License (Ms-PL) does not grant you rights to use
//      authors names, logos, or trademarks.
//   2. If you distribute any portion of the software, you must retain all copyright,
//      patent, trademark, and attribution notices that are present in the software.
//   3. If you distribute any portion of the software in source code form, you may do
//      so only under this license by including a complete copy of Microsoft Public License (Ms-PL)
//      with your distribution. If you distribute any portion of the software in compiled
//      or object code form, you may only do so under a license that complies with
//      Microsoft Public License (Ms-PL).
//   4. The names of the authors may not be used to endorse or promote products
//      derived from this software without specific prior written permission.
//
// The software is licensed "as-is." You bear the risk of using it. The authors
// give no express warranties, guarantees or conditions. You may have additional consumer
// rights under your local laws which this license cannot change. To the extent permitted
// under your local laws, the authors exclude the implied warranties of merchantability,
// fitness for a particular purpose and non-infringement.
// -----------------------------------------------------------------------------
var PagingReference = function () {
    this.listTitle = '';
    this.view = '';
    this.firstRow = 0;
    this.lastRow = 0;
    this.sortField = '';
    this.sortDir = '';
    this.dataLoaded = null;
    this.webparts = new Array();
};
PagingReference.prototype.buildUrl = function () {
    // Load list of page links for building page controls with
    var url = _spPageContextInfo.webAbsoluteUrl
        + "/_layouts/ImprovedListView/GetPagingLinks.aspx"
        + "?List=" + encodeURI(this.listTitle)
        + "&View=" + encodeURI(this.view)
        + "&StartRow=" + this.firstRow;
    if (this.sortField != null && this.sortField.length > 0) {
        url += '&SortField=' + encodeURI(this.sortField);
        if (this.sortDir != null && this.sortDir.length > 0)
            url += '&SortDir=' + encodeURI(this.sortDir);
    }
    return url;
};
PagingReference.prototype.getPageUrl = function (page) {
    var link = '';
    if (this.dataLoaded != null) {
        for (var i = 0; i < this.dataLoaded.PageLinks.length; i++) {
            if (this.dataLoaded.PageLinks[i].Page == page) {
                link = this.dataLoaded.PageLinks[i].Url;
                break;
            }
        }
    }
    return link;
};
PagingReference.prototype.pageSummaryHTML = function (wpq) {
    var countDisplayString = String.format('Page {0} of {1}',
		this.dataLoaded.CurrentPage.localeFormat("N0"),
		this.dataLoaded.PageCount.localeFormat("N0"));

    var html = '<div id="' + wpq + '_Paging_Summary" class="ms-listview-footer">';
    html += '	<div id="' + wpq + '_ResultCount" class="ms-listview-summary">';
    html += '		' + countDisplayString + '<br/>';
    if (window.ImprovedListView.Paging.debug) {
        html += '		listTitle : ' + this.listTitle + '<br/>';
        html += '		view : ' + this.view + '<br/>';
        html += '		firstRow : ' + this.firstRow + '<br/>';
        html += '		lastRow : ' + this.lastRow + '<br/>';
        html += '		sortField : ' + this.sortField + '<br/>';
        html += '		sortDir : ' + this.sortDir + '<br/>';
        html += '		resultsPerPage : ' + this.dataLoaded.RowLimit + '<br/>';
        html += '		totalRows : ' + this.dataLoaded.TotalRows + '<br/>';
        html += '		pageCount : ' + this.dataLoaded.PageCount + '<br/>';
        html += '		currentPage : ' + this.dataLoaded.CurrentPage + '<br/>';
        html += '		startPage : ' + this.dataLoaded.StartPage + '<br/>';
        html += '		lastPage : ' + this.dataLoaded.EndPage + '<br/>';
    }
    html += '	</div>';
    html += '</div>';
    if (window.ImprovedListView.Paging.debug)
        console.log(html);
    return html;
};
PagingReference.prototype.firstPageHTML = function (wpq) {
    var html = '';
    if (window.ImprovedListView.Paging.debug) {
        console.log('Building first page quick link..');
        console.log(this.dataLoaded);
        console.log(this.getPageUrl(1));
    }
    if (this.dataLoaded.CurrentPage > 1) {
        var imagesUrl = GetThemedImageUrl('spcommon.png');
        html += '	<li id="' + wpq + '_PagingImageLinkFirst">'
        html += '		<a id="' + wpq + '_PageLinkFirst" href="javascript:" onclick="RefreshPageTo(event, \'' + this.getPageUrl(1) + '\');return false;" title="Move to first page" class="ms-commandLink ms-listview-paging-image" style="top: -2px">';
        html += '			<span class="ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle" style="width: 24px; white-space: nowrap">';
        html += '				<span class="ms-promlink-button-image" style="left: 0px; width: 8px">';
        html += '					<img src="' + imagesUrl + '" class="ms-promlink-button-left" alt="Move to first page" style="left: -130px;" />';
        html += ' 				</span>';
        html += '				<span class="ms-promlink-button-image" style="width: 8px; left: -5px">';
        html += ' 					<img src="' + imagesUrl + '" class="ms-promlink-button-left" alt="Move to first page" style="left: -130px;" />';
        html += '				</span>';
        html += '			</span>';
        html += '		</a>';
        html += '	</li>';
    }
    return html;
};
PagingReference.prototype.previousPageHTML = function (wpq) {
    var html = '';
    if (window.ImprovedListView.Paging.debug) {
        console.log('Building prev page quick link..');
        console.log(this.dataLoaded);
        console.log(this.dataLoaded.CurrentPage);
        console.log(this.getPageUrl(this.dataLoaded.CurrentPage - 1));
    }
    if (this.dataLoaded.CurrentPage > 1) {
        var imagesUrl = GetThemedImageUrl('spcommon.png');
        html += '	<li id="' + wpq + '_PagingImageLinkPrev">';
        html += '		<a id="' + wpq + '_PageLinkPrev" href="javascript:" onclick="RefreshPageTo(event, \'' + this.getPageUrl(this.dataLoaded.CurrentPage - 1) + '\');return false;" title="Move to previous page" class="ms-commandLink ms-listview-paging-image" style="top: -2px">';
        html += '			<span class="ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle">';
        html += '				<span class="ms-promlink-button-image">';
        html += '					<img src="' + imagesUrl + '" class="ms-promlink-button-left" alt="Move to previous page" />';
        html += '				</span>';
        html += '			</span>';
        html += '		</a> ';
        html += '	</li>';
    }
    return html;
};
PagingReference.prototype.pageLinksHTML = function (wpq) {
    var html = '';
    for (var p = this.dataLoaded.StartPage; p <= this.dataLoaded.EndPage; p++) {
        if (p == this.dataLoaded.CurrentPage) {
            var selfLinkId = wpq + '_SelfLink_' + p;
            html += '	<li id="' + wpq + '_PagingSelf">';
            html += '		<span class="ms-listview-paging-self">' + p + '</span>';
            html += '	</li>';
        } else {
            var pageLinkId = wpq + '_PageLink_' + p;
            var title = "Move to page " + p;
            html += '	<li id="' + wpq + '_PagingLink_' + p + '">';
            html += '		<a id="' + pageLinkId + '" href="javascript:" onclick="RefreshPageTo(event, \'' + this.getPageUrl(p) + '\');return false;" title="' + title + '">' + p + '</a>';
            html += '	</li>';
        }
    }
    return html;
};
PagingReference.prototype.nextPageHTML = function (wpq) {
    var html = '';
    if (window.ImprovedListView.Paging.debug) {
        console.log('Building next page quick link..');
        console.log(this.dataLoaded);
        console.log(this.getPageUrl(this.dataLoaded.CurrentPage + 1));
    }
    if (this.dataLoaded.CurrentPage < this.dataLoaded.PageCount) {
        var imagesUrl = GetThemedImageUrl('spcommon.png');
        html += '	<li id="' + wpq + '_PagingImageLinkNext">';
        html += '		<a id="' + wpq + '_PageLinkNext" href="javascript:" onclick="RefreshPageTo(event, \'' + this.getPageUrl(this.dataLoaded.CurrentPage + 1) + '\');return false;" title="Move to next page" class="ms-commandLink ms-listview-paging-image" style="top: -2px">';
        html += '			<span class="ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle">';
        html += '				<span class="ms-promlink-button-image">';
        html += '					<img src="' + imagesUrl + '" class="ms-promlink-button-right" alt="Move to next page" />';
        html += '				</span>';
        html += '			</span>';
        html += '		</a> ';
        html += '	</li>';
    }
    return html;
};
PagingReference.prototype.lastPageHTML = function (wpq) {
    var html = '';
    if (window.ImprovedListView.Paging.debug) {
        console.log('Building last page quick link..');
        console.log(this.dataLoaded);
        console.log(this.getPageUrl(this.dataLoaded.PageCount));
    }
    if (this.dataLoaded.CurrentPage < this.dataLoaded.PageCount) {
        var imagesUrl = GetThemedImageUrl('spcommon.png');
        html += '	<li id="' + wpq + '_PagingImageLinkLast">';
        html += '		<a id="' + wpq + '_PageLinkLast" href="javascript:" onclick="RefreshPageTo(event, \'' + this.getPageUrl(this.dataLoaded.PageCount) + '\');return false;" title="Move to last page" class="ms-commandLink ms-listview-paging-image" style="top: -2px">';
        html += '			<span class="ms-promlink-button ms-promlink-button-enabled ms-verticalAlignMiddle" style="width: 24px; white-space: nowrap">';
        html += '				<span class="ms-promlink-button-image" style="left: 0px; width: 8px">';
        html += '					<img src="' + imagesUrl + '" class="ms-promlink-button-right" alt="Move to last page" style="left: -202px;" />';
        html += '				</span>';
        html += '				<span class="ms-promlink-button-image" style="width: 8px; left: -6px">';
        html += '					<img src="' + imagesUrl + '" class="ms-promlink-button-right" alt="Move to last page" style="left: -202px;" />';
        html += '				</span>';
        html += '			</span>';
        html += '		</a> ';
        html += '	</li>';
    }
    return html;
};

window.ImprovedListView = window.ImprovedListView || {};
window.ImprovedListView.Paging = {
    pagingReferences: new Object,
    debug: false,

    onPreRender: function (ctx) {
        //alert('onPreRender Not Implemented!');
        if (window.ImprovedListView.Paging.debug) {
            console.log('onPreRender...');
            console.log(ctx);
        }

        if (typeof (PageState) != "undefined" && PageState.ViewModeIsEdit == "1")
            return;

        // Lookup existing refItem to avoid repeat calls
        var view = ctx.ListSchema.View.replace('{', '').replace('}', '').toUpperCase();
        if (window.ImprovedListView.Paging.debug)
            console.log('View: ' + view);
        var refItem = window.ImprovedListView.Paging.pagingReferences[view];
        if (refItem == null) {
            // create new ref item to load data for and save to cache list
            refItem = new PagingReference();
            refItem.listTitle = ctx.ListTitle;
            refItem.view = view;
            refItem.firstRow = ctx.ListData.FirstRow;
            refItem.lastRow = ctx.ListData.LastRow;
            refItem.sortField = ctx.ListData.SortField;
            refItem.sortDir = ctx.ListData.SortDir;
            refItem.webparts.push(ctx.wpq);
            window.ImprovedListView.Paging.pagingReferences[view] = refItem;
            if (window.ImprovedListView.Paging.debug)
                console.log(refItem);

            // Make ajax call to load view details for ref item
            if (window.ImprovedListView.Paging.debug)
                console.log(refItem.buildUrl());
            $.ajax({
                url: refItem.buildUrl(),
                method: "GET",
                headers: { "accept": "application/json;odata=verbose" },
                success: function (data) {
                    // Update refItem with list paging details
                    if (window.ImprovedListView.Paging.debug) {
                        console.log('Successfully loaded list paging data!');
                        console.log(data);
                    }

                    var results = eval(data);
                    if (window.ImprovedListView.Paging.debug)
                        console.log(results);
                    var refItem = window.ImprovedListView.Paging.pagingReferences[results.View.toUpperCase()];
                    refItem.dataLoaded = results;
                    if (window.ImprovedListView.Paging.debug)
                        console.log(refItem);

                    // Call to update each web part paging controls using list data retrieved
                    for (var i = 0; i < refItem.webparts.length; i++)
                        window.ImprovedListView.Paging.updatePagingControls(refItem.webparts[i], refItem);
                },
                error: function (err) {
                    console.log('Error: Failed to load list paging data - ' + JSON.stringify(err));
                }
            });
        } else if (refItem.webparts.indexOf(ctx.wpq) < 0) {
            // Add as additional webpart for updating
            refItem.webparts.push(ctx.wpq);

            // Data already loaded, call to update webpart using data
            if (refItem.dataLoaded != null)
                window.ImprovedListView.Paging.updatePagingControls(ctx.wpq, refItem);
        }
    },
    updatePagingControls: function (wpq, refItem) {
        //alert('renderFooter Not Implemented!');
        if (window.ImprovedListView.Paging.debug) {
            console.log('updatePagingControls...');
            console.log(wpq);
            console.log(refItem);
        }
        var html = refItem.pageSummaryHTML(wpq);
        html += '<ul id="' + wpq + '_Paging" class="ms-listview-paging">';
        html += refItem.firstPageHTML(wpq);
        html += refItem.previousPageHTML(wpq);
        html += refItem.pageLinksHTML(wpq);
        html += refItem.nextPageHTML(wpq);
        html += refItem.lastPageHTML(wpq);
        html += '</ul>';
        $('#scriptPaging' + wpq).before(html);
        $('#scriptPaging' + wpq).remove();
        return;
    }
};

// Add to JSLink Web Part Property
// ~site/_layouts/15/ImprovedListView/JSLink.js
(function () {
    // Initialize the variables for overrides objects
    var overrideCtx = {};
    overrideCtx.Templates = {};
    if (window.ImprovedListView.Paging.debug)
        console.log("Override call worked");

    //Tempate overrides
    overrideCtx.OnPreRender = window.ImprovedListView.Paging.onPreRender;

    // Register the template overrides.
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();

