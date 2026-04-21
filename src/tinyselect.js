/*!
 * tinySelect ( https://mcfizh.github.io/tinySelect/ )
 *
 * Licensed under MIT license.
 *
 * @version 3.2.0
 * @author Pekka Harjamäki
 */
;(function ($) {

  "use strict";

  const TinySelect = {
    /* ******************************************************************* *
     * Class initializers
     * ******************************************************************* */
    init: function ($el, options) {     
      this.config = $.extend({
        showSearch: true,
        searchCaseSensitive: true,
        searchDebounce: 100,
        txtLoading: "Loading...",
        txtAjaxFailure: "Error...",
        ariaSearchLabel: "Search options",

        dataUrl: null,
        dataParser: null
      }, options);

      this.state = {
        container: null,
        selectBox: null,
        itemContainer: null,
        listboxId: null,

        searchContainer: null,
        searchBox: null,
        searchStatus: null,

        $el: null,

        open: false,
        ajaxPending: false,
        selectedValue: -1,
        searchDebounceTimer: null,

        originalItemData: [],
        filteredItemData: []
      };

      this.state.disabled = $el.prop("disabled");

      this.readSelect($el);
      this.createSelect($el);

    },

    createSelect: function ($el) {
      // Create container for select, search and options
      this.state.container = $("<div></div>").
        addClass("tinyselect").
        css({ width: $el.css("width") });

      const t_id = $el.attr("id");
      if (t_id && t_id.length > 0)
        this.state.container.attr("id", t_id + "_ts");

      this.state.listboxId = (t_id && t_id.length > 0 ? t_id + "_ts" : "ts_" + Math.random().toString(36).slice(2, 7)) + "_lb";

      // Create the select element
      this.state.selectBox = $("<div></div>").addClass("selectbox").
        attr("role", "combobox").
        attr("aria-haspopup", "listbox").
        attr("aria-expanded", "false");

      if (this.state.disabled) {
        this.state.selectBox.addClass("disabled");
      } else {
        this.state.selectBox.
          attr("tabindex", "0").
          on("click", { self: this }, this.onSelectBoxClicked).
          on("keydown", { self: this }, this.onSelectBoxKeyDown);
      }

      this.state.container.append(this.state.selectBox);

      // Create container to hold search and results
      this.state.dropdown = $("<div></div>").
        addClass("dropdown").
        hide();

      this.state.container.append(this.state.dropdown);

      // Add search as first element
      if (this.config.showSearch)
        this.createSearch(this.state.dropdown);

      // Create ul to hold items
      this.state.itemContainer = $("<ul></ul>").addClass("itemcontainer").attr("role", "listbox").attr("id", this.state.listboxId);
      this.state.dropdown.append(this.state.itemContainer);

      //
      this.createItems();

      // Hide original select element and add new component to below
      $el.hide().after(this.state.container);
      this.state.$el = $el;

      // Hide select content when clicked elsewhere in the document
      $(document).on("click", { self: this }, this.onDocumentClicked);
    },

    createItems: function () {
      // Remove all
      this.state.itemContainer.empty();

      //
      for (const opt of this.state.filteredItemData) {
        const newLi = $("<li></li>").text(opt.text).addClass("item").
          attr("data-value", opt.val).
          attr("role", "option").
          attr("aria-selected", opt.val === this.state.selectedValue ? "true" : "false");

        if (opt.val === this.state.selectedValue) {
          this.state.selectBox.html(opt.text);
          newLi.addClass("selected");
        }

        if (opt.disabled) {
          newLi.addClass("disabled").attr("aria-disabled", "true");
        } else {
          newLi.on("click", { self: this }, this.onSelectLiClicked);
        }

        this.state.itemContainer.append(newLi);
      }
    },

    createSearch: function () {
      this.state.searchContainer = $("<div></div>").
        addClass("searchcontainer");
      this.state.searchBox = $("<input type='text'></input>").
        addClass("searchbox").
        attr("aria-label", this.config.ariaSearchLabel).
        attr("aria-autocomplete", "list").
        attr("aria-controls", this.state.listboxId).
        on("click", function (e) { e.stopPropagation(); }).
        on("keyup", { self: this }, this.onSearchKeyPress);

      this.state.searchStatus = $("<div></div>").
        addClass("sr-only").
        attr("aria-live", "polite").
        attr("aria-atomic", "true");

      this.state.searchContainer.append($("<span class='searchicon'></span>"));
      this.state.searchContainer.append(this.state.searchBox);
      this.state.searchContainer.append(this.state.searchStatus);
      this.state.dropdown.append(this.state.searchContainer);
    },

    readSelect: function ($el) {
      const self = this;

      $el.find("option").each(function () {
        const opt = $(this);
        self.state.originalItemData.push({ val: opt.val(), text: opt.text(), disabled: opt.prop("disabled") });
      });

      this.state.filteredItemData = this.state.originalItemData;
      this.state.selectedValue = $el.val();
    },

    loadData: function (url) {
      const self = this;
      self.setAjaxIndicator(false);
      $.ajax({ url, dataType: "json", type: "GET" })
        .done(function (data) { self.onAjaxLoadSuccess(data); })
        .fail(function () { self.onAjaxLoadError(); });
    },

    setAjaxIndicator: function (failure) {
      this.state.ajaxPending = true;
      this.state.itemContainer.empty();

      if (this.state.searchContainer !== null)
        this.state.searchContainer.hide();

      const newLi = $("<li></li>");
      if (!failure) {
        newLi.text(this.config.txtLoading).
          addClass("loadindicator");
      } else {
        newLi.text(this.config.txtAjaxFailure).
          addClass("loaderrorindicator");
      }

      this.state.itemContainer.append(newLi);
    },

    closeDropdown: function () {
      this.state.open = false;
      this.state.selectBox.removeClass("open").attr("aria-expanded", "false");
      this.state.dropdown.slideUp(100);
      if (this.state.searchBox !== null) {
        this.state.searchBox.val("");
        this.state.filteredItemData = this.state.originalItemData;
        this.createItems();
      }
    },

    /* ******************************************************************* *
     * Event handlers
     * ******************************************************************* */
    onDocumentClicked: function (e) {
      const self = e.data.self;

      if (self.state.open)
        self.onSelectBoxClicked(e);
    },

    onSearchKeyPress: function (e) {
      const self = e.data.self;

      clearTimeout(self.state.searchDebounceTimer);
      self.state.searchDebounceTimer = setTimeout(function () {
        let sval = $(e.currentTarget).val();

        // Convert search string to lowercase, if using case insensitive search
        if (!self.config.searchCaseSensitive)
          sval = sval.toLowerCase();

        if (sval.length === 0) {
          self.state.filteredItemData = self.state.originalItemData;
        } else {
          self.state.filteredItemData = self.state.originalItemData.filter(function (item) {
            if (!self.config.searchCaseSensitive)
              return item.text.toLowerCase().includes(sval);
            return item.text.includes(sval);
          });
        }

        self.createItems();

        if (self.state.searchStatus !== null) {
          const n = self.state.filteredItemData.length;
          self.state.searchStatus.text(sval.length === 0 ? "" : n + (n === 1 ? " result" : " results"));
        }
      }, self.config.searchDebounce);
    },

    onSelectBoxKeyDown: function (e) {
      const self = e.data.self;
      if (e.keyCode === 32 || e.keyCode === 13) {
        e.preventDefault();
        self.onSelectBoxClicked({ data: { self: self } });
      } else if (e.keyCode === 27 && self.state.open) {
        self.closeDropdown();
      }
    },

    onSelectBoxClicked: function (e) {
      const self = e.data.self;

      // Do nothing, if currently animating
      if (self.state.dropdown.is(":animated"))
        return;

      // Close selectBox
      if (self.state.open) {
        self.closeDropdown();
        return;
      }

      // Open selectbox
      if (self.config.dataUrl !== null) {
        self.loadData(self.config.dataUrl);
      }

      self.state.open = true;
      self.state.selectBox.addClass("open").attr("aria-expanded", "true");
      self.state.dropdown.slideDown(100);
    },

    onAjaxLoadSuccess: function (data) {
      this.state.ajaxPending = false;

      if (this.config.dataParser !== null)
        data = this.config.dataParser(data, this.state.selectedValue);

      this.state.$el.empty();
      data.forEach((v) => {
        if (v.selected)
          this.state.selectedValue = v.val;

        const $opt = $("<option></option>").text(v.text).val(v.val);
        if (v.disabled) $opt.prop("disabled", true);
        this.state.$el.append($opt);
      });

      this.state.$el.val(this.state.selectedValue);
      this.state.originalItemData = data;
      this.state.filteredItemData = data;

      if (this.state.searchContainer !== null)
        this.state.searchContainer.show();

      this.createItems();
    },

    onAjaxLoadError: function () {
      this.setAjaxIndicator(true);
    },

    onSelectLiClicked: function (e) {
      const self = e.data.self;
      const item = $(e.currentTarget);

      self.state.itemContainer.find(".selected").removeClass("selected").attr("aria-selected", "false");

      item.addClass("selected").attr("aria-selected", "true");
      self.state.selectBox.html(item.text());

      self.state.selectedValue = item.attr("data-value");
      self.state.$el.val(self.state.selectedValue);
      self.state.$el.trigger("change");
    },

    /* ******************************************************************* *
     * External callbacks
     * ******************************************************************* */
    onChangeDataUrl: function (newUrl) {
      this.config.dataUrl = newUrl;
    },

    destroy: function () {
      $(document).off("click", this.onDocumentClicked);
      this.state.container.remove();
      this.state.$el.show();
    },
  };

  /* ******************************************************************* *
   * Plugin main
   * ******************************************************************* */
  $.fn.tinyselect = function (options) {
    const key = "plugin_tinySelect";

    if (options === undefined || typeof options === "object") {
      return this.each(function () {
        if (!$.data(this, key)) {
          const sel = Object.create(TinySelect);
          sel.init($(this), options);
          $.data(this, key, sel);
        }
      });
    } else if (typeof options === "string" && options === "setDataUrl") {
      // Arguments need to be extracted here, the value of arguments is different inside the loop
      const args = arguments;

      return this.each(function () {
        const instance = $.data(this, key);
        if (instance && args[1])
          instance.onChangeDataUrl(args[1]);
      });
    } else if (typeof options === "string" && options === "destroy") {
      return this.each(function () {
        const instance = $.data(this, key);
        if (instance) {
          instance.destroy();
          $.removeData(this, key);
        }
      });
    }
  };

}(jQuery));
