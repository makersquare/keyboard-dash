/** @jsx React.DOM **/
//
// We can break this into multiple if it gets too big
//
(function () {

  window.LevelSelect = React.createClass({
    getInitialState: function () {
      return { levels: KeyboardDash.levels };
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

  window.KeyMap = React.createClass({
    render: function () {
      var shortcuts = _.map(this.props.data, function(name, keystroke) {
        return (<li><b>{keystroke}</b><br />{name}</li>);
      });
      return (<ul className="shortcut-list">{shortcuts}</ul>);
    }
  });

  window.DashStats = React.createClass({
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

  window.KeyboardDashView = React.createClass({
    getInitialState: function() {
      return { dash: new Dash(0), keyMap: {} };
    },
    render: function () {
      return (<div>
        <LevelSelect onSelect={this.props.onLevelSelect} />
        <KeyMap data={this.state.keyMap} />
        <DashStats dash={this.state.dash} />
        <textarea ref="editor"></textarea>
      </div>);
    }
  });

})();
