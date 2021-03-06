/*******************************************     Google Sheets          ************************************************/
//GOOGLE SHEET: https://docs.google.com/spreadsheets/d/1l5BsM8-ejfncXU9uLz8kn6DD4YLTGT3_pyra4LJZMto/edit#gid=0

const {google}        = require('googleapis');
fs              = require('fs');
readline        = require('readline');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), addTranscript);
  authorize(JSON.parse(content), getTranscript);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Gets transcripts
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function getTranscript(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1l5BsM8-ejfncXU9uLz8kn6DD4YLTGT3_pyra4LJZMto',
    range: 'A2:E1000',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      //
      console.log(rows);
      rows.map((row) => {
        //row[0] = Name
        //row[x] = language in col x
        console.log(`${row[0]}: ${row[2]}`);
      });
    } else {
      console.log('No data found.');
    }
  });
};


/**
 * Puts transcripts
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function addTranscript(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.update({
    spreadsheetId: '1l5BsM8-ejfncXU9uLz8kn6DD4YLTGT3_pyra4LJZMto',
    //the cell at which you want to start adding
    range: 'A3',
    valueInputOption: 'USER_ENTERED',
    resource: {
      //send values as a 2d array [[row1col1, row1col2], [row2col1, row2col2]]
      "values": [
        ['tony', 'korean', 'spanish', 'chinese', 'arabic'],
        ['haard', 'k', 's', 'c', 'a']
      ]
    },
    auth: auth
  }, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }

    // TODO: Change code below to process the `response` object:
    console.log(JSON.stringify(res, null, 2));
  });
};