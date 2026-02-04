// Apps Script: doPost endpoint to record response in Google Sheets and send an email notification.
// Use this script in a script bound to your Google Sheet (Extensions → Apps Script) for easiest setup.
// If you prefer a standalone script, set SPREADSHEET_ID to the target spreadsheet ID.

// Optional: if empty, will use the active spreadsheet when script is bound to the sheet
var SPREADSHEET_ID = ""; // <--- leave empty if you paste this into the sheet's Apps Script editor
var SHEET_NAME = "Feuille 1"; // change if needed
var NOTIFY_EMAIL = "mardocheelankoande@gmail.com"; // your email

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ok: true, message: 'Apps Script is running'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var params = e.parameter || {};
    // Debug logs: inspect incoming parameters and raw post body
    try {
      Logger.log('doPost e.parameter (initial): ' + JSON.stringify(params));
      Logger.log('doPost e.postData.type: ' + (e.postData ? e.postData.type : ''));
      Logger.log('doPost e.postData.contents: ' + (e.postData ? e.postData.contents : ''));
    } catch (logErr) {
      // ignore logging errors
    }
    // Fallback: si 'message' n'est pas présent, tenter de parser e.postData.contents
    if ((!params.message || params.message === '') && e.postData && e.postData.contents) {
      try {
        var bodyStr = e.postData.contents || '';
        // If the body looks like JSON, parse it
        var trimmed = bodyStr.trim();
        if (trimmed.indexOf('{') === 0) {
          try {
            var json = JSON.parse(bodyStr);
            for (var key in json) {
              if (json.hasOwnProperty(key) && !(key in params)) {
                params[key] = json[key];
              }
            }
          } catch (jsonErr) {
            Logger.log('Erreur parsing JSON postData: ' + jsonErr);
          }
        } else {
          var parts = bodyStr.split('&');
          for (var i = 0; i < parts.length; i++) {
            var kv = parts[i].split('=');
            if (kv.length >= 1) {
              var k = decodeURIComponent(kv[0].replace(/\+/g, ' '));
              var v = kv.length > 1 ? decodeURIComponent(kv.slice(1).join('=').replace(/\+/g, ' ')) : '';
              if (k && !(k in params)) {
                params[k] = v;
              }
            }
          }
        }
      } catch (parseErr) {
        Logger.log('Erreur parsing postData: ' + parseErr);
      }
    }
    var name = params.name || 'inconnu';
    var response = params.response || '';
    var message = params.message || '';
    var ts = new Date();

    var ss = null;
    if (SPREADSHEET_ID && SPREADSHEET_ID.length > 5) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    sheet.appendRow([name, response, message, ts]);

    // If message is empty, include raw postData contents for debugging/fallback
    var rawBody = e.postData && e.postData.contents ? e.postData.contents : '';
    var effectiveMessage = message && message.length > 0 ? message : (rawBody || '(aucun message)');

    // Send email notification
    var subject = 'Nouvelle réponse de ' + name + ' : ' + response;
    var body = 'La personne ' + name + ' a répondu : ' + response + '\n\nMessage: ' + effectiveMessage + '\n\nHeure: ' + ts + '\n\n(raw post body) ' + rawBody;
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    var output = {success: true};
    return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errorOutput = {success: false, error: err.toString()};
    return ContentService.createTextOutput(JSON.stringify(errorOutput)).setMimeType(ContentService.MimeType.JSON);
  }
}