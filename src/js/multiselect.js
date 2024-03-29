(function (d) {
    function g(a, b) { this.b = d(a); this.a = d.extend({}, k, b); this.M() } var k = {
        containerHTML: '<div class="multi-select-container">', menuHTML: '<div class="multi-select-menu">', buttonHTML: '<span class="multi-select-button">', menuItemsHTML: '<div class="multi-select-menuitems">', menuItemHTML: '<label class="multi-select-menuitem">', presetsHTML: '<div class="multi-select-presets">', modalHTML: void 0, menuItemTitleClass: "multi-select-menuitem--titled", activeClass: "multi-select-container--open", noneText: "Choose options",
        allText: void 0, presets: void 0, positionedMenuClass: "multi-select-container--positioned", positionMenuWithin: void 0, viewportBottomGutter: 20, menuMinHeight: 200
    }; d.extend(g.prototype, {
        M: function () { this.C(); this.L(); this.F(); this.D(); this.G(); this.J(); this.N(); this.O(); this.b.hide() }, C: function () { if (!1 === this.b.is("select[multiple]")) throw Error("$.multiSelect only works on <select multiple> elements"); }, L: function () { this.l = d('label[for="' + this.b.attr("id") + '"]') }, F: function () {
        this.f = d(this.a.containerHTML);
            this.b.data("multi-select-container", this.f); this.f.insertAfter(this.b)
        }, D: function () {
            var a = this; this.g = d(this.a.buttonHTML); this.g.attr({ role: "button", "aria-haspopup": "true", tabindex: 0, "aria-label": this.l.eq(0).text() }).on("keydown.multiselect", function (b) { var c = b.which; 13 === c || 32 === c ? (b.preventDefault(), a.g.click()) : 40 === c ? (b.preventDefault(), a.s(), (a.i || a.h).children(":first").focus()) : 27 === c && a.j() }).on("click.multiselect", function () { a.u() }).appendTo(this.f); this.b.on("change.multiselect", function () { a.w() });
            this.w()
        }, w: function () { var a = [], b = []; this.b.find("option").each(function () { var c = d(this).text(); a.push(c); d(this).is(":selected") && b.push(d.trim(c)) }); this.g.empty(); 0 == b.length || b.length == 1 && b[0] === "" ? this.g.text(this.a.noneText) : b.length === a.length && this.a.allText ? this.g.text(this.a.allText) : this.g.text(b.join(", ")) }, G: function () { var a = this; this.c = d(this.a.menuHTML); this.c.attr({ role: "menu" }).on("keyup.multiselect", function (b) { 27 === b.which && (a.j(), a.g.focus()) }).appendTo(this.f); this.H(); this.a.presets && this.K() }, H: function () {
            var a =
                this; this.h = d(this.a.menuItemsHTML); this.c.append(this.h); this.b.on("change.multiselect", function (b, c) { !0 !== c && a.A() }); this.A()
        }, A: function () { var a = this; this.h.empty(); this.b.children("optgroup,option").each(function (b, c) { "OPTION" === c.nodeName ? (b = a.o(d(c), b), a.h.append(b)) : a.I(d(c), b) }) }, v: function (a, b) {
            var c = b.which; 38 === c ? (b.preventDefault(), b = d(b.currentTarget).prev(), b.length ? b.focus() : this.i && "menuitem" === a ? this.i.children(":last").focus() : this.g.focus()) : 40 === c && (b.preventDefault(), b = d(b.currentTarget).next(),
                b.length || "menuitem" === a ? b.focus() : this.h.children(":first").focus())
        }, K: function () {
            var a = this; this.i = d(this.a.presetsHTML); this.c.prepend(this.i); d.each(this.a.presets, function (b, c) { b = a.b.attr("name") + "_preset_" + b; var f = d(a.a.menuItemHTML).attr({ "for": b, role: "menuitem" }).text(" " + c.name).on("keydown.multiselect", a.v.bind(a, "preset")).appendTo(a.i); d("<input>").attr({ type: "radio", name: a.b.attr("name") + "_presets", id: b }).prependTo(f).on("change.multiselect", function () { a.b.val(c.options); a.b.trigger("change") }) });
            this.b.on("change.multiselect", function () { a.B() }); this.B()
        }, B: function () { var a = this; d.each(this.a.presets, function (b, c) { b = a.b.attr("name") + "_preset_" + b; b = a.i.find("#" + b); a: { c = c.options || []; var f = a.b.val() || []; if (c.length != f.length) c = !1; else { c.sort(); f.sort(); for (var e = 0; e < c.length; e++)if (c[e] !== f[e]) { c = !1; break a } c = !0 } } c ? b.prop("checked", !0) : b.prop("checked", !1) }) }, I: function (a, b) {
            var c = this; a.children("option").each(function (f, e) {
                e = c.o(d(e), b + "_" + f); var h = c.a.menuItemTitleClass; 0 !== f && (h += "sr");
                e.addClass(h).attr("data-group-title", a.attr("label")); c.h.append(e)
            })
        }, o: function (a, b) {
            if(!a[0].value)return
            var c = a[0].id + "_" + b; b = d(this.a.menuItemHTML).attr({ "for": c, role: "menuitem" }).on("keydown.multiselect", this.v.bind(this, "menuitem")).text(" " + a.text()); c = d("<input>").attr({ type: "checkbox", id: c, value: a.val() }).prependTo(b); a.is(":disabled") && c.attr("disabled", "disabled"); a.is(":selected") && c.prop("checked", "checked"); c.on("change.multiselect", function () {
                d(this).prop("checked") ? a.prop("selected", !0) :
                a.prop("selected", !1); a.trigger("change", [!0])
            }); return b
        }, J: function () { var a = this; this.a.modalHTML && (this.m = d(this.a.modalHTML), this.m.on("click.multiselect", function () { a.j() }), this.m.insertBefore(this.c)) }, N: function () { var a = this; d("html").on("click.multiselect", function () { a.j() }); this.f.on("click.multiselect", function (b) { b.stopPropagation() }) }, O: function () { var a = this; this.l.on("click.multiselect", function (b) { b.preventDefault(); b.stopPropagation(); a.u() }) }, s: function () {
            d("html").trigger("click.multiselect");
            this.f.addClass(this.a.activeClass); if (this.a.positionMenuWithin && this.a.positionMenuWithin instanceof d) { var a = this.c.offset().left + this.c.outerWidth(), b = this.a.positionMenuWithin.offset().left + this.a.positionMenuWithin.outerWidth(); a > b && (this.c.css("width", b - this.c.offset().left), this.f.addClass(this.a.positionedMenuClass)) } a = this.c.offset().top + this.c.outerHeight(); b = d(window).scrollTop() + d(window).height(); a > b - this.a.viewportBottomGutter ? this.c.css({
                maxHeight: Math.max(b - this.a.viewportBottomGutter -
                    this.c.offset().top, this.a.menuMinHeight), overflow: "scroll"
            }) : this.c.css({ maxHeight: "", overflow: "" })
        }, j: function () { this.f.removeClass(this.a.activeClass); this.f.removeClass(this.a.positionedMenuClass); this.c.css("width", "auto") }, u: function () { this.f.hasClass(this.a.activeClass) ? this.j() : this.s() }
    }); d.fn.multiSelect = function (a) { return this.each(function () { d.data(this, "plugin_multiSelect") || d.data(this, "plugin_multiSelect", new g(this, a)) }) }
})(jQuery);
