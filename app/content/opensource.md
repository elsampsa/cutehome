# My OpenSource Projects

*..and their history*

## Valkka 📹

After leaving academia, I got involved in a startup-ish company called "Dasys".

My task was to write a pretty ambitious video-streaming application using IP (aka surveillance) cameras:
a general purpose desktop program for recording several IP cameras in-sync for education applications, i.e.
nurses practicing reanimation / IR, while an operator can see and record the live stream, add live comments, etc.

Different videos had to be synced to less than hundred of milliseconds (also over wifi!), separate microphones with mixing
capabilities had to be added, streams from the cameras had to be shared among several processes (live view, simultaneous recording, etc.),
videos could be exported and viewed later on with the students, etc. - the specs just kept on growing. 💥

I started from scratch, without any prior knowledge of IP cameras or video streaming.
My choice for this was PyQt and libVLC.  However, I quickly realized that libVLC was not flexible enough for something like this.
In fact, there was no available library (and there still isn't!) that would've cut the mustard for this kind of applications.
Sure, you have libav and friends (ffmpeg), but it's a very low-level tool and doesn't touch issues such as multiprocessing/threading, frame
queueing, synchronization, stream sharing, etc.

So I had to write a library of my own for all that - please take a look at [libValkka](http://www.valkka.org).

What happened to that desktop streaming program?  We actually got it done!  It was installed in Finland, Germany, France and even in Dubai 🚀!

The status of libValkka at the moment is, that it is a bit of an abandonware.  I am writing a similar library *from scratch* 
(this must be the third time..!), this time with all the lessons learned and with the aid of my AI buddies.

## Multiprocessing 🔀

Video applications that need to share streams across processes, for live viewing, recording and ML/AI analysis, become heavily concurrent.
In Python, one needs to use multi*processing* instead of threading and the former has several pitfalls and inconveniences.  However, they 
can be overcome with a systematic approach.

Please take a look at my [blog post](https://medium.com/@sampsa.riikonen/doing-python-multiprocessing-the-right-way-a54c1880e300) and then at 
[valkka-multiprocess library](https://elsampsa.github.io/valkka-multiprocess/_build/html/index.html).

## TaskThread 🧵

We're still talking about concurrency - but this time using asyncio!  At one stage of my career, I had to write a cloud video streaming system
for up to thousand IP cameras.  The weapon of choice was python asyncio.

I came up with a novel idea for organizing asyncio coroutines into re-scheduling tasks, giving a threading-like API.

Well.. to understand what this means, you need to be knee-deep into python asyncio.  And then take a look at [TaskThread](https://elsampsa.github.io/task_thread/_build/html/index.html).

## CuteFront 🎨

Every now and then I need to touch upon the theme of *web*apps.

My favorite backend framework is FastAPI (python), and my favorite frontend framework .. none of them.

Modern JS frameworks are bloated monsters drawing increased criticism from developers.  I was so disgusted by them that I wrote
my own framework, inspired by the Qt desktop UI framework.  More than a framework it is actually a way of organizing your frontend JS
into clearly separated and testable components.

Please take a look at it [here](https://elsampsa.github.io/cutefront/_build/html/index.html).
