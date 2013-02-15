# Compile freedom.js using the closure service.

SOURCES = src/util.js src/hub.js src/apis.js src/app*.js src/channel.js src/proxy.js src/freedom.js interface/*.js

all: freedom.js

freedom.js: freedom.compiled.js src/preamble.js src/postamble.js
	cat src/preamble.js freedom.compiled.js src/postamble.js > freedom.js

freedom.compiled.js: $(SOURCES)
	python tools/build.py $(MAKEFLAGS) -o $@ $(SOURCES)
