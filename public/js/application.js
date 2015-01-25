// Generated by CoffeeScript 1.8.0
(function() {
  var AppView, FIREBASE_URL, RedirectYourTrafficRouter, Rule, RuleForm, RuleView, Rules, RulesView, SuccessView, app,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FIREBASE_URL = "https://resplendent-torch-5273.firebaseio.com";

  RedirectYourTrafficRouter = (function(_super) {
    __extends(RedirectYourTrafficRouter, _super);

    function RedirectYourTrafficRouter() {
      this.auth_callback = __bind(this.auth_callback, this);
      this.swap_view = __bind(this.swap_view, this);
      this.authenticated = __bind(this.authenticated, this);
      this.enforce_authentication = __bind(this.enforce_authentication, this);
      this.success = __bind(this.success, this);
      this.signout = __bind(this.signout, this);
      this.signin = __bind(this.signin, this);
      this.app = __bind(this.app, this);
      return RedirectYourTrafficRouter.__super__.constructor.apply(this, arguments);
    }

    RedirectYourTrafficRouter.prototype.routes = {
      "": "app",
      "signin": "signin",
      "signout": "signout",
      "rules": "rules",
      "success": "success",
      ".*": "app"
    };

    RedirectYourTrafficRouter.prototype.app = function() {
      console.log("hi");
      return this.swap_view(new AppView());
    };

    RedirectYourTrafficRouter.prototype.signin = function() {
      if (this.authenticated()) {
        return this.navigate('rules', {
          trigger: true
        });
      } else {
        return this.ref.authWithOAuthPopup("google", this.auth_callback);
      }
    };

    RedirectYourTrafficRouter.prototype.signout = function() {
      this.enforce_authentication();
      this.ref.unauth();
      this.auth = null;
      console.log('signed out');
      return this.navigate('#', {
        trigger: true
      });
    };

    RedirectYourTrafficRouter.prototype.success = function() {
      return this.swap_view(new SuccessView());
    };

    RedirectYourTrafficRouter.prototype.rules = function() {
      if (this.enforce_authentication()) {
        console.log('ruled!');
        return this.swap_view(new RulesView());
      }
    };

    RedirectYourTrafficRouter.prototype.enforce_authentication = function() {
      if (!this.authenticated()) {
        this.navigate('', {
          trigger: true
        });
      }
      return this.authenticated();
    };

    RedirectYourTrafficRouter.prototype.authenticated = function() {
      if (!this.ref) {
        this.ref = new Firebase(FIREBASE_URL);
      }
      if (!this.auth) {
        this.auth = this.ref.getAuth();
      }
      console.log('authed as', this.auth);
      return this.auth;
    };

    RedirectYourTrafficRouter.prototype.swap_view = function(view) {
      var _ref;
      if ((_ref = this.view) != null) {
        _ref.destroy();
      }
      this.view = view;
      return this.view.render();
    };

    RedirectYourTrafficRouter.prototype.auth_callback = function(error, authData) {
      var user;
      if (error) {
        console.log("Login Failed!", error);
        if (error.code === "TRANSPORT_UNAVAILABLE") {
          this.ref.authWithOAuthRedirect("google", this.auth_callback);
        }
        return this.navigate('');
      } else {
        console.log("Authenticated successfully with payload:", authData);
        if (authData) {
          user = this.ref.child("users").child(authData.uid).once('value', (function(_this) {
            return function(snapshot) {
              var token;
              if (!snapshot.exists()) {
                _this.ref.child("users").child(authData.uid).set(authData);
                token = Math.random().toString(36).substr(2);
                return _this.ref.child("users").child(authData.uid).child('script_token').set(token);
              }
            };
          })(this));
        }
        return this.navigate('rules', {
          trigger: true
        });
      }
    };

    return RedirectYourTrafficRouter;

  })(Backbone.Router);

  AppView = (function(_super) {
    __extends(AppView, _super);

    function AppView() {
      this.destroy = __bind(this.destroy, this);
      this.render = __bind(this.render, this);
      return AppView.__super__.constructor.apply(this, arguments);
    }

    AppView.prototype.el = '#app';

    AppView.prototype.template = _.template($('#app-template').html());

    AppView.prototype.render = function() {
      this.$el.html(this.template());
      return this;
    };

    AppView.prototype.destroy = function() {
      this.stopListening();
      return this.undelegateEvents();
    };

    return AppView;

  })(Backbone.View);

  SuccessView = (function(_super) {
    __extends(SuccessView, _super);

    function SuccessView() {
      this.destroy = __bind(this.destroy, this);
      this.render = __bind(this.render, this);
      return SuccessView.__super__.constructor.apply(this, arguments);
    }

    SuccessView.prototype.el = '#app';

    SuccessView.prototype.template = _.template($('#success-template').html());

    SuccessView.prototype.render = function() {
      this.$el.html(this.template());
      return this;
    };

    SuccessView.prototype.destroy = function() {
      this.stopListening();
      return this.undelegateEvents();
    };

    return SuccessView;

  })(Backbone.View);

  RulesView = (function(_super) {
    __extends(RulesView, _super);

    function RulesView() {
      this.validate = __bind(this.validate, this);
      this.update_test_link = __bind(this.update_test_link, this);
      this.publish = __bind(this.publish, this);
      this.add_rule = __bind(this.add_rule, this);
      this.renderOne = __bind(this.renderOne, this);
      this.render = __bind(this.render, this);
      this.destroy = __bind(this.destroy, this);
      this.fetch_script_token = __bind(this.fetch_script_token, this);
      this.initialize = __bind(this.initialize, this);
      return RulesView.__super__.constructor.apply(this, arguments);
    }

    RulesView.prototype.el = '#app';

    RulesView.prototype.template = _.template($('#rules-template').html());

    RulesView.prototype.events = {
      "click button#addrule": "add_rule",
      "click button#publish": "publish",
      "keyup input#test_url": "update_test_link"
    };

    RulesView.prototype.initialize = function() {
      this.rules = new Rules();
      this.views = _([]);
      this.listenTo(this.rules, 'sync', this.render);
      this.listenTo(this.rules, 'add', this.render);
      this.listenTo(this.rules, 'remove', this.render);
      this.listenTo(this.rules, 'add', this.validate);
      this.listenTo(this.rules, 'remove', this.validate);
      this.listenTo(this.rules, 'sync', this.validate);
      return this.fetch_script_token();
    };

    RulesView.prototype.fetch_script_token = function() {
      var authData, snapshot;
      this.ref = new Firebase(FIREBASE_URL);
      authData = this.ref.getAuth();
      return snapshot = this.ref.child("users").child(authData.uid).child('script_token').once('value', (function(_this) {
        return function(snapshot) {
          if (snapshot.exists()) {
            _this.token = snapshot.val();
          }
          console.log('script token set', _this.token);
          return _this.render();
        };
      })(this));
    };

    RulesView.prototype.destroy = function() {
      this.stopListening();
      this.views.invoke('destroy');
      return this.undelegateEvents();
    };

    RulesView.prototype.render = function() {
      this.views.invoke('destroy');
      this.views = _([]);
      this.$el.html(this.template({
        token: this.token
      }));
      this.rules.each(this.renderOne, this);
      this.$el.find(".accordion-tabs-minimal").each(function(index) {
        return $(this).children("li").first().children("a").addClass("is-active").next().addClass("is-open").show();
      });
      this.$el.find(".accordion-tabs-minimal").on("click", "li > a", function(event) {
        var accordionTabs;
        if (!$(this).hasClass("is-active")) {
          event.preventDefault();
          accordionTabs = $(this).closest(".accordion-tabs-minimal");
          accordionTabs.find(".is-open").removeClass("is-open").hide();
          $(this).next().toggleClass("is-open").toggle();
          accordionTabs.find(".is-active").removeClass("is-active");
          $(this).addClass("is-active");
        } else {
          event.preventDefault();
        }
      });
      return this;
    };

    RulesView.prototype.renderOne = function(rule) {
      var view;
      view = new RuleView(rule);
      this.views.push(view);
      view.render();
      return this.$el.find('#rules table tbody').prepend(view.el);
    };

    RulesView.prototype.add_rule = function(e) {
      var rule_form;
      rule_form = new RuleForm(this.rules);
      this.views.push(rule_form);
      this.$el.find('#rules').append(rule_form.render().el);
      return e.preventDefault();
    };

    RulesView.prototype.publish = function(e) {
      var flash;
      if (this.rules.length > 0) {
        this.ref.child('published').child(this.token).set(this.rules.toJSON());
        flash = '<div class="flash-success"> <span><strong>Published your rules!</strong> Your site will now begin redirecting traffic</span> </div>';
        this.$el.find('header').after($.parseHTML(flash));
        window.setTimeout('$(".flash-success").slideUp();', 3000);
      }
      return e.preventDefault();
    };

    RulesView.prototype.update_test_link = function(e) {
      var href;
      href = this.$el.find('input#test_url').val();
      return this.$el.find('a#test_link').attr({
        href: href
      });
    };

    RulesView.prototype.validate = function(e) {
      if (this.rules.length > 0) {
        return this.$el.find('button#publish').show();
      } else {
        return this.$el.find('button#publish').hide();
      }
    };

    return RulesView;

  })(Backbone.View);

  RuleForm = (function(_super) {
    __extends(RuleForm, _super);

    function RuleForm() {
      this.update = __bind(this.update, this);
      this.render = __bind(this.render, this);
      return RuleForm.__super__.constructor.apply(this, arguments);
    }

    RuleForm.prototype.tag = 'div';

    RuleForm.prototype.className = 'rule-form';

    RuleForm.prototype.template = _.template($('#rule-form-template').html());

    RuleForm.prototype.events = {
      "click button#save-rule": "save",
      "keyup input": "update"
    };

    RuleForm.prototype.initialize = function(rules) {
      this.rule = new Rule();
      return this.rules = rules;
    };

    RuleForm.prototype.render = function() {
      this.$el.html(this.template(this.rule.attributes));
      return this;
    };

    RuleForm.prototype.update = function(e) {
      var input;
      input = $(e.currentTarget);
      return this.rule.set(input.attr('name'), input.val());
    };

    RuleForm.prototype.save = function(e) {
      this.rules.add(this.rule.attributes);
      return e.preventDefault();
    };

    RuleForm.prototype.destroy = function() {
      return this.stopListening();
    };

    return RuleForm;

  })(Backbone.View);

  RuleView = (function(_super) {
    __extends(RuleView, _super);

    function RuleView() {
      this.remove = __bind(this.remove, this);
      this.render = __bind(this.render, this);
      return RuleView.__super__.constructor.apply(this, arguments);
    }

    RuleView.prototype.tagName = 'tr';

    RuleView.prototype.className = 'rule';

    RuleView.prototype.template = _.template($('#rule-template').html());

    RuleView.prototype.events = {
      "click button.remove-rule": "remove"
    };

    RuleView.prototype.initialize = function(rule) {
      return this.rule = rule;
    };

    RuleView.prototype.render = function() {
      return this.$el.html(this.template(this.rule.attributes));
    };

    RuleView.prototype.remove = function(e) {
      e.preventDefault();
      return this.rule.destroy();
    };

    RuleView.prototype.destroy = function() {
      return this.stopListening();
    };

    return RuleView;

  })(Backbone.View);

  Rule = (function(_super) {
    __extends(Rule, _super);

    function Rule() {
      return Rule.__super__.constructor.apply(this, arguments);
    }

    Rule.prototype.defaults = {
      subject: 'referrer',
      referrer: '',
      dest: ''
    };

    return Rule;

  })(Backbone.Model);

  Rules = (function(_super) {
    __extends(Rules, _super);

    function Rules() {
      return Rules.__super__.constructor.apply(this, arguments);
    }

    Rules.prototype.url = function() {
      var uid, user;
      user = new Firebase(FIREBASE_URL).getAuth();
      if (user) {
        uid = user.uid;
      }
      if (uid) {
        return "" + FIREBASE_URL + "/rules/" + uid + "/";
      }
    };

    Rules.prototype.autoSync = true;

    Rules.prototype.model = Rule;

    return Rules;

  })(Backbone.Firebase.Collection);

  window.setTimeout('$(".flash-success").slideUp();', 3000);

  app = app || {};

  app.Router = new RedirectYourTrafficRouter();

  Backbone.history.start();

}).call(this);
