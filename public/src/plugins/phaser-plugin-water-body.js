var WaterBodyPlugin = function() {
    "use strict";

    function a(a, b) {
        if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function")
    }

    function b(a, b) {
        for (var c, d = 0; d < b.length; d++) c = b[d], c.enumerable = c.enumerable || !1, c.configurable = !0, "value" in c && (c.writable = !0), Object.defineProperty(a, c.key, c)
    }

    function c(a, c, d) {
        return c && b(a.prototype, c), d && b(a, d), a
    }

    function d(a, b) {
        if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function");
        a.prototype = Object.create(b && b.prototype, {
            constructor: {
                value: a,
                writable: !0,
                configurable: !0
            }
        }), b && f(a, b)
    }

    function e(a) {
        return e = Object.setPrototypeOf ? Object.getPrototypeOf : function(a) {
            return a.__proto__ || Object.getPrototypeOf(a)
        }, e(a)
    }

    function f(a, b) {
        return f = Object.setPrototypeOf || function(a, b) {
            return a.__proto__ = b, a
        }, f(a, b)
    }

    function g() {
        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
        if (Reflect.construct.sham) return !1;
        if ("function" == typeof Proxy) return !0;
        try {
            return Date.prototype.toString.call(Reflect.construct(Date, [], function() {})), !0
        } catch (a) {
            return !1
        }
    }

    function i() {
        return i = g() ? Reflect.construct : function(b, c, d) {
            var e = [null];
            e.push.apply(e, c);
            var a = Function.bind.apply(b, e),
                g = new a;
            return d && f(g, d.prototype), g
        }, i.apply(null, arguments)
    }

    function j(a) {
        if (void 0 === a) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return a
    }

    function k(a, b) {
        return b && ("object" == typeof b || "function" == typeof b) ? b : j(a)
    }

    function l(a) {
        return m(a) || n(a) || o()
    }

    function m(a) {
        if (Array.isArray(a)) {
            for (var b = 0, c = Array(a.length); b < a.length; b++) c[b] = a[b];
            return c
        }
    }

    function n(a) {
        if (Symbol.iterator in Object(a) || "[object Arguments]" === Object.prototype.toString.call(a)) return Array.from(a)
    }

    function o() {
        throw new TypeError("Invalid attempt to spread non-iterable instance")
    }
    var p = function() {
            function b() {
                var c = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 0,
                    d = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0,
                    e = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 0;
                a(this, b), this.index = e, this.x = c, this.y = d, this.targetY = d, this.speed = .5
            }
            return c(b, [{
                key: "update",
                value: function(a, b) {
                    var c = this.targetY - this.y;
                    this.speed += b * c - this.speed * a, this.y += this.speed
                }
            }]), b
        }(),
        q = function() {
            function b(c) {
                var d = Math.min,
                    e = this,
                    f = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0,
                    g = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 0,
                    j = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : 100,
                    k = 4 < arguments.length && void 0 !== arguments[4] ? arguments[4] : 100,
                    h = 5 < arguments.length && void 0 !== arguments[5] ? arguments[5] : 150,
                    m = 6 < arguments.length && void 0 !== arguments[6] ? arguments[6] : {},
                    n = m.dampening,
                    o = void 0 === n ? .025 : n,
                    q = m.renderDepth,
                    r = void 0 === q ? 1 : q,
                    s = m.spread,
                    t = void 0 === s ? .25 : s,
                    u = m.tension,
                    v = void 0 === u ? .025 : u,
                    w = m.texture;
                if (a(this, b), "undefined" == typeof w) throw new Error("This version of WaterBody requires explicitly setting a texture");
                this.debug = !1, this.x = f, this.y = g, this.w = j, this.h = k, this.tension = v, this.dampening = o, this.spread = t, this.depth = d(h, this.h), this.texture = w;
                var x = [0, this.h - this.depth, this.w, this.h - this.depth],
                    y = i(Phaser.Geom.Line, x),
                    z = y.getPoints(0, 20);
                this.columns = [].concat(l(z), [{
                    x: this.w,
                    y: x[1]
                }]).map(function(a, b) {
                    var c = a.x,
                        d = a.y;
                    return new p(c, d, b)
                });
                var A = this.columns.reduce(function(a, b) {
                    var c = b.x,
                        d = b.y;
                    return [].concat(l(a), [c, d])
                }, []);
                this.body = c.add.polygon(f, g, [x[0], this.h].concat(l(A), [x[2], this.h])).setFillStyle(1334737, 0).setDepth(99).setOrigin(0, 0), "string" == typeof w && (this.background = c.add.tileSprite(this.x, this.y, this.w, this.h, this.texture).setAlpha(.75).setDepth(r).setOrigin(0, 0), this.background.mask = new Phaser.Display.Masks.GeometryMask(c, this.body)), this.sensor = c.matter.add.rectangle(this.x + this.w / 2, this.y + this.h - this.depth / 2, j, this.depth, {
                    isSensor: !0,
                    isStatic: !0,
                    gameObject: this
                }), this.debugGraphic = c.add.graphics({
                    fillStyle: {
                        color: 16777215
                    }
                });
                var B = new Phaser.Geom.Polygon(Object.values(this.body.geom.points).map(function(a) {
                    var b = a.x,
                        c = a.y;
                    return [e.x + b, e.y + c]
                }));
                this.emitter = c.add.particles("droplet").createEmitter({
                    alpha: 1,
                    tint: 741525,
                    speed: {
                        min: 100,
                        max: 500
                    },
                    gravityY: 1e3,
                    lifespan: 4e3,
                    quantity: 0,
                    frequency: 1e3,
                    angle: {
                        min: 240,
                        max: 300
                    },
                    scale: {
                        min: .5,
                        max: .1
                    },
                    deathZone: {
                        type: "onEnter",
                        source: B
                    },
                    deathCallbackScope: this,
                    deathCallback: this.onDropletDeath
                }), c.sys.events.on("update", this.update, this)
                c.sys.events.on("shutdown", function(){this.isActive = false;}, this);
                this.isActive = true;
            }
            return c(b, [{
                key: "update",
                value: function() {
                    if(this.isActive){
                        var a = this;
                        this.columns.forEach(function(b) {
                            return b.update(a.dampening, a.tension)
                        });
                        var b = this.columns.reduce(function(a, b) {
                            var c = b.x,
                                d = b.y;
                            return [].concat(l(a), [c, d])
                        }, []);
                        this.body.geom.setTo([0, this.h].concat(l(b), [this.w, this.h])), this.body.updateData(), this.debugGraphic.clear(), this.debug && this.columns.forEach(function(b) {
                            var c = b.x,
                                d = b.y;
                            return a.debugGraphic.fillRect(a.x + c - 1, a.y + d - 1, 2, 2)
                        });
                        for (var c = Array(this.columns.length).fill(0), d = Array(this.columns.length).fill(0), e = 0; 1 > e; e++) {
                            for (var f = 0; f < this.columns.length - 1; f++) {
                                if (0 < f) {
                                    var g = this.columns[f],
                                        h = this.columns[f - 1];
                                    c[f] = this.spread * (g.y - h.y), h.speed += c[f]
                                }
                                if (f < this.columns.length - 1) {
                                    var k = this.columns[f],
                                        m = this.columns[f + 1];
                                    d[f] = this.spread * (k.y - m.y), m.speed += d[f]
                                }
                            }
                            for (var n = 0; n < this.columns.length - 1; n++) {
                                if (0 < n) {
                                    var o = this.columns[n - 1];
                                    o.y += c[n]
                                }
                                if (n < this.columns.length - 1) {
                                    var p = this.columns[n + 1];
                                    p.y += d[n]
                                }
                            }
                        }
                    }
                }
            }, {
                key: "splash",
                value: function(a) {
                    var b = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 1,
                        c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 3,
                        d = this.columns[a];
                    return d.speed = b, this.emitter.explode(c, this.x + d.x, this.y + d.y), this
                }
            }, {
                key: "ripple",
                value: function(a, b) {
                    var c = this.columns[a];
                    return c.speed = b, this
                }
            }, {
                key: "setDebug",
                value: function(a) {
                    return this.debug = a, this
                }
            }, {
                key: "onDropletDeath",
                value: function(a) {
                    var b = this,
                        c = a.x,
                        d = this.columns.length - 1,
                        e = this.columns.findIndex(function(a, d) {
                            return b.x + a.x >= c && d
                        }),
                        f = Phaser.Math.Clamp(e, 0, d);
                    this.ripple(f, .5)
                }
            }]), b
        }(),
        r = function(b) {
            function f(b) {
                var c;
                return a(this, f), c = k(this, e(f).call(this, b)), b.registerGameObject("water", c.createWaterBody), c
            }
            return d(f, b), c(f, [{
                key: "createWaterBody",
                value: function(a, b, c, d, e, f) {
                    return new q(this.scene, a, b, c, d, e, f)
                }
            }]), f
        }(Phaser.Plugins.BasePlugin);
    return r
}();