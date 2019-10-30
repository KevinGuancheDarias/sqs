# SQS

## v1.1.0
* __Feature:__ Add JSON messages support to Java client
* __Fix:__ Server crashes when the socket is closed by force, Ex: Reset peer

## v1.0.1
* __Fix:__ Not able to use the project, as Maven doesn't allow slashes in artifactId property, while jitpack does allow
* __Fix:__ Package.json not properly generating the runnable command