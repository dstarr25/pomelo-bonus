# Pomelo Bonus!

For a bonus add-on to the credit card payment coding assessment, I created a backend api server with Bun.js (download [here](https://bun.sh/)) that allows you to send http requests to make the six different kinds of changes to your credit account as they were in the coding assessment. Bun.js is an up and coming JavaScript runtime/bundler known for its insane speed when compared to other JavaScript runtimes. I used it in this bonus to learn more about its API server functionalities.

[Here](https://github.com/dstarr25/pomelo-bonus/blob/master/pomelo-bonus-demo.mp4) is a link to a demo video of some requests to the backend and their responses, dealing with many different credit card transactions and payments.

If there are any questions, let me know at [devonstarr123@gmail.com](mailto:devonstarr123@gmail.com). Enjoy!

To install dependencies:

```bash
bun install
```

To run locally:

```bash
bun run index.ts
```

To view the current account info, make a GET request to `localhost:3000`.

And to make an account action, make a POST request to `localhost:3000` with a request body like the following:

```json
{
    "eventType": "PAYMENT_POSTED",
    "txnId": "t0",
    "amount": -180
}
```
- `eventType` is the type of action you are making on your account. Can be one of: `TXN_AUTHED`, `TXN_AUTH_CLEARED`, `TXN_SETTLED`, `PAYMENT_INITIATED`, `PAYMENT_CANCELED`, `PAYMENT_POSTED`
- `txnId` is the id of the transaction or payment. different payments/transactions should have different `txnId`s
- `amount` is the amount of the transaction or payment. this field is only used for actions with `eventType`: `TXN_AUTHED`, `TXN_SETTLED`, or `PAYMENT_INITIATED`
