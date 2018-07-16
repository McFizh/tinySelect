/*
 * tinySelect
 *
 * Licensed under MIT license.
 *
 * @version 1.0.4
 * @author Pekka Harjamäki
 */
;(function($) {

  "use strict";

  var TinySelect = {
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
        var t_id;

        // Create container for select, search and options
        this.state.container = $("<div></div>").
            addClass("tinyselect").
            css({ width: $el.css("width") });

        t_id = $el.attr("id");
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
        this.state.itemContainer = $("<ul></ul>").
            addClass("itemcontainer");
        this.state.dropdown.append(this.state.itemContainer);

        //
        this.createItems();

        // Hide original select element and add new component to below
        $el.hide().after(this.state.container);
        this.state.$el = $el;

        // Hide select content when clicked elsewhere in the document
        $(document).on("click", {self: this}, this.onDocumentClicked );
    },

    createItems: function(selected) {
        var l1, opt; 

        // Remove all 
        this.state.itemContainer.empty();

        //
        for(l1=0; l1<this.state.filteredItemData.length; l1++)
        {
            opt = this.state.filteredItemData[l1];

            var newLi = $("<li></li>").
                text( opt.text ).
                addClass( "item" ).
                attr( "data-value", opt.val );

            if( opt.val == this.state.selectedValue )
            {
                this.state.selectBox.html( opt.text );
                newLi.addClass("selected");
            }

            newLi.on("click", { self:this }, this.onSelectLiClicked );

            this.state.itemContainer.append(newLi);
        }
    },

    createSearch: function($el) {
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
        var self = this;

        $el.find("option").each(function(index){
            var opt = $(this);
            self.state.originalItemData.push({ val: opt.val() , text: opt.text() });
        });

        this.state.filteredItemData = this.state.originalItemData;
        this.state.selectedValue = $el.val();
    },

    setAjaxIndicator: function(failure) {
        this.state.ajaxPending = true;
        this.state.itemContainer.empty();

        if(this.state.searchContainer !== null)
            this.state.searchContainer.hide();

        var newLi = $("<li></li>");
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
        var self = e.data.self;

        if( self.state.open )
            self.onSelectBoxClicked(e);
    },

    onSearchKeyPress: function(e) {
        var self = e.data.self,
            sval = $(e.currentTarget).val();
    
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
        var self = e.data.self;

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
        {
            self.setAjaxIndicator(false);
            $.ajax({
                url: self.config.dataUrl,
                dataType: "json",
                type: "GET"
            }).    done( function(data) { self.onAjaxLoadSuccess(self, data); } ).
                fail( function(data) { self.onAjaxLoadError(self, data); } );
        } 

        self.state.open = true;
        self.state.selectBox.addClass("open");
        self.state.dropdown.slideDown(100);

    },

    onAjaxLoadSuccess: function(self,data) {
        self.state.ajaxPending = false;

        if(self.config.dataParser !== null )
        {
            data = self.config.dataParser(data, self.state.selectedValue);
        }

        self.state.$el.empty();
        data.forEach(function(v){

            if(v.selected)
                self.state.selectedValue = v.val;

            self.state.$el.append(

                $("<option></option>").
                    text( v.text ).
                    val( v.val )
            );

        });
        self.state.$el.val( self.state.selectedValue );

        self.state.originalItemData = data;
        self.state.filteredItemData = data;
        
        if(this.state.searchContainer !== null)
            this.state.searchContainer.show();
        self.createItems();
    },

    onAjaxLoadError: function(self,data) {
        self.setAjaxIndicator(true);
    },

    onSelectLiClicked: function(e) {
        var self = e.data.self,
            item = $(e.currentTarget);

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
    
  };  
  
  /* ******************************************************************* *
   * Plugin main
   * ******************************************************************* */
  $.fn.tinyselect = function(options) {
    if( typeof(options) != "undefined" )
    {
    }

    return this.each(function(){
        var sel = Object.create(TinySelect);
        sel.init( $(this) , options);
    });
  };

}(jQuery));
