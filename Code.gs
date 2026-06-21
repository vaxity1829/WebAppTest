/**
 * Faculty Room — Apps Script backend
 * Paste this entire file into Extensions > Apps Script on a Google Sheet,
 * then deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * Copy the resulting URL into database/config.js as SHEETS_API_URL.
 */

var SHEET_TEACHERS = 'Teachers';
var SHEET_NOTES = 'Notes';
var SHEET_ANNOUNCEMENTS = 'Announcements';
var TEACHER_HEADERS = ['id', 'name', 'subject', 'room', 'theme', 'tagline', 'quote', 'bio', 'officeHours', 'since', 'factLabel', 'factValue', 'initials', 'ownerEmail', 'createdAt'];
var NOTE_HEADERS = ['id', 'teacherId', 'title', 'body', 'x', 'y', 'createdAt'];
// Edit announcements directly in this sheet tab — no code changes needed.
// active: TRUE to show it, FALSE (or blank) to hide it without deleting the row.
// order: lower numbers show first. id: anything unique, e.g. a1, a2.
var ANNOUNCEMENT_HEADERS = ['id', 'message', 'active', 'order'];

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function sheetToObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    if (!values[i][0]) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j];
    out.push(obj);
  }
  return out;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var teacherSheet = getSheet_(SHEET_TEACHERS, TEACHER_HEADERS);
  var noteSheet = getSheet_(SHEET_NOTES, NOTE_HEADERS);
  var announceSheet = getSheet_(SHEET_ANNOUNCEMENTS, ANNOUNCEMENT_HEADERS);
  var teachers = sheetToObjects_(teacherSheet).map(function (t) {
    try { t.bio = t.bio ? JSON.parse(t.bio) : []; } catch (err) { t.bio = []; }
    return t;
  });
  var notes = sheetToObjects_(noteSheet);
  var announcements = sheetToObjects_(announceSheet)
    .filter(function (a) { return a.active === true || String(a.active).toUpperCase() === 'TRUE'; })
    .sort(function (a, b) { return (Number(a.order) || 0) - (Number(b.order) || 0); });
  return jsonOutput_({ teachers: teachers, notes: notes, announcements: announcements });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput_({ error: 'Bad request body' });
  }
  var action = body.action;
  try {
    if (action === 'addTeacher') return addTeacher_(body);
    if (action === 'addNote') return addNote_(body);
    if (action === 'updateNote') return updateNote_(body);
    if (action === 'deleteNote') return deleteNote_(body);
    return jsonOutput_({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOutput_({ error: err.message });
  }
}

// Verifies a Google ID token by asking Google directly. Returns the
// decoded payload (with .email) if valid, or null if not.
function verifyGoogleToken_(idToken) {
  if (!idToken) return null;
  var res = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;
  var data = JSON.parse(res.getContentText());
  return data.email ? data : null;
}

function addTeacher_(body) {
  var payload = verifyGoogleToken_(body.idToken);
  if (!payload) return jsonOutput_({ error: 'Sign-in required' });
  var t = body.teacher || {};
  var sheet = getSheet_(SHEET_TEACHERS, TEACHER_HEADERS);
  var id = 't-' + new Date().getTime();
  sheet.appendRow([
    id, t.name || '', t.subject || '', t.room || '', t.theme || 'literature',
    t.tagline || '', t.quote || '', JSON.stringify(t.bio || []),
    t.officeHours || '', t.since || '', t.factLabel || '', t.factValue || '',
    t.initials || '', payload.email, new Date().toISOString(),
  ]);
  return jsonOutput_({ ok: true, id: id });
}

function addNote_(body) {
  var n = body.note || {};
  var sheet = getSheet_(SHEET_NOTES, NOTE_HEADERS);
  var id = n.id || ('note-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000));
  sheet.appendRow([id, n.teacherId || '', n.title || '', n.body || '', n.x || 0, n.y || 0, new Date().toISOString()]);
  return jsonOutput_({ ok: true, id: id });
}

function findRow_(sheet, id) {
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) return i + 1;
  }
  return -1;
}

function updateNote_(body) {
  var sheet = getSheet_(SHEET_NOTES, NOTE_HEADERS);
  var row = findRow_(sheet, body.id);
  if (row === -1) return jsonOutput_({ error: 'Not found' });
  var patch = body.patch || {};
  if (patch.title !== undefined) sheet.getRange(row, 3).setValue(patch.title);
  if (patch.body !== undefined) sheet.getRange(row, 4).setValue(patch.body);
  if (patch.x !== undefined) sheet.getRange(row, 5).setValue(patch.x);
  if (patch.y !== undefined) sheet.getRange(row, 6).setValue(patch.y);
  return jsonOutput_({ ok: true });
}

function deleteNote_(body) {
  var sheet = getSheet_(SHEET_NOTES, NOTE_HEADERS);
  var row = findRow_(sheet, body.id);
  if (row === -1) return jsonOutput_({ error: 'Not found' });
  sheet.deleteRow(row);
  return jsonOutput_({ ok: true });
}
