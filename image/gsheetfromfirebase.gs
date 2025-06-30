// Script Id: 1hguuh4Zx72XVC1Zldm_vTtcUUKUA6iBUOoGnJUWLfqDWx5WlOJHqYkrt
function getAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var sheet = ss.getActiveSheet();

  var firebaseUrl = "YOUR_FIREBASE_URL";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl);

  var data = base.getData();
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  
  // set the header row
  var headers = ["NAME", "AGE", "EMAIL"];
  sheet.appendRow(headers);
  
  // loop through the Firebase data and write to sheet
  for (var key in data) {
    var row = data[key];
    var rowData = [row.name, row.age, row.email];
    sheet.appendRow(rowData);
    Logger.log(rowData);
  }
}

