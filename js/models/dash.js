(function () {

  window.Dash = function (goal) {
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
  };
})();
