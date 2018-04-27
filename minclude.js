
var minclude;

(function () {
    "use strict";

    minclude = {
        tagname: 'hx:include',
        classprefix: 'minc_',

        run: function () {
            this.process_tags();
        },

        includes: {},
        process_tags: function () {
            const rawincludes = document.getElementsByTagName(this.tagname);
            var callback = this.set_content_async;

            // Group tags
            for (var i = 0; i < rawincludes.length; i++) {
                const uri = rawincludes[i].getAttribute('src');
                const entry = rawincludes[i].getAttribute('entry');

                if (null != uri) {
                    if ((uri in this.includes) == false) {
                        this.includes[uri] = {
                            'withCredentials': false,
                            'includes': []
                        };
                    }

                    const include = {
                        'tag': rawincludes[i],
                        'entry': entry
                    };

                    this.includes[uri].includes.push(include);

                    // Include options
                    if ('withCredentials' in include.tag.dataset && include.tag.dataset.withCredentials == true) {
                        this.includes[uri].withCredentials = true;
                    }
                }
            }

            // Process groups
            for (let uri in this.includes) {
                this.include(uri, this.includes[uri], callback);
            }
        },

        include: function(uri, group, incl_cb) {
            let req;

            // Fetch content
            try {
                req = new XMLHttpRequest();
                if (group.withCredentials == true) {
                    req.withCredentials = true;
                }
                req.onreadystatechange = function () {
                    incl_cb(group, req);
                };
            } catch (err) {
                console.error('mInclude error: ' + err);
            }
            if (req) {
                try {
                    req.open('GET', uri, true);
                    req.send();
                } catch (err) {
                    console.error('mInclude error: ' + uri + '(' + err + ')');
                }
            }
        },

        set_content_async: function(group, req) {
            const realGroup = (group.includes.length > 1);

            // Request done
            if (req.readyState && req.readyState == 4) {
                let data   = req.responseText,
                    isJSON = false;

                // Try to JSON parse
                try {
                    data = JSON.parse(data);
                    isJSON = true;
                } catch (err) {
                    if (realGroup) {
                        console.error('mInclude error: Response should be valid JSON (' + err + ')', req.responseURL, req.response);
                    }
                }

                for (let i = 0; i < group.includes.length; i++) {
                    const item  = group.includes[i],
                          entry = item.entry,
                          tag   = item.tag;

                    let replaced = false;

                    if (req.status === 200 || req.status === 304) {
                        if (realGroup) {
                            if (isJSON && entry in data && 'html' in data[entry]) {
                                tag.innerHTML = data[entry].html;
                                replaced = true;
                            }
                        } else {
                            if (isJSON) {
                                if ('html' in data) {
                                    tag.innerHTML = data['html'];
                                    replaced = true;
                                }
                            } else {
                                tag.innerHTML = data;
                                replaced = true;
                            }
                        }
                    }

                    // Eval JS if content has been properly replaced
                    if (replaced) {
                        minclude.eval_js(tag);
                    }

                    // Set Status CSS Class
                    minclude.set_class(tag, req.status);

                    minclude.trigger_event(tag);
                }
            }
        },

        eval_js: function (element) {
            var evaljs = element.hasAttribute('evaljs') && element.getAttribute('evaljs') === "true";
            if (evaljs) {
                var scripts = element.getElementsByTagName('script');
                var i;
                for (i = 0; i < scripts.length; i = i + 1) {
                /*jslint evil: true */
                eval(scripts[i].innerHTML);
                }
            }
        },

        set_class: function (element, status) {
            const genericClass  = this.classprefix + 'included',
                  specificClass = this.classprefix + 'included_' + status

            if (element.classList.contains(genericClass) === false) {
                element.classList.add(genericClass);
                element.classList.add(specificClass);
            }
        },



        trigger_event: function (element) {
            var event;

            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.initEvent("hinclude", true, true);
                event.eventName = "hinclude";
                element.dispatchEvent(event);
            } else if (document.createEventObject) { // IE
                event = document.createEventObject();
                event.eventType = "hinclude";
                event.eventName = "hinclude";
                element.fireEvent("on" + event.eventType, event);
            }
        },

        /*
        * (c)2006 Dean Edwards/Matthias Miller/John Resig
        * Special thanks to Dan Webb's domready.js Prototype extension
        * and Simon Willison's addLoadEvent
        *
        * For more info, see:
        * http://dean.edwards.name/weblog/2006/06/again/
        *
        * Thrown together by Jesse Skinner (http://www.thefutureoftheweb.com/)
        */
        addDOMLoadEvent: function (func) {
            if (!window.__load_events) {
            var init = function () {
                var i = 0;
                // quit if this function has already been called
                if (minclude.addDOMLoadEvent.done) {return; }
                minclude.addDOMLoadEvent.done = true;
                if (window.__load_timer) {
                clearInterval(window.__load_timer);
                window.__load_timer = null;
                }
                for (i; i < window.__load_events.length; i += 1) {
                window.__load_events[i]();
                }
                window.__load_events = null;
                // clean up the __ie_onload event
                /*@cc_on
                document.getElementById("__ie_onload").onreadystatechange = "";
                @*/
            };
            // for Mozilla/Opera9
            if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", init, false);
            }
            // for Internet Explorer
            /*@cc_on
            var script = document.createElement('script');
            script.id = '__ie_onload';
            script.setAttribute("defer", "defer");
            document.getElementsByTagName('head')[0].appendChild(script);
            script.onreadystatechange = function () {
                if (this.readyState === "complete") {
                init(); // call the onload handler
                }
            };
            @*/
            // for Safari
            if (/WebKit/i.test(navigator.userAgent)) { // sniff
                window.__load_timer = setInterval(function () {
                if (/loaded|complete/.test(document.readyState)) {
                    init();
                }
                }, 10);
            }
            // for other browsers
            window.onload = init;
            window.__load_events = [];
            }
            window.__load_events.push(func);
        }
    };

    minclude.addDOMLoadEvent(function () { minclude.run(); });
})();