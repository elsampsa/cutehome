# OpenSource Projects

*..and their history*

## Valkka

After leaving academia, I got involved in a startup-ish company called "Dasys".

My task was to write a pretty ambitious video-streaming application using IP (aka surveillance) cameras:
a general purpose desktop program for recording several IP cameras in-sync for education applications: i.e.
nurses practicing reanimation / IR, while an operator can see and record the live stream, add live comments, etc.

Different videos had to be synced to less than hundred of milliseconds (also over wifi!), separate microphones with mixing
capabilities had to be added, streams from the cameras had to be shared among several processes (live view, simultaneous recording, etc.),
videos could be exported and viewed later on with the students, etc. the specs just kept on growing..!  Oh'those where the times.

I started from scratch, without any prior knowledge of IP cameras nor video streaming.
My choice for this was PyQt and libVLC.  However, I quickly realized that libVLC was not flexible enough for something like this.
In fact, there was no available library (and there still isn't!) that would've cut the mustard for this kind of applications.
Sure, you have libav and friends (ffmpeg), but its a very low-level tool and doesn't touch issues such as multiprocessing/threading, frame
queueing, synchronization, stream sharing, etc.

So I had to write a library of my own for all that: please check out [libValkka](valkka.org).

What happened to that desktop streaming program?  We actually got it done!  It was installed in Finland, Germany, France and even in Dubai..!

And what happened to libValkka?

The status of libValkka at the moment is, that it is a bit of an abandonware.  I am writing a similar library *from scratch* 
(this must be the third time), this time with all the lessons learned and finally with the aid of my AI buddies.

## Multiprocessing



## AsyncIO

## CuteFront

Every now and then 