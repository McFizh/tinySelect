/*
 * tinySelect
 *
 * Licensed under MIT license.
 *
 * @version 2.0.1
 * @author Pekka Harjamäki
 */
// eslint-disable-next-line no-extra-semi
;(function($) {

  "use strict";

  const TinySelect = {
    /* ******************************************************************* *
     * Class initializers
     * ******************************************************************* */
    init: function($el, options) {
      $el.data("tinySelectObj",this);

      this.config = $.extend({
        showSearch: true,
        searchCaseSensitive: true,
        txtLoading: "Loading...",
        txtAjaxFailure: "Error...",

        dataUrl: null,
        dataParser: null
      },options);

      this.state = {
        container: null,
        selectBox: null,
        itemContainer: null,

        searchContainer: null,
        searchBox: null,

        $el: null,

        open: false,
        ajaxPending: false,
        selectedValue: -1,

        originalItemData: [],
        filteredItemData: []
      };

      this.readSelect($el);
      this.createSelect($el);

    },

    createSelect: function($el) {
      // Create container for select, search and options
      this.state.container = $("<div></div>").
        addClass("tinyselect").
        css({ width: $el.css("width") });

      const t_id = $el.attr("id");
      if( t_id && t_id.length > 0 )
        this.state.container.attr("id",t_id+"_ts");

      // Create the select element
      this.state.selectBox = $("<div></div>").
        addClass("selectbox").
        on("click", { self:this }, this.onSelectBoxClicked );

      this.state.container.append(this.state.selectBox);

      // Create container to hold search and results
      this.state.dropdown = $("<div></div>").
        addClass("dropdown").
        hide();

      this.state.container.append(this.state.dropdown);

      // Add search as first element
      if(this.config.showSearch)
        this.createSearch(this.state.dropdown);

      // Create ul to hold items
      this.state.itemContainer = $("<ul></ul>").addClass("itemcontainer");
      this.state.dropdown.append(this.state.itemContainer);

      //
      this.createItems();

      // Hide original select element and add new component to below
      $el.hide().after(this.state.container);
      this.state.$el = $el;

      // Hide select content when clicked elsewhere in the document
      $(document).on("click", {self: this}, this.onDocumentClicked );
    },

    createItems: function() {
      // Remove all
      this.state.itemContainer.empty();

      //
      for(const opt of this.state.filteredItemData)
      {
        const newLi = $("<li></li>").text(opt.text).addClass("item").attr("data-value", opt.val);

        if( opt.val === this.state.selectedValue )
        {
          this.state.selectBox.html( opt.text );
          newLi.addClass("selected");
        }

        newLi.on("click", { self:this }, this.onSelectLiClicked );

        this.state.itemContainer.append(newLi);
      }
    },

    createSearch: function() {
      this.state.searchContainer = $("<div></div>").
        addClass("searchcontainer");
      this.state.searchBox = $("<input type='text'></input>").
        addClass("searchbox").
        on("click",function(e) { e.stopPropagation(); }).
        on("keyup",{ self: this }, this.onSearchKeyPress);

      this.state.searchContainer.append($("<span class='searchicon'></span>"));
      this.state.searchContainer.append(this.state.searchBox);
      this.state.dropdown.append(this.state.searchContainer);
    },

    readSelect: function($el) {
      const self = this;

      $el.find("option").each(function(){
        const opt = $(this);
        self.state.originalItemData.push({ val: opt.val() , text: opt.text() });
      });

      this.state.filteredItemData = this.state.originalItemData;
      this.state.selectedValue = $el.val();
    },

    loadData: function(url) {
      const self = this;
      self.setAjaxIndicator(false);
      $.ajax({ url, dataType: "json", type: "GET" })
        .done( function(data) { self.onAjaxLoadSuccess(self, data); } )
        .fail( function() { self.onAjaxLoadError(self); } );
    },

    setAjaxIndicator: function(failure) {
      this.state.ajaxPending = true;
      this.state.itemContainer.empty();

      if(this.state.searchContainer !== null)
        this.state.searchContainer.hide();

      const newLi = $("<li></li>");
      if(!failure)
      {
        newLi.text( this.config.txtLoading ).
          addClass( "loadindicator" );
      } else {
        newLi.text( this.config.txtAjaxFailure ).
          addClass( "loaderrorindicator" );
      }

      this.state.itemContainer.append(newLi);
    },

    /* ******************************************************************* *
     * Event handlers
     * ******************************************************************* */
    onDocumentClicked: function(e) {
      const self = e.data.self;

      if( self.state.open )
        self.onSelectBoxClicked(e);
    },

    onSearchKeyPress: function(e) {
      const self = e.data.self;
      let sval = $(e.currentTarget).val();

      // Convert search string to lowercase, if using case insensitive search
      if(!self.config.searchCaseSensitive)
        sval = sval.toLowerCase();

      if(sval.length === 0)
      {
        self.state.filteredItemData = self.state.originalItemData;
      } else {
        self.state.filteredItemData = self.state.originalItemData.filter(function(item){
          // Case insensitive search
          if(!self.config.searchCaseSensitive)
            return item.text.toLowerCase().indexOf(sval) >= 0 ? true: false;

          // Case sensitive search
          return item.text.indexOf(sval) >= 0 ? true: false;
        });
      }

      self.createItems();
    },

    onSelectBoxClicked: function(e) {
      const self = e.data.self;

      // Do nothing, if currently animating
      if(self.state.dropdown.is(":animated"))
        return;

      // Close selectBox
      if( self.state.open )
      {
        self.state.open = false;
        self.state.selectBox.removeClass("open");
        self.state.dropdown.slideUp(100);
        return;
      }

      // Open selectbox
      if(self.config.dataUrl !== null)
        self.loadData(self.config.dataUrl);

      self.state.open = true;
      self.state.selectBox.addClass("open");
      self.state.dropdown.slideDown(100);
    },

    onAjaxLoadSuccess: function(self, data) {
      self.state.ajaxPending = false;

      if(self.config.dataParser !== null )
        data = self.config.dataParser(data, self.state.selectedValue);

      self.state.$el.empty();
      data.forEach(function(v){
        if(v.selected)
          self.state.selectedValue = v.val;

        self.state.$el.append( $("<option></option>").text(v.text).val(v.val) );
      });

      self.state.$el.val( self.state.selectedValue );
      self.state.originalItemData = data;
      self.state.filteredItemData = data;

      if(this.state.searchContainer !== null)
        this.state.searchContainer.show();

      self.createItems();
    },

    onAjaxLoadError: function(self) {
      self.setAjaxIndicator(true);
    },

    onSelectLiClicked: function(e) {
      const self = e.data.self;
      const item = $(e.currentTarget);

      self.state.dropdown.find("li").each(function() {
        $(this).removeClass("selected");
      });

      item.addClass("selected");
      self.state.selectBox.html( item.text() );

      self.state.selectedValue = item.attr("data-value");
      self.state.$el.val(self.state.selectedValue);
      self.state.$el.trigger("change");
    },

    /* ******************************************************************* *
     * External callbacks
     * ******************************************************************* */
    onChangeDataUrl: function(newUrl) {
      this.config.dataUrl = newUrl;
    },
  };

  /* ******************************************************************* *
   * Plugin main
   * ******************************************************************* */
  $.fn.tinyselect = function(options) {
    if(options === undefined || typeof options === "object") {
      return this.each( function() {
        const key = "plugin_tinySelect";
        if(!$.data(this, key)) {
          const sel = Object.create(TinySelect);
          sel.init( $(this) , options);
          $.data(this, key, sel);
        }
      });
    } else if(typeof options === "string" && options === "setDataUrl") {
      const args = arguments;
      return this.each( function() {
        const instance = $.data(this, "plugin_tinySelect");
        if(instance && arguments[1])
          instance.onChangeDataUrl(args[1]);
      });
    }
  };

}(jQuery));
