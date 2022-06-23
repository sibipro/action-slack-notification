# action-slack-notification

Github action that sends a simple slack notification

## Usage

```
steps:
- uses: sibipro/action-slack-notification@v1
  with:
    channel: <slack channel>
    token: <slack token>
    messages: Deplyment failure for whosit service
    type: failure
```
