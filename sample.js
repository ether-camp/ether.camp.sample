define(function(require, exports, module) {
  main.consumes = ['Panel', 'ui', 'settings', 'ethergit.libs', 'ethergit.sandbox'];
  main.provides = ['ether.camp.sample'];
  return main;

  function main(options, imports, register) {
    var Panel = imports.Panel;
    var ui = imports.ui;
    var settings = imports.settings;
    var libs = imports['ethergit.libs'];
    var sandbox = imports['ethergit.sandbox'];
    
    var $ = libs.jquery();
    var _ = libs.lodash();
    
    var panel = new Panel('Ether.camp', main.consumes, {
      index: 300,
      width: 400,
      caption: 'Sample',
      minWidth: 300,
      where: 'right'
    });
    
    panel.on('load', function() {
      ui.insertCss(require('text!./sample.css'), false, panel);
      sandbox.web3._extend({
        property: 'sample',
        methods: [
          new sandbox.web3._extend.Method({
            name: 'doSome',
            call: 'sample_doSome',
            params: 0
          })
        ]
      })
    });
    
    panel.on('draw', function(e) {
      var $root = $(e.html);
      $root.append(require('text!./sample.html'));
      installTheme($root.find('[data-name=container]'));
      
      var $sandboxId = $root.find('[data-name=sandboxId]');
      updateSandboxId();
      sandbox.on('select', updateSandboxId, panel);
      
      var $sendTx = $root.find('[data-name=sendTx]');
      updateBtn();
      sandbox.on('select', updateBtn, panel);
      $sendTx.click(function() {
        sandbox.web3.sample.doSome(function(err) {
          if (err) console.error(err);
        });
      });
      
      var $logs = $root.find('[data-name=logs]');
      watchLogs();
      sandbox.on('select', watchLogs, panel);
      
      function installTheme($el) {
        $el.addClass(settings.get('user/general/@skin'));
        settings.on('user/general/@skin', function(newTheme, oldTheme) {
          $el.removeClass(oldTheme).addClass(newTheme);
        }, panel);
      }
      function updateSandboxId() {
        $sandboxId.text(sandbox.getId() ? sandbox.getId() : 'Not selected');
      }
      function watchLogs() {
        $logs.empty();
        if (sandbox.getId()) {
          var filter = sandbox.web3.eth.filter({
            fromBlock: 0,
            address: '0x054c0d72de17a9ae859fd0a4d99cfd1b02960081'
          });
          filter.watch(function(err, entry) {
            if (err) return console.error(err);
            $logs.append('<li>' + hexToStr(entry.data) + '</li>');
          });
        }
      }
      function hexToStr(hex) {
        return String.fromCharCode.apply(null, toArray(hex.substr(2)));

        function toArray(str) {
          if (str.length % 2 !== 0)
            console.error('Wrong hex str: ' + str);
          
          var arr = [];
          for (var i = 0; i < str.length; i += 2) {
            var code = parseInt(str.charAt(i) + str.charAt(i + 1), 16);
            // Ignore non-printable characters
            if (code > 9) arr.push(code);
          }
          
          return arr;
        }
      }
      function updateBtn() {
        if (!sandbox.getId()) $sendTx.attr('disabled', 'disabled');
        else $sendTx.removeAttr('disabled');
      }
    });

    panel.freezePublicAPI({});
    register(null, { 'ether.camp.sample': panel });
  }
});