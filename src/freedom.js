/**
 * @module freedom
 */

/**
 * External freedom Setup.  global.freedom is set to the value returned by
 * setup (see preamble.js and postamble.js for that mechanism).  As a result,
 * this is the primary entry function for the freedom library.
 * @for util
 * @method setup
 * @static
 */
setup = function (global, freedom_src, config) {
  var def,
      hub = new fdom.Hub(),
      site_cfg = {
        'debug': true,
        'stayLocal': false,
        'portType': 'Worker'
      },
      manager = new fdom.port.Manager(hub);
  fdom.debug = new fdom.port.Debug();
  
  if (isAppContext()) {
    site_cfg.global = global;
    site_cfg.src = freedom_src;
    def = new fdom.port[site_cfg.portType]();
  } else {
    advertise();
    
    // Configure against data-manifest.
    if (typeof document !== 'undefined') {
      eachReverse(scripts(), function (script) {
        var manifest = script.getAttribute('data-manifest');
        var source = script.src;
        if (manifest) {
          site_cfg.source = source;
          site_cfg.manifest = manifest;
          if (script.textContent.trim().length) {
            try {
              mixin(site_cfg, JSON.parse(script.innerText), true);
            } catch (e) {
              fdom.debug.warn("Failed to parse configuration: " + e);
            }
          }
          return true;
        }
      });
    }
    //Try to talk to local FreeDOM Manager
    if (!site_cfg['stayLocal']) {
      fdom.ManagerLink.get().connect();
    }

    site_cfg.global = global;
    site_cfg.src = freedom_src;
    if(config) {
      mixin(site_cfg, config, true);
    }
    def = new fdom.port.App(site_cfg.manifest);
  }
  hub.emit('config', site_cfg);

  manager.setup(def);

  var external = new fdom.port.Proxy();
  manager.setup(external);
  manager.createLink(external, 'default', def);

  manager.setup(fdom.debug);
  // Enable console.log from worker contexts.
  if (typeof global.console === 'undefined' && site_cfg.debug) {
    global.console = fdom.debug;
  }
  
  return external.getInterface();
};

