import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import {convert, getTOTP} from "simple-totp";

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp();

export const beforeSignIn = functions.auth.user().beforeSignIn(async (user, context) => {
  const customClaims = user.customClaims;

  if (!customClaims?.totp) {
    return;
  }

  const token = crypto.randomBytes(256).toString('hex');

  // If firestore is used, it must be controlled by a firestore rule so that this collection cannot be accessed at all.
  await admin.firestore().doc(`onetimeToken/${token}`).set({
    uid: user.uid,
    signInTime: (new Date()).getTime(),
  });

  throw new functions.auth.HttpsError(
      "cancelled", "need-totp-auth", {
        token,
      });
});

export const createCustomClaim = functions.https.onRequest(async (req, res) => {
  const now = admin.firestore.Timestamp.now().toMillis();
  /**
   * 🙅‍♂️️️️THIS IS EXAMPLE CODE!️🙅‍♂️
   * Always validate input values!
   */
  const doc = admin.firestore().doc(`onetimeToken/${req.body.token}`);
  const snap = await doc.get();
  const user = await admin.auth().getUser(snap.get('uid'));
  const signInTime = snap.get('signInTime');
  const isAlreadyUsedToken = (Date.parse(user.metadata.lastSignInTime)) > signInTime;
  const isTimeout = (signInTime < (now - (5 * 60 * 1000)));

  if (isAlreadyUsedToken || isTimeout) {
    res.status(400).send('Token timeout');
    return;
  }

  /**
   * 🙅‍♂️️️️THIS IS EXAMPLE CODE!️🙅‍♂️
   * DO NOT bring this into a production environment as is.
   * The firebase uid is a value that is also included in the JWT.
   * This means that many people are likely to see that information.
   * Please use a unique TOTP id, etc. assigned to the user appropriately.
   */
  const totpUserId = convert('ascii', 'base32', user.uid);
  const {totp} = getTOTP(totpUserId, 'base32', now);

  if (totp !== req.body.totp) {
    res.status(400).send('invalid');
    return;
  }

  const customToken = await admin.auth().createCustomToken(user.uid);

  // Considering that the user fails to receive the response, it would be good to remove it using firestore TTL.
  await doc.delete();

  res.send({customToken});
});

