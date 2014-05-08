(function () {

  var expandKeys = function (ctrls, alts) {
    var keystrokes = [];
    _.each(ctrls.split(''), function (ch) { keystrokes.push('Ctrl-'+ch); });
    _.each(alts.split(''), function (ch) { keystrokes.push('Alt-'+ch); });
    return _.pick(KeyboardDash.standardMap, keystrokes);
  };


  window.KeyboardDash = {};
  KeyboardDash.standardMap = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown", "Alt-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars"
  };

  KeyboardDash.levels = [
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
      map: KeyboardDash.standardMap
    },
    {
      id: "scattered",
      name: "Scattered",
      map: KeyboardDash.standardMap
    }
  ];

})();
