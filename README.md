# Firebase TOTP Example

This repository uses Firebase Authentication for two-factor authentication with TOTP.
The MFA feature of Firebase Authentication is not used.

Currently, two-factor authentication with TOTP is already in [preview on the Identity Platform](https://cloud.google.com/identity-platform/docs/admin/enabling-totp-mfa?hl=ja), and we recommend it if possible.

However, we hope this will be of some help to you, as the same procedure as in this Example may be used as a means of two-factor authentication other than TOTP.

## Setup Example

```bash
$ npm i
$ npm run start
```

The firebase emulator will be launched, and you can access the following URL in a browser to check the operation.

http://localhost:3000

The two accounts provided are as follows.

|email|password|detail|
|:--|:--|:--|
|totp@example.com|password|This is an account that requires authentication by totp. You can register for the application by reading the attached QR code.|
|example@example.com|password|A user who does not require two-factor authentication by TOTP.|

![otpauth://totp/FirebaseTOTPExample:totp@example.com?secret=JV3EMUTFGV2DC5KRKFJFSV2FKJIWC6THNBEVG2DQPFLUE===&issuer=FirebaseTOTPExample](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAM8AAADPAQMAAABoTxccAAAABlBMVEX///8AAABVwtN+AAAD+ElEQVRYhe2YPa6rMBCFB7lwBxuw5G2485ZgAwE2AFty521Y8gagc4GYd4bc+4pXDu1D0VWSL4ov83PmTIj+X++vgXltfuXyIRrDNTANuTIXNerJrOyGxHvCX3MEs+a60AsU65pwouGE48xNdee6t1doobpRvYPZW+Xkub1FGzGzOTNzptG6ic0rRAZnLaHMufSWj0AUzN9AKRDytYX6z+NvKhVIaL6m7IjKkHBQmX/fV6KIHJVP4JX5Dv7Ag3h7gQYuc5Iq5YzU05Tw0t8vEAXEtuL9k81hGfW5NnMmPeoQCny5LWNwY7wmprnh6BcooSD9iuLMRLbu2fXRjbaoEQX3scgUYitZG5LrmMZIajSkerark/p0czJ3pDmhC4oa9fbqcPv4fqKpXQhIH5EvPRoyWsYvkRd7zVyRsiXQzKRGfaRPhArhUEZFDclvFmHRoy5DJcwRIbz1xmeygSidTx/pUE+ug+RG/OcoJF4i8sVn0qMu+43MFkTZbosguxHBsS9Qw1mQNVQmnyzjBujblTpEohVuatCfuljq2E3JjeEFsqUnVBE0HBKE9kFMrp92UCEUJDfcvj8zQd9uvMxljEWNunYNDW1YJRQYN4S7oD6QGvWY0Y335nppHJyFUPxWrwoRujKZPZdBxLwgznjn8xUiFUJBckJFoZUwYa85S9fzt4lUSMYW+x3VHqBFlwxZCB3rETyAhAJNlEXQpoSs1e0nlRqEkdrHgmZ/jriI/BaeUatFkHEML1idFS6FoW8yYRFnNeqym9lRRJxhokR+IeZreoGSWSKGV3mGl9mTWb83pUVDQg/6RQY3dNJvEVKJDtUjetpwgpsSA3lBzO8o40yNkCyKiAaCgHwZGQ0QpURqhE5cmxsQ1ezFqOB28Jz1qMvo9HpEkaA7FhGQXA96gRo0XKzU45ZlcnWNpu9oUyEIL/J1UIVp3CwKQBR4anoklYkOQrIw+uEHAvYjz0mPxKVkzC9miLD4UohS3b+pVCF4USQdvrFLmNf4AIzo9VOiKoRgYmaxWDIEFgZDuvKweiSTOonFJes+hFpl2V+iHsF8YvzNrXRsbiuFisXtZD1CEGBRtnB9MCAsllbYvLp+i02F4GmnJDvLgLEom5HrpIn06Ll9mQh7Ej+GBp9lPSc1GhAHNCZ5aR9+dnOUk32BWPbxFQos+68/7EUBT/ToCYjMRKwtGItkeZNBVtQIXmLPYgBu0V54KqglxoQePb9v8IGCT6XHfhRl0xzSCyS/b/hDihxqCVPhZQWOr5CUKKodpZ5hV2QR3uglQj9CMTANReh2xmJIekSQR0cW4mYePw9hF3eqRsjXU0uoKymnjv0t8lvU6P/19voDIaeG/0FEob4AAAAASUVORK5CYII=)

## Approach

The approach implemented in this repository, in a nutshell, is to use the Blocking function error messages to control the ability to authenticate with authentication and other factors.

Firebase Authentication's beforeSignIn feature works when authentication is possible.
At that time, a token is issued for authentication.
Then, another API is prepared, which takes the token issued from beforeSignIn and the TOTP value and issues a custom token.
The client can then use that custom token to login.
