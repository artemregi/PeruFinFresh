/**
 * FinOdnowa — Waitlist Email Collector
 * Google Apps Script Web App
 *
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Открой Google Sheets → создай новую таблицу
 * 2. Скопируй ID таблицы из URL (между /d/ и /edit)
 * 3. Вставь ID в переменную SPREADSHEET_ID ниже
 * 4. Перейди: Расширения → Apps Script
 * 5. Вставь весь этот код
 * 6. Нажми "Развернуть" → "Новое развёртывание"
 * 7. Тип: "Веб-приложение", доступ: "Все"
 * 8. Скопируй URL и вставь в index.html → WL_SCRIPT_URL
 */

var SPREADSHEET_ID = '1vASZ6h9ADVlJMAQ7Prul0pylx_s6EBUygiZ0Uvf2PQA';
var SHEET_NAME     = 'Waitlist';

// ─────────────────────────────────────────────────
// POST — принимает email с сайта
// ─────────────────────────────────────────────────
function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    // Добавить заголовки, если таблица пустая
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['#', 'Data i godzina', 'E-mail', 'Źródło', 'Strona', 'Timestamp']);
      // Стилизация заголовков
      var headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#028E7F');
      headerRange.setFontColor('#ffffff');
    }

    var rowNumber = sheet.getLastRow(); // номер строки = порядковый номер лида

    sheet.appendRow([
      rowNumber,                                          // #
      new Date().toLocaleString('pl-PL', {               // Data i godzina
        timeZone: 'Europe/Warsaw',
        day:   '2-digit', month: '2-digit', year: 'numeric',
        hour:  '2-digit', minute: '2-digit'
      }),
      data.email     || '',                              // E-mail
      data.source    || 'FinOdnowa',                      // Źródło
      data.page      || '',                              // Strona
      data.timestamp || new Date().toISOString()         // Timestamp UTC
    ]);

    // Автоматически подогнать ширину столбцов
    sheet.autoResizeColumns(1, 6);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', message: 'Email saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─────────────────────────────────────────────────
// GET — проверка работоспособности скрипта
// ─────────────────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput('✅ FinOdnowa Waitlist API is running. POST requests accepted.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ─────────────────────────────────────────────────
// Тестовая функция — запусти вручную для проверки
// ─────────────────────────────────────────────────
function testSave() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        email:     'test@example.com',
        source:    'FinOdnowa – test',
        timestamp: new Date().toISOString(),
        page:      'https://fin-fresh.pl/'
      })
    }
  };
  var result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
