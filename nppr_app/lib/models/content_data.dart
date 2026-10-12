class QuickSection {
  final String icon;
  final String title;
  final String route;
  const QuickSection(this.icon, this.title, this.route);
}

class QuickSectionsData {
  static const List<QuickSection> items = [
    QuickSection('📜', 'Программа', '/program'),
    QuickSection('🎯', 'Качество жизни', '/quality'),
    QuickSection('🗳️', 'Демократия', '/democracy'),
    QuickSection('💰', 'Экономика', '/economy'),
    QuickSection('🤝', 'Соцполитика', '/social'),
    QuickSection('⚖️', 'Конституция', '/constitution'),
  ];
}
