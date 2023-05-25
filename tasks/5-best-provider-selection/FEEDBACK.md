# Golem JS Preview Program Feedback Form

## Introduction
Thank you for taking the time to complete this Golem JS Preview Program task! 
We appreciate your effort in helping us gather valuable feedback and suggestions on how to improve the Golem Network. 
Please fill out the following form to provide your feedback and estimated completion times for each task step.

## Task: #5 - Best Provider Selection

### Estimated completion time:
| Task Step                     | Completion Time (in minutes) |
| ----------------------------- | ---------------------------- |
| Create a `harvest.js` script  | 540                          |
| Create an `execute.js` script | 60                           |

### Feedback:
Please provide any feedback you have regarding each task step below:

#### Step 1: Create a `harvest.js` script

The biggest challenge was to work with the core API. I was able to come up with a script that should handle proposals and offers with the providers, while refering to [this documentation](https://docs.golem.network/creators/javascript/mid-level/examples/hello/#requestor-agent-code). But, it was throwing some errors related to countering proposals. I couldn't find a way to fix this issue, but it seemed ignorable.

In the docs, I couldn't find any way to get the provider ID, and their benchmark data like amount of time taken and cost. Most of the classes that I visited in the [API reference section](https://docs.golem.network/creators/javascript/docs/#modules) shows `404 errors` like [this](https://docs.golem.network/creators/javascript/new_yajsapi/classes/agreement_agreement.Agreement.md). So, I had to manually look into the JS API code and find my answers. I was able to find the provider ID in Agreement class. Also, I found [this example](https://github.com/golemfactory/yajsapi/blob/39690260391eefc22d6f148e2c5252a112460af0/examples/mid-level-api/hello.ts#L40), which was helpful.

#### Step 2: Create an `execute.js` script

Finally, I created `execute.js` pretty quickly because now I know the whole process. I set a timeout of `OFFER_TIMEOUT` milliseconds to wait for the offer from top providers. Also, added some time and cost weights as I felt suitable, and had to increase the timeout for the task to complete.

## General feedback:
Is there anything else you'd like to share about your experience 
completing this task or using the Golem Network in general? 

The task was quite challenging for me because it was my second time working on Golem after task 1. I faced the following obstacles:
- Uploading and Downloading in Core API (very difficult)
- Finding provider ID (easy)
- Getting price and handling payments (difficult)
- Measuring time (very easy)

### Suggestions for Improvement

I majorly got stuck on how to upload and download the files. I asked on discord about this in `#Tick-0019`. Anyway, for completing the task, I did it without uploading and downloading.

I think, two things will really make this whole process 40-50 percent faster:
- Using typescript, that will save devs from many unexpected errors. Please allow TS in the task description, maybe optional.
- A Typedoc documentation. Typedoc docs are very helpful for any new dev. It can help you to explore the whole SDK with ease. 

Thank you for your feedback and for contributing to the Golem Network!
