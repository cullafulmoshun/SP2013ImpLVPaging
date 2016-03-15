#region Copyright(c) 2016 Kain De Luca. All Rights Reserved.
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
#endregion
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Xml;
using System.Xml.Linq;
using System.Xml.XPath;
using Microsoft.SharePoint;
using Microsoft.SharePoint.WebControls;

namespace ImprovedListView.Layouts.ImprovedListView
{
    public partial class GetPagingLinks : LayoutsPageBase
    {
        #region QueryString Properties
        // Parameter: PageSpread (#Pages to display either side of current)
        private int _pageSpread = -1;
        protected int PageSpread
        {
            get
            {
                if (_pageSpread < 0)
                {
                    if (Request.QueryString["PageSpread"] != null)
                        int.TryParse(Request.QueryString["PageSpread"], out _pageSpread);
                    if (_pageSpread < 0)
                        _pageSpread = 3;
                }
                return _pageSpread;
            }
        }

        // Parameter: StartRow (for current page identification)
        private int _startRow = -1;
        protected int StartRow
        {
            get
            {
                if (_startRow < 0)
                {
                    if (Request.QueryString["StartRow"] != null)
                        int.TryParse(Request.QueryString["StartRow"], out _startRow);
                    if (_startRow < 0)
                        _startRow = 1;
                }
                return _startRow;
            }
        }

        // Parameter: SortField 
        private String _sortField = null;
        protected String SortField
        {
            get
            {
                if (String.IsNullOrWhiteSpace(_sortField))
                {
                    _sortField = "";
                    if (Request.QueryString["SortField"] != null)
                        _sortField = Request.QueryString["SortField"];
                }
                return _sortField;
            }
        }

        // Parameter: SortDir
        private String _sortDir = null;
        protected String SortDir
        {
            get
            {
                if (String.IsNullOrWhiteSpace(_sortDir))
                {
                    _sortDir = "";
                    if (Request.QueryString["SortDir"] != null)
                        _sortDir = Request.QueryString["SortDir"];
                }
                return _sortDir;
            }
        }

        // Parameter: List [Required]
        private string _listTitle = null;
        protected string ListTitle
        {
            get
            {
                if (String.IsNullOrWhiteSpace(_listTitle))
                {
                    if (Request.QueryString["List"] != null)
                        _listTitle = Request.QueryString["List"];
                }
                return _listTitle;
            }
        }

        // Parameter: View [Required]
        private Guid _viewIdGuid = Guid.Empty;
        protected Guid ViewIdGuid
        {
            get
            {
                if (_viewIdGuid == Guid.Empty)
                {
                    if (Request.QueryString["View"] != null)
                        _viewIdGuid = new Guid(Request.QueryString["View"]);
                }
                return _viewIdGuid;
            }
        }
        #endregion 

        #region Global references
        private SPList _list = null;
        protected SPList List
        {
            get
            {
                if (_list == null && !String.IsNullOrWhiteSpace(ListTitle))
                    _list = SPContext.Current.Web.Lists.TryGetList(ListTitle);
                return _list;
            }
        }

        private SPView _view = null;
        protected SPView View
        {
            get
            {
                if (_view == null && List != null)
                {
                    if (ViewIdGuid != Guid.Empty)
                        _view = List.GetView(ViewIdGuid);
                    else
                        _view = List.DefaultView;
                }
                return _view;
            }
        }

        private List<String> _querySortFields = null;
        protected List<String> QuerySortFields
        {
            get
            {
                if (_querySortFields == null)
                {
                    _querySortFields = new List<string>();
                    if (!String.IsNullOrWhiteSpace(SortField))
                        _querySortFields.Add(SortField);
                    if (View != null)
                    {
                        var doc = XDocument.Parse("<Query>" + View.Query + "</Query>");
                        _querySortFields.AddRange(
                            ((IEnumerable<object>)doc.XPathEvaluate("//Query/OrderBy/FieldRef/@Name"))
                            .Cast<XAttribute>()
		                    .Select(a => a.Value));
                    }
                    _querySortFields.Add("ID");
                }
                return _querySortFields;
            }
        }

        private SPListItemCollection _items = null;
        protected SPListItemCollection ListItems
        {
            get
            {
                if (_items == null)
                {
                    // Add sort field to View query caml
                    var doc = XDocument.Parse("<Query>" + View.Query + "</Query>");
                    if (!String.IsNullOrWhiteSpace(SortField))
                    {
                        var orderBy = doc.XPathSelectElement("//OrderBy");
                        XElement el = new XElement("FieldRef");
                        XAttribute attr1 = new XAttribute("Name", SortField);
                        XAttribute attr2 = new XAttribute("Ascending",
                            SortDir.ToUpper().StartsWith("DESC") ? "FALSE" : "TRUE");
                        el.Add(attr1);
                        el.Add(attr2);
                        orderBy.AddFirst(el);
                    }

                    // Use query object to source list items
                    SPQuery query = new SPQuery();
                    query.Query = doc.ToString().Replace("<Query>", "").Replace("</Query>", "").Trim();
                    query.ViewFields = String.Join("",
                        QuerySortFields
                            .Select(f => String.Format("<FieldRef Name='{0}' />", f))
                            .ToArray());
                    query.ViewFieldsOnly = true;
                    _items = List.GetItems(query);
                }
                return _items;
            }
        }
        #endregion

        #region Quick Reference Properties
        protected int RowLimit
        {
            get { return (int)View.RowLimit; }
        }
        protected int TotalRows
        {
            get { return ListItems.Count; }
        }
        protected int PageCount
        {
            get { return (int)Math.Ceiling((double)TotalRows / (double)(RowLimit <= 0 ? TotalRows : RowLimit)); }
        }
        protected int CurrentPage
        {
            get { return (int)Math.Ceiling((double)StartRow / (double)(RowLimit <= 0 ? TotalRows : RowLimit)); }
        }
        protected int StartPage
        {
            get { return CurrentPage <= PageSpread ? 1 : CurrentPage - PageSpread; }
        }
        protected int EndPage
        {
            get { return CurrentPage + PageSpread > PageCount ? PageCount : CurrentPage + PageSpread; }
        }
        #endregion


        protected void Page_Load(object sender, EventArgs e)
        {
            StringBuilder json = new StringBuilder();
            json.AppendLine("({");
            try
            {
                // Validate required input and operational data
                if (String.IsNullOrWhiteSpace(ListTitle) || List == null)
                    throw new Exception("No valid list specified!");
                if (View == null)
                    throw new Exception("No valid view specified!");
                if (ListItems == null)
                    throw new Exception("No items found for specified parameters!");

                // Build basic json data string to return to client
                json.AppendFormat("  List:'{0}',\r\n", List.Title);
                json.AppendFormat("  View:'{0}',\r\n", View.ID.ToString().ToUpper());
                json.AppendFormat("  PageSpread:{0},\r\n", PageSpread);
                json.AppendFormat("  StartRow:{0},\r\n", StartRow);
                json.AppendFormat("  SortField:'{0}',\r\n", SortField);
                json.AppendFormat("  SortDir:'{0}',\r\n", SortDir);
                json.AppendFormat("  ViewQuery:'{0}',\r\n", HttpUtility.HtmlEncode(View.Query));
                json.AppendFormat("  SortFields:'{0}',\r\n", String.Join(",", QuerySortFields.ToArray()));
                json.AppendFormat("  RowLimit:{0},\r\n", RowLimit);
                json.AppendFormat("  TotalRows:{0},\r\n", TotalRows);
                json.AppendFormat("  PageCount:{0},\r\n", PageCount);
                json.AppendFormat("  CurrentPage:{0},\r\n", CurrentPage);
                json.AppendFormat("  StartPage:{0},\r\n", StartPage);
                json.AppendFormat("  EndPage:{0},\r\n", EndPage);

                // Add specific page links to return string
                json.AppendLine("  PageLinks:[");
                for (int i = 1; i <= PageCount; i++)
                    json.AppendFormat("    {{Page:{0},Url:'{1}'}},\r\n", i, BuildPageHref(i));     
                json.AppendLine("  ]");
            }
            catch (Exception ex)
            {
                json.AppendFormat("  error:'{0}'", ex.Message.Replace("'", "\""));
            }
            json.AppendLine("})");

            Response.Clear();
            Response.Write(json);
            Response.End();
        }

        private String BuildPageHref(int pageNum)
        {
	        // If current page this return empty string
            if (pageNum == CurrentPage)
                return "";
            
            // Build querystring parameters for page link
            int index = 0;
            StringBuilder url = new StringBuilder("?");
            if (pageNum == 1)
            {
                index = 1;
            }
            else if (pageNum < CurrentPage)
            {
                url.Append("&Paged=TRUE");
                url.Append("&PagedPrev=TRUE");
                url.Append("&p_SortBehavior=0");
                index = pageNum * RowLimit;
            }
            else
            {
                url.Append("&Paged=TRUE");
                url.Append("&p_SortBehavior=0");
                index = ((pageNum - 1) * RowLimit) - 1;
            }
            
            // Add field values for first item in next page for scope and view sorting fields
            SPListItem item = ListItems[index];

            // If custom sort set then add details of start item for sort field
            if (!String.IsNullOrWhiteSpace(SortField))
            {
                url.AppendFormat("&SortField={0}&SortDir={1}",
                    HttpUtility.UrlEncode(SortField),
                    SortDir);
            }

            // Add all view field values for start item in sort order
            foreach (var fieldName in QuerySortFields)
            {
                var field = List.Fields.GetFieldByInternalName(fieldName);
                var value = "";
                switch (field.TypeAsString)
                {
                    case "User":
                        int start = Convert.ToString(item[fieldName]).IndexOf(";#");
                        start = start < 0 ? 0 : start + 2;
                        value = Convert.ToString(item[fieldName]).Substring(start);
                        break;
                    case "DateTime":
                        value = Convert.ToDateTime(item[fieldName]).ToString("yyyyMMdd HH:mm:ss");
                        break;
                    default:
                        value = Convert.ToString(item[fieldName]);
                        break;
                }
                url.AppendFormat("&p_{0}={1}",
                    fieldName,
                   HttpUtility.UrlEncode(value).Replace("+","%20"));
            }

            // "&FolderCTID=0x012001" ??
            // Add start row number for page and view ID
            int startRow = (pageNum - 1)*RowLimit + 1;
            url.AppendFormat("&PageFirstRow={0}", startRow);
            url.AppendFormat("&View={0}", ViewIdGuid.ToString());
 
	        return url.ToString();
        }
    }
}
