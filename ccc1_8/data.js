// data.js — хранилище справочников и документов
// Подключается как <script src="data.js"></script> ДО основного скрипта.
// При сохранении из интерфейса файл не перезаписывается (браузер не может),
// но данные живут в localStorage и подхватываются при следующем открытии.

window.DB = {
  nomenclature: [
    { id: 1, name: 'Болт М8', unit: 'шт' },
    { id: 2, name: 'Гайка М8', unit: 'шт' },
    { id: 3, name: 'Лист стальной', unit: 'кг' }
  ],
  organizations: [
    { id: 1, name: 'ООО «Вектор»', inn: '7701234567' },
    { id: 2, name: 'АО «Прогресс»', inn: '7809876543' }
  ],
  employees: [
    { id: 1, name: 'Иванов И.И.', position: 'Менеджер' },
    { id: 2, name: 'Петров П.П.', position: 'Кладовщик' }
  ],
  documents: [
    // пример: { id, type: 'Приход'|'Расход', date: 'YYYY-MM-DD',
    //           orgId, empId, lines: [{ nomId, qty, price, sum }], total }
  ]
};
