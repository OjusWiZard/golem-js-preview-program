# Golem JS Preview Program Feedback Form

## Introduction
Thank you for taking the time to complete this Golem JS Preview Program task! 
We appreciate your effort in helping us gather valuable feedback and suggestions on how to improve the Golem Network. 
Please fill out the following form to provide your feedback and estimated completion times for each task step.

## Task: #1 - Text2Speech

### Estimated completion time:
| Task Step                                                                                                    | Completion Time (in minutes) |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Convert the docker image to a GVMI image and publish it to receive an image hash                             | 200                          |
| Modify a `main.mjs` script that will execute the text-2-speech conversion, available under the `npm run tts` | 180                          |

### Feedback:
Please provide any feedback you have regarding each task step below:

#### Step 1: Convert the docker image to a GVMI image and publish it to receive an image hash

- While following the steps from [here](https://handbook.golem.network/requestor-tutorials/vm-runtime/convert-a-docker-image-into-a-golem-image#converting-the-image), I installed the latest version of `gvmkit-build` using `pip install gvmkit-build`. Then, while creating the Golem image using the command `gvmkit-build golem-example:latest`, I faced the following error:
```
Traceback (most recent call last):
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/docker/api/client.py", line 214, in _retrieve_server_version
    return self.version(api_version=False)["ApiVersion"]
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/docker/api/daemon.py", line 181, in version
    return self._result(self._get(url), json=True)
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/docker/utils/decorators.py", line 46, in inner
    return f(self, *args, **kwargs)
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/docker/api/client.py", line 237, in _get
    return self.get(url, **self._set_request_timeout(kwargs))
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/requests/sessions.py", line 600, in get
    return self.request("GET", url, **kwargs)
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/requests/sessions.py", line 587, in request
    resp = self.send(prep, **send_kwargs)
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/requests/sessions.py", line 701, in send
    r = adapter.send(request, **kwargs)
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/requests/adapters.py", line 486, in send
    resp = conn.urlopen(
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/urllib3/connectionpool.py", line 790, in urlopen
    response = self._make_request(
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/urllib3/connectionpool.py", line 496, in _make_request
    conn.request(
TypeError: HTTPConnection.request() got an unexpected keyword argument 'chunked'

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/bin/gvmkit-build", line 8, in <module>
    sys.exit(build())
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/gvmkit_build/build.py", line 115, in build
    client = DockerClient.from_env()
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/docker/client.py", line 96, in from_env
    return cls(
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/docker/client.py", line 45, in __init__
    self.api = APIClient(*args, **kwargs)
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/docker/api/client.py", line 197, in __init__
    self._version = self._retrieve_server_version()
  File "/home/ojuswi/Documents/repos/golem-js-preview-program/tasks/1-text-2-speech/venv/lib/python3.10/site-packages/docker/api/client.py", line 221, in _retrieve_server_version
    raise DockerException(
docker.errors.DockerException: Error while fetching server API version: HTTPConnection.request() got an unexpected keyword argument 'chunked'
```
Upon investigating [this issue from here](https://github.com/docker/docker-py/issues/3113), I was able to solve this problem by downgrading `requests` module using `pip install requests==2.28.2`.
Please **notify the gvmkit-build devs about this dependency issue** :)

-  There is also some issue with the default `Dockerfile` that is given in the task directory. This `Dockerfile` is using `alpine:3.14`, but apparently it is having some compactibility issues with `gvmkit-build`. Image built with this `Dockerfile` is giving `Running process failed, exit code: 2` error on running any command (or maybe I'm doing something wrong). I was able to solve this by usign `debian:stable-slim` instead. But, it's quite large *_*

#### Step 2: Modify a `main.mjs` script that will execute the text-2-speech conversion, available under the `npm run tts`

- It was easy to follow the docs in the starting. But, soon I realise that the docs given [here](https://handbook.golem.network/requestor-tutorials/task-processing-development/task-example-0-hello) are much different from the template code that is given in the task repository. Maybe they are outdated? Also, there isn't anymore example given for JS SDK. So, even a simple task as downloading the audio file took me hours to figure out, by reading the SDK code myself. Ideally, I would love to have a good reference section to include details about all these functions.

## General feedback:
Is there anything else you'd like to share about your experience completing this task or using the Golem Network in general? 

I got to know about Golem through this program only, and I really liked its idea. This got me reading more about its history and how it works.

### Suggestions for Improvement

- The task can explain a little more about what ways are required for input and output. Like the input should be through command line and output should be a file, or buffer stream.
- There is also an improvements I suggested above regarding Dockerfile.

Thank you for your feedback and for contributing to the Golem Network!
