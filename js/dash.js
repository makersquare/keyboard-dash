/** @jsx React.DOM **/

(function () {

  var standardMap = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown", "Alt-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars"
  };
  var expandKeys = function (ctrls, alts) {
    var keystrokes = [];
    _.each(ctrls.split(''), function (ch) { keystrokes.push('Ctrl-'+ch); });
    _.each(alts.split(''), function (ch) { keystrokes.push('Alt-'+ch); });
    return _.pick(standardMap, keystrokes);
  }
  // LAST TIME: CREATE LEVEL-SPECIFIC LEVELS
  var levels = [
    {
      id: "updown",
      name: "Up & Down",
      map: expandKeys('ADEHNP', '')
    },
    {
      id: "hourglass",
      name: "Hourglass",
      map: expandKeys('ADEHNPBF', 'BF')
    },
    {
      id: "snake",
      name: "Snake!!",
      map: standardMap
    },
    {
      id: "scattered",
      name: "Scattered",
      map: standardMap
    }
  ];

  var Dash = function (goal) {
    var lastKeypressScore = 0;
    $.observable(this);

    this.status = 'pending';
    this.history = [];
    this.goal = goal;
    this.score = 0;
    this.strokeCount = 0;
    this.seconds = 0;
    this.startTime = (new Date()).getTime();
    this.stopTime = null;
  };
  Dash.prototype = {
    tick: function () {
      this.seconds += 1;
      this.history.push({ tick: this.seconds });
      this.trigger('update');
      return this.seconds;
    },
    recordPoints: function (amount) {
      lastKeypressScore = amount;
    },
    recordKeystroke: function (keystroke) {
      this.history.push({ keystroke: name, points: lastKeypressScore });
      this.score += lastKeypressScore;
      this.strokeCount += 1;
      this.trigger('update');

      lastKeypressScore = 0;
      if (this.score === this.goal) {
        console.log('Win!');
        this.end();
      }
    },
    start: function () {
      this.status = 'running';
      this.trigger('update');
    },
    end: function () {
      this.stopTime = (new Date()).getTime();
      this.status = 'done';
      this.trigger('end', this.score);
    },
    abort: function () {
      this.status = 'aborted';
      this.trigger('update');
    },
    isRunning: function () {
      return this.status == 'running';
    }
  }

  var DashManager = function (ui) {
    this.ui = ui;

    this.setKeyMap = function (map) {
      this.keyMap = map;
      this.ui.setState({ keyMap: map });
    };

    this.setLevel = function (level) {
      if (this.currentDash && this.currentDash.isRunning()) {
        this.currentDash.abort();
        this.end();
      }

      this.level = level;
      this.ui.setState({ keyMap: this.level.map });
      CodeMirror.keyMap['training'] = this.level.map;
      if (!level.content) {
        var script = document.querySelectorAll('.map.' + level.id)[0];
        level.content = script.innerHTML;
      }
      this.editor.unlock();
      this.editor.doc.setValue(level.content);
      this.goal = level.content.split('x').length - 1;
      this.editor.lock();
    };
    this.ui.props.onLevelSelect = this.setLevel.bind(this);

    this.begin = function () {
      // var textarea = document.getElementById('editor');
      // var goal = textarea.value.split('x').length - 1;
      this.currentDash = new Dash(this.goal);

      var self = this;
      this.currentDash.on('update', function () {
        self.ui.setState({ dash: self.currentDash });
      });
      this.currentDash.on('end', function () {
        self.end();
      });

      this.currentDash.start();

      // $('.timer').text("00:00 - Go!");

      var self = this;
      this.tickTimer = setInterval(function () {
        var totalSeconds = self.currentDash.tick();
        // $('.timer').text(formatted);
      }, 1500);
    };

    this.end = function () {
      clearTimeout(this.tickTimer);
      self.ui.setState({ dash: this.currentDash });
    };

    this.errorCount = 0;
    this.showError = function (message) {
      for (var i = this.errorCount-1; i >= 0; i -= 1) { message += '!'; }
      $('.error').text(message);
      this.errorCount += 1;

      clearTimeout(this.errorTimer);
      var self = this;
      this.errorTimer = setTimeout(function () {
        self.clearError();
      }, 1000);
    };
    this.clearError = function () {
      if (this.errorCount === 0) { return; }
      $('.error').text('');
      this.errorCount = 0;
    };
  };


  var createTrainerEditor = function (manager, textarea) {
    // var name = keyMap[keystroke];
    // $('.shortcut-list').append("<li><b>" + keystroke + ":</b><br />" + name + "</li>");
    CodeMirror.keyMap['training'] = {}
    manager.editor = CodeMirror.fromTextArea(textarea, {
      lineNumbers: true,
      mode: "text/html",
      theme: "blackboard",
      keyMap: "training",
      value: "Select a level from above"
    });

    var handleKey = function (editor, name, e) {
      if (!manager.currentDash || !manager.currentDash.isRunning()) return;

      // Add keystroke to history
      manager.currentDash.recordKeystroke(name);
      // $('#stats .stroke-count').text(dash.history.length);
      // $('#stats .progress').text(dash.score);
        // manager.end();
        // $('.success').text("Nice job!");
    };

    var validateChange = function (editor, change) {
      if (change.text[0]) {
        // manager.showError("You can't add your own characters");
        console.log("You can't add your own characters");
        change.cancel();
        return;
      }
      var deletingChars = editor.doc.getRange(change.from, change.to);
      if (deletingChars.match(/[^x]/)) {
        // manager.showError("You can only delete x characters");
        console.log("You can only delete x characters");
        change.cancel();
        return;
      }
      if (!manager.currentDash || !manager.currentDash.isRunning()) {
        manager.begin();
      }
      var points = deletingChars.split('x').length - 1;
      manager.currentDash.recordPoints(points);
      // manager.clearError();
    };

    manager.editor.lock = function () {
      manager.editor.on('keyHandled', handleKey);
      manager.editor.on('beforeChange', validateChange);
    };
    manager.editor.unlock = function () {
      manager.editor.off('keyHandled', handleKey);
      manager.editor.off('beforeChange', validateChange);
    };

    manager.editor.lock();
  };

  // // // // // //
  // REACT VIEWS //
  // // // // // //
  var LevelSelect = React.createClass({
    getInitialState: function () {
      return { levels: levels };
    },
    render: function () {
      var options = this.state.levels.map(function (level, i) {
        return (<option value={level.id}>{level.name}</option>)
      });
      return (<select onChange={this.handleChange}>{options}</select>);
    },
    handleChange: function (e) {
      var levelId = e.target.value;
      var level = _.find(this.state.levels, function (lvl) { return lvl.id == levelId });
      this.props.onSelect(level);
    }
  });

  var KeyMap = React.createClass({
    render: function () {
      var shortcuts = _.map(this.props.data, function(name, keystroke) {
        return (<li><b>{keystroke}</b><br />{name}</li>);
      });
      return (<ul className="shortcut-list">{shortcuts}</ul>);
    }
  });

  var DashStats = React.createClass({
    statuses: {
      'pending': "Click anywhere and delete an `x` to start!",
      'running': "Go!",
      'done': "Great job!",
      'aborted': "Aborted."
    },
    render: function () {
      return (<div className="stats">
        <label>{this.props.dash.score}</label> / <label>{this.props.dash.goal}</label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>{this.props.dash.strokeCount} strokes</label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>{this.elapsedTime()}</label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label className="status">{this.statuses[this.props.dash.status]}</label>
        <label className="error"></label>
        <label className="success"></label>
      </div>);
    },
    elapsedTime: function () {
      var totalSeconds = this.props.dash.seconds;
      var minutes = parseInt(totalSeconds / 60)
      var seconds = (totalSeconds % 60);
      var formatted = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
      return formatted;
    }
  });

  var KeyboardDash = React.createClass({
    getInitialState: function() {
      return { dash: new Dash(0), keyMap: {} };
    },
    render: function () {
      return (<div>
        <LevelSelect onSelect={this.props.onLevelSelect} />
        <KeyMap data={this.state.keyMap} />
        <DashStats dash={this.state.dash} />
        <textarea class="editor" ref="editor"></textarea>
      </div>);
    }
  });


  // Time to React!
  window.ui = React.renderComponent(
    <KeyboardDash />,
    document.getElementById('dash-ui')
  );
  window.manager = new DashManager(ui);
  // There's gotta be a better way
  createTrainerEditor(manager, ui.refs.editor.getDOMNode());
  manager.setLevel(levels[0]);

})();
