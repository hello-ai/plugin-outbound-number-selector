const Twilio = require('twilio');
exports.handler = async function (context, event, callback) {
  // Get Twilio Client
  const client = context.getTwilioClient();

  // CORS settings
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const numberList = await client.incomingPhoneNumbers.list();
    numberList.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));
    const numbers = numberList
      .filter((number) => (/flex/i).test(number.friendlyName))
      .map((number) => {
        if (number.capabilities.voice) {
          // It can use for voice
          return {
            friendlyName: number.friendlyName,
            phoneNumber: number.phoneNumber,
          };
        }
      });
    if (numbers.length === 0) {
      throw new Error('No number.');
    }
    const res = {
      numberList: numbers,
    };
    response.appendHeader('Content-Type', 'application/json');
    response.setBody(res);
    callback(null, response);
  } catch (err) {
    response.appendHeader('Content-Type', 'plain/text');
    response.setBody(err);
    callback(null, response);
  }
};
