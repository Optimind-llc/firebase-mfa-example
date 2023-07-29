# Firebase TOTP Example

This repository uses Firebase Authentication for two-factor authentication with TOTP.
The MFA feature of Firebase Authentication is not used.

Currently, two-factor authentication with TOTP is already in [preview on the Identity Platform](https://cloud.google.com/identity-platform/docs/admin/enabling-totp-mfa?hl=ja), and we recommend it if possible.

However, we hope this will be of some help to you, as the same procedure as in this Example may be used as a means of two-factor authentication other than TOTP.

## Setup Example

The operating environment is as follows.

* Node.js 18

```bash
$ npm i
$ npm start
```

The firebase emulator will be launched, and you can access the following URL in a browser to check the operation.

http://localhost:3000

The two accounts provided are as follows.

|email|password|detail|
|:--|:--|:--|
|totp@example.com|password|This is an account that requires authentication by totp. You can register for the application by reading the attached QR code.|
|example@example.com|password|A user who does not require two-factor authentication by TOTP.|

![otpauth://totp/FirebaseTOTPExample:totp@example.com?secret=JV3EMUTFGV2DC5KRKFJFSV2FKJIWC6THNBEVG2DQPFLUE===&issuer=FirebaseTOTPExample](./docs/images/totp-auth.png)

## Approach

The approach implemented in this repository, in a nutshell, is to use the Blocking function error messages to control the ability to authenticate with authentication and other factors.

Firebase Authentication's beforeSignIn feature works when authentication is possible.
At that time, a token is issued for authentication.
Then, another API is prepared, which takes the token issued from beforeSignIn and the TOTP value and issues a custom token.
The client can then use that custom token to login.
