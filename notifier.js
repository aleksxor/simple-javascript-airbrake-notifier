(function(window, location, undef) {
  var root   = location.protocol + "//" + location.host,
      apiKey = window.ConveadClient.AIRBRAKE_API_KEY,
      env    = window.ConveadClient.AIRBRAKE_ENVIRONMENT || "production",
      url    = window.ConveadClient.AIRBRAKE_URL || "http://airbrake.io";

  function xmlNode(nodeName, attributes, nodeValue) {
    attributes = attributes ? " " + attributes : "";
    return "<" + nodeName + attributes +  ">" + nodeValue + "</" + nodeName + ">";
  }

  function escapeText(text) {
    return (text + "").replace(/[&<>'"]/g, function(match) {
      return "&#" + match.charCodeAt() + ";";
    });
  }

  function getXML(message, file, line) {
    file && (file = file.replace(root, "[PROJECT ROOT]"));
    return '<?xml version="1.0" encoding="UTF-8"?>' +
            xmlNode("notice", 'version="2.0"',
              xmlNode("api-key",  undef, apiKey) +
              xmlNode("notifier", undef,
                xmlNode("name",     undef, "Airbrake Notifier")   +
                xmlNode("version",  undef, "1.2.4")                 +
                xmlNode("url",      undef, url)
              ) +
              xmlNode("error",    undef,
                xmlNode("class",      undef, "Error")    +
                xmlNode("message",    undef, escapeText(message))    +
                (file && line && xmlNode("backtrace",  undef, '<line method="" file="' + escapeText(file) + '" number="' + escapeText(line) + '" />'))
              ) +
              xmlNode("request",  undef,
                xmlNode("component",  undef, "frontend")    +
                xmlNode("action",     undef, "javascript")  +
                xmlNode("url",        undef, location.href) +
                xmlNode("cgi-data",   undef,
                  xmlNode("var", 'key="HTTP_USER_AGENT"', navigator.userAgent) +
                  xmlNode("var", 'key="HTTP_REFERER"',    document.referrer)
                )
              ) +
              xmlNode("server-environment", undef,
                xmlNode("project-root",     undef, root) +
                xmlNode("environment-name", undef, env)
              )
            );
  }

  var prev_err_handler = window.onerror;

  window.ConveadClient || (window.ConveadClient = {});
  window.ConveadClient.error_notify = function(message, file, line) {
    if (apiKey) {
      new Image().src = url + "/notifier_api/v2/notices?data=" + encodeURIComponent(getXML(message, file, line));
    }
    if (typeof prev_err_handler == "function") {
      prev_err_handler(arguments);
    }
  };
})(this, location);
