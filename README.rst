Instead of pushing commits to fix this repo, i'm leaving it up for historical reasons. It's utter crap. I should have split snappass-nodejs into snappass-nodejs-core. Then put all of the other jank in snappass-backend-sailsjs for example. Similar to how I did it with the golang port.

========
SnapPass-nodejs
========

.. image:: https://travis-ci.org/adarqui/snappass-nodejs.png


https://travis-ci.org/adarqui/snappass-nodejs


Found this nice little app on pinterest's github. Figured it would be a good candidate for porting to other langs for fun. Front end is not included yet. That will be a separate repo that ob may write. The frontend needs to be an SPA. It needs to be re-done because the backend apps won't support server side templating etc.

TODO:
- travis-ci
- cleanup the code

Most of the original README follows, with node.js specific modifications.


========
SnapPass
========

It's like SnapChat... for Passwords.

This is a webapp that lets you share passwords securely.

Let's say you have a password.  You want to give it to your coworker, Jane.
You could email it to her, but then it's in her email, which might be backed up,
and probably is in some storage device controlled by the NSA.

You could send it to her over chat, but chances are Jane logs all her messages
because she uses Google Talk, and Google Talk logs everything.

You could write it down, but you can't find a pen, and there's way too many
characters because your Security Person, Paul, is paranoid.

So we build SnapPass.  It's not that complicated, it does one thing.  If
Jane gets a link to the password and never looks at it, the password goes away.
If the NSA gets a hold of the link, and they look at the password... well they
have the password.  Also, Jane can't get the password, but now Jane knows that
not only is someone looking in her email, they are clicking on links.

Anyway, this took us very little time to write, but we figure we'd save you the
trouble of writing it yourself, because maybe you are busy and have other things
to do.  Enjoy.

Requirements
------------

* Redis.
* Node.js.

Installation
------------

::

    $ git clone https://github.com/adarqui/snappass-nodejs
    $ cd ./snappass-nodejs
    $ ./bin/snappass
    debug: true
    redis: 
        host: 127.0.0.1
        port: 6379
        db:   0
        auth: 
    web: 
        port:    5000
        static:  ./snappass-static
        logging: false

    .. or you can specify the config
    $ ./bin/snappass /path/to/config.js


Backend Routes
--------------

::

    $ ./bin/post_password.sh
    key: 95775568-f08f-4f37-96ad-4db8982f66ed
    pass #1: 22880
    pass #2: 
    

Configuration
-------------

TODO.

For SSL use haproxy etc.
