(function () {
  window.DashPresenter = function (ui) {
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
      this.ui.setState({ dash: this.currentDash });
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


  KeyboardDash.createTrainerEditor = function (manager, textarea) {
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
})();
